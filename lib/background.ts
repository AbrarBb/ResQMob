import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { SOSService } from './sos';
import { NotificationService } from './notifications';
import { LocationService } from './location';
import { supabase, isDemoMode } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKGROUND_FETCH_TASK = 'background-fetch-task';
const LOCATION_TASK_NAME = 'background-location-task';
const SOS_MONITORING_TASK = 'sos-monitoring-task';

// Background fetch task for general app updates
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    if (Platform.OS === 'web') {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Check for new emergency alerts
    const location = await LocationService.getCurrentLocation();
    if (location) {
      const alerts = await SOSService.getActiveAlerts(
        location.coords.latitude,
        location.coords.longitude,
        10000 // 10km radius
      );

      // Check if there are new alerts since last check
      const lastCheck = await AsyncStorage.getItem('lastAlertCheck');
      const lastCheckTime = lastCheck ? new Date(lastCheck) : new Date(0);
      
      const newAlerts = alerts.filter(alert => 
        alert.timestamp > lastCheckTime
      );

      if (newAlerts.length > 0) {
        // Send local notification for new alerts (demo mode only)
        if (isDemoMode()) {
          console.log('Demo mode: Would send notification for new alerts');
        } else {
          await NotificationService.scheduleLocalNotification(
            'New Emergency Alerts',
            `${newAlerts.length} new emergency alert(s) in your area`,
            { seconds: 1 },
            { type: 'new_alerts', count: newAlerts.length }
          );
        }
      }

      await AsyncStorage.setItem('lastAlertCheck', new Date().toISOString());
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background fetch error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Background location tracking task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background location error:', error);
    return;
  }

  if (data) {
    const { locations } = data as any;
    const location = locations[0];

    if (location) {
      try {
        // Store location update
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          await LocationService.startLocationTracking(userId, false);
        }
      } catch (error) {
        console.error('Error processing background location:', error);
      }
    }
  }
});

// SOS monitoring task (checks for emergency triggers)
TaskManager.defineTask(SOS_MONITORING_TASK, async () => {
  try {
    if (Platform.OS === 'web') {
      return;
    }

    // Check for emergency triggers (like hardware button combinations)
    const emergencyTrigger = await AsyncStorage.getItem('emergencyTrigger');
    
    if (emergencyTrigger) {
      const triggerData = JSON.parse(emergencyTrigger);
      const now = Date.now();
      
      // Check if trigger was recent (within last 30 seconds)
      if (now - triggerData.timestamp < 30000) {
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          // Auto-trigger SOS
          await SOSService.createSOSAlert(
            userId,
            'general',
            5, // Maximum urgency
            'Emergency triggered via hardware buttons',
            false
          );
          
          // Clear the trigger
          await AsyncStorage.removeItem('emergencyTrigger');
          
          // Send immediate notification
          await NotificationService.scheduleLocalNotification(
            'SOS Alert Sent',
            'Emergency alert has been sent to nearby users and your emergency contacts',
            { seconds: 1 },
            { type: 'sos_sent' }
          );
        }
      }
    }
  } catch (error) {
    console.error('SOS monitoring error:', error);
  }
});

export class BackgroundService {
  static async initialize() {
    if (Platform.OS === 'web') {
      console.log('Background services not available on web');
      return;
    }

    if (isDemoMode()) {
      console.log('Demo mode: Background services simulated');
      return;
    }

    try {
      // Register background fetch
      await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 15 * 60, // 15 minutes
        stopOnTerminate: false,
        startOnBoot: true,
      });

      // Register background location
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 60000, // 1 minute
        distanceInterval: 100, // 100 meters
        foregroundService: {
          notificationTitle: 'ResQMob Location Service',
          notificationBody: 'Tracking location for emergency services',
        },
      });

      console.log('Background services initialized');
    } catch (error) {
      console.error('Error initializing background services:', error);
    }
  }

  static async enableEmergencyMonitoring() {
    if (Platform.OS === 'web') {
      return;
    }

    try {
      // Enable more frequent background checks during emergency mode
      await BackgroundFetch.registerTaskAsync(SOS_MONITORING_TASK, {
        minimumInterval: 30, // 30 seconds
        stopOnTerminate: false,
        startOnBoot: true,
      });

      console.log('Emergency monitoring enabled');
    } catch (error) {
      console.error('Error enabling emergency monitoring:', error);
    }
  }

  static async disableEmergencyMonitoring() {
    if (Platform.OS === 'web') {
      return;
    }

    try {
      await BackgroundFetch.unregisterTaskAsync(SOS_MONITORING_TASK);
      console.log('Emergency monitoring disabled');
    } catch (error) {
      console.error('Error disabling emergency monitoring:', error);
    }
  }

  static async triggerEmergencySOS() {
    try {
      // Store emergency trigger for background task to pick up
      await AsyncStorage.setItem('emergencyTrigger', JSON.stringify({
        timestamp: Date.now(),
        type: 'hardware_buttons',
      }));

      console.log('Emergency SOS trigger stored');
    } catch (error) {
      console.error('Error triggering emergency SOS:', error);
    }
  }

  static async getBackgroundStatus() {
    if (Platform.OS === 'web') {
      return {
        backgroundFetch: 'unavailable',
        locationTracking: 'unavailable',
        sosMonitoring: 'unavailable',
      };
    }

    try {
      const backgroundFetchStatus = await BackgroundFetch.getStatusAsync();
      const isLocationRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
      const isSosRegistered = await TaskManager.isTaskRegisteredAsync(SOS_MONITORING_TASK);

      return {
        backgroundFetch: backgroundFetchStatus,
        locationTracking: isLocationRegistered ? 'active' : 'inactive',
        sosMonitoring: isSosRegistered ? 'active' : 'inactive',
      };
    } catch (error) {
      console.error('Error getting background status:', error);
      return {
        backgroundFetch: 'unknown',
        locationTracking: 'unknown',
        sosMonitoring: 'unknown',
      };
    }
  }
}
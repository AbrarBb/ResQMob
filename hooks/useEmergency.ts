import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { SOSService } from '../lib/sos';
import { LocationService, NearbyAlert } from '../lib/location';
import { BackgroundService } from '../lib/background';
import { NotificationService } from '../lib/notifications';
import { SOSAlert, User } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useEmergency(user: User | null) {
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState<SOSAlert[]>([]);
  const [nearbyAlerts, setNearbyAlerts] = useState<NearbyAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load active alerts
  const loadActiveAlerts = useCallback(async () => {
    if (!user) return;

    try {
      const location = await LocationService.getCurrentLocation();
      if (location) {
        const alerts = await SOSService.getActiveAlerts(
          location.coords.latitude,
          location.coords.longitude,
          user.settings.emergencyRadius
        );
        setActiveAlerts(alerts);
      }
    } catch (error) {
      console.error('Error loading active alerts:', error);
    }
  }, [user]);

  // Load nearby alerts
  const loadNearbyAlerts = useCallback(async () => {
    if (!user) return;

    try {
      const location = await LocationService.getCurrentLocation();
      if (location) {
        const alerts = await LocationService.getNearbyAlerts(
          location.coords.latitude,
          location.coords.longitude,
          user.settings.emergencyRadius
        );
        setNearbyAlerts(alerts);
      }
    } catch (error) {
      console.error('Error loading nearby alerts:', error);
    }
  }, [user]);

  // Send SOS alert
  const sendSOSAlert = useCallback(async (
    type: SOSAlert['type'],
    urgencyLevel: SOSAlert['urgencyLevel'],
    message?: string,
    isAnonymous: boolean = false
  ) => {
    if (!user || isSOSActive) return null;

    setIsLoading(true);
    setError(null);
    setIsSOSActive(true);

    try {
      const { alert, error: sosError } = await SOSService.createSOSAlert(
        user.id,
        type,
        urgencyLevel,
        message,
        isAnonymous
      );

      if (sosError) {
        throw sosError;
      }

      if (alert) {
        // Start emergency location tracking
        await LocationService.startLocationTracking(user.id, true);
        
        // Enable emergency monitoring
        await BackgroundService.enableEmergencyMonitoring();
        
        // Store active SOS state
        await AsyncStorage.setItem('activeSOS', JSON.stringify({
          alertId: alert.id,
          timestamp: alert.timestamp,
        }));

        // Refresh alerts
        await loadActiveAlerts();

        return alert;
      }
    } catch (error) {
      console.error('Error sending SOS alert:', error);
      setError(error instanceof Error ? error.message : 'Failed to send SOS alert');
      setIsSOSActive(false);
    } finally {
      setIsLoading(false);
    }

    return null;
  }, [user, isSOSActive, loadActiveAlerts]);

  // Respond to SOS alert
  const respondToSOS = useCallback(async (
    alertId: string,
    status: 'responding' | 'arrived' | 'helping' | 'unavailable'
  ) => {
    if (!user) return false;

    setIsLoading(true);
    setError(null);

    try {
      const { responder, error: responseError } = await SOSService.respondToSOS(
        alertId,
        user.id,
        status
      );

      if (responseError) {
        throw responseError;
      }

      if (responder && status === 'responding') {
        // Start location tracking to help with navigation
        await LocationService.startLocationTracking(user.id, true);
      }

      // Refresh alerts
      await loadActiveAlerts();

      return true;
    } catch (error) {
      console.error('Error responding to SOS:', error);
      setError(error instanceof Error ? error.message : 'Failed to respond to SOS');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, loadActiveAlerts]);

  // Resolve SOS alert
  const resolveSOSAlert = useCallback(async (
    alertId: string,
    status: 'resolved' | 'false_alarm'
  ) => {
    if (!user) return false;

    setIsLoading(true);
    setError(null);

    try {
      const { success, error: resolveError } = await SOSService.resolveAlert(
        alertId,
        user.id,
        status
      );

      if (resolveError) {
        throw resolveError;
      }

      if (success) {
        setIsSOSActive(false);
        
        // Stop emergency location tracking
        await LocationService.stopLocationTracking();
        
        // Disable emergency monitoring
        await BackgroundService.disableEmergencyMonitoring();
        
        // Clear active SOS state
        await AsyncStorage.removeItem('activeSOS');

        // Refresh alerts
        await loadActiveAlerts();
      }

      return success;
    } catch (error) {
      console.error('Error resolving SOS alert:', error);
      setError(error instanceof Error ? error.message : 'Failed to resolve SOS alert');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, loadActiveAlerts]);

  // Escalate alert
  const escalateAlert = useCallback(async (alertId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { success, error: escalateError } = await SOSService.escalateAlert(alertId);

      if (escalateError) {
        throw escalateError;
      }

      if (success) {
        await loadActiveAlerts();
      }

      return success;
    } catch (error) {
      console.error('Error escalating alert:', error);
      setError(error instanceof Error ? error.message : 'Failed to escalate alert');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadActiveAlerts]);

  // Hardware button SOS trigger
  const triggerHardwareButtonSOS = useCallback(async () => {
    if (!user?.settings.autoSOSEnabled) return;

    try {
      await BackgroundService.triggerEmergencySOS();
      
      // Show immediate feedback
      await NotificationService.scheduleLocalNotification(
        'Emergency SOS Triggered',
        'SOS alert will be sent in a few seconds...',
        { seconds: 1 } as any,
        { type: 'sos_trigger' }
      );
    } catch (error) {
      console.error('Error triggering hardware button SOS:', error);
    }
  }, [user]);

  // Check for active SOS on mount
  useEffect(() => {
    const checkActiveSOS = async () => {
      try {
        const activeSOS = await AsyncStorage.getItem('activeSOS');
        if (activeSOS) {
          const sosData = JSON.parse(activeSOS);
          // Check if SOS is still active (within last 24 hours)
          const sosTime = new Date(sosData.timestamp);
          const now = new Date();
          const hoursDiff = (now.getTime() - sosTime.getTime()) / (1000 * 60 * 60);
          
          if (hoursDiff < 24) {
            setIsSOSActive(true);
          } else {
            await AsyncStorage.removeItem('activeSOS');
          }
        }
      } catch (error) {
        console.error('Error checking active SOS:', error);
      }
    };

    checkActiveSOS();
  }, []);

  // Load data on mount and user change
  useEffect(() => {
    if (user) {
      loadActiveAlerts();
      loadNearbyAlerts();
    }
      }, [user, loadActiveAlerts, loadNearbyAlerts]);

  // Set up hardware button listener (mobile only)
  useEffect(() => {
    if (Platform.OS === 'web' || !user?.settings.autoSOSEnabled) return;

    let buttonPressCount = 0;
    let buttonPressTimer: ReturnType<typeof setTimeout>;

    const handleHardwareButtons = () => {
      buttonPressCount++;
      
      if (buttonPressCount === 1) {
        buttonPressTimer = setTimeout(() => {
          buttonPressCount = 0;
        }, 3000); // Reset after 3 seconds
      }
      
      if (buttonPressCount >= 3) {
        // Three presses within 3 seconds
        clearTimeout(buttonPressTimer);
        buttonPressCount = 0;
        triggerHardwareButtonSOS();
      }
    };

    // This would need to be implemented with native modules
    // For now, it's a placeholder for the hardware button detection
    console.log('Hardware button SOS monitoring enabled');

    return () => {
      if (buttonPressTimer) {
        clearTimeout(buttonPressTimer);
      }
    };
  }, [user, triggerHardwareButtonSOS]);

  return {
    isSOSActive,
    activeAlerts,
    nearbyAlerts,
    isLoading,
    error,
    sendSOSAlert,
    respondToSOS,
    resolveSOSAlert,
    escalateAlert,
    triggerHardwareButtonSOS,
    refreshAlerts: loadActiveAlerts,
    refreshNearbyAlerts: loadNearbyAlerts,
  };
}
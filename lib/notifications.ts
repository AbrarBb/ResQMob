import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase, isDemoMode } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  static async initialize() {
    if (Platform.OS === 'web') {
      console.log('Notifications not supported on web');
      return null;
    }

    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return null;
    }

    // Skip push token in demo mode
    if (isDemoMode()) {
      console.log('Demo mode: Skipping push token initialization');
      return null;
    }

    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    try {
      // Get push token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-expo-project-id', // Replace with your actual project ID
      });

      console.log('Push token:', token.data);

      // Store token in database
      await this.storePushToken(token.data);

      return token.data;
    } catch (error) {
      console.log('Error getting push token (this is normal in demo mode):', error);
      return null;
    }
  }

  static async storePushToken(token: string) {
    try {
      if (isDemoMode()) {
        // Store locally in demo mode
        await AsyncStorage.setItem('pushToken', token);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('users')
        .update({ push_token: token })
        .eq('id', user.id);

      // Store locally as backup
      await AsyncStorage.setItem('pushToken', token);
    } catch (error) {
      console.error('Error storing push token:', error);
    }
  }

  static async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: any
  ) {
    try {
      // Get user's push token
      const { data: user } = await supabase
        .from('users')
        .select('push_token, settings')
        .eq('id', userId)
        .single();

      if (!user?.push_token || !user.settings?.notificationsEnabled) {
        return;
      }

      // Send via Expo Push API
      const message = {
        to: user.push_token,
        sound: 'default',
        title,
        body,
        data,
        priority: data?.priority || 'normal',
        badge: 1,
      };

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      console.log('Push notification sent:', result);

      // Store notification in database
      await this.storeNotification(userId, title, body, data);

    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  static async sendSMSNotification(phone: string, message: string) {
    try {
      // Call your SMS service API (Twilio, AWS SNS, etc.)
      // This is a placeholder - implement with your preferred SMS service
      console.log(`SMS to ${phone}: ${message}`);
      
      // Example with a generic SMS API
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phone,
          message,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  }

  static async storeNotification(
    userId: string,
    title: string,
    body: string,
    data?: any
  ) {
    try {
      await supabase.from('notifications').insert({
        user_id: userId,
        type: data?.type || 'system',
        title,
        body,
        data,
        is_read: false,
        timestamp: new Date().toISOString(),
        priority: data?.priority || 'normal',
      });
    } catch (error) {
      console.error('Error storing notification:', error);
    }
  }

  static async getNotifications(userId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  static async markAsRead(notificationId: string) {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  static async clearAllNotifications(userId: string) {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId);

      // Clear badge count
      if (Platform.OS !== 'web') {
        await Notifications.setBadgeCountAsync(0);
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  static setupNotificationListeners() {
    if (Platform.OS === 'web') return;

    // Handle notification received while app is in foreground
    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received in foreground:', notification);
    });

    // Handle notification tapped
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      
      const data = response.notification.request.content.data;
      if (data?.alert_id) {
        // Navigate to alert details
        // This would be handled by your navigation system
      }
    });

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }

  static async scheduleLocalNotification(
    title: string,
    body: string,
    trigger: Notifications.NotificationTriggerInput,
    data?: any
  ) {
    if (Platform.OS === 'web') return;

    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger,
      });

      return id;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  static async cancelScheduledNotification(notificationId: string) {
    if (Platform.OS === 'web') return;

    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }
}
import { supabase, isDemoMode } from './supabase';
import { SOSAlert, SOSResponder, User } from '../types';
import { NotificationService } from './notifications';
import { LocationService } from './location';
import uuid from 'react-native-uuid';

// Demo data for when Supabase is not configured
const DEMO_ALERTS: SOSAlert[] = [
  {
    id: '1',
    userId: '550e8400-e29b-41d4-a716-446655440002',
    user: {
      id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Dr. Sarah Ahmed',
      email: 'sarah@example.com',
      phone: '+880 1987-654321',
      avatar: 'https://images.pexels.com/photos/559827/pexels-photo-559827.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
      isOnline: true,
      lastSeen: new Date(),
      emergencyContacts: [],
      settings: {
        notificationsEnabled: true,
        locationSharingEnabled: true,
        privacyMode: false,
        emergencyRadius: 5000,
        autoSOSEnabled: false,
        sosCountdown: 10,
        backgroundMonitoring: true
      },
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    type: 'medical',
    urgencyLevel: 3,
    status: 'active',
    location: {
      latitude: 23.8103,
      longitude: 90.4125,
      address: 'Dhanmondi, Dhaka'
    },
    message: 'Heart attack reported',
    timestamp: new Date(Date.now() - 300000),
    responders: [],
    confirmations: 1,
    escalationLevel: 1,
    notificationRadius: 3000,
    mediaUrls: [],
    isAnonymous: false
  }
];

export class SOSService {
  static async createSOSAlert(
    userId: string,
    type: SOSAlert['type'],
    urgencyLevel: SOSAlert['urgencyLevel'],
    message?: string,
    isAnonymous: boolean = false
  ): Promise<{ alert: SOSAlert | null; error: any }> {
    try {
      if (isDemoMode()) {
        // Demo mode - create mock alert
        const alertId = uuid.v4() as string;
        const mockAlert: SOSAlert = {
          id: alertId,
          userId,
          user: {
            id: userId,
            name: 'Demo User',
            email: 'demo@resqmob.com',
            phone: '+880 1712-345678',
            isOnline: true,
            lastSeen: new Date(),
            emergencyContacts: [],
            settings: {
              notificationsEnabled: true,
              locationSharingEnabled: true,
              privacyMode: false,
              emergencyRadius: 5000,
              autoSOSEnabled: false,
              sosCountdown: 10,
              backgroundMonitoring: true
            },
            verified: false,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          type,
          urgencyLevel,
          status: 'active',
          location: {
            latitude: 23.8103,
            longitude: 90.4125,
            address: 'Dhanmondi, Dhaka'
          },
          message,
          timestamp: new Date(),
          responders: [],
          confirmations: 1,
          escalationLevel: 1,
          notificationRadius: this.calculateInitialRadius(urgencyLevel),
          mediaUrls: [],
          isAnonymous
        };
        
        return { alert: mockAlert, error: null };
      }

      // Get user's current location
      const location = await LocationService.getCurrentLocation();
      if (!location) {
        throw new Error('Unable to get current location');
      }

      const alertId = uuid.v4() as string;
      const now = new Date().toISOString();

      // Create SOS alert
      const { data: alertData, error: alertError } = await supabase
        .from('sos_alerts')
        .insert({
          id: alertId,
          user_id: userId,
          type,
          urgency_level: urgencyLevel,
          status: 'active',
          location: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
          },
          message,
          timestamp: now,
          confirmations: 1,
          escalation_level: 1,
          notification_radius: this.calculateInitialRadius(urgencyLevel),
          is_anonymous: isAnonymous,
        })
        .select()
        .single();

      if (alertError) throw alertError;

      // Get nearby users
      const nearbyUsers = await this.getNearbyUsers(
        location.coords.latitude,
        location.coords.longitude,
        this.calculateInitialRadius(urgencyLevel)
      );

      // Send notifications to nearby users
      await this.notifyNearbyUsers(alertData, nearbyUsers);

      // Send notifications to emergency contacts
      await this.notifyEmergencyContacts(userId, alertData);

      // Create emergency chat room
      await this.createEmergencyChatRoom(alertData);

      return { alert: this.formatSOSAlert(alertData), error: null };
    } catch (error) {
      return { alert: null, error };
    }
  }

  static async respondToSOS(
    alertId: string,
    userId: string,
    status: SOSResponder['status']
  ): Promise<{ responder: SOSResponder | null; error: any }> {
    try {
      if (isDemoMode()) {
        // Demo mode - create mock responder
        const mockResponder: SOSResponder = {
          id: uuid.v4() as string,
          userId,
          user: {
            id: userId,
            name: 'Demo Responder',
            email: 'responder@demo.com',
            phone: '+880 1555-123456',
            isOnline: true,
            lastSeen: new Date(),
            emergencyContacts: [],
            settings: {
              notificationsEnabled: true,
              locationSharingEnabled: true,
              privacyMode: false,
              emergencyRadius: 5000,
              autoSOSEnabled: false,
              sosCountdown: 10,
              backgroundMonitoring: true
            },
            verified: false,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          alertId,
          status,
          distance: 500,
          timestamp: new Date()
        };
        
        return { responder: mockResponder, error: null };
      }

      const responderId = uuid.v4() as string;
      const now = new Date().toISOString();

      // Get user location
      const location = await LocationService.getCurrentLocation();
      const distance = location ? await this.calculateDistance(alertId, location) : 0;

      const { data, error } = await supabase
        .from('sos_responders')
        .insert({
          id: responderId,
          user_id: userId,
          alert_id: alertId,
          status,
          distance,
          timestamp: now,
          estimated_arrival: status === 'responding' ? this.calculateETA(distance) : null,
        })
        .select()
        .single();

      if (error) throw error;

      // Update alert with new responder count
      await this.updateAlertResponderCount(alertId);

      // Notify alert creator about new responder
      await this.notifyAlertCreator(alertId, userId, status);

      return { responder: data, error: null };
    } catch (error) {
      return { responder: null, error };
    }
  }

  static async escalateAlert(alertId: string): Promise<{ success: boolean; error: any }> {
    try {
      if (isDemoMode()) {
        return { success: true, error: null };
      }

      // Get current alert
      const { data: alert, error: alertError } = await supabase
        .from('sos_alerts')
        .select('*')
        .eq('id', alertId)
        .single();

      if (alertError || !alert) throw new Error('Alert not found');

      const newEscalationLevel = alert.escalation_level + 1;
      const newRadius = this.calculateEscalatedRadius(alert.notification_radius, newEscalationLevel);

      // Update alert escalation
      const { error: updateError } = await supabase
        .from('sos_alerts')
        .update({
          escalation_level: newEscalationLevel,
          notification_radius: newRadius,
          updated_at: new Date().toISOString(),
        })
        .eq('id', alertId);

      if (updateError) throw updateError;

      // Get additional nearby users
      const additionalUsers = await this.getNearbyUsers(
        alert.location.latitude,
        alert.location.longitude,
        newRadius,
        alert.notification_radius // Exclude users already notified
      );

      // Notify additional users
      await this.notifyNearbyUsers(alert, additionalUsers, true);

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  }

  static async resolveAlert(
    alertId: string,
    userId: string,
    status: 'resolved' | 'false_alarm'
  ): Promise<{ success: boolean; error: any }> {
    try {
      if (isDemoMode()) {
        return { success: true, error: null };
      }

      const { error } = await supabase
        .from('sos_alerts')
        .update({
          status,
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', alertId)
        .eq('user_id', userId); // Only alert creator can resolve

      if (error) throw error;

      // Notify all responders about resolution
      await this.notifyAlertResolution(alertId, status);

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  }

  static async getActiveAlerts(
    latitude: number,
    longitude: number,
    radius: number = 10000
  ): Promise<SOSAlert[]> {
    try {
      if (isDemoMode()) {
        return DEMO_ALERTS;
      }

      const { data, error } = await supabase
        .rpc('get_nearby_alerts', {
          lat: latitude,
          lng: longitude,
          radius_meters: radius,
        });

      if (error) throw error;

      return data.map(this.formatSOSAlert);
    } catch (error) {
      console.error('Error getting active alerts:', error);
      return [];
    }
  }

  static async getUserAlerts(userId: string): Promise<SOSAlert[]> {
    try {
      if (isDemoMode()) {
        return DEMO_ALERTS.filter(alert => alert.userId === userId);
      }

      const { data, error } = await supabase
        .from('sos_alerts')
        .select(`
          *,
          users (*),
          sos_responders (
            *,
            users (*)
          )
        `)
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      return data.map(this.formatSOSAlert);
    } catch (error) {
      console.error('Error getting user alerts:', error);
      return [];
    }
  }

  private static calculateInitialRadius(urgencyLevel: number): number {
    const baseRadius = 1000; // 1km
    return baseRadius * urgencyLevel;
  }

  private static calculateEscalatedRadius(currentRadius: number, escalationLevel: number): number {
    return currentRadius * (1 + escalationLevel * 0.5);
  }

  private static calculateETA(distance: number): string {
    // Assume average speed of 30 km/h in emergency
    const timeInHours = distance / 30000;
    const timeInMinutes = Math.ceil(timeInHours * 60);
    const eta = new Date();
    eta.setMinutes(eta.getMinutes() + timeInMinutes);
    return eta.toISOString();
  }

  private static async calculateDistance(alertId: string, userLocation: any): Promise<number> {
    try {
      if (isDemoMode()) {
        return 500; // Mock distance
      }

      const { data: alert } = await supabase
        .from('sos_alerts')
        .select('location')
        .eq('id', alertId)
        .single();

      if (!alert) return 0;

      return LocationService.calculateDistance(
        userLocation.coords.latitude,
        userLocation.coords.longitude,
        alert.location.latitude,
        alert.location.longitude
      );
    } catch (error) {
      return 0;
    }
  }

  private static async getNearbyUsers(
    latitude: number,
    longitude: number,
    radius: number,
    excludeRadius?: number
  ): Promise<User[]> {
    try {
      if (isDemoMode()) {
        return []; // No nearby users in demo mode
      }

      // For now, return empty array since get_nearby_users function doesn't exist
      // You can implement this later by creating the function in your database
      console.log('get_nearby_users function not implemented yet');
      return [];
    } catch (error) {
      console.error('Error getting nearby users:', error);
      return [];
    }
  }

  private static async notifyNearbyUsers(alert: any, users: User[], isEscalation: boolean = false) {
    if (isDemoMode()) {
      return; // Skip notifications in demo mode
    }

    const notifications = users.map(user => ({
      user_id: user.id,
      type: 'sos_alert',
      title: isEscalation ? 'ESCALATED EMERGENCY ALERT' : 'EMERGENCY ALERT NEARBY',
      body: `${alert.type.toUpperCase()} emergency reported nearby. Tap to help.`,
      data: {
        alert_id: alert.id,
        alert_type: alert.type,
        urgency_level: alert.urgency_level,
        location: alert.location,
      },
      priority: 'critical',
      timestamp: new Date().toISOString(),
    }));

    await supabase.from('notifications').insert(notifications);

    // Send push notifications
    for (const user of users) {
      await NotificationService.sendPushNotification(
        user.id,
        isEscalation ? 'ESCALATED EMERGENCY ALERT' : 'EMERGENCY ALERT NEARBY',
        `${alert.type.toUpperCase()} emergency reported nearby. Tap to help.`,
        {
          alert_id: alert.id,
          type: 'sos_alert',
        }
      );
    }
  }

  private static async notifyEmergencyContacts(userId: string, alert: any) {
    try {
      if (isDemoMode()) {
        return; // Skip notifications in demo mode
      }

      const { data: contacts } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', userId)
        .eq('notification_enabled', true);

      if (!contacts) return;

      for (const contact of contacts) {
        await NotificationService.sendSMSNotification(
          contact.phone,
          `EMERGENCY ALERT: ${contact.name} has sent an SOS alert. Location: ${alert.location.address || 'Location shared'}. Please check the ResQMob app for details.`
        );
      }
    } catch (error) {
      console.error('Error notifying emergency contacts:', error);
    }
  }

  private static async createEmergencyChatRoom(alert: any) {
    try {
      if (isDemoMode()) {
        return; // Skip chat room creation in demo mode
      }

      const roomId = uuid.v4() as string;
      
      await supabase.from('chat_rooms').insert({
        id: roomId,
        name: `Emergency Response - ${alert.type}`,
        type: 'emergency',
        alert_id: alert.id,
        is_active: true,
        urgency_level: alert.urgency_level,
        location: alert.location,
        created_at: new Date().toISOString(),
      });

      // Add alert creator as admin
      await supabase.from('chat_participants').insert({
        id: uuid.v4(),
        chat_room_id: roomId,
        user_id: alert.user_id,
        role: 'admin',
        joined_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error creating emergency chat room:', error);
    }
  }

  private static async updateAlertResponderCount(alertId: string) {
    if (isDemoMode()) {
      return;
    }

    const { data: responders } = await supabase
      .from('sos_responders')
      .select('id')
      .eq('alert_id', alertId);

    await supabase
      .from('sos_alerts')
      .update({
        responder_count: responders?.length || 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', alertId);
  }

  private static async notifyAlertCreator(alertId: string, responderId: string, status: string) {
    try {
      if (isDemoMode()) {
        return;
      }

      const { data: alert } = await supabase
        .from('sos_alerts')
        .select('user_id')
        .eq('id', alertId)
        .single();

      if (!alert) return;

      const { data: responder } = await supabase
        .from('users')
        .select('name')
        .eq('id', responderId)
        .single();

      await NotificationService.sendPushNotification(
        alert.user_id,
        'Help is Coming!',
        `${responder?.name || 'Someone'} is ${status} to your emergency alert.`,
        {
          alert_id: alertId,
          type: 'sos_response',
        }
      );
    } catch (error) {
      console.error('Error notifying alert creator:', error);
    }
  }

  private static async notifyAlertResolution(alertId: string, status: string) {
    try {
      if (isDemoMode()) {
        return;
      }

      const { data: responders } = await supabase
        .from('sos_responders')
        .select('user_id')
        .eq('alert_id', alertId);

      if (!responders) return;

      const title = status === 'resolved' ? 'Emergency Resolved' : 'False Alarm';
      const body = status === 'resolved' 
        ? 'The emergency has been resolved. Thank you for your help!'
        : 'This was a false alarm. Thank you for your quick response!';

      for (const responder of responders) {
        await NotificationService.sendPushNotification(
          responder.user_id,
          title,
          body,
          {
            alert_id: alertId,
            type: 'sos_resolution',
          }
        );
      }
    } catch (error) {
      console.error('Error notifying alert resolution:', error);
    }
  }

  private static formatSOSAlert(data: any): SOSAlert {
    return {
      id: data.id,
      userId: data.user_id,
      user: data.users,
      type: data.type,
      urgencyLevel: data.urgency_level,
      status: data.status,
      location: data.location,
      message: data.message,
      timestamp: new Date(data.timestamp),
      resolvedAt: data.resolved_at ? new Date(data.resolved_at) : undefined,
      responders: data.sos_responders || [],
      confirmations: data.confirmations || 0,
      escalationLevel: data.escalation_level || 1,
      notificationRadius: data.notification_radius || 1000,
      mediaUrls: data.media_urls || [],
      isAnonymous: data.is_anonymous || false,
    };
  }
}
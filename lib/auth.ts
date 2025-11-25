import { supabase, isDemoMode } from './supabase';
import { User } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Demo user for when Supabase is not configured
const DEMO_USER: User = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  email: 'demo@resqmob.com',
  name: 'Abrar Khatib',
  phone: '+880 1712-345678',
  avatar: 'https://static.wikia.nocookie.net/batman/images/f/f9/Heath_Ledger_as_the_Joker.JPG/revision/latest?cb=20211006123111',
  location: {
    latitude: 23.8103,
    longitude: 90.4125,
    address: 'Badda, Dhaka'
  },
  isOnline: true,
  lastSeen: new Date(),
  emergencyContacts: [
    {
      id: '1',
      name: 'Dr. Sarah Ahmed',
      phone: '+880 1987-654321',
      relationship: 'Family Doctor',
      isPrimary: true,
      notificationEnabled: true
    }
  ],
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
};

export class AuthService {
  static async signUp(email: string, password: string, userData: Partial<User>) {
    try {
      if (isDemoMode()) {
        // Demo mode - simulate successful signup
        await AsyncStorage.setItem('demoUser', JSON.stringify({
          ...DEMO_USER,
          email,
          ...userData
        }));
        return { data: { user: DEMO_USER }, error: null };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) throw error;

      // Create user profile
      if (data.user) {
        await this.createUserProfile(data.user.id, {
          email,
          ...userData,
        });
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async signIn(email: string, password: string) {
    try {
      if (isDemoMode()) {
        // Demo mode - check for demo credentials
        if (email === 'demo@resqmob.com' && password === 'demo123') {
          await AsyncStorage.setItem('demoUser', JSON.stringify(DEMO_USER));
          return { data: { user: DEMO_USER }, error: null };
        } else {
          throw new Error('Invalid demo credentials. Use demo@resqmob.com / demo123');
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Update user online status
      if (data.user) {
        await this.updateUserOnlineStatus(data.user.id, true);
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async signOut() {
    try {
      if (isDemoMode()) {
        await AsyncStorage.removeItem('demoUser');
        return { error: null };
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await this.updateUserOnlineStatus(user.id, false);
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear local storage
      await AsyncStorage.clear();

      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  static async getCurrentUser() {
    try {
      if (isDemoMode()) {
        const demoUser = await AsyncStorage.getItem('demoUser');
        if (demoUser) {
          return { user: JSON.parse(demoUser), error: null };
        }
        return { user: null, error: null };
      }

      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;

      if (user) {
        const profile = await this.getUserProfile(user.id);
        return { user: profile, error: null };
      }

      return { user: null, error: null };
    } catch (error) {
      return { user: null, error };
    }
  }

  static async createUserProfile(userId: string, userData: Partial<User>) {
    if (isDemoMode()) {
      return { data: DEMO_USER, error: null };
    }

    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        avatar: userData.avatar,
        is_online: true,
        last_seen: new Date().toISOString(),
        settings: {
          notificationsEnabled: true,
          locationSharingEnabled: true,
          privacyMode: false,
          emergencyRadius: 5000,
          autoSOSEnabled: false,
          sosCountdown: 10,
          backgroundMonitoring: true,
        },
        verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    return { data, error };
  }

  static async getUserProfile(userId: string): Promise<User | null> {
    if (isDemoMode()) {
      return DEMO_USER;
    }

    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        emergency_contacts (*)
      `)
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      phone: data.phone,
      avatar: data.avatar,
      location: data.location,
      isOnline: data.is_online,
      lastSeen: new Date(data.last_seen),
      emergencyContacts: data.emergency_contacts || [],
      settings: data.settings,
      verified: data.verified,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  static async updateUserProfile(userId: string, updates: Partial<User>) {
    if (isDemoMode()) {
      const currentUser = await AsyncStorage.getItem('demoUser');
      if (currentUser) {
        const updatedUser = { ...JSON.parse(currentUser), ...updates };
        await AsyncStorage.setItem('demoUser', JSON.stringify(updatedUser));
        return { data: updatedUser, error: null };
      }
      return { data: null, error: new Error('No demo user found') };
    }

    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    return { data, error };
  }

  static async updateUserOnlineStatus(userId: string, isOnline: boolean) {
    if (isDemoMode()) {
      return { error: null };
    }

    const { error } = await supabase
      .from('users')
      .update({
        is_online: isOnline,
        last_seen: new Date().toISOString(),
      })
      .eq('id', userId);

    return { error };
  }

  static async updateUserLocation(userId: string, location: { latitude: number; longitude: number; address?: string }) {
    if (isDemoMode()) {
      return { error: null };
    }

    const { error } = await supabase
      .from('users')
      .update({
        location,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    return { error };
  }
}
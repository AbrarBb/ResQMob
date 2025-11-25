import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://sswsnpqxgycbfdvrknif.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzd3NucHF4Z3ljYmZkdnJrbmlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NjkwNzcsImV4cCI6MjA2NzE0NTA3N30.xy3H_hkcyqSJge6z6suenFiqrQR53cDMVHf0z2Ft5tQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database table names
export const TABLES = {
  USERS: 'users',
  SOS_ALERTS: 'sos_alerts',
  SOS_RESPONDERS: 'sos_responders',
  CHAT_ROOMS: 'chat_rooms',
  CHAT_PARTICIPANTS: 'chat_participants',
  MESSAGES: 'messages',
  FEED_POSTS: 'feed_posts',
  SAFE_ZONES: 'safe_zones',
  NOTIFICATIONS: 'notifications',
  LOCATION_UPDATES: 'location_updates',
  EMERGENCY_CONTACTS: 'emergency_contacts',
  EMERGENCY_SERVICES: 'emergency_services',
} as const;

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://your-project-id.supabase.co' && 
         supabaseAnonKey !== 'your-anon-key' &&
         supabaseUrl.includes('.supabase.co') &&
         supabaseAnonKey.length > 50;
};

// Demo mode fallback for when Supabase is not configured
export const isDemoMode = () => true; // Force demo mode for testing

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) throw error;
    return { success: true, message: 'Connected to Supabase successfully' };
  } catch (error) {
    return { 
      success: false, 
      message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
};
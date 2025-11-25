/*
  # Initial Database Schema for ResQMob

  1. New Tables
    - `users` - User profiles and authentication data
    - `emergency_contacts` - User emergency contacts
    - `sos_alerts` - Emergency alerts with location and urgency
    - `sos_responders` - People responding to alerts
    - `chat_rooms` - Communication channels for emergencies
    - `chat_participants` - Users in chat rooms
    - `messages` - Chat messages with real-time support
    - `feed_posts` - Community safety updates and tips
    - `safe_zones` - Hospitals, police stations, etc.
    - `notifications` - Push notifications and alerts
    - `location_updates` - Real-time location tracking
    - `emergency_services` - Official emergency contacts

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure data access based on user relationships

  3. Indexes
    - Location-based queries optimization
    - Real-time performance improvements
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  location JSONB,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  emergency_contacts_count INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{
    "notificationsEnabled": true,
    "locationSharingEnabled": true,
    "privacyMode": false,
    "emergencyRadius": 5000,
    "autoSOSEnabled": false,
    "sosCountdown": 10,
    "backgroundMonitoring": true
  }'::jsonb,
  push_token TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  notification_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SOS alerts table
CREATE TABLE IF NOT EXISTS sos_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('medical', 'fire', 'police', 'general', 'accident', 'violence')),
  urgency_level INTEGER NOT NULL CHECK (urgency_level BETWEEN 1 AND 5),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'false_alarm')),
  location JSONB NOT NULL,
  message TEXT,
  alert_timestamp TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  confirmations INTEGER DEFAULT 1,
  escalation_level INTEGER DEFAULT 1,
  notification_radius INTEGER DEFAULT 1000,
  media_urls TEXT[],
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SOS responders table
CREATE TABLE IF NOT EXISTS sos_responders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  alert_id UUID NOT NULL REFERENCES sos_alerts(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('responding', 'arrived', 'helping', 'unavailable')),
  distance DOUBLE PRECISION,
  response_timestamp TIMESTAMPTZ DEFAULT NOW(),
  estimated_arrival TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, alert_id)
);

-- Chat rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('emergency', 'neighborhood', 'general', 'alert_response')),
  is_active BOOLEAN DEFAULT true,
  urgency_level INTEGER CHECK (urgency_level BETWEEN 1 AND 5),
  location JSONB,
  alert_id UUID REFERENCES sos_alerts(id) ON DELETE SET NULL,
  participant_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat participants table
CREATE TABLE IF NOT EXISTS chat_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  is_online BOOLEAN DEFAULT false,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(chat_room_id, user_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'location', 'image', 'emergency_alert', 'system')),
  message_timestamp TIMESTAMPTZ DEFAULT NOW(),
  media_url TEXT,
  location JSONB,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feed posts table
CREATE TABLE IF NOT EXISTS feed_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('safety_tip', 'incident_report', 'community_update', 'help_request')),
  post_timestamp TIMESTAMPTZ DEFAULT NOW(),
  location JSONB,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  tags TEXT[],
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'neighborhood', 'contacts')),
  image_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safe zones table
CREATE TABLE IF NOT EXISTS safe_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('hospital', 'police_station', 'fire_station', 'safe_house', 'community_center')),
  location JSONB NOT NULL,
  radius INTEGER DEFAULT 500,
  contact_info JSONB,
  operating_hours JSONB,
  services TEXT[],
  is_verified BOOLEAN DEFAULT false,
  rating DECIMAL(2,1) DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('sos_alert', 'sos_response', 'chat_message', 'safety_update', 'system')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  notification_timestamp TIMESTAMPTZ DEFAULT NOW(),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Location updates table
CREATE TABLE IF NOT EXISTS location_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location JSONB NOT NULL,
  update_timestamp TIMESTAMPTZ DEFAULT NOW(),
  is_emergency BOOLEAN DEFAULT false,
  accuracy DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency services table
CREATE TABLE IF NOT EXISTS emergency_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('police', 'fire', 'medical', 'rescue')),
  phone TEXT NOT NULL,
  location JSONB NOT NULL,
  is_available BOOLEAN DEFAULT true,
  response_time INTEGER, -- in minutes
  coverage JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_location ON users USING GIN (location);
CREATE INDEX IF NOT EXISTS idx_users_online ON users (is_online, last_seen);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user ON emergency_contacts (user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_primary ON emergency_contacts (user_id, is_primary);

CREATE INDEX IF NOT EXISTS idx_sos_alerts_status ON sos_alerts (status, alert_timestamp);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_location ON sos_alerts USING GIN (location);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_user ON sos_alerts (user_id, status);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_urgency ON sos_alerts (urgency_level, alert_timestamp);

CREATE INDEX IF NOT EXISTS idx_sos_responders_alert ON sos_responders (alert_id, status);
CREATE INDEX IF NOT EXISTS idx_sos_responders_user ON sos_responders (user_id, response_timestamp);

CREATE INDEX IF NOT EXISTS idx_chat_rooms_active ON chat_rooms (is_active, type);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_alert ON chat_rooms (alert_id);

CREATE INDEX IF NOT EXISTS idx_chat_participants_room ON chat_participants (chat_room_id, is_online);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user ON chat_participants (user_id, joined_at);

CREATE INDEX IF NOT EXISTS idx_messages_room ON messages (chat_room_id, message_timestamp);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages (sender_id, message_timestamp);

CREATE INDEX IF NOT EXISTS idx_feed_posts_type ON feed_posts (type, post_timestamp);
CREATE INDEX IF NOT EXISTS idx_feed_posts_location ON feed_posts USING GIN (location);
CREATE INDEX IF NOT EXISTS idx_feed_posts_user ON feed_posts (user_id, post_timestamp);

CREATE INDEX IF NOT EXISTS idx_safe_zones_type ON safe_zones (type, is_verified);
CREATE INDEX IF NOT EXISTS idx_safe_zones_location ON safe_zones USING GIN (location);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, is_read, notification_timestamp);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications (type, priority, notification_timestamp);

CREATE INDEX IF NOT EXISTS idx_location_updates_user ON location_updates (user_id, update_timestamp);
CREATE INDEX IF NOT EXISTS idx_location_updates_emergency ON location_updates (is_emergency, update_timestamp);

CREATE INDEX IF NOT EXISTS idx_emergency_services_type ON emergency_services (type, is_available);
CREATE INDEX IF NOT EXISTS idx_emergency_services_location ON emergency_services USING GIN (location);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_responders ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE safe_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_services ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can read public profiles"
  ON users FOR SELECT
  TO authenticated
  USING (
    (settings->>'privacyMode')::boolean = false OR
    auth.uid() = id
  );

-- RLS Policies for emergency_contacts table
CREATE POLICY "Users can manage own emergency contacts"
  ON emergency_contacts FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for sos_alerts table
CREATE POLICY "Users can create own alerts"
  ON sos_alerts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read nearby alerts"
  ON sos_alerts FOR SELECT
  TO authenticated
  USING (
    status = 'active' OR
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM sos_responders 
      WHERE alert_id = sos_alerts.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own alerts"
  ON sos_alerts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for sos_responders table
CREATE POLICY "Users can respond to alerts"
  ON sos_responders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read alert responses"
  ON sos_responders FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM sos_alerts 
      WHERE id = sos_responders.alert_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own responses"
  ON sos_responders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for chat_rooms table
CREATE POLICY "Users can read accessible chat rooms"
  ON chat_rooms FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_participants 
      WHERE chat_room_id = chat_rooms.id AND user_id = auth.uid()
    ) OR
    type IN ('general', 'neighborhood')
  );

-- RLS Policies for chat_participants table
CREATE POLICY "Users can manage own participation"
  ON chat_participants FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read room participants"
  ON chat_participants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_participants cp2
      WHERE cp2.chat_room_id = chat_participants.chat_room_id 
      AND cp2.user_id = auth.uid()
    )
  );

-- RLS Policies for messages table
CREATE POLICY "Users can send messages to joined rooms"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM chat_participants 
      WHERE chat_room_id = messages.chat_room_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read messages from joined rooms"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_participants 
      WHERE chat_room_id = messages.chat_room_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for feed_posts table
CREATE POLICY "Users can create posts"
  ON feed_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read public posts"
  ON feed_posts FOR SELECT
  TO authenticated
  USING (
    visibility = 'public' OR
    auth.uid() = user_id
  );

CREATE POLICY "Users can update own posts"
  ON feed_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for safe_zones table
CREATE POLICY "Anyone can read safe zones"
  ON safe_zones FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for notifications table
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for location_updates table
CREATE POLICY "Users can create own location updates"
  ON location_updates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own location updates"
  ON location_updates FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for emergency_services table
CREATE POLICY "Anyone can read emergency services"
  ON emergency_services FOR SELECT
  TO authenticated
  USING (true);
/*
  # Database Functions and Triggers

  1. Functions
    - Distance calculation (Haversine formula)
    - Get nearby users within radius
    - Get nearby active alerts
    - Update user last seen timestamp
    - Auto-escalate alerts

  2. Triggers
    - Update last seen on location updates
    - Update timestamps on record changes
    - Auto-escalation for unresponded alerts

  3. Real-time Setup
    - Enable real-time for critical tables
    - Configure publication settings
*/

-- Function to calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DOUBLE PRECISION,
  lng1 DOUBLE PRECISION,
  lat2 DOUBLE PRECISION,
  lng2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION AS $$
BEGIN
  RETURN (
    6371000 * acos(
      cos(radians(lat1)) * 
      cos(radians(lat2)) * 
      cos(radians(lng2) - radians(lng1)) + 
      sin(radians(lat1)) * 
      sin(radians(lat2))
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get nearby users within radius
CREATE OR REPLACE FUNCTION get_nearby_users(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_meters INTEGER DEFAULT 5000,
  exclude_radius_meters INTEGER DEFAULT 0
) RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  avatar TEXT,
  location JSONB,
  is_online BOOLEAN,
  last_seen TIMESTAMPTZ,
  distance DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.email,
    u.phone,
    u.avatar,
    u.location,
    u.is_online,
    u.last_seen,
    calculate_distance(
      lat,
      lng,
      (u.location->>'latitude')::DOUBLE PRECISION,
      (u.location->>'longitude')::DOUBLE PRECISION
    ) as distance
  FROM users u
  WHERE 
    u.location IS NOT NULL
    AND u.location ? 'latitude'
    AND u.location ? 'longitude'
    AND (u.settings->>'locationSharingEnabled')::BOOLEAN = true
    AND (u.settings->>'privacyMode')::BOOLEAN = false
    AND calculate_distance(
      lat,
      lng,
      (u.location->>'latitude')::DOUBLE PRECISION,
      (u.location->>'longitude')::DOUBLE PRECISION
    ) <= radius_meters
    AND calculate_distance(
      lat,
      lng,
      (u.location->>'latitude')::DOUBLE PRECISION,
      (u.location->>'longitude')::DOUBLE PRECISION
    ) > exclude_radius_meters
  ORDER BY distance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get nearby active alerts
CREATE OR REPLACE FUNCTION get_nearby_alerts(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_meters INTEGER DEFAULT 10000
) RETURNS TABLE (
  id UUID,
  user_id UUID,
  type TEXT,
  urgency_level INTEGER,
  status TEXT,
  location JSONB,
  message TEXT,
  alert_timestamp TIMESTAMPTZ,
  responder_count INTEGER,
  escalation_level INTEGER,
  distance DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.user_id,
    a.type,
    a.urgency_level,
    a.status,
    a.location,
    a.message,
    a.alert_timestamp,
    COALESCE(r.responder_count, 0)::INTEGER as responder_count,
    a.escalation_level,
    calculate_distance(
      lat,
      lng,
      (a.location->>'latitude')::DOUBLE PRECISION,
      (a.location->>'longitude')::DOUBLE PRECISION
    ) as distance
  FROM sos_alerts a
  LEFT JOIN (
    SELECT 
      alert_id, 
      COUNT(*) as responder_count 
    FROM sos_responders 
    GROUP BY alert_id
  ) r ON a.id = r.alert_id
  WHERE 
    a.status = 'active'
    AND a.location IS NOT NULL
    AND a.location ? 'latitude'
    AND a.location ? 'longitude'
    AND calculate_distance(
      lat,
      lng,
      (a.location->>'latitude')::DOUBLE PRECISION,
      (a.location->>'longitude')::DOUBLE PRECISION
    ) <= radius_meters
  ORDER BY 
    a.urgency_level DESC,
    distance ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user last seen
CREATE OR REPLACE FUNCTION update_user_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users 
  SET 
    last_seen = NOW(),
    updated_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update chat room participant count
CREATE OR REPLACE FUNCTION update_chat_room_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE chat_rooms 
    SET participant_count = participant_count + 1
    WHERE id = NEW.chat_room_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE chat_rooms 
    SET participant_count = participant_count - 1
    WHERE id = OLD.chat_room_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update emergency contacts count
CREATE OR REPLACE FUNCTION update_emergency_contacts_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users 
    SET emergency_contacts_count = emergency_contacts_count + 1
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users 
    SET emergency_contacts_count = emergency_contacts_count - 1
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user last seen on location updates
CREATE TRIGGER trigger_update_last_seen
  AFTER INSERT ON location_updates
  FOR EACH ROW
  EXECUTE FUNCTION update_user_last_seen();

-- Apply update timestamp trigger to relevant tables
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_contacts_updated_at 
  BEFORE UPDATE ON emergency_contacts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sos_alerts_updated_at 
  BEFORE UPDATE ON sos_alerts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sos_responders_updated_at 
  BEFORE UPDATE ON sos_responders 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_rooms_updated_at 
  BEFORE UPDATE ON chat_rooms 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feed_posts_updated_at 
  BEFORE UPDATE ON feed_posts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_safe_zones_updated_at 
  BEFORE UPDATE ON safe_zones 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_services_updated_at 
  BEFORE UPDATE ON emergency_services 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update chat room participant count
CREATE TRIGGER update_participant_count_on_insert
  AFTER INSERT ON chat_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_room_participant_count();

CREATE TRIGGER update_participant_count_on_delete
  AFTER DELETE ON chat_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_room_participant_count();

-- Trigger to update emergency contacts count
CREATE TRIGGER update_contacts_count_on_insert
  AFTER INSERT ON emergency_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_emergency_contacts_count();

CREATE TRIGGER update_contacts_count_on_delete
  AFTER DELETE ON emergency_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_emergency_contacts_count();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_nearby_users TO authenticated;
GRANT EXECUTE ON FUNCTION get_nearby_alerts TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_distance TO authenticated;

-- Enable real-time for critical tables
ALTER PUBLICATION supabase_realtime ADD TABLE sos_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE sos_responders;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE location_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_participants;
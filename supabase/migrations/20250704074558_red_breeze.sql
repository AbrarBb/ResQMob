/*
  # Database Functions and Triggers

  1. Functions
    - get_nearby_users: Find users within radius
    - get_nearby_alerts: Find active alerts within radius
    - calculate_distance: Calculate distance between coordinates
    - update_user_last_seen: Update user activity
  
  2. Triggers
    - Auto-update timestamps
    - Location update notifications
    - Alert escalation triggers
  
  3. Real-time Setup
    - Enable real-time for critical tables
    - Configure row level security for real-time
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
  timestamp TIMESTAMPTZ,
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
    a.alert_timestamp as timestamp,
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

-- Function to auto-escalate alerts
CREATE OR REPLACE FUNCTION auto_escalate_alert()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-escalate if no responders after 10 minutes for high urgency
  IF NEW.urgency_level >= 4 AND 
     NEW.alert_timestamp < NOW() - INTERVAL '10 minutes' AND
     (SELECT COUNT(*) FROM sos_responders WHERE alert_id = NEW.id) = 0 THEN
    
    UPDATE sos_alerts 
    SET 
      escalation_level = escalation_level + 1,
      notification_radius = notification_radius * 2,
      updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user last seen on location updates
CREATE TRIGGER trigger_update_last_seen
  AFTER INSERT ON location_updates
  FOR EACH ROW
  EXECUTE FUNCTION update_user_last_seen();

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update timestamp trigger to relevant tables
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sos_alerts_updated_at 
  BEFORE UPDATE ON sos_alerts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_rooms_updated_at 
  BEFORE UPDATE ON chat_rooms 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable real-time for critical tables
ALTER PUBLICATION supabase_realtime ADD TABLE sos_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE sos_responders;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE location_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_nearby_users TO authenticated;
GRANT EXECUTE ON FUNCTION get_nearby_alerts TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_distance TO authenticated;
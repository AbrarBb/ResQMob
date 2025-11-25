-- Fix get_nearby_alerts function to use correct column name
-- The sos_alerts table has 'alert_timestamp' not 'timestamp'

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
  alert_time TIMESTAMPTZ,
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
    a.alert_timestamp as alert_time,
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

-- Also fix the auto_escalate_alert function
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
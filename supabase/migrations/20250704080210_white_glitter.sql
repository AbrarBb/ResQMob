/*
  # Sample Data for ResQMob

  1. Emergency Services
    - Police stations, hospitals, fire stations
    - Contact information and coverage areas

  2. Safe Zones
    - Hospitals, police stations, community centers
    - Operating hours and services

  3. Sample Users
    - Test users with different settings
    - Emergency contacts and relationships

  4. Sample Alerts and Responses
    - Active and resolved emergency alerts
    - User responses and chat rooms
*/

-- Insert Emergency Services
INSERT INTO emergency_services (id, name, type, phone, location, is_available, response_time, coverage) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'Dhaka Metropolitan Police', 'police', '+880-2-9586551', 
 '{"latitude": 23.7465, "longitude": 90.3723, "address": "Ramna Police Station, Dhaka"}', 
 true, 8, '{"radius": 15000, "areas": ["Ramna", "Shahbagh", "Dhanmondi"]}'),

('550e8400-e29b-41d4-a716-446655440011', 'Dhaka Medical College Hospital', 'medical', '+880-2-8626812',
 '{"latitude": 23.7223, "longitude": 90.3654, "address": "Dhaka Medical College Hospital, Dhaka"}',
 true, 12, '{"radius": 20000, "areas": ["Old Dhaka", "Dhanmondi", "Wari"]}'),

('550e8400-e29b-41d4-a716-446655440012', 'Fire Service Station', 'fire', '+880-2-9555555',
 '{"latitude": 23.7465, "longitude": 90.3723, "address": "Central Fire Station, Dhaka"}',
 true, 6, '{"radius": 12000, "areas": ["Central Dhaka", "Old Dhaka"]}'),

('550e8400-e29b-41d4-a716-446655440013', 'Square Hospital', 'medical', '+880-2-8159457',
 '{"latitude": 23.7516, "longitude": 90.3752, "address": "Square Hospital, Panthapath, Dhaka"}',
 true, 10, '{"radius": 18000, "areas": ["Dhanmondi", "Panthapath", "Kalabagan"]}'),

('550e8400-e29b-41d4-a716-446655440014', 'Gulshan Police Station', 'police', '+880-2-8821366',
 '{"latitude": 23.7806, "longitude": 90.4193, "address": "Gulshan Police Station, Dhaka"}',
 true, 7, '{"radius": 10000, "areas": ["Gulshan", "Banani", "Baridhara"]}');

-- Insert Safe Zones
INSERT INTO safe_zones (id, name, type, location, radius, contact_info, operating_hours, services, is_verified, rating) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'Dhaka Medical College Hospital', 'hospital',
 '{"latitude": 23.7223, "longitude": 90.3654, "address": "Dhaka Medical College Hospital, Dhaka"}',
 500, '{"phone": "+880-2-8626812", "email": "info@dmch.gov.bd"}',
 '{"open": "00:00", "close": "23:59", "is24Hours": true}',
 '["Emergency Care", "Trauma Center", "ICU", "Surgery"]', true, 4.2),

('650e8400-e29b-41d4-a716-446655440002', 'Square Hospital', 'hospital',
 '{"latitude": 23.7516, "longitude": 90.3752, "address": "Square Hospital, Panthapath, Dhaka"}',
 400, '{"phone": "+880-2-8159457", "website": "https://squarehospital.com"}',
 '{"open": "00:00", "close": "23:59", "is24Hours": true}',
 '["Emergency Care", "Cardiac Care", "Neurology", "Pediatrics"]', true, 4.5),

('650e8400-e29b-41d4-a716-446655440003', 'Ramna Police Station', 'police_station',
 '{"latitude": 23.7465, "longitude": 90.3723, "address": "Ramna Police Station, Dhaka"}',
 300, '{"phone": "+880-2-9586551"}',
 '{"open": "00:00", "close": "23:59", "is24Hours": true}',
 '["Emergency Response", "Crime Reporting", "Traffic Control"]', true, 3.8),

('650e8400-e29b-41d4-a716-446655440004', 'Central Fire Station', 'fire_station',
 '{"latitude": 23.7465, "longitude": 90.3723, "address": "Central Fire Station, Dhaka"}',
 350, '{"phone": "+880-2-9555555"}',
 '{"open": "00:00", "close": "23:59", "is24Hours": true}',
 '["Fire Emergency", "Rescue Operations", "Ambulance Service"]', true, 4.0),

('650e8400-e29b-41d4-a716-446655440005', 'Dhanmondi Community Center', 'community_center',
 '{"latitude": 23.7461, "longitude": 90.3742, "address": "Dhanmondi Community Center, Road 27"}',
 200, '{"phone": "+880-2-9661234", "email": "info@dhanmondicc.org"}',
 '{"open": "06:00", "close": "22:00", "is24Hours": false}',
 '["Community Meetings", "Emergency Shelter", "First Aid"]', true, 4.1),

('650e8400-e29b-41d4-a716-446655440006', 'Gulshan Youth Club', 'community_center',
 '{"latitude": 23.7806, "longitude": 90.4193, "address": "Gulshan Youth Club, Road 11"}',
 250, '{"phone": "+880-2-8821234"}',
 '{"open": "07:00", "close": "21:00", "is24Hours": false}',
 '["Youth Programs", "Emergency Assembly Point", "Community Support"]', true, 3.9);

-- Insert Sample Users (for testing)
INSERT INTO users (id, email, name, phone, avatar, location, is_online, last_seen, settings, verified) VALUES
('750e8400-e29b-41d4-a716-446655440001', 'dr.sarah@resqmob.com', 'Dr. Sarah Ahmed', '+880 1987-654321',
 'https://images.pexels.com/photos/559827/pexels-photo-559827.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
 '{"latitude": 23.7516, "longitude": 90.3752, "address": "Dhanmondi, Dhaka"}',
 true, NOW() - INTERVAL '5 minutes',
 '{"notificationsEnabled": true, "locationSharingEnabled": true, "privacyMode": false, "emergencyRadius": 5000, "autoSOSEnabled": true, "sosCountdown": 10, "backgroundMonitoring": true}',
 true),

('750e8400-e29b-41d4-a716-446655440002', 'rahman.khan@resqmob.com', 'Rahman Khan', '+880 1712-987654',
 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
 '{"latitude": 23.8103, "longitude": 90.4125, "address": "Gulshan, Dhaka"}',
 true, NOW() - INTERVAL '2 minutes',
 '{"notificationsEnabled": true, "locationSharingEnabled": true, "privacyMode": false, "emergencyRadius": 3000, "autoSOSEnabled": false, "sosCountdown": 15, "backgroundMonitoring": true}',
 false),

('750e8400-e29b-41d4-a716-446655440003', 'fatima.begum@resqmob.com', 'Fatima Begum', '+880 1555-123456',
 'https://images.pexels.com/photos/1468379/pexels-photo-1468379.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
 '{"latitude": 23.7806, "longitude": 90.4193, "address": "Banani, Dhaka"}',
 false, NOW() - INTERVAL '1 hour',
 '{"notificationsEnabled": true, "locationSharingEnabled": true, "privacyMode": true, "emergencyRadius": 2000, "autoSOSEnabled": false, "sosCountdown": 20, "backgroundMonitoring": false}',
 true),

('750e8400-e29b-41d4-a716-446655440004', 'karim.ahmed@resqmob.com', 'Karim Ahmed', '+880 1888-765432',
 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
 '{"latitude": 23.7465, "longitude": 90.3723, "address": "Ramna, Dhaka"}',
 true, NOW() - INTERVAL '10 minutes',
 '{"notificationsEnabled": true, "locationSharingEnabled": true, "privacyMode": false, "emergencyRadius": 7000, "autoSOSEnabled": true, "sosCountdown": 5, "backgroundMonitoring": true}',
 true);

-- Insert Emergency Contacts for sample users
INSERT INTO emergency_contacts (id, user_id, name, phone, relationship, is_primary, notification_enabled) VALUES
('850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', 'Dr. Rahman Ali', '+880 1777-888999', 'Colleague', true, true),
('850e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440001', 'Nasir Ahmed', '+880 1666-777888', 'Brother', false, true),
('850e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440002', 'Salma Khan', '+880 1555-666777', 'Wife', true, true),
('850e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440003', 'Abdul Karim', '+880 1444-555666', 'Husband', true, true),
('850e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440004', 'Rashida Ahmed', '+880 1333-444555', 'Mother', true, true);

-- Insert Sample SOS Alerts (for testing)
INSERT INTO sos_alerts (id, user_id, type, urgency_level, status, location, message, alert_timestamp, confirmations, escalation_level, notification_radius, is_anonymous) VALUES
('950e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', 'medical', 4, 'active',
 '{"latitude": 23.7516, "longitude": 90.3752, "address": "Dhanmondi Road 27, Dhaka", "accuracy": 10}',
 'Heart attack symptoms, need immediate medical assistance', NOW() - INTERVAL '5 minutes', 1, 1, 2000, false),

('950e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440002', 'accident', 3, 'active',
 '{"latitude": 23.8103, "longitude": 90.4125, "address": "Gulshan Avenue, Dhaka", "accuracy": 15}',
 'Car accident, minor injuries, need assistance', NOW() - INTERVAL '15 minutes', 1, 1, 1500, false),

('950e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440004', 'general', 2, 'resolved',
 '{"latitude": 23.7465, "longitude": 90.3723, "address": "Ramna Park, Dhaka", "accuracy": 20}',
 'Lost in park area, found safe', NOW() - INTERVAL '2 hours', 1, 1, 1000, false);

-- Insert Sample Responders
INSERT INTO sos_responders (id, user_id, alert_id, status, distance, response_timestamp, estimated_arrival) VALUES
('a50e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440002', '950e8400-e29b-41d4-a716-446655440001', 'responding', 800, NOW() - INTERVAL '3 minutes', NOW() + INTERVAL '5 minutes'),
('a50e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440003', '950e8400-e29b-41d4-a716-446655440001', 'responding', 1200, NOW() - INTERVAL '2 minutes', NOW() + INTERVAL '7 minutes'),
('a50e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440002', 'arrived', 300, NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '5 minutes');

-- Insert Sample Feed Posts
INSERT INTO feed_posts (id, user_id, content, type, post_timestamp, location, likes, comments, shares, tags, visibility, is_verified) VALUES
('b50e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', 
 'Important safety reminder: Always inform someone about your travel plans, especially when going to unfamiliar areas. Keep emergency contacts updated in your phone.',
 'safety_tip', NOW() - INTERVAL '2 hours',
 '{"latitude": 23.7516, "longitude": 90.3752, "address": "Dhanmondi, Dhaka", "distance": 0}',
 15, 3, 8, '["safety", "travel", "emergency"]', 'public', true),

('b50e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440002',
 'Traffic accident cleared at Gulshan intersection. Thanks to all ResQMob users who responded quickly. This is why community matters!',
 'incident_report', NOW() - INTERVAL '1 hour',
 '{"latitude": 23.8103, "longitude": 90.4125, "address": "Gulshan, Dhaka", "distance": 0}',
 23, 7, 12, '["traffic", "accident", "resolved", "community"]', 'public', false),

('b50e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440003',
 'New neighborhood watch group forming in Banani area. Looking for volunteers to help keep our community safe. Weekly meetings every Saturday 6 PM.',
 'community_update', NOW() - INTERVAL '6 hours',
 '{"latitude": 23.7806, "longitude": 90.4193, "address": "Banani, Dhaka", "distance": 0}',
 8, 12, 4, '["community", "safety", "volunteer", "banani"]', 'neighborhood', true);

-- Insert Sample Chat Rooms
INSERT INTO chat_rooms (id, name, type, is_active, urgency_level, location, alert_id, participant_count) VALUES
('c50e8400-e29b-41d4-a716-446655440001', 'Emergency Response - Medical Alert', 'emergency', true, 4,
 '{"latitude": 23.7516, "longitude": 90.3752, "address": "Dhanmondi Road 27, Dhaka"}',
 '950e8400-e29b-41d4-a716-446655440001', 3),

('c50e8400-e29b-41d4-a716-446655440002', 'Dhanmondi Neighborhood Watch', 'neighborhood', true, null,
 '{"latitude": 23.7461, "longitude": 90.3742, "address": "Dhanmondi, Dhaka"}',
 null, 24),

('c50e8400-e29b-41d4-a716-446655440003', 'Gulshan Safety Network', 'general', true, null,
 '{"latitude": 23.8103, "longitude": 90.4125, "address": "Gulshan, Dhaka"}',
 null, 18);

-- Insert Sample Chat Participants
INSERT INTO chat_participants (id, chat_room_id, user_id, role, joined_at, is_online) VALUES
('d50e8400-e29b-41d4-a716-446655440001', 'c50e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', 'admin', NOW() - INTERVAL '5 minutes', true),
('d50e8400-e29b-41d4-a716-446655440002', 'c50e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440002', 'member', NOW() - INTERVAL '3 minutes', true),
('d50e8400-e29b-41d4-a716-446655440003', 'c50e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440003', 'member', NOW() - INTERVAL '2 minutes', true);

-- Insert Sample Messages
INSERT INTO messages (id, chat_room_id, sender_id, content, type, message_timestamp, is_edited) VALUES
('e50e8400-e29b-41d4-a716-446655440001', 'c50e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001',
 'I need immediate medical assistance. Having chest pain and difficulty breathing.', 'text', NOW() - INTERVAL '5 minutes', false),

('e50e8400-e29b-41d4-a716-446655440002', 'c50e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440002',
 'I am responding to your location. ETA 5 minutes. Stay calm, help is coming.', 'text', NOW() - INTERVAL '3 minutes', false),

('e50e8400-e29b-41d4-a716-446655440003', 'c50e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440003',
 'Ambulance has been called. I am also heading to your location.', 'text', NOW() - INTERVAL '2 minutes', false);

-- Insert Sample Notifications
INSERT INTO notifications (id, user_id, type, title, body, data, is_read, notification_timestamp, priority) VALUES
('f50e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440002', 'sos_alert',
 'EMERGENCY ALERT NEARBY', 'Medical emergency reported in Dhanmondi. Tap to help.',
 '{"alert_id": "950e8400-e29b-41d4-a716-446655440001", "alert_type": "medical", "urgency_level": 4}',
 false, NOW() - INTERVAL '5 minutes', 'critical'),

('f50e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440003', 'sos_alert',
 'EMERGENCY ALERT NEARBY', 'Medical emergency reported in Dhanmondi. Tap to help.',
 '{"alert_id": "950e8400-e29b-41d4-a716-446655440001", "alert_type": "medical", "urgency_level": 4}',
 false, NOW() - INTERVAL '5 minutes', 'critical'),

('f50e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440001', 'sos_response',
 'Help is Coming!', 'Rahman Khan is responding to your emergency alert.',
 '{"alert_id": "950e8400-e29b-41d4-a716-446655440001", "responder_id": "750e8400-e29b-41d4-a716-446655440002"}',
 false, NOW() - INTERVAL '3 minutes', 'high');

-- Insert Sample Location Updates
INSERT INTO location_updates (id, user_id, location, update_timestamp, is_emergency, accuracy) VALUES
('g50e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001',
 '{"latitude": 23.7516, "longitude": 90.3752, "heading": 45, "speed": 0}',
 NOW() - INTERVAL '1 minute', true, 10.0),

('g50e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440002',
 '{"latitude": 23.8103, "longitude": 90.4125, "heading": 180, "speed": 25}',
 NOW() - INTERVAL '2 minutes', false, 15.0),

('g50e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440003',
 '{"latitude": 23.7806, "longitude": 90.4193, "heading": 90, "speed": 0}',
 NOW() - INTERVAL '30 minutes', false, 20.0);
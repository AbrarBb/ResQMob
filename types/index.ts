export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  avatar?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  isOnline: boolean;
  lastSeen: Date;
  emergencyContacts: EmergencyContact[];
  settings: UserSettings;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
  notificationEnabled: boolean;
}

export interface UserSettings {
  notificationsEnabled: boolean;
  locationSharingEnabled: boolean;
  privacyMode: boolean;
  emergencyRadius: number; // in meters
  autoSOSEnabled: boolean;
  sosCountdown: number; // in seconds
  backgroundMonitoring: boolean;
}

export interface SOSAlert {
  id: string;
  userId: string;
  user: User;
  type: 'medical' | 'fire' | 'police' | 'general' | 'accident' | 'violence';
  urgencyLevel: 1 | 2 | 3 | 4 | 5;
  status: 'active' | 'resolved' | 'false_alarm';
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    accuracy?: number;
  };
  message?: string;
  timestamp: Date;
  resolvedAt?: Date;
  responders: SOSResponder[];
  confirmations: number;
  escalationLevel: number;
  notificationRadius: number;
  mediaUrls?: string[];
  isAnonymous: boolean;
}

export interface SOSResponder {
  id: string;
  userId: string;
  user: User;
  alertId: string;
  status: 'responding' | 'arrived' | 'helping' | 'unavailable';
  estimatedArrival?: Date;
  distance: number;
  timestamp: Date;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'emergency' | 'neighborhood' | 'general' | 'alert_response';
  participants: ChatParticipant[];
  lastMessage?: Message;
  isActive: boolean;
  urgencyLevel?: number;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  alertId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatParticipant {
  id: string;
  userId: string;
  user: User;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: Date;
  isOnline: boolean;
}

export interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  sender: User;
  content: string;
  type: 'text' | 'location' | 'image' | 'emergency_alert' | 'system';
  timestamp: Date;
  readBy: MessageRead[];
  mediaUrl?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  isEdited: boolean;
  editedAt?: Date;
}

export interface MessageRead {
  userId: string;
  readAt: Date;
}

export interface FeedPost {
  id: string;
  userId: string;
  user: User;
  content: string;
  type: 'safety_tip' | 'incident_report' | 'community_update' | 'help_request';
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
    distance?: number;
  };
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  imageUrl?: string;
  tags: string[];
  visibility: 'public' | 'neighborhood' | 'contacts';
  isVerified: boolean;
}

export interface SafeZone {
  id: string;
  name: string;
  type: 'hospital' | 'police_station' | 'fire_station' | 'safe_house' | 'community_center';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  radius: number;
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
  };
  operatingHours?: {
    open: string;
    close: string;
    is24Hours: boolean;
  };
  services: string[];
  isVerified: boolean;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'sos_alert' | 'sos_response' | 'chat_message' | 'safety_update' | 'system';
  title: string;
  body: string;
  data?: any;
  isRead: boolean;
  timestamp: Date;
  priority: 'low' | 'normal' | 'high' | 'critical';
  actionUrl?: string;
}

export interface LocationUpdate {
  userId: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    heading?: number;
    speed?: number;
  };
  timestamp: Date;
  isEmergency: boolean;
}

export interface EmergencyService {
  id: string;
  name: string;
  type: 'police' | 'fire' | 'medical' | 'rescue';
  phone: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  isAvailable: boolean;
  responseTime: number; // in minutes
  coverage: {
    radius: number;
    areas: string[];
  };
}

export interface Analytics {
  totalAlerts: number;
  resolvedAlerts: number;
  averageResponseTime: number;
  activeUsers: number;
  safetyScore: number;
  recentIncidents: SOSAlert[];
  popularSafeZones: SafeZone[];
  communityEngagement: {
    posts: number;
    comments: number;
    likes: number;
  };
}
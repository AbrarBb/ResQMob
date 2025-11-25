import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  Alert,
  Image
} from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, TriangleAlert as AlertTriangle, Phone, Video, Users, MapPin, Plus, Search } from 'lucide-react-native';

interface ChatRoom {
  id: string;
  name: string;
  type: 'emergency' | 'neighborhood' | 'general' | 'alert_response';
  participants: number;
  lastMessage: {
    content: string;
    timestamp: Date;
    sender: string;
  };
  isActive: boolean;
  urgencyLevel?: number;
  location?: string;
}

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: Date;
  type: 'text' | 'location' | 'image' | 'emergency_alert';
}

export default function EmergencyChat() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showRoomList, setShowRoomList] = useState(true);

  useEffect(() => {
    loadChatRooms();
  }, []);

  const loadChatRooms = () => {
    setChatRooms([
      {
        id: '1',
        name: 'Emergency Response - Medical',
        type: 'emergency',
        participants: 7,
        lastMessage: {
          content: 'Ambulance is on the way, ETA 5 minutes',
          timestamp: new Date(Date.now() - 180000),
          sender: 'Dr. Rahman'
        },
        isActive: true,
        urgencyLevel: 3,
        location: 'Dhanmondi'
      },
      {
        id: '2',
        name: 'Dhanmondi Neighborhood Watch',
        type: 'neighborhood',
        participants: 24,
        lastMessage: {
          content: 'All clear in sector 7, continuing patrol',
          timestamp: new Date(Date.now() - 600000),
          sender: 'Salam Ahmed'
        },
        isActive: true
      },
      {
        id: '3',
        name: 'Traffic Accident - Gulshan',
        type: 'alert_response',
        participants: 12,
        lastMessage: {
          content: 'Police have arrived, directing traffic',
          timestamp: new Date(Date.now() - 1200000),
          sender: 'Traffic Control'
        },
        isActive: false,
        urgencyLevel: 2,
        location: 'Gulshan'
      },
      {
        id: '4',
        name: 'Uttara Community Safety',
        type: 'general',
        participants: 89,
        lastMessage: {
          content: 'Weekly safety meeting scheduled for Saturday',
          timestamp: new Date(Date.now() - 3600000),
          sender: 'Community Admin'
        },
        isActive: true
      }
    ]);
  };

  const loadMessages = (roomId: string) => {
    // Sample messages for demonstration
    const sampleMessages: Message[] = [
      {
        id: '1',
        sender: {
          id: '1',
          name: 'Dr. Rahman',
          avatar: 'https://images.pexels.com/photos/612608/pexels-photo-612608.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2'
        },
        content: 'I\'m 2 minutes away from the location. What\'s the current status?',
        timestamp: new Date(Date.now() - 300000),
        type: 'text'
      },
      {
        id: '2',
        sender: {
          id: '2',
          name: 'First Responder',
          avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2'
        },
        content: 'Patient is conscious and breathing. Need medical attention for chest pain.',
        timestamp: new Date(Date.now() - 240000),
        type: 'text'
      },
      {
        id: '3',
        sender: {
          id: '3',
          name: 'Emergency Coordinator',
          avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2'
        },
        content: 'Ambulance dispatched. ETA 5 minutes.',
        timestamp: new Date(Date.now() - 180000),
        type: 'text'
      },
      {
        id: '4',
        sender: {
          id: '4',
          name: 'You',
          avatar: 'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2'
        },
        content: 'I can help guide the ambulance to the exact location.',
        timestamp: new Date(Date.now() - 120000),
        type: 'text'
      }
    ];
    
    setMessages(sampleMessages);
  };

  const handleRoomSelect = (room: ChatRoom) => {
    setSelectedRoom(room);
    setShowRoomList(false);
    loadMessages(room.id);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedRoom) {
      const message: Message = {
        id: Date.now().toString(),
        sender: {
          id: 'current_user',
          name: 'You',
          avatar: 'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2'
        },
        content: newMessage,
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const handleEmergencyCall = () => {
    Alert.alert(
      'Emergency Call',
      'This will initiate an emergency call to local authorities.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Now', style: 'destructive', onPress: () => {
          Alert.alert('Calling', 'Emergency call initiated...');
        }}
      ]
    );
  };

  const getChatTypeColor = (type: string) => {
    switch (type) {
      case 'emergency': return '#dc2626';
      case 'alert_response': return '#ea580c';
      case 'neighborhood': return '#1d4ed8';
      case 'general': return '#059669';
      default: return '#6b7280';
    }
  };

  const getChatTypeLabel = (type: string) => {
    switch (type) {
      case 'emergency': return 'Emergency';
      case 'alert_response': return 'Alert Response';
      case 'neighborhood': return 'Neighborhood';
      case 'general': return 'General';
      default: return 'Chat';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1m ago';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const formatMessageTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (showRoomList) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Emergency Chat</Text>
          <TouchableOpacity style={styles.newChatButton}>
            <Plus size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search chats..."
          />
        </View>

        {/* Chat Rooms */}
        <ScrollView style={styles.chatList} showsVerticalScrollIndicator={false}>
          {chatRooms.map((room) => (
            <TouchableOpacity
              key={room.id}
              style={styles.chatRoomItem}
              onPress={() => handleRoomSelect(room)}
            >
              <View style={styles.chatRoomHeader}>
                <View style={styles.chatRoomInfo}>
                  <Text style={styles.chatRoomName}>{room.name}</Text>
                  <View style={styles.chatRoomMeta}>
                    <View style={[styles.chatTypeIndicator, { backgroundColor: getChatTypeColor(room.type) }]}>
                      <Text style={styles.chatTypeText}>{getChatTypeLabel(room.type)}</Text>
                    </View>
                    {room.urgencyLevel && (
                      <View style={styles.urgencyBadge}>
                        <AlertTriangle size={12} color="#dc2626" />
                        <Text style={styles.urgencyText}>L{room.urgencyLevel}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.chatRoomStatus}>
                  <Text style={styles.chatRoomTime}>{formatTimeAgo(room.lastMessage.timestamp)}</Text>
                  <View style={[styles.activeIndicator, { backgroundColor: room.isActive ? '#059669' : '#6b7280' }]} />
                </View>
              </View>
              
              <Text style={styles.lastMessage}>{room.lastMessage.content}</Text>
              
              <View style={styles.chatRoomFooter}>
                <View style={styles.participantsInfo}>
                  <Users size={14} color="#6b7280" />
                  <Text style={styles.participantsCount}>{room.participants} participants</Text>
                </View>
                {room.location && (
                  <View style={styles.locationInfo}>
                    <MapPin size={14} color="#6b7280" />
                    <Text style={styles.locationText}>{room.location}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Chat Header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setShowRoomList(true)}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.chatHeaderInfo}>
          <Text style={styles.chatHeaderTitle}>{selectedRoom?.name}</Text>
          <Text style={styles.chatHeaderSubtitle}>
            {selectedRoom?.participants} participants • {selectedRoom?.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
        <View style={styles.chatHeaderActions}>
          <TouchableOpacity style={styles.headerActionButton}>
            <Phone size={20} color="#dc2626" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionButton}>
            <Video size={20} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
        {messages.map((message) => (
          <View key={message.id} style={[
            styles.messageItem,
            message.sender.name === 'You' && styles.messageItemSelf
          ]}>
            <Image source={{ uri: message.sender.avatar }} style={styles.messageAvatar} />
            <View style={styles.messageContent}>
              <View style={styles.messageHeader}>
                <Text style={styles.messageSender}>{message.sender.name}</Text>
                <Text style={styles.messageTime}>{formatMessageTime(message.timestamp)}</Text>
              </View>
              <Text style={styles.messageText}>{message.content}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Emergency Actions */}
      {selectedRoom?.type === 'emergency' && (
        <View style={styles.emergencyActions}>
          <TouchableOpacity style={styles.emergencyCallButton} onPress={handleEmergencyCall}>
            <Phone size={20} color="#ffffff" />
            <Text style={styles.emergencyCallText}>Emergency Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.locationButton}>
            <MapPin size={20} color="#dc2626" />
            <Text style={styles.locationButtonText}>Share Location</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Message Input */}
      <View style={styles.messageInputContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={handleSendMessage}
        >
          <Send size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  newChatButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  chatList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  chatRoomItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  chatRoomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  chatRoomInfo: {
    flex: 1,
  },
  chatRoomName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  chatRoomMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatTypeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  chatTypeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef2f2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  urgencyText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#dc2626',
  },
  chatRoomStatus: {
    alignItems: 'flex-end',
  },
  chatRoomTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginBottom: 4,
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  lastMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginBottom: 8,
  },
  chatRoomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  participantsCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 24,
    fontFamily: 'Inter-Regular',
    color: '#dc2626',
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  chatHeaderSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  chatHeaderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerActionButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  messageItemSelf: {
    flexDirection: 'row-reverse',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  messageContent: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageSender: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#dc2626',
  },
  messageTime: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 18,
  },
  emergencyActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  emergencyCallButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#dc2626',
    borderRadius: 8,
  },
  emergencyCallText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  locationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  locationButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#dc2626',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#dc2626',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
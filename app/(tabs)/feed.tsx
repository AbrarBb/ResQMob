import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  Image
} from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, MessageCircle, Share, TriangleAlert as AlertTriangle, Shield, Users, MapPin, Plus, Search } from 'lucide-react-native';

interface FeedPost {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
  };
  content: string;
  type: 'safety_tip' | 'incident_report' | 'community_update' | 'help_request';
  timestamp: Date;
  location?: {
    name: string;
    distance: number;
  };
  likes: number;
  comments: number;
  isLiked: boolean;
  imageUrl?: string;
}

export default function SafetyFeed() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'safety_tip' | 'incident_report' | 'community_update' | 'help_request'>('all');

  useEffect(() => {
    loadFeedData();
  }, []);

  const loadFeedData = () => {
    // Sample feed data
    setPosts([
      {
        id: '1',
        user: {
          id: '1',
          name: 'Dr. Tasnim Jara',
          avatar: 'https://yt3.googleusercontent.com/OKQaRdItmuFRKIDooobVVX7xJgaSLbsbr0-MRbFps-bONQ1QEQp6Tm1eyYC5GHra4_AuQNhz=s900-c-k-c0x00ffffff-no-rj',
          verified: true
        },
        content: 'Important safety tip: Always carry a fully charged power bank and keep emergency contacts easily accessible. In case of emergency, having a working phone can be life-saving.',
        type: 'safety_tip',
        timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
        location: { name: 'Dhanmondi', distance: 2.3 },
        likes: 24,
        comments: 8,
        isLiked: false
      },
      {
        id: '2',
        user: {
          id: '2',
          name: 'Community Watch BD',
          avatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2',
          verified: true
        },
        content: 'RESOLVED: Traffic accident at Gulshan-2 intersection has been cleared. Emergency services responded quickly. Thank you to all who offered assistance.',
        type: 'incident_report',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        location: { name: 'Gulshan', distance: 5.1 },
        likes: 45,
        comments: 12,
        isLiked: true,
        imageUrl: 'https://images.pexels.com/photos/163016/highway-the-way-forward-blue-sky-163016.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'
      },
      {
        id: '3',
        user: {
          id: '3',
          name: 'Saiful Islam',
          avatar: 'https://media.licdn.com/dms/image/v2/D4D03AQGmmKUpJo_zew/profile-displayphoto-shrink_800_800/B4DZdfOpO7G8Ao-/0/1749649364547?e=1756944000&v=beta&t=ovbD6qV-1fL7sxdYLaLcvDL7UWjxsiRMhhgsTGdkUKA',
          verified: false
        },
        content: 'New neighborhood watch group forming in Uttara. Looking for volunteers to help keep our community safe. Weekly meetings every Saturday. DM for details.',
        type: 'community_update',
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        location: { name: 'Uttara', distance: 12.5 },
        likes: 18,
        comments: 6,
        isLiked: false
      },
      {
        id: '4',
        user: {
          id: '4',
          name: 'Fatima Begum',
          avatar: 'https://images.pexels.com/photos/1468379/pexels-photo-1468379.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2',
          verified: false
        },
        content: 'URGENT: Elderly woman lost in Ramna Park area. Last seen wearing blue sari. Please contact if you have any information. Police have been notified.',
        type: 'help_request',
        timestamp: new Date(Date.now() - 10800000), // 3 hours ago
        location: { name: 'Ramna', distance: 3.8 },
        likes: 67,
        comments: 23,
        isLiked: true
      },
      {
        id: '5',
        user: {
          id: '5',
          name: 'Fire Service Dhaka',
          avatar: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Bangladesh_Fire_Service_%26_Civil_Defence_Logo.png/250px-Bangladesh_Fire_Service_%26_Civil_Defence_Logo.png',
          verified: true
        },
        content: 'Fire safety reminder: Check smoke detectors monthly, have an evacuation plan, and keep fire extinguishers accessible. Small preparations can save lives.',
        type: 'safety_tip',
        timestamp: new Date(Date.now() - 14400000), // 4 hours ago
        likes: 89,
        comments: 15,
        isLiked: false
      }
    ]);
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked, 
            likes: post.isLiked ? post.likes - 1 : post.likes + 1 
          }
        : post
    ));
  };

  const handleComment = (postId: string) => {
    Alert.alert('Comment', 'Comment feature coming soon!');
  };

  const handleShare = (postId: string) => {
    Alert.alert('Share', 'Share feature coming soon!');
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'safety_tip': return '#059669';
      case 'incident_report': return '#dc2626';
      case 'community_update': return '#1d4ed8';
      case 'help_request': return '#ea580c';
      default: return '#6b7280';
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'safety_tip': return Shield;
      case 'incident_report': return AlertTriangle;
      case 'community_update': return Users;
      case 'help_request': return Heart;
      default: return MessageCircle;
    }
  };

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case 'safety_tip': return 'Safety Tip';
      case 'incident_report': return 'Incident Report';
      case 'community_update': return 'Community Update';
      case 'help_request': return 'Help Request';
      default: return 'Post';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  const filteredPosts = selectedFilter === 'all' 
    ? posts 
    : posts.filter(post => post.type === selectedFilter);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Safety Feed</Text>
        <TouchableOpacity style={styles.newPostButton}>
          <Plus size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search safety updates..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterTab, selectedFilter === 'all' && styles.filterTabActive]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text style={[styles.filterTabText, selectedFilter === 'all' && styles.filterTabTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, selectedFilter === 'safety_tip' && styles.filterTabActive]}
          onPress={() => setSelectedFilter('safety_tip')}
        >
          <Text style={[styles.filterTabText, selectedFilter === 'safety_tip' && styles.filterTabTextActive]}>
            Safety Tips
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, selectedFilter === 'incident_report' && styles.filterTabActive]}
          onPress={() => setSelectedFilter('incident_report')}
        >
          <Text style={[styles.filterTabText, selectedFilter === 'incident_report' && styles.filterTabTextActive]}>
            Incidents
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, selectedFilter === 'community_update' && styles.filterTabActive]}
          onPress={() => setSelectedFilter('community_update')}
        >
          <Text style={[styles.filterTabText, selectedFilter === 'community_update' && styles.filterTabTextActive]}>
            Community
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, selectedFilter === 'help_request' && styles.filterTabActive]}
          onPress={() => setSelectedFilter('help_request')}
        >
          <Text style={[styles.filterTabText, selectedFilter === 'help_request' && styles.filterTabTextActive]}>
            Help Requests
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Feed */}
      <ScrollView style={styles.feedContainer} showsVerticalScrollIndicator={false}>
        {filteredPosts.map((post) => {
          const PostIcon = getPostTypeIcon(post.type);
          return (
            <View key={post.id} style={styles.postCard}>
              {/* Post Header */}
              <View style={styles.postHeader}>
                <Image source={{ uri: post.user.avatar }} style={styles.avatar} />
                <View style={styles.postHeaderInfo}>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{post.user.name}</Text>
                    {post.user.verified && <Shield size={14} color="#059669" />}
                  </View>
                  <View style={styles.postMeta}>
                    <View style={styles.postTypeContainer}>
                      <PostIcon size={12} color={getPostTypeColor(post.type)} />
                      <Text style={[styles.postType, { color: getPostTypeColor(post.type) }]}>
                        {getPostTypeLabel(post.type)}
                      </Text>
                    </View>
                    <Text style={styles.postTime}>{formatTimeAgo(post.timestamp)}</Text>
                    {post.location && (
                      <View style={styles.locationInfo}>
                        <MapPin size={12} color="#6b7280" />
                        <Text style={styles.locationText}>
                          {post.location.name} • {post.location.distance}km
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Post Content */}
              <Text style={styles.postContent}>{post.content}</Text>

              {/* Post Image */}
              {post.imageUrl && (
                <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
              )}

              {/* Post Actions */}
              <View style={styles.postActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleLike(post.id)}
                >
                  <Heart 
                    size={20} 
                    color={post.isLiked ? '#dc2626' : '#6b7280'} 
                    fill={post.isLiked ? '#dc2626' : 'none'}
                  />
                  <Text style={[styles.actionText, post.isLiked && styles.actionTextActive]}>
                    {post.likes}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleComment(post.id)}
                >
                  <MessageCircle size={20} color="#6b7280" />
                  <Text style={styles.actionText}>{post.comments}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleShare(post.id)}
                >
                  <Share size={20} color="#6b7280" />
                  <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
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
  newPostButton: {
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
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: '#dc2626',
  },
  filterTabText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
  },
  filterTabTextActive: {
    color: '#ffffff',
  },
  feedContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  postCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postHeaderInfo: {
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  postTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postType: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  postTime: {
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
  postContent: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
  },
  actionTextActive: {
    color: '#dc2626',
  },
});
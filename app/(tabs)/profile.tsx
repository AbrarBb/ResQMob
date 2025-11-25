import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  Alert,
  Image
} from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, Bell, Shield, Phone, MapPin, Users, TriangleAlert as AlertTriangle, Lock, Eye, EyeOff, CreditCard as Edit3, Camera, ChevronRight } from 'lucide-react-native';

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationSharingEnabled, setLocationSharingEnabled] = useState(true);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    {
      id: '1',
      name: 'Dr. Sarah Ahmed',
      relationship: 'Family Doctor',
      phone: '+880 1712-345678',
      isPrimary: true
    },
    {
      id: '2',
      name: 'Rahman Khan',
      relationship: 'Emergency Contact',
      phone: '+880 1987-654321',
      isPrimary: false
    },
    {
      id: '3',
      name: 'Police Station',
      relationship: 'Local Authority',
      phone: '+880 1555-000999',
      isPrimary: false
    }
  ]);
  const [privacyMode, setPrivacyMode] = useState(false);

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing feature coming soon!');
  };

  const handleAddEmergencyContact = () => {
    Alert.alert('Add Contact', 'Add emergency contact feature coming soon!');
  };

  const handleRemoveEmergencyContact = (contactId: string) => {
    Alert.alert(
      'Remove Contact',
      'Are you sure you want to remove this emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            setEmergencyContacts(prev => prev.filter(contact => contact.id !== contactId));
          }
        }
      ]
    );
  };

  const handleLocationSettings = () => {
    Alert.alert('Location Settings', 'Location settings feature coming soon!');
  };

  const handlePrivacySettings = () => {
    Alert.alert('Privacy Settings', 'Privacy settings feature coming soon!');
  };

  const handleSafetySettings = () => {
    Alert.alert('Safety Settings', 'Safety settings feature coming soon!');
  };

  const handleAccountSettings = () => {
    Alert.alert('Account Settings', 'Account settings feature coming soon!');
  };

  const handleSupport = () => {
    Alert.alert('Support', 'Support feature coming soon!');
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => {
          Alert.alert('Signed Out', 'You have been signed out successfully.');
        }}
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image 
              source={{ uri: 'https://media.licdn.com/dms/image/v2/D5603AQGv7MgHumldSQ/profile-displayphoto-shrink_800_800/B56ZanR7wnHUAc-/0/1746563218931?e=1756944000&v=beta&t=MvBTHtz1CVghIGX1pOVu0w3Ipv26QNX63mr9izHQff8' }}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.editImageButton}>
              <Camera size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>Abrar Khatib</Text>
          <Text style={styles.profileLocation}>Badda, Dhaka</Text>
          <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
            <Edit3 size={16} color="#dc2626" />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Safety Status */}
        <View style={styles.safetyStatusContainer}>
          <View style={styles.safetyStatusHeader}>
            <Shield size={20} color="#059669" />
            <Text style={styles.safetyStatusTitle}>Safety Status</Text>
            <View style={[styles.statusIndicator, { backgroundColor: '#059669' }]}>
              <Text style={styles.statusText}>Safe</Text>
            </View>
          </View>
          <Text style={styles.safetyStatusDescription}>
            Your safety network is active and you're connected to 12 nearby ResQMob users.
          </Text>
        </View>

        {/* Emergency Contacts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddEmergencyContact}>
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>
          
          {emergencyContacts.map((contact) => (
            <View key={contact.id} style={styles.contactItem}>
              <View style={styles.contactInfo}>
                <View style={styles.contactHeader}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  {contact.isPrimary && (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryBadgeText}>Primary</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.contactRelationship}>{contact.relationship}</Text>
                <Text style={styles.contactPhone}>{contact.phone}</Text>
              </View>
              <TouchableOpacity 
                style={styles.contactActions}
                onPress={() => handleRemoveEmergencyContact(contact.id)}
              >
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Quick Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Bell size={20} color="#dc2626" />
              <Text style={styles.settingTitle}>Emergency Notifications</Text>
            </View>
            <Switch 
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#e5e7eb', true: '#dc2626' }}
              thumbColor={notificationsEnabled ? '#ffffff' : '#f3f4f6'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MapPin size={20} color="#dc2626" />
              <Text style={styles.settingTitle}>Location Sharing</Text>
            </View>
            <Switch 
              value={locationSharingEnabled}
              onValueChange={setLocationSharingEnabled}
              trackColor={{ false: '#e5e7eb', true: '#dc2626' }}
              thumbColor={locationSharingEnabled ? '#ffffff' : '#f3f4f6'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              {privacyMode ? <EyeOff size={20} color="#dc2626" /> : <Eye size={20} color="#dc2626" />}
              <Text style={styles.settingTitle}>Privacy Mode</Text>
            </View>
            <Switch 
              value={privacyMode}
              onValueChange={setPrivacyMode}
              trackColor={{ false: '#e5e7eb', true: '#dc2626' }}
              thumbColor={privacyMode ? '#ffffff' : '#f3f4f6'}
            />
          </View>
        </View>

        {/* Settings Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleLocationSettings}>
            <View style={styles.menuItemContent}>
              <MapPin size={20} color="#6b7280" />
              <Text style={styles.menuItemTitle}>Location Settings</Text>
            </View>
            <ChevronRight size={20} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handlePrivacySettings}>
            <View style={styles.menuItemContent}>
              <Lock size={20} color="#6b7280" />
              <Text style={styles.menuItemTitle}>Privacy & Security</Text>
            </View>
            <ChevronRight size={20} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleSafetySettings}>
            <View style={styles.menuItemContent}>
              <Shield size={20} color="#6b7280" />
              <Text style={styles.menuItemTitle}>Safety Settings</Text>
            </View>
            <ChevronRight size={20} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleAccountSettings}>
            <View style={styles.menuItemContent}>
              <User size={20} color="#6b7280" />
              <Text style={styles.menuItemTitle}>Account Settings</Text>
            </View>
            <ChevronRight size={20} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleSupport}>
            <View style={styles.menuItemContent}>
              <AlertTriangle size={20} color="#6b7280" />
              <Text style={styles.menuItemTitle}>Help & Support</Text>
            </View>
            <ChevronRight size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>ResQMob v1.0.0</Text>
          <Text style={styles.appInfoText}>Emergency Response Network</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#dc2626',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#dc2626',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  profileLocation: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginBottom: 16,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  editProfileText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#dc2626',
  },
  safetyStatusContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  safetyStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  safetyStatusTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    flex: 1,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  safetyStatusDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  contactInfo: {
    flex: 1,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  contactName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  primaryBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  contactRelationship: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
  },
  contactActions: {
    padding: 8,
  },
  removeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#dc2626',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  signOutButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  appInfoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    textAlign: 'center',
  },
});
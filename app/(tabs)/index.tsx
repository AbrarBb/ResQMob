import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { TriangleAlert as AlertTriangle, MapPin, Phone, Shield, Users, Clock, CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useEmergency } from '@/hooks/useEmergency';
import { router } from 'expo-router';

export default function EmergencyHome() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  console.log('EmergencyHome - Auth state:', { user: !!user, isAuthenticated, isLoading: authLoading });
  const {
    isSOSActive,
    activeAlerts,
    nearbyAlerts,
    isLoading: emergencyLoading,
    error,
    sendSOSAlert,
    respondToSOS,
    resolveSOSAlert,
    triggerHardwareButtonSOS,
  } = useEmergency(user);

  const [sosCountdown, setSOSCountdown] = useState(0);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.replace('/(auth)/signin');
    }
  }, [isAuthenticated, authLoading]);

  const handleSOSPress = () => {
    if (isSOSActive) {
      Alert.alert(
        'SOS Already Active',
        'You already have an active SOS alert. Do you want to resolve it?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Resolve', 
            style: 'destructive',
            onPress: () => handleResolveAlert()
          }
        ]
      );
      return;
    }

    Alert.alert(
      'EMERGENCY ALERT',
      'Are you sure you want to send an SOS alert? This will notify all nearby users and your emergency contacts.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'SEND SOS', 
          style: 'destructive',
          onPress: () => showSOSOptions()
        }
      ]
    );
  };

  const showSOSOptions = () => {
    Alert.alert(
      'Select Emergency Type',
      'Choose the type of emergency to send appropriate help',
      [
        { text: 'Medical Emergency', onPress: () => sendEmergencyAlert('medical', 5) },
        { text: 'Fire Emergency', onPress: () => sendEmergencyAlert('fire', 4) },
        { text: 'Police Required', onPress: () => sendEmergencyAlert('police', 4) },
        { text: 'General Emergency', onPress: () => sendEmergencyAlert('general', 3) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const sendEmergencyAlert = async (type: any, urgencyLevel: any) => {
    const alert = await sendSOSAlert(type, urgencyLevel, 'Emergency assistance needed');
    
    if (alert) {
      Alert.alert(
        'SOS SENT',
        'Your emergency alert has been sent to nearby users and emergency contacts. Help is on the way!',
        [{ text: 'OK' }]
      );
    }
  };

  const handleResolveAlert = () => {
    Alert.alert(
      'Resolve Emergency',
      'How would you like to resolve this emergency?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Emergency Resolved', 
          onPress: () => resolveEmergency('resolved')
        },
        { 
          text: 'False Alarm', 
          style: 'destructive',
          onPress: () => resolveEmergency('false_alarm')
        }
      ]
    );
  };

  const resolveEmergency = async (status: 'resolved' | 'false_alarm') => {
    const userAlert = activeAlerts.find(alert => alert.userId === user?.id);
    if (userAlert) {
      const success = await resolveSOSAlert(userAlert.id, status);
      if (success) {
        Alert.alert(
          'Emergency Resolved',
          status === 'resolved' 
            ? 'Your emergency has been marked as resolved. Thank you for updating your status!'
            : 'The alert has been marked as a false alarm. Thank you for the update.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleAlertResponse = (alertId: string) => {
    Alert.alert(
      'Respond to Emergency',
      'How would you like to help with this emergency?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'I\'m Responding', 
          onPress: () => respondToAlert(alertId, 'responding')
        },
        { 
          text: 'I\'ve Arrived', 
          onPress: () => respondToAlert(alertId, 'arrived')
        },
        { 
          text: 'I\'m Helping', 
          onPress: () => respondToAlert(alertId, 'helping')
        }
      ]
    );
  };

  const respondToAlert = async (alertId: string, status: any) => {
    const success = await respondToSOS(alertId, status);
    if (success) {
      Alert.alert(
        'Response Sent',
        'Your response has been sent to the person in need. Stay safe!',
        [{ text: 'OK' }]
      );
    }
  };

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'medical': return '#dc2626';
      case 'fire': return '#ea580c';
      case 'police': return '#1d4ed8';
      default: return '#7c3aed';
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'medical': return AlertTriangle;
      case 'fire': return AlertTriangle;
      case 'police': return Shield;
      default: return AlertTriangle;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    return `${minutes} minutes ago`;
  };

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Stay Safe, {user.name}</Text>
            <Text style={styles.subtitle}>ResQMob Emergency Network</Text>
          </View>
          <View style={styles.statusContainer}>
            <View style={styles.statusItem}>
              <Users size={16} color="#059669" />
                              <Text style={styles.statusText}>{nearbyAlerts.length} nearby</Text>
            </View>
            <View style={[styles.statusIndicator, { backgroundColor: '#059669' }]} />
          </View>
        </View>

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* SOS Button */}
        <View style={styles.sosContainer}>
          <TouchableOpacity
            style={[styles.sosButton, isSOSActive && styles.sosButtonActive]}
            onPress={handleSOSPress}
            disabled={emergencyLoading}
          >
            <LinearGradient
              colors={isSOSActive ? ['#fca5a5', '#dc2626'] : ['#dc2626', '#991b1b']}
              style={styles.sosGradient}
            >
              <AlertTriangle size={48} color="#ffffff" />
              <Text style={styles.sosButtonText}>
                {isSOSActive ? 'SOS ACTIVE' : 'SOS ALERT'}
              </Text>
              <Text style={styles.sosSubtext}>
                {isSOSActive ? 'Tap to resolve' : 'Tap to send emergency alert'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => Alert.alert('Emergency Call', 'Calling emergency services...')}
            >
              <Phone size={24} color="#dc2626" />
              <Text style={styles.quickActionText}>Emergency Call</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => router.push('/(tabs)/map')}
            >
              <MapPin size={24} color="#dc2626" />
              <Text style={styles.quickActionText}>View Map</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Shield size={24} color="#dc2626" />
              <Text style={styles.quickActionText}>Safety Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => router.push('/(tabs)/chat')}
            >
              <Users size={24} color="#dc2626" />
              <Text style={styles.quickActionText}>Emergency Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Alerts */}
        <View style={styles.alertsContainer}>
          <Text style={styles.sectionTitle}>Active Alerts Nearby</Text>
          {activeAlerts.length === 0 ? (
            <View style={styles.noAlertsContainer}>
              <CheckCircle size={48} color="#059669" />
              <Text style={styles.noAlertsTitle}>All Clear</Text>
              <Text style={styles.noAlertsText}>No active emergencies in your area</Text>
            </View>
          ) : (
            activeAlerts.map((alert) => {
              const AlertIcon = getAlertTypeIcon(alert.type);
              return (
                <View key={alert.id} style={styles.alertCard}>
                  <View style={styles.alertHeader}>
                    <View style={styles.alertTypeContainer}>
                      <AlertIcon size={20} color={getAlertTypeColor(alert.type)} />
                      <Text style={[styles.alertType, { color: getAlertTypeColor(alert.type) }]}>
                        {alert.type.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.alertStatus}>
                      <View style={[styles.urgencyIndicator, { backgroundColor: getAlertTypeColor(alert.type) }]}>
                        <Text style={styles.urgencyLevel}>L{alert.urgencyLevel}</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.alertInfo}>
                    <View style={styles.alertLocationRow}>
                      <MapPin size={16} color="#6b7280" />
                      <Text style={styles.alertLocation}>
                        {alert.location.address || `${alert.location.latitude.toFixed(4)}, ${alert.location.longitude.toFixed(4)}`}
                      </Text>
                    </View>
                    <View style={styles.alertMetaRow}>
                      <Clock size={16} color="#6b7280" />
                      <Text style={styles.alertTime}>{formatTimeAgo(alert.timestamp)}</Text>
                      <Users size={16} color="#6b7280" />
                      <Text style={styles.alertResponders}>{alert.responders.length} responding</Text>
                    </View>
                    {alert.message && (
                      <Text style={styles.alertMessage}>{alert.message}</Text>
                    )}
                  </View>

                  {alert.userId !== user.id && (
                    <View style={styles.alertActions}>
                      <TouchableOpacity 
                        style={styles.alertActionButton}
                        onPress={() => handleAlertResponse(alert.id)}
                      >
                        <CheckCircle size={18} color="#059669" />
                        <Text style={styles.alertActionText}>I Can Help</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.alertActionButton}
                        onPress={() => router.push('/(tabs)/map')}
                      >
                        <MapPin size={18} color="#dc2626" />
                        <Text style={styles.alertActionText}>View Location</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* Safety Tips */}
        <View style={styles.safetyTipsContainer}>
          <Text style={styles.sectionTitle}>Safety Tips</Text>
          <View style={styles.safetyTip}>
            <Shield size={20} color="#059669" />
            <Text style={styles.safetyTipText}>
              Always inform trusted contacts about your location when traveling alone
            </Text>
          </View>
          <View style={styles.safetyTip}>
            <AlertTriangle size={20} color="#ea580c" />
            <Text style={styles.safetyTipText}>
              Keep emergency numbers saved and easily accessible
            </Text>
          </View>
          <View style={styles.safetyTip}>
            <Users size={20} color="#1d4ed8" />
            <Text style={styles.safetyTipText}>
              Stay connected with your community safety network
            </Text>
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginTop: 2,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#059669',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#dc2626',
    textAlign: 'center',
  },
  sosContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sosButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  sosButtonActive: {
    opacity: 0.8,
  },
  sosGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  sosButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  sosSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    textAlign: 'center',
  },
  alertsContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  noAlertsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  noAlertsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#059669',
    marginTop: 16,
    marginBottom: 8,
  },
  noAlertsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    textAlign: 'center',
  },
  alertCard: {
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
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertType: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  alertStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  urgencyIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  urgencyLevel: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  alertInfo: {
    gap: 8,
    marginBottom: 16,
  },
  alertLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertLocation: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    flex: 1,
  },
  alertMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alertTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  alertResponders: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  alertMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    fontStyle: 'italic',
  },
  alertActions: {
    flexDirection: 'row',
    gap: 12,
  },
  alertActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  alertActionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  safetyTipsContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  safetyTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  safetyTipText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
  },
});
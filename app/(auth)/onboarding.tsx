import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, MapPin, Bell, Users, Phone, Eye, EyeOff, ChevronRight, CircleCheck as CheckCircle } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { LocationService } from '@/lib/location';
import { NotificationService } from '@/lib/notifications';

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [settings, setSettings] = useState({
    locationSharing: true,
    notifications: true,
    emergencyRadius: 5000,
    privacyMode: false,
    autoSOS: false,
  });
  const { user, updateProfile } = useAuth();

  const steps = [
    {
      title: 'Welcome to ResQMob',
      subtitle: 'Your personal emergency response network',
      icon: Shield,
      content: (
        <View style={styles.welcomeContent}>
          <Text style={styles.welcomeText}>
            ResQMob connects you with nearby users and emergency services to provide rapid assistance when you need it most.
          </Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <CheckCircle size={20} color="#059669" />
              <Text style={styles.featureText}>One-tap SOS alerts</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle size={20} color="#059669" />
              <Text style={styles.featureText}>Real-time location sharing</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle size={20} color="#059669" />
              <Text style={styles.featureText}>Community safety network</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle size={20} color="#059669" />
              <Text style={styles.featureText}>Emergency chat rooms</Text>
            </View>
          </View>
        </View>
      ),
    },
    {
      title: 'Location Services',
      subtitle: 'Enable location sharing for emergency assistance',
      icon: MapPin,
      content: (
        <View style={styles.stepContent}>
          <Text style={styles.stepDescription}>
            Location sharing allows nearby users to find and assist you during emergencies. Your location is only shared when you send an SOS alert or when you choose to help others.
          </Text>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MapPin size={20} color="#dc2626" />
              <Text style={styles.settingTitle}>Enable Location Sharing</Text>
            </View>
            <Switch
              value={settings.locationSharing}
              onValueChange={(value) => setSettings(prev => ({ ...prev, locationSharing: value }))}
              trackColor={{ false: '#e5e7eb', true: '#dc2626' }}
              thumbColor={settings.locationSharing ? '#ffffff' : '#f3f4f6'}
            />
          </View>
        </View>
      ),
    },
    {
      title: 'Notifications',
      subtitle: 'Stay informed about nearby emergencies',
      icon: Bell,
      content: (
        <View style={styles.stepContent}>
          <Text style={styles.stepDescription}>
            Receive instant notifications about emergency alerts in your area. You can choose to help or stay informed about ongoing situations.
          </Text>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Bell size={20} color="#dc2626" />
              <Text style={styles.settingTitle}>Emergency Notifications</Text>
            </View>
            <Switch
              value={settings.notifications}
              onValueChange={(value) => setSettings(prev => ({ ...prev, notifications: value }))}
              trackColor={{ false: '#e5e7eb', true: '#dc2626' }}
              thumbColor={settings.notifications ? '#ffffff' : '#f3f4f6'}
            />
          </View>
        </View>
      ),
    },
    {
      title: 'Privacy Settings',
      subtitle: 'Control your visibility and data sharing',
      icon: Eye,
      content: (
        <View style={styles.stepContent}>
          <Text style={styles.stepDescription}>
            Privacy mode limits your visibility to other users while still allowing you to receive emergency alerts and send SOS signals when needed.
          </Text>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              {settings.privacyMode ? (
                <EyeOff size={20} color="#dc2626" />
              ) : (
                <Eye size={20} color="#dc2626" />
              )}
              <Text style={styles.settingTitle}>Privacy Mode</Text>
            </View>
            <Switch
              value={settings.privacyMode}
              onValueChange={(value) => setSettings(prev => ({ ...prev, privacyMode: value }))}
              trackColor={{ false: '#e5e7eb', true: '#dc2626' }}
              thumbColor={settings.privacyMode ? '#ffffff' : '#f3f4f6'}
            />
          </View>
        </View>
      ),
    },
    {
      title: 'Emergency Contacts',
      subtitle: 'Add trusted contacts for emergency situations',
      icon: Phone,
      content: (
        <View style={styles.stepContent}>
          <Text style={styles.stepDescription}>
            Emergency contacts will be notified immediately when you send an SOS alert. You can add family members, friends, or medical professionals.
          </Text>
          <TouchableOpacity style={styles.addContactButton}>
            <Phone size={20} color="#dc2626" />
            <Text style={styles.addContactText}>Add Emergency Contact</Text>
            <ChevronRight size={20} color="#dc2626" />
          </TouchableOpacity>
          <Text style={styles.skipText}>You can add contacts later in your profile settings</Text>
        </View>
      ),
    },
  ];

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    try {
      // Request permissions based on settings
      if (settings.locationSharing) {
        await LocationService.initialize();
      }

      if (settings.notifications) {
        await NotificationService.initialize();
      }

      // Update user profile with settings
      if (user) {
        await updateProfile({
          settings: {
            notificationsEnabled: settings.notifications,
            locationSharingEnabled: settings.locationSharing,
            privacyMode: settings.privacyMode,
            emergencyRadius: settings.emergencyRadius,
            autoSOSEnabled: settings.autoSOS,
            sosCountdown: 10,
            backgroundMonitoring: true,
          },
        });
      }

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Setup Error', 'There was an issue completing setup. You can configure these settings later in your profile.');
      router.replace('/(tabs)');
    }
  };

  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index <= currentStep && styles.progressDotActive,
              ]}
            />
          ))}
        </View>

        {/* Step Content */}
        <View style={styles.stepContainer}>
          <LinearGradient
            colors={['#dc2626', '#991b1b']}
            style={styles.iconContainer}
          >
            <StepIcon size={32} color="#ffffff" />
          </LinearGradient>

          <Text style={styles.stepTitle}>{currentStepData.title}</Text>
          <Text style={styles.stepSubtitle}>{currentStepData.subtitle}</Text>

          {currentStepData.content}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          {currentStep > 0 && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.nextButton, currentStep === 0 && styles.nextButtonFull]}
            onPress={handleNext}
          >
            <LinearGradient
              colors={['#dc2626', '#991b1b']}
              style={styles.nextGradient}
            >
              <Text style={styles.nextButtonText}>
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Skip Option */}
        {currentStep < steps.length - 1 && (
          <TouchableOpacity style={styles.skipButton} onPress={completeOnboarding}>
            <Text style={styles.skipButtonText}>Skip Setup</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
  },
  progressDotActive: {
    backgroundColor: '#dc2626',
  },
  stepContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  stepTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  welcomeContent: {
    width: '100%',
  },
  welcomeText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  featureList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  featureText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#111827',
  },
  stepContent: {
    width: '100%',
  },
  stepDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#111827',
  },
  addContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    marginBottom: 16,
  },
  addContactText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#dc2626',
    marginLeft: 12,
  },
  skipText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    textAlign: 'center',
  },
  navigationContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dc2626',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#dc2626',
  },
  nextButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
});
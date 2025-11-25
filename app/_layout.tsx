import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { NotificationService } from '@/lib/notifications';
import { LocationService } from '@/lib/location';
import { BackgroundService } from '@/lib/background';
import { Platform } from 'react-native';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Initialize services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Initialize notifications
        await NotificationService.initialize();
        
        // Set up notification listeners
        const unsubscribe = NotificationService.setupNotificationListeners();
        
        // Initialize location services
        await LocationService.initialize();
        
        // Initialize background services (mobile only)
        if (Platform.OS !== 'web') {
          await BackgroundService.initialize();
        }

        return unsubscribe;
      } catch (error) {
        console.error('Error initializing services:', error);
      }
    };

    let cleanup: (() => void) | undefined;
    
    initializeServices().then((unsubscribe) => {
      cleanup = unsubscribe;
    });

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

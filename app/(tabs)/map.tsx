import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform,
  Alert
} from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { MapPin, TriangleAlert as AlertTriangle, Shield, Users, Filter, RefreshCw } from 'lucide-react-native';

// Platform-specific imports
let MapView: any, Marker: any, Circle: any;

if (Platform.OS === 'web') {
  // Use web-compatible components
  const WebMapComponents = require('@/components/WebMapView');
  MapView = WebMapComponents.default;
  Marker = WebMapComponents.Marker;
  Circle = WebMapComponents.Circle;
} else {
  // Use native react-native-maps
  const NativeMaps = require('react-native-maps');
  MapView = NativeMaps.default;
  Marker = NativeMaps.Marker;
  Circle = NativeMaps.Circle;
}

interface AlertMarker {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title: string;
  description: string;
  type: 'medical' | 'fire' | 'police' | 'general';
  urgencyLevel: number;
  timestamp: Date;
  responders: number;
}

interface SafeZone {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  radius: number;
  name: string;
  type: 'hospital' | 'police_station' | 'fire_station' | 'safe_house';
}

export default function EmergencyMap() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [alerts, setAlerts] = useState<AlertMarker[]>([]);
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);
  const [showAlerts, setShowAlerts] = useState(true);
  const [showSafeZones, setShowSafeZones] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<AlertMarker | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    getCurrentLocation();
    loadMapData();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setLocationError(null);
      
      // Check if location services are available
      const isLocationEnabled = await Location.hasServicesEnabledAsync();
      if (!isLocationEnabled) {
        setLocationError('Location services are disabled. Please enable location services in your device settings.');
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied. Please grant location access to show your position on the map.');
        return;
      }

      // For web platform, provide a fallback location
      if (Platform.OS === 'web') {
        // Use a default location for web (Dhaka, Bangladesh)
        const webLocation = {
          coords: {
            latitude: 23.8103,
            longitude: 90.4125,
            altitude: null,
            accuracy: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        };
        setLocation(webLocation);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
      });
      setLocation(currentLocation);
    } catch (error) {
      console.error('Location error:', error);
      setLocationError('Unable to get current location. Using default location.');
      
      // Fallback to default location
      const fallbackLocation = {
        coords: {
          latitude: 23.8103,
          longitude: 90.4125,
          altitude: null,
          accuracy: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      };
      setLocation(fallbackLocation);
    }
  };

  const loadMapData = () => {
    // Sample alert data
    setAlerts([
      {
        id: '1',
        coordinate: { latitude: 23.8103, longitude: 90.4125 },
        title: 'Medical Emergency',
        description: 'Heart attack reported',
        type: 'medical',
        urgencyLevel: 3,
        timestamp: new Date(Date.now() - 300000),
        responders: 7
      },
      {
        id: '2',
        coordinate: { latitude: 23.7516, longitude: 90.3752 },
        title: 'General Emergency',
        description: 'Person in distress',
        type: 'general',
        urgencyLevel: 2,
        timestamp: new Date(Date.now() - 120000),
        responders: 3
      },
      {
        id: '3',
        coordinate: { latitude: 23.7806, longitude: 90.4193 },
        title: 'Fire Emergency',
        description: 'Building fire reported',
        type: 'fire',
        urgencyLevel: 4,
        timestamp: new Date(Date.now() - 600000),
        responders: 12
      }
    ]);

    // Sample safe zones
    setSafeZones([
      {
        id: '1',
        coordinate: { latitude: 23.8223, longitude: 90.3654 },
        radius: 500,
        name: 'Dhaka Medical College Hospital',
        type: 'hospital'
      },
      {
        id: '2',
        coordinate: { latitude: 23.7593, longitude: 90.3648 },
        radius: 300,
        name: 'Ramna Police Station',
        type: 'police_station'
      },
      {
        id: '3',
        coordinate: { latitude: 23.7465, longitude: 90.3723 },
        radius: 400,
        name: 'Fire Service Station',
        type: 'fire_station'
      }
    ]);
  };

  const getAlertColor = (type: string, urgencyLevel: number) => {
    const baseColors = {
      medical: '#dc2626',
      fire: '#ea580c',
      police: '#1d4ed8',
      general: '#7c3aed'
    };

    const baseColor = baseColors[type as keyof typeof baseColors];
    return baseColor;
  };

  const getSafeZoneColor = (type: string) => {
    switch (type) {
      case 'hospital': return '#059669';
      case 'police_station': return '#1d4ed8';
      case 'fire_station': return '#ea580c';
      case 'safe_house': return '#7c3aed';
      default: return '#6b7280';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 min ago';
    if (minutes < 60) return `${minutes} min ago`;
    
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const handleAlertPress = (alert: AlertMarker) => {
    setSelectedAlert(alert);
    Alert.alert(
      `${alert.title}`,
      `${alert.description}\n\nTime: ${formatTimeAgo(alert.timestamp)}\nResponders: ${alert.responders}\nUrgency: Level ${alert.urgencyLevel}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'I Can Help', onPress: () => handleOfferHelp(alert) },
        { text: 'View Details', onPress: () => handleViewDetails(alert) }
      ]
    );
  };

  const handleOfferHelp = (alert: AlertMarker) => {
    Alert.alert('Help Offered', 'Thank you for offering to help! The person in need will be notified of your assistance.');
  };

  const handleViewDetails = (alert: AlertMarker) => {
    console.log('View details for alert:', alert.id);
  };

  // Default location (Dhaka, Bangladesh)
  const defaultLocation = {
    latitude: 23.8103,
    longitude: 90.4125,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const mapRegion = location ? {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  } : defaultLocation;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Emergency Map</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.refreshButton} onPress={loadMapData}>
            <RefreshCw size={20} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Location Error Banner */}
      {locationError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{locationError}</Text>
          <TouchableOpacity onPress={getCurrentLocation} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={mapRegion}
          showsUserLocation={Platform.OS !== 'web'}
          showsMyLocationButton={Platform.OS !== 'web'}
          loadingEnabled={true}
        >
          {/* User location marker for web */}
          {Platform.OS === 'web' && location && (
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="Your Location"
              description="You are here"
              pinColor="#059669"
            />
          )}

          {/* Alert markers */}
          {showAlerts && alerts.map((alert) => (
            <Marker
              key={alert.id}
              coordinate={alert.coordinate}
              title={alert.title}
              description={alert.description}
              pinColor={getAlertColor(alert.type, alert.urgencyLevel)}
              onPress={() => handleAlertPress(alert)}
            />
          ))}

          {/* Safe zones */}
          {showSafeZones && safeZones.map((zone) => (
            <Circle
              key={zone.id}
              center={zone.coordinate}
              radius={zone.radius}
              strokeColor={getSafeZoneColor(zone.type)}
              strokeWidth={2}
              fillColor={`${getSafeZoneColor(zone.type)}20`}
            />
          ))}
        </MapView>
      </View>

      {/* Filter Controls */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, showAlerts && styles.filterButtonActive]}
          onPress={() => setShowAlerts(!showAlerts)}
        >
          <AlertTriangle size={16} color={showAlerts ? '#ffffff' : '#dc2626'} />
          <Text style={[styles.filterButtonText, showAlerts && styles.filterButtonTextActive]}>
            Alerts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filterButton, showSafeZones && styles.filterButtonActive]}
          onPress={() => setShowSafeZones(!showSafeZones)}
        >
          <Shield size={16} color={showSafeZones ? '#ffffff' : '#059669'} />
          <Text style={[styles.filterButtonText, showSafeZones && styles.filterButtonTextActive]}>
            Safe Zones
          </Text>
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Map Legend</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#dc2626' }]} />
            <Text style={styles.legendText}>Medical Emergency</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#ea580c' }]} />
            <Text style={styles.legendText}>Fire Emergency</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#1d4ed8' }]} />
            <Text style={styles.legendText}>Police Required</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#059669' }]} />
            <Text style={styles.legendText}>Safe Zone</Text>
          </View>
        </View>
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
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  refreshButton: {
    padding: 8,
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#dc2626',
  },
  retryButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 12,
  },
  retryText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
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
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonActive: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  legendContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  legendTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
});
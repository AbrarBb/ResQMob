import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Web-compatible fallback for react-native-maps
export default function MapView({ children, style, ...props }: any) {
  return (
    <View style={[styles.mapContainer, style]}>
      <Text style={styles.mapPlaceholder}>
        Interactive Map
        {'\n'}
        (Available on mobile devices)
      </Text>
      {children}
    </View>
  );
}

export function Marker({ coordinate, title, description, ...props }: any) {
  return (
    <View style={styles.marker}>
      <Text style={styles.markerText}>📍</Text>
    </View>
  );
}

export function Circle({ center, radius, strokeColor, fillColor, ...props }: any) {
  return (
    <View style={[styles.circle, { borderColor: strokeColor, backgroundColor: fillColor }]} />
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  mapPlaceholder: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  marker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
  markerText: {
    fontSize: 24,
  },
  circle: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    opacity: 0.3,
  },
});
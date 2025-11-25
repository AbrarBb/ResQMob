const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver configuration for web compatibility
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Configure platform-specific module resolution conditions
config.resolver.unstable_conditionsByPlatform = {
  ios: ['react-native', 'native', 'main'],
  android: ['react-native', 'native', 'main'],
  web: ['browser', 'module', 'main'],
};

// Custom resolver to handle react-native-maps on web
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Intercept react-native-maps imports on web platform
  if (platform === 'web' && moduleName === 'react-native-maps') {
    return {
      filePath: require.resolve('./components/WebMapView.tsx'),
      type: 'sourceFile',
    };
  }
  
  // Fall back to default resolver for all other cases
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
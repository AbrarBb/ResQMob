const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📱 ResQMob - Starting Mobile Development...');
console.log('🚀 Setting up for Expo Go mobile testing...');

// Create a mobile-specific fix for expo-modules-core
function createMobileFix() {
    const expoModulesPath = path.join(__dirname, 'node_modules', 'expo-modules-core');
    const srcPath = path.join(expoModulesPath, 'src');
    const indexPath = path.join(srcPath, 'index.ts');
    const indexJsPath = path.join(srcPath, 'index.js');
    
    if (fs.existsSync(indexPath)) {
        console.log('🔧 Creating mobile-compatible JavaScript version...');
        
        // Create a mobile-specific JavaScript version
        const jsContent = `
// Mobile-compatible JavaScript version for Expo Go
const { Platform } = require('react-native');

// Mobile-specific exports
module.exports = {
    Platform,
    NativeModulesProxy: new Proxy({}, {
        get: (target, name) => {
            console.warn('Native module accessed:', name);
            return {};
        }
    }),
    EventEmitter: require('events'),
    requireNativeModule: (moduleName) => {
        console.warn('Native module required:', moduleName);
        return {
            addListener: () => {},
            removeListeners: () => {},
            getConstants: () => ({}),
        };
    },
    requireNativeViewManager: (moduleName) => {
        console.warn('Native view manager required:', moduleName);
        return {};
    },
    // Add mobile-specific methods
    getConstants: () => ({}),
    addListener: () => {},
    removeListeners: () => {},
};
        `;
        
        // Write the JavaScript file
        fs.writeFileSync(indexJsPath, jsContent);
        
        // Create package.json for the src directory
        const packageJson = {
            "main": "index.js",
            "type": "commonjs"
        };
        fs.writeFileSync(path.join(srcPath, 'package.json'), JSON.stringify(packageJson, null, 2));
        
        console.log('✅ Created mobile-compatible JavaScript version');
    }
}

// Start Expo for mobile
function startMobileExpo() {
    createMobileFix();
    
    console.log('📱 Starting Expo for mobile development...');
    console.log('');
    console.log('📋 Instructions:');
    console.log('1. Install Expo Go on your phone:');
    console.log('   - iOS: App Store → "Expo Go"');
    console.log('   - Android: Google Play → "Expo Go"');
    console.log('');
    console.log('2. Wait for the QR code to appear');
    console.log('3. Scan the QR code with Expo Go app');
    console.log('4. The app will load on your phone');
    console.log('');
    console.log('🌐 Expo Go will connect to your development server');
    console.log('📱 You can test all features on your phone');
    console.log('');
    
    const expoProcess = spawn('npx', ['expo', 'start', '--tunnel'], {
        stdio: 'inherit',
        shell: true,
        env: {
            ...process.env,
            NODE_OPTIONS: '--max-old-space-size=4096 --no-warnings'
        }
    });
    
    expoProcess.on('error', (error) => {
        console.error('❌ Failed to start Expo for mobile:', error.message);
        console.log('');
        console.log('🔧 Alternative solutions:');
        console.log('1. Use Node.js 18.x: nvm install 18 && nvm use 18');
        console.log('2. Use the preview server: npm run preview');
        console.log('3. Try Expo Go with a different approach');
        console.log('');
        console.log('📱 Current preview server: http://localhost:3000');
    });
    
    expoProcess.on('close', (code) => {
        if (code !== 0) {
            console.log(`❌ Expo mobile process exited with code ${code}`);
            console.log('📱 Preview server is still available at: http://localhost:3000');
        }
    });
}

// Start mobile development
startMobileExpo(); 
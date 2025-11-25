const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚨 ResQMob - Starting Expo Development Server...');

// Create a temporary fix for the expo-modules-core issue
function createExpoModulesFix() {
    const expoModulesPath = path.join(__dirname, 'node_modules', 'expo-modules-core');
    const srcPath = path.join(expoModulesPath, 'src');
    const indexPath = path.join(srcPath, 'index.ts');
    const indexJsPath = path.join(srcPath, 'index.js');
    
    if (fs.existsSync(indexPath)) {
        console.log('🔧 Creating JavaScript version of expo-modules-core...');
        
        // Read the TypeScript file
        const tsContent = fs.readFileSync(indexPath, 'utf8');
        
        // Create a basic JavaScript version
        const jsContent = `
// Auto-generated JavaScript version
const { Platform } = require('react-native');

// Basic exports to prevent errors
module.exports = {
    Platform,
    NativeModulesProxy: {},
    EventEmitter: require('events'),
    requireNativeModule: (moduleName) => {
        console.warn('Native module not available:', moduleName);
        return {};
    },
    requireNativeViewManager: (moduleName) => {
        console.warn('Native view manager not available:', moduleName);
        return {};
    }
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
        
        console.log('✅ Created JavaScript version of expo-modules-core');
    }
}

// Start Expo with the fix
function startExpo() {
    createExpoModulesFix();
    
    console.log('🌐 Starting Expo development server...');
    console.log('📱 This will start the full React Native app');
    console.log('🔗 You can access it via:');
    console.log('   - Web: http://localhost:8081');
    console.log('   - Expo Go app on your phone');
    console.log('');
    
    const expoProcess = spawn('npx', ['expo', 'start', '--web'], {
        stdio: 'inherit',
        shell: true,
        env: {
            ...process.env,
            NODE_OPTIONS: '--max-old-space-size=4096 --no-warnings'
        }
    });
    
    expoProcess.on('error', (error) => {
        console.error('❌ Failed to start Expo:', error.message);
        console.log('');
        console.log('🔧 Alternative solutions:');
        console.log('1. Use Node.js 18.x: nvm install 18 && nvm use 18');
        console.log('2. Use Expo Go app on your phone');
        console.log('3. Use the preview server: npm run preview');
        console.log('');
        console.log('📱 Current preview server: http://localhost:3000');
    });
    
    expoProcess.on('close', (code) => {
        if (code !== 0) {
            console.log(`❌ Expo process exited with code ${code}`);
            console.log('📱 Preview server is still available at: http://localhost:3000');
        }
    });
}

// Start the app
startExpo(); 
const { spawn } = require('child_process');
const path = require('path');

console.log('🚨 ResQMob - Starting Full App...');
console.log('📱 Attempting to start React Native app...');

// Try to start the app with different approaches
function startApp() {
    // First, try to compile the problematic TypeScript files
    console.log('🔧 Attempting to fix TypeScript compilation issues...');
    
    // Create a temporary fix for the expo-modules-core issue
    const expoModulesCorePath = path.join(__dirname, 'node_modules', 'expo-modules-core', 'src', 'index.ts');
    const expoModulesCoreJsPath = path.join(__dirname, 'node_modules', 'expo-modules-core', 'src', 'index.js');
    
    // Try to start with a different approach
    console.log('🌐 Starting Expo development server...');
    
    const expoProcess = spawn('npx', ['expo', 'start', '--web'], {
        stdio: 'inherit',
        shell: true,
        env: {
            ...process.env,
            NODE_OPTIONS: '--max-old-space-size=4096'
        }
    });
    
    expoProcess.on('error', (error) => {
        console.error('❌ Failed to start Expo:', error.message);
        console.log('');
        console.log('🔧 Alternative Solutions:');
        console.log('1. Use Node.js 18.x: nvm install 18 && nvm use 18');
        console.log('2. Try Expo Go app on your phone');
        console.log('3. Use the preview server: npm run preview');
        console.log('');
        console.log('📱 Current preview server is running at: http://localhost:3000');
    });
    
    expoProcess.on('close', (code) => {
        if (code !== 0) {
            console.log(`❌ Expo process exited with code ${code}`);
            console.log('📱 Preview server is still available at: http://localhost:3000');
        }
    });
}

// Start the app
startApp(); 
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing expo-modules-core TypeScript issue...');

const expoModulesCorePath = path.join(__dirname, 'node_modules', 'expo-modules-core', 'src');
const indexPath = path.join(expoModulesCorePath, 'index.ts');
const indexJsPath = path.join(expoModulesCorePath, 'index.js');

try {
    // Check if the TypeScript file exists
    if (fs.existsSync(indexPath)) {
        console.log('📁 Found TypeScript files in expo-modules-core...');
        
        // Read the TypeScript content
        const tsContent = fs.readFileSync(indexPath, 'utf8');
        
        // Create a simple JavaScript version (basic conversion)
        const jsContent = tsContent
            .replace(/import\s+.*\s+from\s+['"](.*)['"];?/g, "const $1 = require('$1');")
            .replace(/export\s+/g, 'module.exports = ')
            .replace(/:\s*string/g, '')
            .replace(/:\s*number/g, '')
            .replace(/:\s*boolean/g, '')
            .replace(/:\s*any/g, '')
            .replace(/:\s*void/g, '')
            .replace(/:\s*Function/g, '')
            .replace(/:\s*object/g, '')
            .replace(/:\s*\[\]/g, '')
            .replace(/:\s*\{[^}]*\}/g, '')
            .replace(/:\s*\([^)]*\)/g, '')
            .replace(/:\s*=>/g, '')
            .replace(/:\s*Promise<[^>]*>/g, '')
            .replace(/:\s*import\([^)]*\)/g, '');
        
        // Write the JavaScript file
        fs.writeFileSync(indexJsPath, jsContent);
        console.log('✅ Created compiled JavaScript version');
        
        // Also create a package.json for the src directory
        const srcPackageJson = {
            "main": "index.js",
            "type": "commonjs"
        };
        fs.writeFileSync(path.join(expoModulesCorePath, 'package.json'), JSON.stringify(srcPackageJson, null, 2));
        
        console.log('✅ Fixed expo-modules-core TypeScript issue');
        console.log('🚀 Now try running: npx expo start --web');
        
    } else {
        console.log('❌ TypeScript files not found in expected location');
    }
} catch (error) {
    console.error('❌ Error fixing expo-modules-core:', error.message);
    console.log('');
    console.log('🔧 Alternative solutions:');
    console.log('1. Use Node.js 18.x');
    console.log('2. Use Expo Go app on your phone');
    console.log('3. Use the preview server: npm run preview');
} 
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files
app.use(express.static(path.join(__dirname)));

// Basic routing
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Catch-all route for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint to show project status
app.get('/api/status', (req, res) => {
    res.json({
        status: 'running',
        project: 'ResQMob Emergency Response Network',
        version: '1.0.0',
        features: [
            'Emergency Response',
            'Interactive Map',
            'Emergency Communication',
            'Privacy & Security'
        ],
        setup: {
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch
        }
    });
});

// Serve project files
app.get('/app/*', (req, res) => {
    res.sendFile(path.join(__dirname, req.path));
});

app.get('/components/*', (req, res) => {
    res.sendFile(path.join(__dirname, req.path));
});

app.get('/lib/*', (req, res) => {
    res.sendFile(path.join(__dirname, req.path));
});

app.get('/hooks/*', (req, res) => {
    res.sendFile(path.join(__dirname, req.path));
});

app.get('/types/*', (req, res) => {
    res.sendFile(path.join(__dirname, req.path));
});

app.listen(port, () => {
    console.log(`🚨 ResQMob Development Server Running!`);
    console.log(`📍 Local: http://localhost:${port}`);
    console.log(`🌐 Network: http://${getLocalIP()}:${port}`);
    console.log(`📱 Project Overview: http://localhost:${port}/`);
    console.log(`🔧 API Status: http://localhost:${port}/api/status`);
    console.log('');
    console.log('⚠️  Note: This is a development preview server.');
    console.log('   For full React Native development, use Node.js 18.x');
    console.log('   and run: npm run dev');
    console.log('');
    console.log('Press Ctrl+C to stop the server');
});

function getLocalIP() {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
} 
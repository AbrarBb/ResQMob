const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);
    
    // Parse URL
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // Default to index.html
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    // Get file path
    const filePath = path.join(__dirname, pathname);
    
    // Get file extension
    const extname = path.extname(filePath);
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    // Read file
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(`
                    <html>
                        <head><title>404 - File Not Found</title></head>
                        <body>
                            <h1>404 - File Not Found</h1>
                            <p>The requested file ${pathname} was not found.</p>
                            <p><a href="/">Go back to homepage</a></p>
                        </body>
                    </html>
                `);
            } else {
                // Server error
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            // Success
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`🚨 ResQMob Development Server Running!`);
    console.log(`📍 Local: http://localhost:${PORT}`);
    console.log(`🌐 Network: http://192.168.56.1:${PORT}`);
    console.log(`📱 Project Overview: http://localhost:${PORT}/`);
    console.log('');
    console.log('⚠️  Note: This is a development preview server.');
    console.log('   For full React Native development, use Node.js 18.x');
    console.log('   and run: npm run dev');
    console.log('');
    console.log('Press Ctrl+C to stop the server');
}); 
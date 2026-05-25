const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

/**
 * Systeme Gestion Globale - Production Static Server
 * 
 * Features:
 * - Serves frontend static files from /build
 * - Proxies /api requests to the backend server
 * - Supports SPA routing (fallbacks to index.html)
 * - Optional HTTPS support
 */

// --- Configuration ---
const PORT = process.env.PORT || 3000;
const BACKEND_PORT = process.env.BACKEND_PORT || 5000;
const BACKEND_HOST = 'localhost';
const BUILD_DIR = path.join(__dirname, 'build');

// MIME Types
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf',
};

// --- Helper Functions ---

const getMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
};

/**
 * Simple Proxy Implementation
 */
const proxyRequest = (req, res) => {
  const options = {
    hostname: BACKEND_HOST,
    port: BACKEND_PORT,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `${BACKEND_HOST}:${BACKEND_PORT}`
    }
  };

  console.log(`[Proxy] ${req.method} ${req.url} -> http://${BACKEND_HOST}:${BACKEND_PORT}${req.url}`);

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error(`[Proxy Error] ${err.message}`);
    res.statusCode = 502;
    res.end('Bad Gateway: Unable to connect to backend server.');
  });

  req.pipe(proxyReq, { end: true });
};

/**
 * Static File Server
 */
const serveStaticFile = (reqPath, res) => {
  const filePath = path.join(BUILD_DIR, reqPath === '/' ? 'index.html' : reqPath);

  // Security check: ensure path is inside build dir
  if (!filePath.startsWith(BUILD_DIR)) {
    res.statusCode = 403;
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // SPA Fallback: if file not found, serve index.html
      const indexPath = path.join(BUILD_DIR, 'index.html');
      fs.access(indexPath, fs.constants.F_OK, (indexErr) => {
        if (indexErr) {
          res.statusCode = 404;
          return res.end('404: File Not Found and index.html missing');
        }
        res.setHeader('Content-Type', 'text/html; charset=UTF-8');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        fs.createReadStream(indexPath).pipe(res);
      });
      return;
    }

    // Serve found file
    const mimeType = getMimeType(filePath);
    res.setHeader('Content-Type', mimeType);

    // Cache control (immutable for static assets with hashes, but let's keep it simple for now)
    if (reqPath.startsWith('/static/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.setHeader('Cache-Control', 'no-cache');
    }

    fs.createReadStream(filePath).pipe(res);
  });
};

// --- Request Handler ---

const requestHandler = (req, res) => {
  const parsedUrl = url.parse(req.url);
  const reqPath = parsedUrl.pathname;

  // 1. Proxy API requests
  if (reqPath.startsWith('/api/') || reqPath.startsWith('/socket.io/')) {
    return proxyRequest(req, res);
  }

  // 2. Serve static files
  return serveStaticFile(reqPath, res);
};

// --- SSL Initialization ---

let sslOptions = null;
try {
  // Try to find certificates in the backend certs folder
  const certsDir = path.join(__dirname, '..', '..', 'backend', 'certs');
  const keyPath = path.join(certsDir, 'server.key');
  const certPath = path.join(certsDir, 'server.cert');

  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    sslOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
    console.log('SSL Certificates found. Enabling HTTPS.');
  }
} catch (err) {
  console.log('SSL certificates not found or inaccessible. Falling back to HTTP.');
}

// --- Server Start ---

const server = sslOptions
  ? https.createServer(sslOptions, requestHandler)
  : http.createServer(requestHandler);

server.listen(PORT, '0.0.0.0', () => {
  const protocol = sslOptions ? 'HTTPS' : 'HTTP';
  console.log(`===============================================`);
  console.log(`Frontend Static Server Running!`);
  console.log(`Protocol:  ${protocol}`);
  console.log(`Port:      ${PORT}`);
  console.log(`Build Dir: ${BUILD_DIR}`);
  console.log(`Proxying:  /api -> http://${BACKEND_HOST}:${BACKEND_PORT}`);
  console.log(`===============================================`);
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});

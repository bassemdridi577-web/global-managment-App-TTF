const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const os = require('os');
const rateLimit = require('express-rate-limit');
const { authMiddleware, authorizeRoles } = require('./middleware/authMiddleware');
const { swaggerUi, specs } = require('./config/swagger');
const { createServer } = require('./config/server');
const { initSocket, broadcast, getWss } = require('./services/socketService');
const { initRoutes } = require('./routes/routeManager');

// Load environment variables
require('dotenv').config();

const { initBackupJob, backupDatabase } = require('./services/backupService');

// Initialize scheduled tasks
initBackupJob();

// Uncomment the line below if you want to test the backup immediately on server start
// backupDatabase();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Security: CORS
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'user-id', 'user-role', 'Origin', 'Accept', 'X-Requested-With'],
};
app.use(cors(corsOptions));

// Security: Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1500000,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', loginLimiter);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Server & Socket Initialization
const server = createServer(app);
const { connectedUsers } = initSocket(server);

// Middleware to expose socket data to routes
app.use((req, res, next) => {
  req.wss = getWss();
  req.connectedUsers = connectedUsers;
  next();
});

// Request Logger (Debug) - Shows client IP address
app.use((req, res, next) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
  console.log(`[${new Date().toLocaleTimeString()}] Client IP: ${clientIp} | ${req.method} ${req.originalUrl}`);
  next();
});

// Auth Middleware Configuration
app.use('/api', (req, res, next) => {
  if (req.path.startsWith('/auth') || (req.path === '/users' && req.method === 'POST')) {
    return next();
  }
  authMiddleware(req, res, next);
});

// Swagger & Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
initRoutes(app);

// Legacy Admin/App Routes
app.get('/', (req, res) => res.send('ye5dem el backend ch3andek fih'));

app.post('/api/admin/refresh-clients', authMiddleware, authorizeRoles(['admin']), (req, res) => {
  broadcast({ type: 'refresh' });
  res.status(200).json({ message: 'Refresh signal sent to all connected clients.' });
});

app.post('/api/admin/verify-code', authMiddleware, authorizeRoles(['admin']), (req, res) => {
  if (req.body.code === 'TTF#') {
    res.status(200).json({ success: true, message: 'Code verified successfully.' });
  } else {
    res.status(401).json({ success: false, message: 'Incorrect code.' });
  }
});

// Static File Hosting (Uploads)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Static File Hosting (Frontend SPA)
const buildDir = path.join(__dirname, '..', 'react-project', 'app', 'build');
if (fs.existsSync(buildDir)) {
  app.use(express.static(buildDir));
  app.get('/*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(buildDir, 'index.html'));
  });
}

// Start Server
const HOST = '0.0.0.0';
server.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
  const ifaces = os.networkInterfaces();
  Object.keys(ifaces).forEach((ifname) => {
    ifaces[ifname].forEach((iface) => {
      if ('IPv4' === iface.family && !iface.internal) {
        console.log(`  Access locally at http://${iface.address}:${PORT}/`);
      }
    });
  });
});

// Global Error Handlers
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});
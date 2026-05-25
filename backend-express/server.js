const config = require('./config/config');
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const v1Routes = require('./routes/v1Routes');
const { generateRandomAssets } = require('./controllers/resourceController');
const seedUsers = require('./utils/seedUsers');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Make Socket.IO globally available
global.io = io;

// Realtime User Room Routing Integration
io.on('connection', (socket) => {
    console.log('[Socket.IO] Realtime channel connected:', socket.id);
    
    // Associate connection to specific user ID room for target security notifies
    socket.on('register_operator', (userId) => {
        if (userId) {
            socket.join(userId.toString());
            console.log(`[Socket.IO] Operator ${socket.id} secured room for User: ${userId}`);
        }
    });

    socket.on('disconnect', () => {
        console.log('[Socket.IO] Client channel closed:', socket.id);
    });
});

// Seed users on startup
seedUsers().catch(err => console.error('Seed error:', err));

// Simulated background asset discovery (for demo purposes)
setInterval(async () => {
    try {
        console.log(`[SIMULATION] Orchestrating background asset discovery...`);
    } catch (err) {
        console.error('[SIMULATION ERROR]', err);
    }
}, 60000); // Every minute


// Sliding-Window Brute-Force Rate Limiter (Zero-Dependency production grade)
const authAttempts = new Map();
const bruteForceLimiter = (req, res, next) => {
    if (req.path.startsWith('/auth/')) {
        const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
        const now = Date.now();
        const windowMs = 15 * 60 * 1000; // 15 mins window
        const limit = 20; // 20 requests limit
        
        const history = authAttempts.get(ip) || [];
        const recent = history.filter(timestamp => now - timestamp < windowMs);
        
        if (recent.length >= limit) {
            console.warn(`[Security Alert] Rate-limiting block active on IP: ${ip}`);
            return res.status(429).json({
                status: 'fail',
                message: 'Rate limit exceeded. Too many login/register operations. Please wait 15 minutes.'
            });
        }
        
        recent.push(now);
        authAttempts.set(ip, recent);
    }
    next();
};

app.use(cors({ origin: [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'https://cloud-fortress-ai.vercel.app',
  'https://cloudfortressai.vercel.app'
] }));
app.use(express.json());
app.use(bruteForceLimiter);

// Pass io to routes via middleware
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Mount Modular Routes
app.use('/api', v1Routes);

// Root Handshake
app.get('/', (req, res) => {
    res.json({
        engine: 'CloudFortress AI Operations',
        status: 'OPERATIONAL',
        telemetry: 'ACTIVE',
        handshake: 'SUCCESS',
        timestamp: new Date()
    });
});


// Robust Production Health Check
app.get('/api/health', (req, res) => {
    const mongoose = require('mongoose');
    const dbState = mongoose.connection.readyState;
    
    // Connection states: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    const dbStatus = dbState === 1 ? 'UP' : 'DOWN';
    
    const healthReport = {
        status: dbStatus === 'UP' ? 'HEALTHY' : 'DEGRADED',
        timestamp: new Date(),
        uptime: Math.floor(process.uptime()),
        services: {
            database: {
                status: dbStatus,
                connectionCode: dbState
            },
            socketHub: {
                status: 'UP',
                connectionsCount: global.io ? global.io.engine.clientsCount : 0
            }
        },
        system: {
            memoryUsage: process.memoryUsage(),
            nodeVersion: process.version
        }
    };

    if (dbStatus === 'UP') {
        res.status(200).json(healthReport);
    } else {
        res.status(503).json(healthReport);
    }
});

const PORT = config.port;
server.listen(PORT, () => {
    console.log(`CloudFortress AI Engine running on port ${PORT} [Mode: ${config.env}]`);
});
// Live reload touch for updated Atlas Mongo DB URI.




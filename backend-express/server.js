require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const v1Routes = require('./routes/v1Routes');
const { generateRandomAssets } = require('./controllers/resourceController');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Connect to Database
connectDB();

const User = require('./models/User');

// Simulated background asset discovery (Multi-tenant)
setInterval(async () => {
    try {
        const users = await User.find({});
        if (users.length === 0) return;

        console.log(`[SIMULATION] Orchestrating background discovery for ${users.length} tenants...`);
        
        for (const user of users) {
          try {
            const count = Math.floor(Math.random() * 3) + 1;
            const newAssets = await generateRandomAssets(user._id, count, 'production');
            
            // Notify specific user/tenant (if we had per-user rooms, for now global for demo)
            io.emit('assets_discovered', { 
                tenantId: user._id,
                count, 
                totalNew: newAssets.length,
                timestamp: new Date() 
            });
          } catch (innerErr) {
            console.error(`[SIMULATION ERROR] Failed for user ${user._id}:`, innerErr.message);
          }
        }
    } catch (err) {
        console.error('[SIMULATION ERROR]', err);
    }
}, 60000); // Every minute



app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());

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


// Health Check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = 5001;
server.listen(PORT, () => {
    console.log(`CloudFortress AI Engine running on port ${PORT}`);
});


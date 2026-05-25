const WebSocket = require('ws');
const prisma = require('../lib/prismaClient');

let wss = null;
const connectedUsers = new Map(); // userId -> WebSocket

const broadcastPresence = async (userId, isOnline, lastSeen) => {
    if (!wss) return;
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { username: true, laboname: true }
        });
        const payload = JSON.stringify({
            type: 'USER_PRESENCE',
            userId,
            isOnline,
            lastSeen,
            username: user?.username || null,
            laboname: user?.laboname || null,
        });
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(payload);
            }
        });
    } catch (error) {
        console.error(`Failed to broadcast presence for user ${userId}:`, error.message);
    }
};

const updateUserPresence = async (userId, isOnline) => {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { isOnline, lastSeen: new Date() },
        });
    } catch (error) {
        console.error(`Failed to update presence for user ${userId}:`, error.message);
    }
};

const initSocket = (server) => {
    wss = new WebSocket.Server({ server });

    wss.on('connection', (ws, req) => {
        // Get client IP address
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        console.log(`\n✅ Client connected | IP: ${clientIp}`);
        ws.clientIp = clientIp; // Store IP on the socket for later use

        try {
            const urlParams = new URLSearchParams(req.url.split('?')[1]);
            const userId = urlParams.get('userId');
            if (userId) {
                const parsedId = parseInt(userId);
                if (!isNaN(parsedId)) {
                    connectedUsers.set(parsedId, ws);
                    ws.userId = parsedId;
                    console.log(`   └── User ID: ${parsedId} connected to WebSocket`);

                    // Mark user as online in DB and notify all clients
                    updateUserPresence(parsedId, true).then(() => {
                        broadcastPresence(parsedId, true, new Date().toISOString());
                    });
                }
            }
        } catch (e) {
            console.error('Error parsing WS query params:', e);
        }

        ws.isAlive = true;
        ws.on('pong', () => { ws.isAlive = true; });

        ws.on('message', message => {
            console.log(`📩 Message from ${ws.clientIp}: ${message}`);
        });

        ws.on('close', () => {
            console.log(`\n❌ Client disconnected | IP: ${ws.clientIp}`);
            if (ws.userId) {
                connectedUsers.delete(ws.userId);
                console.log(`   └── User ID: ${ws.userId} removed from WebSocket map`);

                // Mark user as offline in DB and notify all clients
                const now = new Date().toISOString();
                updateUserPresence(ws.userId, false).then(() => {
                    broadcastPresence(ws.userId, false, now);
                });
            }
        });

        ws.on('error', error => {
            console.error('WebSocket error:', error);
            if (ws.userId) {
                connectedUsers.delete(ws.userId);
                updateUserPresence(ws.userId, false).then(() => {
                    broadcastPresence(ws.userId, false, new Date().toISOString());
                });
            }
        });
    });

    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) return ws.terminate();
            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);

    wss.on('close', () => {
        clearInterval(interval);
    });

    return { wss, connectedUsers };
};

const getWss = () => wss;
const getConnectedUsers = () => connectedUsers;

const broadcast = (data) => {
    if (!wss) return;
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
};

module.exports = {
    initSocket,
    getWss,
    getConnectedUsers,
    broadcast
};

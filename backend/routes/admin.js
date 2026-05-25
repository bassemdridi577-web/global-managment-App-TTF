const express = require('express');
const router = express.Router();
const { backupDatabase } = require('../services/backupService');
const { getSettings, updateSetting } = require('../services/settingsService');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');
const { createLog } = require('../services/logService');
const prisma = require('../lib/prismaClient');

router.get('/backup/status', authMiddleware, authorizeRoles(['admin']), (req, res) => {
    const settings = getSettings();
    res.status(200).json({
        autoBackupEnabled: settings.autoBackupEnabled,
        backupRetentionDays: settings.backupRetentionDays
    });
});

router.post('/backup/toggle', authMiddleware, authorizeRoles(['admin']), (req, res) => {
    const { enabled } = req.body;
    const userId = req.user?.id;
    const success = updateSetting('autoBackupEnabled', enabled);
    if (success) {
        createLog(userId, 'Config Sauvegarde', `Sauvegarde automatique ${enabled ? 'Activée' : 'Désactivée'}`);
        res.status(200).json({ message: `Automatic backup ${enabled ? 'enabled' : 'disabled'} successfully.`, enabled });
    } else {
        res.status(500).json({ error: 'Failed to update backup settings.' });
    }
});

router.post('/backup', authMiddleware, authorizeRoles(['admin']), async (req, res) => {
    try {
        const userId = req.user?.id;
        backupDatabase(userId);
        res.status(200).json({ message: 'Manual backup triggered successfully. Check logs for completion.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to trigger backup: ' + err.message });
    }
});

// ─── Admin Chat Management ────────────────────────────────────────────────────

// GET /api/admin/chat/conversations - All user-to-user conversations with stats
router.get('/chat/conversations', authMiddleware, authorizeRoles(['admin']), async (req, res) => {
    try {
        const messages = await prisma.message.findMany({
            select: { senderId: true, receiverId: true, createdAt: true },
            orderBy: { createdAt: 'desc' }
        });

        // Build unique conversation pairs
        const pairsMap = new Map();
        messages.forEach(m => {
            const key = [Math.min(m.senderId, m.receiverId), Math.max(m.senderId, m.receiverId)].join('-');
            if (!pairsMap.has(key)) {
                pairsMap.set(key, { userAId: Math.min(m.senderId, m.receiverId), userBId: Math.max(m.senderId, m.receiverId), count: 0, lastMessageAt: m.createdAt });
            }
            pairsMap.get(key).count++;
        });

        const pairs = Array.from(pairsMap.values());
        const userIds = [...new Set(pairs.flatMap(p => [p.userAId, p.userBId]))];

        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, username: true, role: true }
        });

        const userMap = Object.fromEntries(users.map(u => [u.id, u]));

        const conversations = pairs.map(p => ({
            userA: userMap[p.userAId],
            userB: userMap[p.userBId],
            messageCount: p.count,
            lastMessageAt: p.lastMessageAt
        })).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

        res.json(conversations);
    } catch (error) {
        console.error('Admin chat conversations error:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// GET /api/admin/chat/user-stats - List of users with their chat stats
router.get('/chat/user-stats', authMiddleware, authorizeRoles(['admin']), async (req, res) => {
    try {
        const messages = await prisma.message.findMany({
            select: { senderId: true, receiverId: true, createdAt: true },
        });

        if (messages.length === 0) return res.json([]);

        const statsMap = new Map();

        messages.forEach(m => {
            const updateStat = (uid, otherId) => {
                if (!statsMap.has(uid)) {
                    statsMap.set(uid, { conversationPairs: new Set(), totalMessages: 0, lastActivity: m.createdAt });
                }
                const stat = statsMap.get(uid);
                stat.conversationPairs.add(otherId);
                stat.totalMessages++;
                if (new Date(m.createdAt) > new Date(stat.lastActivity)) {
                    stat.lastActivity = m.createdAt;
                }
            };
            updateStat(m.senderId, m.receiverId);
            updateStat(m.receiverId, m.senderId);
        });

        const userIds = Array.from(statsMap.keys());
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, username: true, role: true }
        });

        const userMap = Object.fromEntries(users.map(u => [u.id, u]));

        const stats = users.map(u => {
            const data = statsMap.get(u.id);
            return {
                user: u,
                conversationsCount: data.conversationPairs.size,
                messagesCount: data.totalMessages,
                lastActivity: data.lastActivity
            };
        }).sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));

        res.json(stats);
    } catch (error) {
        console.error('Admin chat user stats error:', error);
        res.status(500).json({ error: 'Failed to fetch user chat stats' });
    }
});

// GET /api/admin/chat/messages/:userAId/:userBId - Messages between two users
router.get('/chat/messages/:userAId/:userBId', authMiddleware, authorizeRoles(['admin']), async (req, res) => {
    try {
        const userAId = parseInt(req.params.userAId);
        const userBId = parseInt(req.params.userBId);

        if (isNaN(userAId) || isNaN(userBId)) {
            return res.status(400).json({ error: 'Invalid user IDs' });
        }

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userAId, receiverId: userBId },
                    { senderId: userBId, receiverId: userAId }
                ]
            },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: { select: { id: true, username: true, role: true } },
                receiver: { select: { id: true, username: true, role: true } }
            }
        });

        res.json(messages);
    } catch (error) {
        console.error('Admin chat messages error:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// DELETE /api/admin/chat/messages/:id - Admin delete any message
router.delete('/chat/messages/:id', authMiddleware, authorizeRoles(['admin']), async (req, res) => {
    try {
        const messageId = parseInt(req.params.id);
        if (isNaN(messageId)) return res.status(400).json({ error: 'Invalid message ID' });

        await prisma.message.delete({ where: { id: messageId } });
        createLog(req.user.id, 'Admin Chat', `Suppression message #${messageId}`);
        res.json({ success: true, id: messageId });
    } catch (error) {
        console.error('Admin delete message error:', error);
        res.status(500).json({ error: 'Failed to delete message' });
    }
});

// DELETE /api/admin/chat/conversations/:userAId/:userBId - Admin delete full conversation
router.delete('/chat/conversations/:userAId/:userBId', authMiddleware, authorizeRoles(['admin']), async (req, res) => {
    try {
        const userAId = parseInt(req.params.userAId);
        const userBId = parseInt(req.params.userBId);
        if (isNaN(userAId) || isNaN(userBId)) return res.status(400).json({ error: 'Invalid user IDs' });

        await prisma.message.deleteMany({
            where: {
                OR: [
                    { senderId: userAId, receiverId: userBId },
                    { senderId: userBId, receiverId: userAId }
                ]
            }
        });

        createLog(req.user.id, 'Admin Chat', `Suppression conversation entre #${userAId} et #${userBId}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Admin delete conversation error:', error);
        res.status(500).json({ error: 'Failed to delete conversation' });
    }
});

// GET /api/admin/chat/ai-stats - AI chat usage stats per user
router.get('/chat/ai-stats', authMiddleware, authorizeRoles(['admin']), async (req, res) => {
    try {
        const [sessionStats, totalMessages] = await Promise.all([
            prisma.aIChatSession.groupBy({
                by: ['userId'],
                _count: { id: true }
            }),
            prisma.aIChatHistory.groupBy({
                by: ['userId'],
                _count: { id: true }
            })
        ]);

        const userIds = [...new Set([
            ...sessionStats.map(s => s.userId),
            ...totalMessages.map(m => m.userId)
        ])];

        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, username: true, role: true }
        });

        const userMap = Object.fromEntries(users.map(u => [u.id, u]));
        const sessionMap = Object.fromEntries(sessionStats.map(s => [s.userId, s._count.id]));
        const messageMap = Object.fromEntries(totalMessages.map(m => [m.userId, m._count.id]));

        const stats = userIds.map(id => ({
            user: userMap[id],
            sessionCount: sessionMap[id] || 0,
            messageCount: messageMap[id] || 0
        })).sort((a, b) => b.messageCount - a.messageCount);

        res.json(stats);
    } catch (error) {
        console.error('Admin AI stats error:', error);
        res.status(500).json({ error: 'Failed to fetch AI stats' });
    }
});

// GET /api/admin/chat/ai-sessions/:userId - AI sessions for a specific user
router.get('/chat/ai-sessions/:userId', authMiddleware, authorizeRoles(['admin']), async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) return res.status(400).json({ error: 'Invalid user ID' });

        const sessions = await prisma.aIChatSession.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            include: { _count: { select: { messages: true } } }
        });

        res.json(sessions);
    } catch (error) {
        console.error('Admin AI sessions error:', error);
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
});

// GET /api/admin/chat/ai-history/:sessionId - AI chat history for a session
router.get('/chat/ai-history/:sessionId', authMiddleware, authorizeRoles(['admin']), async (req, res) => {
    try {
        const sessionId = parseInt(req.params.sessionId);
        if (isNaN(sessionId)) return res.status(400).json({ error: 'Invalid session ID' });

        const messages = await prisma.aIChatHistory.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'asc' }
        });

        res.json(messages);
    } catch (error) {
        console.error('Admin AI history error:', error);
        res.status(500).json({ error: 'Failed to fetch AI history' });
    }
});

// DELETE /api/admin/chat/ai-sessions/:sessionId - Admin delete AI session
router.delete('/chat/ai-sessions/:sessionId', authMiddleware, authorizeRoles(['admin']), async (req, res) => {
    try {
        const sessionId = parseInt(req.params.sessionId);
        if (isNaN(sessionId)) return res.status(400).json({ error: 'Invalid session ID' });

        await prisma.aIChatSession.delete({ where: { id: sessionId } });
        createLog(req.user.id, 'Admin Chat', `Suppression session AI #${sessionId}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Admin delete AI session error:', error);
        res.status(500).json({ error: 'Failed to delete AI session' });
    }
});

// GET /api/admin/chat/settings - Get AI chat configuration
router.get('/chat/settings', authMiddleware, authorizeRoles(['admin']), (req, res) => {
    const settings = getSettings();
    res.json({
        aiEnabled: settings.aiEnabled ?? true,
        aiTemperature: settings.aiTemperature ?? 0.7,
        aiSystemPrompt: settings.aiSystemPrompt ?? ""
    });
});

// POST /api/admin/chat/settings - Update AI chat configuration
router.post('/chat/settings', authMiddleware, authorizeRoles(['admin']), (req, res) => {
    const { aiEnabled, aiTemperature, aiSystemPrompt } = req.body;
    const userId = req.user.id;

    if (aiEnabled !== undefined) updateSetting('aiEnabled', aiEnabled);
    if (aiTemperature !== undefined) updateSetting('aiTemperature', parseFloat(aiTemperature));
    if (aiSystemPrompt !== undefined) updateSetting('aiSystemPrompt', aiSystemPrompt);

    createLog(userId, 'Admin Chat', 'Mise à jour des paramètres AI');
    res.json({ success: true, settings: getSettings() });
});

module.exports = router;


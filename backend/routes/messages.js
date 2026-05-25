const express = require('express');
const router = express.Router();
const prisma = require('../lib/prismaClient');
const { authMiddleware } = require('../middleware/authMiddleware');

// Get list of users with whom the current user has exchanged messages
router.get('/conversations/list', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    try {
        const interlocutors = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            select: {
                senderId: true,
                receiverId: true
            }
        });

        const ids = new Set();
        interlocutors.forEach(m => {
            if (m.senderId !== userId) ids.add(m.senderId);
            if (m.receiverId !== userId) ids.add(m.receiverId);
        });

        const usersWithConversations = await prisma.user.findMany({
            where: {
                id: { in: Array.from(ids) }
            },
            select: {
                id: true,
                username: true,
                role: true
            }
        });

        res.json(usersWithConversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// Get messages between current user and another user
router.get('/:contactId', authMiddleware, async (req, res) => {
    const { contactId } = req.params;
    const userId = req.user.id;

    console.log(`[GET /api/messages/:contactId] received contactId='${contactId}' (type ${typeof contactId}), userId='${userId}' (type ${typeof userId})`);

    try {
        const parsedContactId = parseInt(contactId);
        const parsedUserId = parseInt(userId);

        if (isNaN(parsedContactId) || isNaN(parsedUserId)) {
            console.error('Invalid IDs:', { contactId, userId, parsedContactId, parsedUserId });
            return res.status(400).json({ error: 'Invalid user or contact ID' });
        }

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: parsedUserId, receiverId: parsedContactId },
                    { senderId: parsedContactId, receiverId: parsedUserId }
                ]
            },
            orderBy: {
                createdAt: 'asc'
            },
            include: {
                sender: {
                    select: { id: true, username: true }
                },
                receiver: {
                    select: { id: true, username: true }
                }
            }
        });
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Send a message
router.post('/', authMiddleware, async (req, res) => {
    const { receiverId, content, imageBase64 } = req.body;
    const senderId = req.user.id;

    if (!receiverId || (!content && !imageBase64)) {
        return res.status(400).json({ error: 'Receiver and content or image are required' });
    }

    let imageUrl = null;
    if (imageBase64) {
        try {
            const fs = require('fs');
            const path = require('path');
            const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, 'base64');
            const filename = `msg_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
            const uploadsDir = path.join(__dirname, '..', 'uploads');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            fs.writeFileSync(path.join(uploadsDir, filename), buffer);
            imageUrl = `/uploads/${filename}`;
        } catch (imgError) {
            console.error('Error saving image:', imgError);
            return res.status(500).json({ error: 'Failed to save image' });
        }
    }

    try {
        const message = await prisma.message.create({
            data: {
                content: content || null,
                imageUrl,
                senderId,
                receiverId: parseInt(receiverId)
            },
            include: {
                sender: {
                    select: { id: true, username: true }
                },
                receiver: {
                    select: { id: true, username: true }
                }
            }
        });

        // Real-time notification
        if (req.connectedUsers) {
            const receiverSocket = req.connectedUsers.get(parseInt(receiverId));
            if (receiverSocket && receiverSocket.readyState === 1) { // 1 = OPEN
                receiverSocket.send(JSON.stringify({
                    type: 'NEW_MESSAGE',
                    message: message
                }));
            }
        }

        res.json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Delete a message (only sender can delete)
router.delete('/:id', authMiddleware, async (req, res) => {
    const messageId = parseInt(req.params.id);
    const userId = req.user.id;

    if (isNaN(messageId)) {
        return res.status(400).json({ error: 'Invalid message ID' });
    }

    try {
        // Check ownership
        const message = await prisma.message.findUnique({
            where: { id: messageId }
        });

        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        if (message.senderId !== userId && message.receiverId !== userId) {
            return res.status(403).json({ error: 'Not authorized to delete this message' });
        }

        if (message.imageUrl) {
            try {
                const fs = require('fs');
                const path = require('path');
                // message.imageUrl looks like "/uploads/filename.jpg"
                const filename = message.imageUrl.replace('/uploads/', '');
                const filePath = path.join(__dirname, '..', 'uploads', filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (err) {
                console.error('Failed to delete physical file:', err);
                // Continue with deleting the DB record even if file deletion fails
            }
        }

        await prisma.message.delete({
            where: { id: messageId }
        });

        res.json({ message: 'Message deleted successfully', id: messageId });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ error: 'Failed to delete message' });
    }
});

// Delete entire conversation (delete all messages between users)
router.delete('/conversations/:contactId', authMiddleware, async (req, res) => {
    const contactId = parseInt(req.params.contactId);
    const userId = req.user.id;

    if (isNaN(contactId)) {
        return res.status(400).json({ error: 'Invalid contact ID' });
    }

    try {
        // Find messages with images to delete files
        const messagesWithImages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: contactId, imageUrl: { not: null } },
                    { senderId: contactId, receiverId: userId, imageUrl: { not: null } }
                ]
            }
        });

        if (messagesWithImages.length > 0) {
            const fs = require('fs');
            const path = require('path');
            messagesWithImages.forEach(msg => {
                try {
                    const filename = msg.imageUrl.replace('/uploads/', '');
                    const filePath = path.join(__dirname, '..', 'uploads', filename);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                } catch (err) {
                    console.error('Failed to delete physical file during conversation deletion:', err);
                }
            });
        }

        await prisma.message.deleteMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: contactId },
                    { senderId: contactId, receiverId: userId }
                ]
            }
        });

        res.json({ message: 'Conversation deleted successfully', contactId });
    } catch (error) {
        console.error('Error deleting conversation:', error);
        res.status(500).json({ error: 'Failed to delete conversation' });
    }
});

module.exports = router;

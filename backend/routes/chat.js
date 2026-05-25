const express = require('express');
const fs = require('fs');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const prisma = require('../lib/prismaClient');
const { getComprehensiveDatabaseContext, getDatabaseSchema } = require('../services/databaseQueryService');
const { getSettings } = require('../services/settingsService');
const deepseekService = require('../services/deepseekService');
require('dotenv').config();

const router = express.Router();

// Load multiple API keys from environment variables
const API_KEYS = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5
].filter(key => key && key.trim() !== '');

if (API_KEYS.length === 0) {
    console.error('ERROR: No API keys found in .env file for chat service');
}

// Model failover configuration
const MODELS = [
    "gemini-3-flash-preview",
    "gemini-2.5-flash",
    "gemini-2-flash",
    "gemini-2.5-flash-lite",
    "gemma-3-27b-it"
];
let currentModelIndex = 0;

// API Key rotation state
let currentKeyIndex = 0;
let keyFailureCounts = new Array(API_KEYS.length).fill(0);
const MAX_FAILURES_PER_KEY = 3;

function getCurrentModelName() {
    return MODELS[currentModelIndex];
}

function rotateToNextModel() {
    const previousModel = MODELS[currentModelIndex];
    currentModelIndex = (currentModelIndex + 1) % MODELS.length;
    console.log(`📡 Switching model from ${previousModel} to ${MODELS[currentModelIndex]}`);
    return true;
}

function getCurrentApiKey() {
    return API_KEYS[currentKeyIndex];
}

function rotateToNextKey() {
    const previousIndex = currentKeyIndex;

    for (let i = 0; i < API_KEYS.length; i++) {
        currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;

        if (keyFailureCounts[currentKeyIndex] < MAX_FAILURES_PER_KEY) {
            console.log(`🔄 Switching from API key #${previousIndex + 1} to API key #${currentKeyIndex + 1} for model ${getCurrentModelName()}`);
            return true;
        }
    }

    console.error(`❌ All API keys have exceeded failure limits for model ${getCurrentModelName()}`);

    // Try rotating to the next model
    if (rotateToNextModel()) {
        keyFailureCounts.fill(0);
        currentKeyIndex = 0;
        console.log(`🆕 Starting fresh with model ${getCurrentModelName()} and API key #1`);
        return true;
    }

    return false;
}

function handleKeyFailure(error) {
    keyFailureCounts[currentKeyIndex]++;

    const isRateLimitError = error.message?.includes('429') ||
        error.message?.includes('quota') ||
        error.message?.includes('rate limit');

    if (isRateLimitError) {
        console.warn(`⚠️  API key #${currentKeyIndex + 1} hit rate limit for ${getCurrentModelName()} (failure ${keyFailureCounts[currentKeyIndex]}/${MAX_FAILURES_PER_KEY})`);
    } else {
        console.warn(`⚠️  API key #${currentKeyIndex + 1} failed for ${getCurrentModelName()} (failure ${keyFailureCounts[currentKeyIndex]}/${MAX_FAILURES_PER_KEY}): ${error.message}`);
    }

    return rotateToNextKey();
}

function handleKeySuccess() {
    if (keyFailureCounts[currentKeyIndex] > 0) {
        console.log(`✅ API key #${currentKeyIndex + 1} recovered for ${getCurrentModelName()}`);
        keyFailureCounts[currentKeyIndex] = 0;
    }
}

// Reset all failure state so each new request starts with a clean slate
function resetFailureState() {
    currentKeyIndex = 0;
    currentModelIndex = 0;
    keyFailureCounts.fill(0);
}

function getGenAIClient() {
    return new GoogleGenerativeAI(getCurrentApiKey());
}

// Note: getDatabaseContext is now imported from databaseQueryService as getComprehensiveDatabaseContext
// This provides access to ALL database tables for accurate AI responses

// --- Optimization: Cache Knowledge Base & Targeted Context ---
const path = require('path');

// Global cache for knowledge base
let CACHED_KNOWLEDGE_BASE = "";
function loadKnowledgeBase() {
    try {
        const kbPath = path.join(__dirname, '../ai_knowledge_base.txt');
        if (fs.existsSync(kbPath)) {
            CACHED_KNOWLEDGE_BASE = fs.readFileSync(kbPath, 'utf8');
            console.log("✅ AI Knowledge Base loaded and cached.");
        }
    } catch (err) {
        console.error("❌ Failed to load AI knowledge base:", err);
    }
}
loadKnowledgeBase();

/**
 * Check if the user message is asking for specific database information
 * Returns an array of required model keys or null if no context needed
 */
function isDataQuery(message) {
    const msg = message.toLowerCase();
    const categories = {
        stock: ['stock', 'inventaire', 'quantité', 'article', 'matériel', 'poids'],
        productionLine: ['production', 'ligne', 'transfo', 'transformateur', 'appareil', 'étape', 'step', 'bobinage', 'montage', 'calage', 'peinture'],
        commande: ['commande', 'client', 'order', 'ordre', 'status', 'état'],
        pvEssai: ['pv', 'essai', 'test', 'conformité', 'mesure', 'rapport'],
        user: ['opérateur', 'équipe', 'personnel', 'user', 'utilisateur', 'team', 'connécter'],
        actionLog: ['log', 'historique', 'action', 'activité']
    };

    const neededModels = new Set();

    // Check for category keywords
    for (const [model, keywords] of Object.entries(categories)) {
        if (keywords.some(kw => msg.includes(kw))) {
            neededModels.add(model);
            // Add related models if necessary
            if (model === 'user') {
                neededModels.add('operator');
                neededModels.add('team');
            }
            if (model === 'productionLine') {
                neededModels.add('productionStep');
            }
        }
    }

    // Check for general data context questions
    const isInquiry = /combien|quel|quelle|quelles|quels|qui|où|donne-moi|affiche|liste/i.test(msg);
    if (neededModels.size === 0 && (isInquiry && message.length > 10)) {
        // Fallback to basic summary models for general inquiries
        return ['productionLine', 'stock', 'commande'];
    }

    return neededModels.size > 0 ? Array.from(neededModels) : null;
}

async function getSystemInstruction(hasContext) {
    const settings = getSettings();
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    const adminPrompt = settings.aiSystemPrompt || "Tu es l'assistant IA de TTF (Tunisie Transformateurs).";

    return `
${adminPrompt}

${CACHED_KNOWLEDGE_BASE}

CRITICAL INSTRUCTION:
You are an intelligent and versatile assistant for this factory management system. 
CURRENT CONTEXT: Use today's date for reference: ${dateStr}, ${timeStr}.

LANGUAGE POLICY:
- Always respond in FRENCH (Français) by default.
- Use technical manufacturing terminology appropriately.

VIRTUAL PERSONALITY & CAPABILITIES:
1. VERSATILE EXPERT: You are both a technical expert and a helpful assistant. You can answer questions about the factory's real-time state, but also provide technical advice, explain concepts, and engage in general discussion using your own vast internal knowledge.
2. DATA-AWARE: When the user asks about factory metrics (stock, production, orders, etc.), use the provided REAL-TIME context to give accurate answers.
3. KNOWLEDGE FREEDOM: Do not restrict yourself to only the provided data. If a question is general, technical, or outside the provided database context, use your own intelligence.

${hasContext ? `
DATABASE ACCESS:
You have access to REAL-TIME database context (provided in CONTEXT_START / CONTEXT_END markers).
- Use this data to answer factory-specific questions precisely.
` : `
DATABASE ACCESS:
You are currently operating in General Knowledge mode.
`}

RESPONSE RULES:
1. Be helpful, concise, and professional (Senior Engineer tone).
2. Format responses using clean Markdown.
3. Never refuse to answer a question just because it's not in the database.
`.trim();
}

// --- Session Logic ---

// GET /api/chat/sessions - List user's sessions
router.get('/sessions', async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const sessions = await prisma.aIChatSession.findMany({
            where: { userId: req.user.id },
            orderBy: { updatedAt: 'desc' },
            include: {
                _count: {
                    select: { messages: true }
                }
            }
        });

        res.json(sessions);
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
});

// POST /api/chat/sessions - Create new session
router.post('/sessions', async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const session = await prisma.aIChatSession.create({
            data: {
                userId: req.user.id,
                title: 'Nouvelle discussion',
            }
        });

        res.json(session);
    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({ error: 'Failed to create session' });
    }
});

// DELETE /api/chat/sessions/:id - Delete a session
router.delete('/sessions/:id', async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const sessionId = parseInt(req.params.id);

        await prisma.aIChatSession.deleteMany({
            where: {
                id: sessionId,
                userId: req.user.id
            }
        });

        res.json({ message: 'Session deleted' });
    } catch (error) {
        console.error('Error deleting session:', error);
        // Might fail if detailed relations aren't cascading, but schema says onDelete: Cascade for messages
        res.status(500).json({ error: 'Failed to delete session' });
    }
});


// GET /api/chat/history - Get chat history (optionally by sessionId)
router.get('/history', async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const sessionId = req.query.sessionId ? parseInt(req.query.sessionId) : null;
        let whereClause = { userId: req.user.id };

        if (sessionId) {
            whereClause.sessionId = sessionId;
        } else {
            // Include messages with NO session (legacy)
            whereClause.sessionId = null;
        }

        const history = await prisma.aIChatHistory.findMany({
            where: whereClause,
            orderBy: { createdAt: 'asc' },
            take: 50
        });

        const formattedHistory = history.map(msg => ({
            id: msg.id,
            type: msg.role.toLowerCase(), // Ensure lowercase for CSS classes
            content: msg.content,
            timestamp: msg.createdAt
        }));

        res.json(formattedHistory);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// POST /api/chat - Send message to AI
router.post('/', async (req, res) => {
    try {
        const { message, sessionId, model: requestedModel } = req.body;

        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message is required' });
        }

        const settings = getSettings();
        if (settings.aiEnabled === false) {
            return res.status(503).json({ error: 'L\'assistant IA est temporairement désactivé par l\'administrateur.' });
        }

        // --- Model Selection Logic ---
        const useDeepSeek = requestedModel === 'deepseek' || requestedModel?.includes('deepseek');
        const githubToken = process.env.GITHUB_TOKEN;

        if (useDeepSeek && (!githubToken || githubToken === 'YOUR-GITHUB-TOKEN-GOES-HERE')) {
            return res.status(400).json({ error: 'DeepSeek model selected but GITHUB_TOKEN is not configured in .env' });
        }

        if (!useDeepSeek && API_KEYS.length === 0) {
            return res.status(503).json({ error: 'Gemini AI service is not configured' });
        }

        let targetSessionId = sessionId ? parseInt(sessionId) : null;

        // If sessionId is provided, verify ownership? 
        // Prisma create will link it, but good to be safe. 
        // We'll rely on the DB constraints and logic.

        // REMOVED resetFailureState(); - We want to keep using the last working model/key 
        // to avoid repeating failure loops for every single message.

        let totalRetries = 0;
        const maxTotalRetries = MODELS.length * API_KEYS.length;
        let success = false;
        let responseText = '';

        const neededModels = isDataQuery(message);
        const isDataNeeded = !!neededModels;
        let dbContext = "";

        // 1. Fetch targeted DB context only if needed
        if (isDataNeeded) {
            console.log(`🔍 Data query detected [${neededModels.join(', ')}]. Fetching targeted database context...`);
            dbContext = await getComprehensiveDatabaseContext(neededModels, message);
        }

        // 2. Fetch recent chat history ... (rest remains same)
        let contextWhere = { userId: req.user.id };
        if (targetSessionId) contextWhere.sessionId = targetSessionId;
        else contextWhere.sessionId = null;

        const recentHistory = await prisma.aIChatHistory.findMany({
            where: contextWhere,
            orderBy: { createdAt: 'asc' },
            take: 10
        });

        // Format history for Gemini
        const geminiHistory = recentHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        const systemInstruction = await getSystemInstruction(isDataNeeded);
        const fullMessage = isDataNeeded
            ? `CONTEXT_START\n${dbContext}\nCONTEXT_END\n\nUser Question: ${message}`
            : message;

        // --- DeepSeek Support ---
        if (useDeepSeek) {
            try {
                const deepseekMessages = [
                    { role: 'system', content: systemInstruction },
                    ...recentHistory.map(msg => ({
                        role: msg.role === 'user' ? 'user' : 'assistant',
                        content: msg.content
                    })),
                    { role: 'user', content: fullMessage }
                ];

                console.log(`🤖 Web Chat: Using DeepSeek via GitHub Models`);
                responseText = await deepseekService.getChatCompletion(deepseekMessages, {
                    temperature: settings.aiTemperature ?? 0.7,
                    maxTokens: 2000
                });

                success = true;
            } catch (error) {
                console.error(`🔴 DeepSeek error:`, error.message);
                return res.status(503).json({ error: 'DeepSeek service unavailable: ' + error.message });
            }
        } else {
            // Existing Gemini Logic
            const TIMEOUT_MS = 10000; // 10 seconds max per model
            let modelsTried = 0;

            while (!success && totalRetries < maxTotalRetries) {
                try {
                    const genAI = getGenAIClient();
                    const model = genAI.getGenerativeModel({
                        model: getCurrentModelName(),
                        systemInstruction: systemInstruction
                    });

                    console.log(`🤖 Web Chat: Using model ${getCurrentModelName()} with API Key #${currentKeyIndex + 1}`);

                    const chat = model.startChat({
                        history: geminiHistory,
                        generationConfig: {
                            maxOutputTokens: 2000,
                            temperature: settings.aiTemperature ?? 0.7,
                        },
                    });

                    // Logic: Only timeout if we haven't tried all models yet.
                    // If we've cycled through all of them and are back at the start (or continuing), wait indefinitely.
                    const shouldTimeout = modelsTried < MODELS.length;

                    let resultPromise;

                    if (shouldTimeout) {
                        const timeoutPromise = new Promise((_, reject) => {
                            setTimeout(() => reject(new Error('TIMEOUT')), TIMEOUT_MS);
                        });
                        resultPromise = Promise.race([chat.sendMessage(fullMessage), timeoutPromise]);
                    } else {
                        console.log(`⏳ Timeout disabled for model ${getCurrentModelName()} (Second attempt/pass)`);
                        resultPromise = chat.sendMessage(fullMessage);
                    }

                    const result = await resultPromise;
                    const response = await result.response;
                    responseText = response.text();

                    handleKeySuccess();
                    success = true;

                } catch (error) {
                    totalRetries++;

                    if (error.message === 'TIMEOUT') {
                        console.warn(`⏳ TIMEOUT: Model ${getCurrentModelName()} took too long (> ${TIMEOUT_MS}ms).`);
                        modelsTried++; // Count this model as tried

                        // Force switch to next model immediately (skip remaining keys for this slow model)
                        if (rotateToNextModel()) {
                            currentKeyIndex = 0; // Reset to first key for the new model
                            console.log(`🔄 Switching to next model: ${getCurrentModelName()}`);
                            continue; // Retry loop with new model
                        } else {
                            console.error('❌ All models exhausted after timeout.');
                            break;
                        }
                    }

                    console.error(`🔴 Chat error with ${getCurrentModelName()} using API key #${currentKeyIndex + 1}:`, error.message);

                    if (handleKeyFailure(error)) {
                        console.log(`🔄 Retrying with ${getCurrentModelName()} using API key #${currentKeyIndex + 1}...`);
                    } else {
                        console.error('❌ All models and API keys failed to respond successfully.');
                        break;
                    }
                }
            }
        }

        if (!success) {
            return res.status(503).json({
                error: 'AI service temporarily unavailable. Please try again later or check your API keys.'
            });
        }

        // 3. Save User Message
        await prisma.aIChatHistory.create({
            data: {
                userId: req.user.id,
                sessionId: targetSessionId,
                role: 'user',
                content: message,
            }
        });

        // 4. Save Assistant Response
        await prisma.aIChatHistory.create({
            data: {
                userId: req.user.id,
                sessionId: targetSessionId,
                role: 'assistant',
                content: responseText,
            }
        });

        // Update session title if needed
        if (targetSessionId) {
            // Only update title if it's "Nouvelle discussion" or similar default?
            // Or update it if it's the first message exchange interaction in a new session.
            // Let's check if title is default.
            const session = await prisma.aIChatSession.findUnique({ where: { id: targetSessionId } });
            if (session && session.title === 'Nouvelle discussion' && recentHistory.length === 0) {
                const title = message.length > 30 ? message.substring(0, 30) + '...' : message;
                await prisma.aIChatSession.update({
                    where: { id: targetSessionId },
                    data: { title: title }
                });
            }

            // Always update updatedAt
            await prisma.aIChatSession.update({
                where: { id: targetSessionId },
                data: { updatedAt: new Date() }
            });
        }

        res.json({
            response: responseText,
            sessionId: targetSessionId,
            modelUsed: useDeepSeek ? 'deepseek/DeepSeek-V3' : getCurrentModelName(),
            keyUsed: useDeepSeek ? 'GitHub Token' : (currentKeyIndex + 1)
        });

    } catch (error) {
        console.error('🔴 Chat endpoint error:', error);
        res.status(500).json({
            error: 'Failed to process your message.',
            details: error.message
        });
    }
});

// DELETE /api/chat - Clear chat history (Legacy or global clear)
router.delete('/', async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        await prisma.aIChatHistory.deleteMany({
            where: { userId: req.user.id }
        });

        // Also clear sessions?
        await prisma.aIChatSession.deleteMany({
            where: { userId: req.user.id }
        });

        res.json({ message: 'All chat history cleared' });
    } catch (error) {
        console.error('Error clearing history:', error);
        res.status(500).json({ error: 'Failed to clear history' });
    }
});

module.exports = router;

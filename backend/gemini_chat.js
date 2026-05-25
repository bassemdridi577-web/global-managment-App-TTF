const { GoogleGenerativeAI } = require("@google/generative-ai");
const readline = require('readline');
require('dotenv').config();

// Load multiple API keys from environment variables
const API_KEYS = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5
].filter(key => key && key.trim() !== ''); // Remove empty/undefined keys

if (API_KEYS.length === 0) {
    console.error('ERROR: No API keys found in .env file');
    console.error('Please add at least one key: GEMINI_API_KEY_1=your_api_key_here');
    console.error('You can add up to 5 keys: GEMINI_API_KEY_1 to GEMINI_API_KEY_5');
    process.exit(1);
}

console.log(`✅ Loaded ${API_KEYS.length} API key(s) for failover`);

// API Key rotation state
let currentKeyIndex = 0;
let keyFailureCounts = new Array(API_KEYS.length).fill(0);
const MAX_FAILURES_PER_KEY = 3;

// Model failover configuration
const MODELS = [

    "gemma-3-27b-it"

];
let currentModelIndex = 0;

/**
 * Get the current active model name
 */
function getCurrentModelName() {
    return MODELS[currentModelIndex];
}

/**
 * Rotate to the next available model
 */
function rotateToNextModel() {
    const previousModel = MODELS[currentModelIndex];
    currentModelIndex = (currentModelIndex + 1) % MODELS.length;
    console.log(`📡 Switching model from ${previousModel} to ${MODELS[currentModelIndex]}`);
    return true; // We can always loop back to the first model
}

/**
 * Get the current active API key
 */
function getCurrentApiKey() {
    return API_KEYS[currentKeyIndex];
}

/**
 * Rotate to the next available API key
 */
function rotateToNextKey() {
    const previousIndex = currentKeyIndex;

    // Try to find a key that hasn't failed too many times
    for (let i = 0; i < API_KEYS.length; i++) {
        currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;

        if (keyFailureCounts[currentKeyIndex] < MAX_FAILURES_PER_KEY) {
            console.log(`🔄 Switching from API key #${previousIndex + 1} to API key #${currentKeyIndex + 1} for model ${getCurrentModelName()}`);
            return true;
        }
    }

    // All keys have failed too many times for the current model
    console.error(`❌ All API keys have exceeded failure limits for model ${getCurrentModelName()}`);

    // Try rotating to the next model
    if (rotateToNextModel()) {
        // Reset key failure counts for the new model
        keyFailureCounts.fill(0);
        currentKeyIndex = 0;
        console.log(`🆕 Starting fresh with model ${getCurrentModelName()} and API key #1`);
        return true;
    }

    return false;
}

/**
 * Mark current key as failed and rotate
 */
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

/**
 * Reset failure count for current key on success
 */
function handleKeySuccess() {
    if (keyFailureCounts[currentKeyIndex] > 0) {
        console.log(`✅ API key #${currentKeyIndex + 1} recovered for ${getCurrentModelName()}`);
        keyFailureCounts[currentKeyIndex] = 0;
    }
}

/**
 * Get or create a Generative AI client with current key
 */
function getGenAIClient() {
    return new GoogleGenerativeAI(getCurrentApiKey());
}

async function run() {
    // Initialize with first available key and model
    let genAI = getGenAIClient();
    let model = genAI.getGenerativeModel({ model: getCurrentModelName() });
    let chat = model.startChat({
        history: [],
        generationConfig: {
            maxOutputTokens: 1000,
        },
    });

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log(`Connected to ${getCurrentModelName()} using API key #${currentKeyIndex + 1}`);
    console.log("--------------------------------------------------");

    const askQuestion = () => {
        rl.question('You: ', async (msg) => {
            if (msg.toLowerCase().trim() === 'exit') {
                console.log("Goodbye!");
                rl.close();
                return;
            }

            let success = false;
            let totalRetries = 0;
            const maxTotalRetries = MODELS.length * API_KEYS.length; // Try all combinations

            while (!success && totalRetries < maxTotalRetries) {
                try {
                    console.log(`\n🤖 Terminal Chat: Using model ${getCurrentModelName()} with API Key #${currentKeyIndex + 1}`);
                    process.stdout.write(`${getCurrentModelName()} thinking...`);
                    const result = await chat.sendMessage(msg);
                    const response = await result.response;
                    const text = response.text();

                    // Clear the "thinking..." line
                    readline.clearLine(process.stdout, 0);
                    readline.cursorTo(process.stdout, 0);

                    console.log(`${getCurrentModelName()}:`, text);

                    // Mark success and reset failure count
                    handleKeySuccess();
                    success = true;

                } catch (error) {
                    readline.clearLine(process.stdout, 0);
                    readline.cursorTo(process.stdout, 0);

                    totalRetries++;

                    // Try to rotate (keys first, then models)
                    if (handleKeyFailure(error)) {
                        // Successfully rotated (either key or model), recreate chat
                        genAI = getGenAIClient();
                        model = genAI.getGenerativeModel({ model: getCurrentModelName() });
                        chat = model.startChat({
                            history: [], // We might lose context here on rotation, but it's a failover
                            generationConfig: {
                                maxOutputTokens: 1000,
                            },
                        });

                        console.log(`🔄 Retrying with ${getCurrentModelName()} using API key #${currentKeyIndex + 1}...`);
                    } else {
                        // No more options available
                        console.error('❌ Error: Total failure after trying all models and keys');
                        break;
                    }
                }
            }

            if (!success) {
                console.error('⚠️  Could not complete request after trying all alternatives');
            }

            askQuestion();
        });
    };

    askQuestion();
}

run().catch(console.error);

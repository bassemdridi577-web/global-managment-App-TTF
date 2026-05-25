    const { AzureKeyCredential } = require("@azure/core-auth");
const path = require('path');
const fs = require('fs');
const envPath = path.join(__dirname, '..', '.env');

// Try standard dotenv first
require('dotenv').config({ path: envPath, override: true });

// Fallback: If token not loaded, parse manually (handles encoding/path quirks)
if (!process.env.GITHUB_TOKEN && fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
        const [key, ...val] = line.split('=');
        if (key && val.length > 0) {
            process.env[key.trim()] = val.join('=').trim().replace(/^['"](.*)['"]$/, '$1');
        }
    });
}

// The @azure-rest/ai-inference package might be ESM. 
// If require fails, we'll use dynamic import.
let ModelClient;
let isUnexpected;

async function loadAzureClient() {
    if (!ModelClient) {
        // Many @azure packages are hybrid, let's try requiring first
        try {
            const aiInference = require("@azure-rest/ai-inference");
            ModelClient = aiInference.default;
            isUnexpected = aiInference.isUnexpected;
        } catch (err) {
            // Fallback to dynamic import if CommonJS require fails
            const aiInference = await import("@azure-rest/ai-inference");
            ModelClient = aiInference.default;
            isUnexpected = aiInference.isUnexpected;
        }
    }
}

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.github.ai/inference";
const defaultModel = "deepseek/DeepSeek-V3-0324";

/**
 * Send messages to DeepSeek via GitHub Models
 * @param {Array} messages - Array of chat messages
 * @param {Object} options - Options like temperature, maxTokens, etc.
 */
async function getChatCompletion(messages, options = {}) {
    await loadAzureClient();

    if (!token) {
        throw new Error("GITHUB_TOKEN is not defined in environment variables.");
    }

    const client = ModelClient(
        endpoint,
        new AzureKeyCredential(token),
    );

    const response = await client.path("/chat/completions").post({
        body: {
            messages: messages,
            temperature: options.temperature || 1.0,
            top_p: options.top_p || 1.0,
            max_tokens: options.maxTokens || 1000,
            model: options.model || defaultModel
        }
    });

    if (isUnexpected(response)) {
        const errorMsg = response.body?.error?.message || "Unknown API error";
        throw new Error(`GitHub Models Error (${response.status}): ${errorMsg}`);
    }

    return response.body.choices[0].message.content;
}

module.exports = {
    getChatCompletion
};

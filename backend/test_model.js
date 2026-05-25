const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY;
const modelName = "gemini-3-flash-preview";

async function testModel() {
    if (!API_KEY) {
        console.error("No API key found in .env");
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: modelName });

        console.log(`Testing model: ${modelName}...`);
        const result = await model.generateContent("Hello, are you operational?");
        const response = await result.response;
        console.log("Success! Response:", response.text());
    } catch (error) {
        console.error("Failed to use model:", modelName);
        console.error("Error message:", error.message);
    }
}

testModel();

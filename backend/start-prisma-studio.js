require('dotenv').config();
const express = require("express");
const basicAuth = require("express-basic-auth");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { spawn } = require("child_process");
const path = require("path");

const APP_PORT = 5555; // Public port with authentication
const PRISMA_STUDIO_PORT = 5556; // Private internal port
const AUTH_USER = process.env.PRISMA_STUDIO_USER || 'admin';
const AUTH_PASS = process.env.PRISMA_STUDIO_PASS || 'TTF2026#';

// --- 1. Start Prisma Studio on localhost (127.0.0.1) ONLY ---
// By binding to 127.0.0.1, we ensure it's ONLY accessible via this proxy.
console.log(`Starting Prisma Studio on 127.0.0.1:${PRISMA_STUDIO_PORT}...`);
const prismaProcess = spawn("npx.cmd", ["prisma", "studio", "--port", PRISMA_STUDIO_PORT.toString(), "--hostname", "127.0.0.1", "--browser", "none"], {
    cwd: __dirname,
    shell: true,
    windowsHide: true
});

prismaProcess.stdout.on("data", (data) => {
    const output = data.toString();
    if (output.includes("Prisma Studio is up on")) {
        console.log(`[Prisma Studio] Ready on internal port ${PRISMA_STUDIO_PORT}`);
    }
});

prismaProcess.on("error", (err) => {
    console.error("Failed to start Prisma Studio:", err);
});

// --- 2. Create Express Proxy with Basic Auth ---
const app = express();

// Use basic authentication from .env
app.use(basicAuth({
    users: { [AUTH_USER]: AUTH_PASS },
    challenge: true,
    realm: "Prisma Studio Access"
}));

// Proxy all requests to internal Prisma Studio
app.use("/", createProxyMiddleware({
    target: `http://127.0.0.1:${PRISMA_STUDIO_PORT}`,
    changeOrigin: true,
    ws: true, // Crucial for Prisma Studio (uses WebSockets)
    logLevel: 'warn'
}));

// Start the authenticated proxy on all network interfaces
app.listen(APP_PORT, "0.0.0.0", () => {
    console.log(`--------------------------------------------------`);
    console.log(`Prisma Studio is now PROTECTED.`);
    console.log(`Access URL: http://0.0.0.0:${APP_PORT}`);
    console.log(`Credentials managed in .env file.`);
    console.log(`--------------------------------------------------`);
});

// Cleanup on exit
process.on("SIGINT", () => {
    prismaProcess.kill();
    process.exit();
});
process.on("SIGTERM", () => {
    prismaProcess.kill();
    process.exit();
});

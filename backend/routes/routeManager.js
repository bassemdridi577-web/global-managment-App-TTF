const express = require('express');
const router = express.Router();

// Try to mount a route, log failure if it fails
const mountRoute = (app, path, routeFile) => {
    try {
        const route = require(routeFile);
        app.use(path, route);
        console.log(`Mounted ${path}`);
    } catch (err) {
        console.error(`Failed to mount ${path}:`, err.message);
    }
};

const initRoutes = (app) => {
    // Versioned API
    const v1Router = require('./v1');
    app.use('/api/v1', v1Router);

    // Legacy/Default API routes
    mountRoute(app, '/api/auth', '../routes/auth');
    mountRoute(app, '/api/pv-essai', '../routes/pvEssai');
    mountRoute(app, '/api/commande', '../routes/commande');
    mountRoute(app, '/api/production-line', '../routes/productionLine');
    mountRoute(app, '/api/production-steps', '../routes/productionStep');
    mountRoute(app, '/api/users', '../routes/users');
    mountRoute(app, '/api/stock', '../routes/stock');
    mountRoute(app, '/api/transformator', '../routes/transformator');
    mountRoute(app, '/api', '../routes/transformatorArticle');
    mountRoute(app, '/api/test', '../routes/test');
    mountRoute(app, '/api/logs', '../routes/logs');
    mountRoute(app, '/api/chat', '../routes/chat');
    mountRoute(app, '/api/messages', '../routes/messages');
    mountRoute(app, '/api/operators', '../routes/operators');
    mountRoute(app, '/api/teams', '../routes/teams');
    mountRoute(app, '/api/non-conformity', '../routes/nonConformity');
    mountRoute(app, '/api/transformer-study', '../routes/transformerStudy');
    mountRoute(app, '/api/admin', '../routes/admin');
    mountRoute(app, '/api/bct', '../routes/bct');
    mountRoute(app, '/api/facture', '../routes/facture');
};

module.exports = { initRoutes };

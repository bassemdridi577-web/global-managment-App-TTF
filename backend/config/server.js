const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const loadSSL = () => {
    let sslOptions = null;
    try {
        const keyPath = path.join(__dirname, '..', 'certs', 'server.key');
        const certPath = path.join(__dirname, '..', 'certs', 'server.cert');
        if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
            sslOptions = {
                key: fs.readFileSync(keyPath),
                cert: fs.readFileSync(certPath),
            };
            console.log('SSL Certificates found. HTTPS will be enabled.');
        }
    } catch (err) {
        console.warn('SSL certificates not found or invalid. Falling back to HTTP.');
    }
    return sslOptions;
};

const createServer = (app) => {
    const sslOptions = loadSSL();
    return sslOptions
        ? https.createServer(sslOptions, app)
        : http.createServer(app);
};

module.exports = {
    createServer
};

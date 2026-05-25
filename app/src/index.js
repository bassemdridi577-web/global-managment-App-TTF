import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import './index.css';
import './i18n';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

// --- GitHub Pages SPA Routing Redirect Handler ---
if (window.location.pathname !== '/' && window.location.search.startsWith('?/')) {
  window.history.replaceState(
    null,
    null,
    window.location.pathname.slice(0, -1) +
    window.location.search.slice(2).replace(/~and~/g, '&') +
    window.location.hash
  );
}

root.render(
  <React.StrictMode>
    <Suspense fallback="loading...">
      <App />
    </Suspense>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// --- Global WebSocket Refresh Mechanism ---
// Tracking refresh time in sessionStorage to persist across reloads

let wsInstance = null;

const setupWebSocket = () => {
  // Portfolio mode: Skip WebSocket
  const isMock = window.location.hostname.includes('github.io') || 
                 process.env.REACT_APP_MOCK_API === 'true';
  if (isMock) {
    console.log('Portfolio mode: Sync WebSocket disabled');
    return;
  }

  // Prevent multiple overlapping connections
  if (wsInstance) {
    wsInstance.close();
  }

  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsHost = window.location.hostname + ':5000';

  const ws = new WebSocket(`${wsProtocol}//${wsHost}`);
  wsInstance = ws;

  ws.onopen = () => {
    console.log('Sync WebSocket connected');
  };

  ws.onmessage = event => {
    try {
      const message = JSON.parse(event.data);
      if (message.type === 'refresh') {
        const now = Date.now();
        // Prevent refresh loop: only allow refresh every 10 seconds
        const lastRefreshTime = parseInt(sessionStorage.getItem('lastRefreshTime') || '0', 10);
        // Prevent refresh loop: only allow refresh every 10 seconds
        if (now - lastRefreshTime > 10000) {
          sessionStorage.setItem('lastRefreshTime', now.toString());
          console.log('Refresh signal received, reloading page...');
          window.location.reload();
        } else {
          console.log('Refresh signal ignored (cooldown active)');
        }
      }
    } catch (e) {
      console.error('Error parsing WS message', e);
    }
  };

  ws.onclose = () => {
    console.log('Sync WebSocket disconnected, attempting to reconnect...');
    wsInstance = null;
    // Debounced reconnection
    setTimeout(setupWebSocket, 5000);
  };

  ws.onerror = error => {
    console.error('Sync WebSocket error:', error);
    ws.close();
  };
};

setupWebSocket();

// --- PWA Service Worker Registration with Auto-Update ---
if ('serviceWorker' in navigator) {
  const isLocalhost = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '[::1]';

  window.addEventListener('load', () => {
    if (process.env.NODE_ENV === 'production' || !isLocalhost) {
      navigator.serviceWorker.register(`${process.env.PUBLIC_URL || ''}/service-worker.js`)
        .then(registration => {
          console.log('SW registered: ', registration);

          // Check for updates every 60 seconds
          setInterval(() => {
            registration.update();
          }, 60 * 1000);

          // When a new SW is found, activate it and reload
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'activated') {
                  console.log('New version available, reloading...');
                  window.location.reload();
                }
              });
            }
          });
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });

      // Reload when a new SW takes control
      let isRefreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!isRefreshing) {
          isRefreshing = true;
          window.location.reload();
        }
      });
    } else {
      // In development on localhost, unregister to avoid caching issues
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (let registration of registrations) {
          registration.unregister();
          console.log('SW unregistered on localhost');
        }
      });
    }
  });
}

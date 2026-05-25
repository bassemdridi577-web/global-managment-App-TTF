import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage PWA install prompt.
 * Reads the globally captured `beforeinstallprompt` event from index.html,
 * and also listens for future events in case it fires after mount.
 */
const usePwaInstall = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already running as installed PWA
        const isStandalone =
            window.matchMedia('(display-mode: standalone)').matches ||
            window.matchMedia('(display-mode: minimal-ui)').matches ||
            window.navigator.standalone === true;

        if (isStandalone) {
            setIsInstalled(true);
            return;
        }

        // Pick up the prompt captured globally in index.html before React loaded
        if (window.__pwaInstallPrompt) {
            setDeferredPrompt(window.__pwaInstallPrompt);
        }

        // Also listen for future events (e.g. after user dismisses and revisits)
        const handleBeforeInstall = (event) => {
            event.preventDefault();
            window.__pwaInstallPrompt = event;
            setDeferredPrompt(event);
        };

        const handleAppInstalled = () => {
            window.__pwaInstallPrompt = null;
            setDeferredPrompt(null);
            setIsInstalled(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const promptInstall = useCallback(async () => {
        if (!deferredPrompt) return false;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            window.__pwaInstallPrompt = null;
            setDeferredPrompt(null);
            setIsInstalled(true);
        }

        return outcome === 'accepted';
    }, [deferredPrompt]);

    return {
        isInstallable: !!deferredPrompt && !isInstalled,
        isInstalled,
        promptInstall,
    };
};

export default usePwaInstall;

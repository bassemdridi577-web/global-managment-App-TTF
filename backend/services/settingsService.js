const fs = require('fs');
const path = require('path');

const SETTINGS_FILE = path.resolve(__dirname, '..', 'config', 'settings.json');

const defaultSettings = {
    autoBackupEnabled: true,
    backupRetentionDays: 7,
    lastBackupIndex: 0,
    // AI Chat Settings
    aiEnabled: true,
    aiTemperature: 0.7,
    aiSystemPrompt: "Tu es l'assistant IA de TTF (Tunisie Transformateurs). Tu aides les utilisateurs avec des informations techniques, la gestion du stock et les processus de production."
};

/**
 * Get all application settings
 */
const getSettings = () => {
    try {
        if (!fs.existsSync(SETTINGS_FILE)) {
            // Create with defaults if doesn't exist
            saveSettings(defaultSettings);
            return defaultSettings;
        }
        const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('[SettingsService] Error reading settings:', err);
        return defaultSettings;
    }
};

/**
 * Save application settings
 * @param {Object} settings 
 */
const saveSettings = (settings) => {
    try {
        const dir = path.dirname(SETTINGS_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error('[SettingsService] Error saving settings:', err);
        return false;
    }
};

/**
 * Update a specific setting
 * @param {string} key 
 * @param {any} value 
 */
const updateSetting = (key, value) => {
    const settings = getSettings();
    settings[key] = value;
    return saveSettings(settings);
};

module.exports = {
    getSettings,
    saveSettings,
    updateSetting
};

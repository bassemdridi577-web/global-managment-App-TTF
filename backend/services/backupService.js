const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
const { createLog } = require('./logService');

const backupDatabase = (userId = null) => {
    const isManual = userId !== null;
    const actionType = isManual ? 'Manuel' : 'Automatique';
    const backupDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(cronDir = backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    // Determine next backup number (N1-N10 rotation)
    const files = fs.readdirSync(backupDir)
        .filter(f => f.startsWith('backup-postgres-N'))
        .sort((a, b) => {
            const aNum = parseInt(a.match(/N(\d+)/)?.[1] || 0);
            const bNum = parseInt(b.match(/N(\d+)/)?.[1] || 0);
            return aNum - bNum;
        });

    let nextNum = 1;
    if (files.length > 0) {
        // Find the highest N to increment it
        const numbers = files.map(f => parseInt(f.match(/N(\d+)/)?.[1] || 0));
        const maxN = Math.max(...numbers);
        nextNum = maxN + 1;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `backup-postgres-N${nextNum}-${timestamp}.sql`;
    const filePath = path.join(backupDir, fileName);

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('DATABASE_URL not found in environment variables');
        return;
    }

    // Extraction of credentials from DATABASE_URL
    // format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
    const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (!match) {
        console.error('Invalid DATABASE_URL format');
        return;
    }

    const [, user, password, host, port, dbname] = match;

    const pgDumpPath = process.env.PG_DUMP_PATH || 'pg_dump';

    // Determine the database name correctly from URL
    // Handle cases like 'postgres?schema=public' by taking only the 'postgres' part
    const cleanDbName = dbname.split('?')[0];

    const cmd = `set PGPASSWORD=${password}&& "${pgDumpPath}" -h ${host} -p ${port} -U ${user} -F c -b -v -f "${filePath}" ${cleanDbName}`;

    console.log(`Starting backup N${nextNum}...`);

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`Backup error: ${error.message}`);
            createLog(userId, 'Sauvegarde Échouée', `Type: ${actionType}. Erreur: ${error.message}`);
            return;
        }

        // Keep 10 most recent: delete N = nextNum - 10
        const deleteN = nextNum - 10;
        if (deleteN > 0) {
            files.forEach(f => {
                if (f.match(new RegExp(`-N${deleteN}-`))) {
                    try {
                        fs.unlinkSync(path.join(backupDir, f));
                        console.log(`Removed old backup: ${f}`);
                    } catch (e) {
                        console.error(`Failed to remove old backup ${f}:`, e);
                    }
                }
            });
        }

        console.log(`Backup completed: ${fileName}`);
        createLog(userId, 'Sauvegarde Réussie', `Type: ${actionType}. Fichier: ${fileName}`);
    });
};

const { getSettings } = require('./settingsService');

const initBackupJob = () => {
    // Daily at 02:00
    cron.schedule('0 2 * * *', () => {
        const settings = getSettings();
        if (settings.autoBackupEnabled) {
            console.log('Running scheduled database backup...');
            backupDatabase();
        } else {
            console.log('Scheduled backup skipped (disabled in settings)');
        }
    });
    console.log('Backup job scheduled (Daily at 02:00)');
};

module.exports = {
    backupDatabase,
    initBackupJob
};

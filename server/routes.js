const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { readData, writeData, readAdmins, writeAdmins, readSuperAdmins } = require('./db');

// Configure multer for file upload (store in memory)
const upload = multer({ storage: multer.memoryStorage() });
const { COMMITTEE_PHONES } = require('./constants');
const { logSuperAdminActivity, readSuperAdminLogs } = require('./logger');

const BASE_TOURNAMENT_JSON = path.join(__dirname, 'data', 'tournament.json');

// Helper to normalize phone numbers to digits-only strings
function normalizePhone(p) {
    return String(p == null ? '' : p).replace(/\D/g, '');
}

// GET /api/data - Full Initial Data
router.get('/data', async (req, res) => {
    const data = await readData();
    res.json(data);
});

// GET /api/rulebook - Serve the rulebook markdown file
router.get('/rulebook', (req, res) => {
    const rulebookPath = path.join(__dirname, 'assets', 'Vijayasri Eldorado Badminton Tournament 2026 - RuleBook.md');
    try {
        const content = fs.readFileSync(rulebookPath, 'utf8');
        res.type('text/plain').send(content);
    } catch (err) {
        console.error("Error reading rulebook:", err);
        res.status(500).send("Error loading rulebook");
    }
});

// POST /api/login - Check if committee
router.post('/login', async (req, res) => {
    const { phone } = req.body;
    const p = normalizePhone(phone);
    const admins = (await readAdmins()).map(normalizePhone);
    const superAdmins = (await readSuperAdmins()).map(normalizePhone);
    const isCommittee = admins.includes(p);
    const isSuperAdmin = superAdmins.includes(p);
    res.json({ success: true, isCommittee, isSuperAdmin, phone: p });
});

// GET /api/admin/list - Get list of admins (Super-Admin only)
router.get('/admin/list', async (req, res) => {
    const { phone } = req.query;
    const p = normalizePhone(phone);
    const superAdmins = (await readSuperAdmins()).map(normalizePhone);
    if (!superAdmins.includes(p)) return res.status(403).json({ error: "Forbidden" });

    // Log super-admin activity
    logSuperAdminActivity(p, 'VIEW_ADMIN_LIST', { action: 'Retrieved admin list' });

    const admins = await readAdmins();
    res.json({ admins });
});

// GET /api/admin/super-admins - Get list of super admins
router.get('/admin/super-admins', async (req, res) => {
    const superAdmins = await readSuperAdmins();
    res.json({ superAdmins });
});

// GET /api/admin/activity-logs - Get super-admin activity logs (Super-Admin only)
router.get('/admin/activity-logs', async (req, res) => {
    const { phone } = req.query;
    const p = normalizePhone(phone);
    const superAdmins = (await readSuperAdmins()).map(normalizePhone);
    if (!superAdmins.includes(p)) return res.status(403).json({ error: "Forbidden" });

    // Log this access as well
    logSuperAdminActivity(p, 'VIEW_ACTIVITY_LOGS', { action: 'Retrieved activity logs' });

    const logs = readSuperAdminLogs();
    res.json({ logs });
});

// POST /api/admin/add - Add a new admin (Super-Admin only)
router.post('/admin/add', async (req, res) => {
    const { superPhone, newAdminPhone } = req.body;
    const sp = normalizePhone(superPhone);
    const nap = normalizePhone(newAdminPhone);
    const superAdmins = (await readSuperAdmins()).map(normalizePhone);
    if (!superAdmins.includes(sp)) return res.status(403).json({ error: "Forbidden" });

    let admins = await readAdmins();
    const adminSet = new Set(admins.map(normalizePhone));
    const wasAdded = !adminSet.has(nap);
    if (wasAdded) {
        // Persist normalized number to keep consistency
        admins.push(nap);
        await writeAdmins(admins);
    }

    // Log super-admin activity
    logSuperAdminActivity(sp, 'ADD_ADMIN', {
        newAdminPhone: nap,
        wasAdded,
        totalAdmins: admins.length
    });

    res.json({ success: true, admins });
});

// POST /admin/reset - Master Reset (Super-Admin only)
router.post('/admin/reset', async (req, res) => {
    const { phone } = req.body;
    const p = normalizePhone(phone);
    const superAdmins = (await readSuperAdmins()).map(normalizePhone);
    if (!superAdmins.includes(p)) return res.status(403).json({ error: "Forbidden" });

    // Load base tournament data from local JSON and overwrite MongoDB
    try {
        const raw = fs.readFileSync(BASE_TOURNAMENT_JSON, 'utf8');
        const baseData = JSON.parse(raw);
        await writeData(baseData);

        // Log super-admin activity
        logSuperAdminActivity(p, 'MASTER_RESET_TO_BASE', {
            action: 'Replaced MongoDB tournament data with local base tournament.json',
            players: baseData.players?.length || 0,
            matches: baseData.matches?.length || 0
        });

        req.io.emit('DATA_REFRESH', baseData);
        res.json({ success: true, message: "Tournament data reset to base from local tournament.json" });
    } catch (e) {
        console.error('Error resetting to base data:', e);
        res.status(500).json({ error: 'Failed to load base tournament.json or write to database' });
    }
});

// POST /api/matches/update - Update Score/Status (Committee Only)
router.post('/matches/update', async (req, res) => {
    const { matchId, score, status, winner, player1, player2 } = req.body;

    const data = await readData();
    const matchIndex = data.matches.findIndex(m => m.id === matchId);

    if (matchIndex === -1) {
        return res.status(404).json({ error: "Match not found" });
    }

    // Update fields
    if (score !== undefined) data.matches[matchIndex].score = score;
    if (status !== undefined) data.matches[matchIndex].status = status;
    if (winner !== undefined) data.matches[matchIndex].winner = winner;
    if (player1 !== undefined) data.matches[matchIndex].player1 = player1;
    if (player2 !== undefined) data.matches[matchIndex].player2 = player2;

    // Run Auto Advancement
    const processAdvancement = require('./auto_scheduler');
    const advanced = processAdvancement(data);

    await writeData(data); // Save everything

    // Emit Socket Event
    req.io.emit('MATCH_UPDATE', data.matches[matchIndex]);

    if (advanced) {
        req.io.emit('DATA_REFRESH', data); // Refresh everyone if future matches changed
    }

    res.json({ success: true, match: data.matches[matchIndex] });
});

// POST /api/players/update - Update Player Name (Committee Only)
router.post('/players/update', async (req, res) => {
    const { playerId, name } = req.body;
    const data = await readData();
    const player = data.players.find(p => p.id === playerId);
    if (!player) return res.status(404).json({ error: "Player not found" });

    player.name = name;
    await writeData(data);
    req.io.emit('DATA_REFRESH', data);
    res.json({ success: true });
});

// GET /api/backup/download - Download tournament.json backup (Committee Only)
router.get('/backup/download', async (req, res) => {
    const { phone } = req.query;
    const p = normalizePhone(phone);
    const admins = (await readAdmins()).map(normalizePhone);
    if (!admins.includes(p)) {
        return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    const data = await readData();
    if (!data) {
        return res.status(500).json({ error: "Error reading tournament data" });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `tournament-backup-${timestamp}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(JSON.stringify(data, null, 2));
});

// POST /api/backup/upload - Upload and restore tournament.json backup (Committee Only)
router.post('/backup/upload', upload.single('backup'), async (req, res) => {
    const { phone } = req.body;
    const p = normalizePhone(phone);
    const admins = (await readAdmins()).map(normalizePhone);
    if (!admins.includes(p)) {
        return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    try {
        const fileContent = req.file.buffer.toString('utf8');
        const data = JSON.parse(fileContent);

        // Basic validation: check if required fields exist
        if (!data.players || !data.matches || !data.categories || !data.courts) {
            return res.status(400).json({ error: "Invalid backup file: missing required fields (players, matches, categories, courts)" });
        }

        // Write the uploaded data
        const success = await writeData(data);
        if (!success) {
            return res.status(500).json({ error: "Error writing tournament data" });
        }

        // Emit socket event to refresh all clients
        req.io.emit('DATA_REFRESH', data);

        res.json({
            success: true,
            message: "Backup restored successfully",
            stats: {
                players: data.players.length,
                matches: data.matches.length,
                categories: data.categories.length,
                courts: data.courts.length
            }
        });
    } catch (err) {
        console.error("Error restoring backup:", err);
        res.status(400).json({ error: "Invalid JSON file" });
    }
});

module.exports = router;

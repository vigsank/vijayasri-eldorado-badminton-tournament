const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { readData, writeData, readAdmins, writeAdmins, readSuperAdmins } = require('./db');
const { COMMITTEE_PHONES } = require('./constants');
const { logSuperAdminActivity, readSuperAdminLogs } = require('./logger');

// GET /api/data - Full Initial Data
router.get('/data', (req, res) => {
    const data = readData();
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
router.post('/login', (req, res) => {
    const { phone } = req.body;
    const admins = readAdmins();
    const superAdmins = readSuperAdmins();
    const isCommittee = admins.includes(phone);
    const isSuperAdmin = superAdmins.includes(phone);
    res.json({ success: true, isCommittee, isSuperAdmin, phone });
});

// GET /api/admin/list - Get list of admins (Super-Admin only)
router.get('/admin/list', (req, res) => {
    const { phone } = req.query;
    const superAdmins = readSuperAdmins();
    if (!superAdmins.includes(phone)) return res.status(403).json({ error: "Forbidden" });

    // Log super-admin activity
    logSuperAdminActivity(phone, 'VIEW_ADMIN_LIST', { action: 'Retrieved admin list' });

    const admins = readAdmins();
    res.json({ admins });
});

// GET /api/admin/super-admins - Get list of super admins
router.get('/api/admin/super-admins', (req, res) => {
    const superAdmins = readSuperAdmins();
    res.json({ superAdmins });
});

// GET /api/admin/activity-logs - Get super-admin activity logs (Super-Admin only)
router.get('/admin/activity-logs', (req, res) => {
    const { phone } = req.query;
    const superAdmins = readSuperAdmins();
    if (!superAdmins.includes(phone)) return res.status(403).json({ error: "Forbidden" });

    // Log this access as well
    logSuperAdminActivity(phone, 'VIEW_ACTIVITY_LOGS', { action: 'Retrieved activity logs' });

    const logs = readSuperAdminLogs();
    res.json({ logs });
});

// POST /api/admin/add - Add a new admin (Super-Admin only)
router.post('/admin/add', (req, res) => {
    const { superPhone, newAdminPhone } = req.body;
    const superAdmins = readSuperAdmins();
    if (!superAdmins.includes(superPhone)) return res.status(403).json({ error: "Forbidden" });

    const admins = readAdmins();
    const wasAdded = !admins.includes(newAdminPhone);
    if (wasAdded) {
        admins.push(newAdminPhone);
        writeAdmins(admins);
    }

    // Log super-admin activity
    logSuperAdminActivity(superPhone, 'ADD_ADMIN', {
        newAdminPhone,
        wasAdded,
        totalAdmins: admins.length
    });

    res.json({ success: true, admins });
});

// POST /admin/reset - Master Reset (Super-Admin only)
router.post('/admin/reset', (req, res) => {
    const { phone } = req.body;
    const superAdmins = readSuperAdmins();
    if (!superAdmins.includes(phone)) return res.status(403).json({ error: "Forbidden" });

    const data = readData();
    const totalMatchesReset = data.matches.length;

    // Only reset match results, keep everything else
    data.matches = data.matches.map(match => ({
        ...match,
        score: { p1: 0, p2: 0 },
        status: "SCHEDULED",
        winner: null
    }));

    // Log super-admin activity
    logSuperAdminActivity(phone, 'MASTER_RESET', {
        totalMatchesReset,
        action: 'Reset all match results to scheduled state'
    });

    writeData(data);
    req.io.emit('DATA_REFRESH', data);
    res.json({ success: true, message: "All match results have been reset to scheduled state." });
});

// POST /api/matches/update - Update Score/Status (Committee Only)
router.post('/matches/update', (req, res) => {
    const { matchId, score, status, winner, player1, player2 } = req.body;
    // In a real app, verify token/session here. 
    // For this simple app, we blindly trust requests for now (or could pass phone again)

    const data = readData();
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

    writeData(data); // Save everything

    // Emit Socket Event
    req.io.emit('MATCH_UPDATE', data.matches[matchIndex]);

    if (advanced) {
        req.io.emit('DATA_REFRESH', data); // Refresh everyone if future matches changed
    }

    res.json({ success: true, match: data.matches[matchIndex] });
});

// POST /api/players/update - Update Player Name (Committee Only)
router.post('/players/update', (req, res) => {
    const { playerId, name } = req.body;
    const data = readData();
    const player = data.players.find(p => p.id === playerId);
    if (!player) return res.status(404).json({ error: "Player not found" });

    player.name = name;
    writeData(data);
    req.io.emit('DATA_REFRESH', data); // Full refresh maybe easier for players list changes
    res.json({ success: true });
});

module.exports = router;

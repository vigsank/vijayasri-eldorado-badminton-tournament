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

// GET /api/matches/:matchId/advancement-info - Get advancement information for a match
router.get('/matches/:matchId/advancement-info', async (req, res) => {
    const { matchId } = req.params;
    const data = await readData();
    const match = data.matches.find(m => m.id === matchId);
    
    if (!match) {
        return res.status(404).json({ error: "Match not found" });
    }

    // Only provide advancement info for Semi-Finals and Finals
    const isSemiFinal = match.stage && (match.stage.toLowerCase().includes('semi') || match.stage.toLowerCase().includes('sf'));
    const isFinal = match.stage && match.stage.toLowerCase().includes('final') && !isSemiFinal;
    
    if (!isSemiFinal && !isFinal) {
        return res.json({ hasAdvancement: false });
    }

    const { calculateStandings } = require('./standings');
    const { standings, headToHead } = calculateStandings(data.matches);

    const advancementInfo = {
        hasAdvancement: true,
        matchStage: match.stage,
        category: match.category,
        player1: {
            name: match.player1,
            advancementDetails: null
        },
        player2: {
            name: match.player2,
            advancementDetails: null
        }
    };

    // Helper to get advancement explanation
    const getAdvancementExplanation = (playerName, category, matchStage) => {
        // Check if it's a placeholder pattern
        const winGrpMatch = playerName.match(/Winner\s+(?:Group|Grp|Gr)\s+([A-Z0-9]+)/i);
        const runGrpMatch = playerName.match(/Runner\s+(?:Group|Grp|Gr)\s+([A-Z0-9]+)/i);
        const rankGrpMatch = playerName.match(/Rank\s+(\d+)\s+(?:Group|Grp|Gr)\s+([A-Z0-9]+)/i);
        const rankTeamMatch = playerName.match(/Rank\s+(\d+)\s+Team/i);
        const topTeamMatch = playerName.match(/Top\s+Team\s+(\d+)/i);
        const winSFMatch = playerName.match(/Winner\s+SF\s+(\d+)/i);

        let explanation = {
            type: 'unknown',
            details: null
        };

        // If it's a real player name (not a placeholder), reverse-engineer their advancement
        const isPlaceholder = winGrpMatch || runGrpMatch || rankGrpMatch || rankTeamMatch || topTeamMatch || winSFMatch;
        
        if (!isPlaceholder) {
            // For Finals, check if they won a semi-final
            if (isFinal) {
                const sfMatches = data.matches.filter(m => 
                    m.category === category && 
                    (m.stage.toLowerCase().includes('semi') || m.stage.toLowerCase().includes('sf'))
                );
                
                for (let i = 0; i < sfMatches.length; i++) {
                    const sfMatch = sfMatches[i];
                    if (sfMatch.winner === playerName && sfMatch.status === 'COMPLETED') {
                        const sfNum = sfMatch.stage.match(/\d+/)?.[0] || (i + 1);
                        return {
                            type: 'semifinal-winner',
                            semifinalNumber: sfNum,
                            match: {
                                player1: sfMatch.player1,
                                player2: sfMatch.player2,
                                score: sfMatch.score,
                                winner: sfMatch.winner
                            },
                            description: `Winner of Semi-Final ${sfNum}: ${sfMatch.winner} defeated ${sfMatch.winner === sfMatch.player1 ? sfMatch.player2 : sfMatch.player1} (${sfMatch.score?.p1 || 0} - ${sfMatch.score?.p2 || 0})`
                        };
                    }
                }
            }
            
            // For Semi-Finals or when semi-final check didn't find anything, check group standings
            if (standings[category]) {
                // First, try to find the player in group standings
                for (const [groupName, groupStandings] of Object.entries(standings[category])) {
                    const playerIndex = groupStandings.findIndex(p => p.name === playerName);
                    
                    if (playerIndex !== -1) {
                        const position = playerIndex + 1;
                        const standingsToShow = groupStandings.slice(0, Math.min(5, groupStandings.length)).map(p => ({
                            name: p.name,
                            won: p.won,
                            lost: p.lost,
                            pointsFor: p.pointsFor,
                            pointsAgainst: p.pointsAgainst,
                            pointDiff: p.pointDiff
                        }));
                        
                        if (position === 1) {
                            return {
                                type: 'group-winner',
                                group: groupName,
                                position: 1,
                                standings: standingsToShow,
                                description: `Winner of Group ${groupName} (Rank 1 based on matches won, then point difference, then total points scored)`
                            };
                        } else if (position === 2) {
                            return {
                                type: 'group-runner',
                                group: groupName,
                                position: 2,
                                standings: standingsToShow,
                                description: `Runner-up of Group ${groupName} (Rank 2 based on matches won, then point difference, then total points scored)`
                            };
                        } else {
                            return {
                                type: 'group-rank',
                                group: groupName,
                                position: position,
                                standings: standingsToShow,
                                description: `Rank ${position} of Group ${groupName} (based on matches won, then point difference, then total points scored)`
                            };
                        }
                    }
                }
                
                // If not found in individual groups, check overall standings (for Pool-based or cross-group advancement)
                let allPlayersInCat = [];
                Object.values(standings[category]).forEach(grpList => {
                    allPlayersInCat = [...allPlayersInCat, ...grpList];
                });
                
                const { sortPlayers } = require('./standings');
                sortPlayers(allPlayersInCat, category, "Pool", headToHead);
                
                const overallIndex = allPlayersInCat.findIndex(p => p.name === playerName);
                if (overallIndex !== -1) {
                    const position = overallIndex + 1;
                    return {
                        type: 'overall-rank',
                        position: position,
                        standings: allPlayersInCat.slice(0, Math.min(5, allPlayersInCat.length)).map(p => ({
                            name: p.name,
                            won: p.won,
                            lost: p.lost,
                            pointsFor: p.pointsFor,
                            pointsAgainst: p.pointsAgainst,
                            pointDiff: p.pointDiff
                        })),
                        description: `Overall Rank ${position} across all groups/pools (based on matches won, then head-to-head if applicable, then point difference, then total points scored)`
                    };
                }
            }
            
            // If still not found, return unknown
            return {
                type: 'unknown',
                details: null
            };
        }

        // Handle placeholder patterns (original logic)
        if (winGrpMatch) {
            const grp = winGrpMatch[1];
            const groupStandings = standings[category]?.[grp];
            if (groupStandings && groupStandings.length > 0) {
                explanation = {
                    type: 'group-winner',
                    group: grp,
                    position: 1,
                    standings: groupStandings.slice(0, 3).map(p => ({
                        name: p.name,
                        won: p.won,
                        lost: p.lost,
                        pointsFor: p.pointsFor,
                        pointsAgainst: p.pointsAgainst,
                        pointDiff: p.pointDiff
                    })),
                    description: `Winner of Group ${grp} (Rank 1 based on matches won, then point difference, then total points scored)`
                };
            }
        } else if (runGrpMatch) {
            const grp = runGrpMatch[1];
            const groupStandings = standings[category]?.[grp];
            if (groupStandings && groupStandings.length > 1) {
                explanation = {
                    type: 'group-runner',
                    group: grp,
                    position: 2,
                    standings: groupStandings.slice(0, 3).map(p => ({
                        name: p.name,
                        won: p.won,
                        lost: p.lost,
                        pointsFor: p.pointsFor,
                        pointsAgainst: p.pointsAgainst,
                        pointDiff: p.pointDiff
                    })),
                    description: `Runner-up of Group ${grp} (Rank 2 based on matches won, then point difference, then total points scored)`
                };
            }
        } else if (rankGrpMatch) {
            const rank = parseInt(rankGrpMatch[1]);
            const grp = rankGrpMatch[2];
            const groupStandings = standings[category]?.[grp];
            if (groupStandings && groupStandings.length >= rank) {
                explanation = {
                    type: 'group-rank',
                    group: grp,
                    position: rank,
                    standings: groupStandings.slice(0, Math.min(3, groupStandings.length)).map(p => ({
                        name: p.name,
                        won: p.won,
                        lost: p.lost,
                        pointsFor: p.pointsFor,
                        pointsAgainst: p.pointsAgainst,
                        pointDiff: p.pointDiff
                    })),
                    description: `Rank ${rank} of Group ${grp} (based on matches won, then point difference, then total points scored)`
                };
            }
        } else if (rankTeamMatch || topTeamMatch) {
            const rank = parseInt(rankTeamMatch ? rankTeamMatch[1] : topTeamMatch[1]);
            // Get aggregated standings across all groups/pools
            let allPlayersInCat = [];
            if (standings[category]) {
                Object.values(standings[category]).forEach(grpList => {
                    allPlayersInCat = [...allPlayersInCat, ...grpList];
                });
            }
            // Sort globally
            const { sortPlayers } = require('./standings');
            sortPlayers(allPlayersInCat, category, "Pool", headToHead);
            
            if (allPlayersInCat.length >= rank) {
                explanation = {
                    type: 'overall-rank',
                    position: rank,
                    standings: allPlayersInCat.slice(0, Math.min(5, allPlayersInCat.length)).map(p => ({
                        name: p.name,
                        won: p.won,
                        lost: p.lost,
                        pointsFor: p.pointsFor,
                        pointsAgainst: p.pointsAgainst,
                        pointDiff: p.pointDiff
                    })),
                    description: `Overall Rank ${rank} across all ${Object.keys(standings[category]).length > 1 ? 'groups' : 'pool matches'} (based on matches won, then head-to-head if applicable, then point difference, then total points scored)`
                };
            }
        } else if (winSFMatch) {
            const sfNum = winSFMatch[1];
            const sfMatch = data.matches.find(m =>
                m.category === category &&
                (m.stage.includes(`Semi ${sfNum}`) || m.stage.includes(`SF ${sfNum}`) || m.stage === `Semi ${sfNum}`)
            );
            if (sfMatch && sfMatch.status === 'COMPLETED' && sfMatch.winner) {
                explanation = {
                    type: 'semifinal-winner',
                    semifinalNumber: sfNum,
                    match: {
                        player1: sfMatch.player1,
                        player2: sfMatch.player2,
                        score: sfMatch.score,
                        winner: sfMatch.winner
                    },
                    description: `Winner of Semi-Final ${sfNum}: ${sfMatch.winner} defeated ${sfMatch.winner === sfMatch.player1 ? sfMatch.player2 : sfMatch.player1} (${sfMatch.score?.p1 || 0} - ${sfMatch.score?.p2 || 0})`
                };
            }
        }

        return explanation;
    };

    // Get advancement details for both players
    advancementInfo.player1.advancementDetails = getAdvancementExplanation(match.player1, match.category, match.stage);
    advancementInfo.player2.advancementDetails = getAdvancementExplanation(match.player2, match.category, match.stage);

    res.json(advancementInfo);
});

module.exports = router;

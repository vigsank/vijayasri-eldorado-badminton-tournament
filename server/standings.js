const sortPlayers = (players, category, group, headToHead) => {
    return players.sort((a, b) => {
        // Primary: Match Wins
        if (b.won !== a.won) return b.won - a.won;

        // Level 1: Head-to-Head (only applies if 2 players are tied)
        // Note: For multi-way ties, official rules usually fallback to point diff,
        // but simple H2H logic often exists for 2-way ties.
        const sortedNames = [a.name, b.name].sort();
        const h2hKey = `${category}|${group}|${sortedNames[0]}|${sortedNames[1]}`;
        const h2hWinner = headToHead[h2hKey];
        if (h2hWinner) {
            if (h2hWinner === a.name) return -1; // a wins, a comes first
            if (h2hWinner === b.name) return 1;  // b wins, b comes first
        }

        // Level 2: Net Point Difference
        if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff;

        // Level 3: Total Points Scored
        return b.pointsFor - a.pointsFor;
    });
};

/**
 * Calculates standings for all categories and groups based on match results.
 * Implements the official 3-Level Tie-Breaker Rule:
 *   - Level 1: Head-to-Head result.
 *   - Level 2: Net Point Difference (Points Won - Points Lost).
 *   - Level 3: Total Points Scored.
 */
const calculateStandings = (matches) => {
    const standings = {};
    const headToHead = {}; // Stores head-to-head results: { "Cat|Grp|P1|P2": "P1" or "P2" }

    matches.forEach(match => {
        if (!match.score || match.status !== 'COMPLETED') return;

        const { category, score, player1, player2, winner, stage } = match;

        let group = "General";
        // Match patterns like "Gr A", "Grp A", "Group A" with optional match numbers like "(1-2)"
        const groupMatch = stage?.match(/(?:Gr|Grp|Group)\s*([A-Z0-9]+)/i);
        if (groupMatch) {
            group = groupMatch[1];
        } else if (stage?.toLowerCase().includes("pool")) {
            // Pool stages - all pool matches belong to a single "Pool" group
            // Pattern: "Pool (1-2)", "Pool (3-4)", etc.
            group = "Pool";
        } else {
            // Elimination matches (Semi-Final, Final) don't contribute to league standings
            return;
        }

        if (!standings[category]) standings[category] = {};
        if (!standings[category][group]) standings[category][group] = {};

        const initStats = () => ({
            played: 0, won: 0, lost: 0,
            pointsFor: 0, pointsAgainst: 0,
            pointDiff: 0
        });

        if (!standings[category][group][player1]) standings[category][group][player1] = initStats();
        if (!standings[category][group][player2]) standings[category][group][player2] = initStats();

        const p1Stats = standings[category][group][player1];
        const p2Stats = standings[category][group][player2];

        p1Stats.played++;
        p2Stats.played++;

        const s1 = parseInt(score.p1 || 0);
        const s2 = parseInt(score.p2 || 0);

        p1Stats.pointsFor += s1;
        p1Stats.pointsAgainst += s2;
        p2Stats.pointsFor += s2;
        p2Stats.pointsAgainst += s1;

        p1Stats.pointDiff = p1Stats.pointsFor - p1Stats.pointsAgainst;
        p2Stats.pointDiff = p2Stats.pointsFor - p2Stats.pointsAgainst;

        if (winner === player1) {
            p1Stats.won++;
            p2Stats.lost++;
        } else if (winner === player2) {
            p2Stats.won++;
            p1Stats.lost++;
        }

        // Store Head-to-Head result
        // Use a consistent key by sorting player names
        const sortedPlayers = [player1, player2].sort();
        const h2hKey = `${category}|${group}|${sortedPlayers[0]}|${sortedPlayers[1]}`;
        headToHead[h2hKey] = winner;
    });

    // Convert to Array and Sort with 3-Level Tie-Breaker
    const sortedStandings = {};
    Object.keys(standings).forEach(cat => {
        sortedStandings[cat] = {};
        Object.keys(standings[cat]).forEach(grp => {
            const players = Object.keys(standings[cat][grp]).map(p => ({
                name: p,
                ...standings[cat][grp][p]
            }));

            // Sort Logic: Won > Head-to-Head > PointDiff > PointsFor
            sortPlayers(players, cat, grp, headToHead);

            sortedStandings[cat][grp] = players;
        });
    });

    return { standings: sortedStandings, headToHead };
};

module.exports = { calculateStandings, sortPlayers };
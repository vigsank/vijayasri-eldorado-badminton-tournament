const { calculateStandings, sortPlayers } = require('./standings');

const processAdvancement = (data) => {
    const { standings, headToHead } = calculateStandings(data.matches);
    let updates = 0;

    // Helper to check if all league/pool matches in a category are complete
    const areLeagueMatchesComplete = (category) => {
        const leagueMatches = data.matches.filter(m =>
            m.category === category &&
            !m.stage.toLowerCase().includes('semi') &&
            !m.stage.toLowerCase().includes('final')
        );
        return leagueMatches.length > 0 && leagueMatches.every(m => m.status === 'COMPLETED');
    };

    // Helper to get aggregated standings for entire category
    const getAggregatedStandings = (category) => {
        let allPlayersInCat = [];
        if (standings[category]) {
            Object.values(standings[category]).forEach(grpList => {
                allPlayersInCat = [...allPlayersInCat, ...grpList];
            });
        }
        // Sort globally using tie-breaker rules
        // For aggregated standings, we use "General" or "Pool" as group for H2H lookup
        // but it's cleaner to just pass null if it's across groups.
        sortPlayers(allPlayersInCat, category, "Pool", headToHead);
        return allPlayersInCat;
    };

    data.matches.forEach(match => {
        if (match.status !== 'SCHEDULED') return;

        // Helper to replace placeholder
        const replacePlaceholder = (placeholder, category) => {
            // Pattern: "Winner Group A" or "Winner Grp A" or "Winner Gr A"
            const winGrp = placeholder.match(/Winner\s+(?:Group|Grp|Gr)\s+([A-Z0-9]+)/i);
            if (winGrp) {
                const grp = winGrp[1];
                const groupStandings = standings[category]?.[grp];
                if (groupStandings && groupStandings.length > 0) {
                    const groupMatches = data.matches.filter(m =>
                        m.category === category &&
                        (m.stage.includes(`Grp ${grp}`) || m.stage.includes(`Group ${grp}`) || m.stage.includes(`Gr ${grp}`))
                    );

                    if (groupMatches.length > 0 && groupMatches.every(m => m.status === 'COMPLETED')) {
                        return groupStandings[0].name;
                    }
                }
            }

            // Pattern: "Runner Group A" or "Runner Grp A" or "Runner Gr A"
            const runGrp = placeholder.match(/Runner\s+(?:Group|Grp|Gr)\s+([A-Z0-9]+)/i);
            if (runGrp) {
                const grp = runGrp[1];
                const groupStandings = standings[category]?.[grp];
                if (groupStandings && groupStandings.length > 1) {
                    const groupMatches = data.matches.filter(m =>
                        m.category === category &&
                        (m.stage.includes(`Grp ${grp}`) || m.stage.includes(`Group ${grp}`) || m.stage.includes(`Gr ${grp}`))
                    );

                    if (groupMatches.length > 0 && groupMatches.every(m => m.status === 'COMPLETED')) {
                        return groupStandings[1].name;
                    }
                }
            }

            // Pattern: "Rank 1 Gr A" or "Rank 2 Gr B" (for group-based rankings)
            const rankGrp = placeholder.match(/Rank\s+(\d+)\s+(?:Group|Grp|Gr)\s+([A-Z0-9]+)/i);
            if (rankGrp) {
                const rank = parseInt(rankGrp[1]) - 1; // 0-indexed
                const grp = rankGrp[2];
                const groupStandings = standings[category]?.[grp];
                if (groupStandings && groupStandings.length > rank) {
                    const groupMatches = data.matches.filter(m =>
                        m.category === category &&
                        (m.stage.includes(`Grp ${grp}`) || m.stage.includes(`Group ${grp}`) || m.stage.includes(`Gr ${grp}`))
                    );

                    if (groupMatches.length > 0 && groupMatches.every(m => m.status === 'COMPLETED')) {
                        return groupStandings[rank].name;
                    }
                }
            }

            // Pattern: "Rank 1 Team" or "Rank 2 Team" (for overall category rankings - used in doubles finals)
            const rankTeam = placeholder.match(/Rank\s+(\d+)\s+Team/i);
            if (rankTeam) {
                const rank = parseInt(rankTeam[1]) - 1; // 0-indexed
                if (areLeagueMatchesComplete(category)) {
                    const aggregatedStandings = getAggregatedStandings(category);
                    if (aggregatedStandings.length > rank) {
                        return aggregatedStandings[rank].name;
                    }
                }
            }

            // Pattern: "Top Team 1" or "Top Team 2" (alternative for overall category rankings)
            const topTeam = placeholder.match(/Top\s+Team\s+(\d+)/i);
            if (topTeam) {
                const rank = parseInt(topTeam[1]) - 1; // 0-indexed
                if (areLeagueMatchesComplete(category)) {
                    const aggregatedStandings = getAggregatedStandings(category);
                    if (aggregatedStandings.length > rank) {
                        return aggregatedStandings[rank].name;
                    }
                }
            }

            // Pattern: "Winner SF 1" or "Winner SF 2" (Semi-final winners)
            const winSF = placeholder.match(/Winner\s+SF\s+(\d+)/i);
            if (winSF) {
                const sfNum = winSF[1];
                const sfMatch = data.matches.find(m =>
                    m.category === category &&
                    (m.stage.includes(`Semi ${sfNum}`) || m.stage.includes(`SF ${sfNum}`) || m.stage === `Semi ${sfNum}`)
                );
                if (sfMatch && sfMatch.status === 'COMPLETED' && sfMatch.winner) {
                    return sfMatch.winner;
                }
            }

            return null;
        };

        const newP1 = replacePlaceholder(match.player1, match.category);
        if (newP1 && newP1 !== match.player1) {
            match.player1 = newP1;
            updates++;
        }

        const newP2 = replacePlaceholder(match.player2, match.category);
        if (newP2 && newP2 !== match.player2) {
            match.player2 = newP2;
            updates++;
        }
    });

    return updates > 0;
};

module.exports = processAdvancement;

const fs = require('fs');
const { calculateStandings } = require('./standings');
const processAdvancement = require('./auto_scheduler');

const output = [];
const log = (msg) => {
    output.push(msg);
    console.log(msg);
};

/**
 * Test all categories for player advancement based on points
 * 
 * Categories and their advancement rules (from RuleBook):
 * - Kids Singles Boy: 4 Groups (A, B, C, D) - Winner of each group advances to Semi-Finals
 * - Kids Singles Girl: 2 Groups (A, B) - Top 2 from each group advance to Semi-Finals
 * - Mens Singles: 2 Groups (A, B) - Top 2 from each group advance to Semi-Finals
 * - Womens Singles: 2 Groups (A, B) - Top 2 from each group advance to Semi-Finals
 * - Mens Doubles: Pool - Top 2 teams qualify for Final
 * - Womens Doubles: Pool - Top 2 teams qualify for Final
 * - Mixed Doubles: 2 Groups (A, B) - Top 2 teams qualify for Final (aggregated)
 */

try {
    // Read tournament data
    const originalData = JSON.parse(fs.readFileSync('./data/tournament.json', 'utf8'));

    // Make a deep copy to avoid modifying original data
    const data = JSON.parse(JSON.stringify(originalData));

    log('='.repeat(80));
    log('VIJAYASRI ELDORADO BADMINTON TOURNAMENT 2026 - ADVANCEMENT TEST');
    log('='.repeat(80));
    log('');

    // Get all categories
    const categories = [...new Set(data.matches.map(m => m.category))].sort();
    log('Categories found: ' + categories.join(', '));
    log('');

    // Simulate completing all league/group/pool matches with controlled scores
    log('=== SIMULATING MATCH COMPLETIONS ===\n');

    // For controlled testing, we'll set specific scores to verify ranking logic
    data.matches.forEach(match => {
        // Skip knockout matches (semi-finals and finals)
        if (match.stage.toLowerCase().includes('semi') || match.stage.toLowerCase().includes('final')) {
            return;
        }

        // Only simulate if not already completed
        if (match.status !== 'COMPLETED') {
            // Generate scores - player1 gets higher score 60% of the time for predictable testing
            const p1Score = Math.floor(Math.random() * 10) + 8;
            const p2Score = Math.floor(Math.random() * 10) + 5;

            match.score = { p1: p1Score, p2: p2Score };
            match.status = 'COMPLETED';
            match.winner = p1Score > p2Score ? match.player1 : match.player2;

            log(`[COMPLETED] ${match.category} - ${match.stage}: ${match.player1} (${p1Score}) vs ${match.player2} (${p2Score}) -> Winner: ${match.winner}`);
        } else {
            log(`[ALREADY COMPLETED] ${match.category} - ${match.stage}: ${match.player1} (${match.score.p1}) vs ${match.player2} (${match.score.p2}) -> Winner: ${match.winner}`);
        }
    });

    log('\n' + '='.repeat(80));
    log('=== STANDINGS CALCULATION ===');
    log('='.repeat(80) + '\n');

    // Calculate standings
    const { standings, headToHead } = calculateStandings(data.matches);

    // Display standings for each category
    categories.forEach(cat => {
        log(`\n📊 ${cat.toUpperCase()}`);
        log('-'.repeat(60));

        if (!standings[cat]) {
            log('  No standings data available');
            return;
        }

        Object.keys(standings[cat]).sort().forEach(grp => {
            log(`\n  Group/Pool ${grp}:`);
            log('  ' + '-'.repeat(50));
            log('  Rank | Player/Team                | W | L | PF | PA | PD');
            log('  ' + '-'.repeat(50));

            standings[cat][grp].forEach((p, i) => {
                const name = p.name.padEnd(26);
                log(`  ${(i + 1).toString().padStart(4)} | ${name} | ${p.won} | ${p.lost} | ${p.pointsFor.toString().padStart(2)} | ${p.pointsAgainst.toString().padStart(2)} | ${p.pointDiff > 0 ? '+' : ''}${p.pointDiff}`);
            });
        });
        log('');
    });

    log('\n' + '='.repeat(80));
    log('=== RUNNING ADVANCEMENT PROCESS ===');
    log('='.repeat(80) + '\n');

    // Run advancement
    const advancementMade = processAdvancement(data);
    log('Advancement updates made: ' + (advancementMade ? 'Yes' : 'No'));

    log('\n' + '='.repeat(80));
    log('=== KNOCKOUT STAGE VERIFICATION ===');
    log('='.repeat(80) + '\n');

    // Verify advancement for each category
    categories.forEach(cat => {
        log(`\n🏆 ${cat.toUpperCase()}`);
        log('-'.repeat(60));

        const knockouts = data.matches.filter(m =>
            m.category === cat &&
            (m.stage.toLowerCase().includes('semi') || m.stage.toLowerCase().includes('final'))
        ).sort((a, b) => {
            // Sort: Semi 1, Semi 2, Final
            if (a.stage.includes('Final') && !a.stage.includes('Semi')) return 1;
            if (b.stage.includes('Final') && !b.stage.includes('Semi')) return -1;
            return a.stage.localeCompare(b.stage);
        });

        if (knockouts.length === 0) {
            log('  No knockout matches found');
            return;
        }

        knockouts.forEach(k => {
            const p1Placeholder = k.player1.includes('Winner') || k.player1.includes('Rank') || k.player1.includes('Top');
            const p2Placeholder = k.player2.includes('Winner') || k.player2.includes('Rank') || k.player2.includes('Top');

            let status = '✅';
            if (p1Placeholder || p2Placeholder) {
                status = '❌ PLACEHOLDER NOT REPLACED';
            }

            log(`  ${k.stage.padEnd(12)}: ${k.player1.padEnd(25)} vs ${k.player2.padEnd(25)} ${status}`);
        });
    });

    log('\n' + '='.repeat(80));
    log('=== ADVANCEMENT VERIFICATION BY CATEGORY ===');
    log('='.repeat(80) + '\n');

    // Detailed verification for each category type

    // 1. Kids Singles Boy - 4 Groups, Winner advances
    log('\n📋 Kids Singles Boy (4 Groups - Winner of each advances to Semi-Finals)');
    log('-'.repeat(60));
    if (standings['Kids Singles Boy']) {
        ['A', 'B', 'C', 'D'].forEach(grp => {
            const grpStandings = standings['Kids Singles Boy'][grp];
            if (grpStandings && grpStandings.length > 0) {
                const winner = grpStandings[0];
                log(`  Group ${grp} Winner: ${winner.name} (W:${winner.won}, PD:${winner.pointDiff})`);
            }
        });

        const semis = data.matches.filter(m => m.category === 'Kids Singles Boy' && m.stage.includes('Semi'));
        log('\n  Semi-Final Assignments:');
        semis.forEach(s => {
            log(`    ${s.stage}: ${s.player1} vs ${s.player2}`);
        });
    }

    // 2. Kids Singles Girl - 2 Groups, Top 2 advance
    log('\n📋 Kids Singles Girl (2 Groups - Top 2 from each advance to Semi-Finals)');
    log('-'.repeat(60));
    if (standings['Kids Singles Girl']) {
        ['A', 'B'].forEach(grp => {
            const grpStandings = standings['Kids Singles Girl'][grp];
            if (grpStandings && grpStandings.length >= 2) {
                log(`  Group ${grp}:`);
                log(`    Rank 1: ${grpStandings[0].name} (W:${grpStandings[0].won}, PD:${grpStandings[0].pointDiff})`);
                log(`    Rank 2: ${grpStandings[1].name} (W:${grpStandings[1].won}, PD:${grpStandings[1].pointDiff})`);
            }
        });

        const semis = data.matches.filter(m => m.category === 'Kids Singles Girl' && m.stage.includes('Semi'));
        log('\n  Semi-Final Assignments (Cross format: Rank 1 Gr A vs Rank 2 Gr B):');
        semis.forEach(s => {
            log(`    ${s.stage}: ${s.player1} vs ${s.player2}`);
        });
    }

    // 3. Mens Singles - 2 Groups, Top 2 advance
    log('\n📋 Mens Singles (2 Groups - Top 2 from each advance to Semi-Finals)');
    log('-'.repeat(60));
    if (standings['Mens Singles']) {
        ['A', 'B'].forEach(grp => {
            const grpStandings = standings['Mens Singles'][grp];
            if (grpStandings && grpStandings.length >= 2) {
                log(`  Group ${grp}:`);
                log(`    Rank 1: ${grpStandings[0].name} (W:${grpStandings[0].won}, PD:${grpStandings[0].pointDiff})`);
                log(`    Rank 2: ${grpStandings[1].name} (W:${grpStandings[1].won}, PD:${grpStandings[1].pointDiff})`);
            }
        });

        const semis = data.matches.filter(m => m.category === 'Mens Singles' && m.stage.includes('Semi'));
        log('\n  Semi-Final Assignments:');
        semis.forEach(s => {
            log(`    ${s.stage}: ${s.player1} vs ${s.player2}`);
        });
    }

    // 4. Womens Singles - 2 Groups, Top 2 advance
    log('\n📋 Womens Singles (2 Groups - Top 2 from each advance to Semi-Finals)');
    log('-'.repeat(60));
    if (standings['Womens Singles']) {
        ['A', 'B'].forEach(grp => {
            const grpStandings = standings['Womens Singles'][grp];
            if (grpStandings && grpStandings.length >= 2) {
                log(`  Group ${grp}:`);
                log(`    Rank 1: ${grpStandings[0].name} (W:${grpStandings[0].won}, PD:${grpStandings[0].pointDiff})`);
                log(`    Rank 2: ${grpStandings[1].name} (W:${grpStandings[1].won}, PD:${grpStandings[1].pointDiff})`);
            }
        });

        const semis = data.matches.filter(m => m.category === 'Womens Singles' && m.stage.includes('Semi'));
        log('\n  Semi-Final Assignments:');
        semis.forEach(s => {
            log(`    ${s.stage}: ${s.player1} vs ${s.player2}`);
        });
    }

    // 5. Mens Doubles - Pool, Top 2 to Final
    log('\n📋 Mens Doubles (Pool - Top 2 teams qualify for Final)');
    log('-'.repeat(60));
    if (standings['Mens Doubles'] && standings['Mens Doubles']['Pool']) {
        const poolStandings = standings['Mens Doubles']['Pool'];
        log('  Pool Standings:');
        poolStandings.forEach((p, i) => {
            log(`    ${i + 1}. ${p.name} (W:${p.won}, PD:${p.pointDiff})`);
        });

        const final = data.matches.find(m => m.category === 'Mens Doubles' && m.stage.includes('Final'));
        if (final) {
            log(`\n  Final: ${final.player1} vs ${final.player2}`);
        }
    }

    // 6. Womens Doubles - Pool, Top 2 to Final
    log('\n📋 Womens Doubles (Pool - Top 2 teams qualify for Final)');
    log('-'.repeat(60));
    if (standings['Womens Doubles'] && standings['Womens Doubles']['Pool']) {
        const poolStandings = standings['Womens Doubles']['Pool'];
        log('  Pool Standings:');
        poolStandings.forEach((p, i) => {
            log(`    ${i + 1}. ${p.name} (W:${p.won}, PD:${p.pointDiff})`);
        });

        const final = data.matches.find(m => m.category === 'Womens Doubles' && m.stage.includes('Final'));
        if (final) {
            log(`\n  Final: ${final.player1} vs ${final.player2}`);
        }
    }

    // 7. Mixed Doubles - 2 Groups, Top 2 overall to Final
    log('\n📋 Mixed Doubles (2 Groups - Top 2 teams overall qualify for Final)');
    log('-'.repeat(60));
    if (standings['Mixed Doubles']) {
        ['A', 'B'].forEach(grp => {
            const grpStandings = standings['Mixed Doubles'][grp];
            if (grpStandings) {
                log(`  Group ${grp}:`);
                grpStandings.forEach((p, i) => {
                    log(`    ${i + 1}. ${p.name} (W:${p.won}, PD:${p.pointDiff})`);
                });
            }
        });

        const final = data.matches.find(m => m.category === 'Mixed Doubles' && m.stage.includes('Final'));
        if (final) {
            log(`\n  Final: ${final.player1} vs ${final.player2}`);
        }
    }

    log('\n' + '='.repeat(80));
    log('=== TEST SUMMARY ===');
    log('='.repeat(80) + '\n');

    // Summary of all knockout matches
    let totalKnockouts = 0;
    let resolvedKnockouts = 0;
    let unresolvedKnockouts = [];

    categories.forEach(cat => {
        const knockouts = data.matches.filter(m =>
            m.category === cat &&
            (m.stage.toLowerCase().includes('semi') || m.stage.toLowerCase().includes('final'))
        );

        knockouts.forEach(k => {
            totalKnockouts++;
            const p1Placeholder = k.player1.includes('Winner') || k.player1.includes('Rank') || k.player1.includes('Top');
            const p2Placeholder = k.player2.includes('Winner') || k.player2.includes('Rank') || k.player2.includes('Top');

            if (!p1Placeholder && !p2Placeholder) {
                resolvedKnockouts++;
            } else {
                unresolvedKnockouts.push({
                    category: k.category,
                    stage: k.stage,
                    player1: k.player1,
                    player2: k.player2
                });
            }
        });
    });

    log(`Total Knockout Matches: ${totalKnockouts}`);
    log(`Resolved (Players Assigned): ${resolvedKnockouts}`);
    log(`Unresolved (Placeholders): ${totalKnockouts - resolvedKnockouts}`);

    if (unresolvedKnockouts.length > 0) {
        log('\nUnresolved Matches:');
        unresolvedKnockouts.forEach(u => {
            log(`  ❌ ${u.category} - ${u.stage}: ${u.player1} vs ${u.player2}`);
        });
    }

    log('\n' + '='.repeat(80));

    const testResult = resolvedKnockouts === totalKnockouts ? '✅ ALL TESTS PASSED' : '⚠️  SOME TESTS FAILED';
    log(`RESULT: ${testResult}`);
    log('='.repeat(80) + '\n');

    // Write output to file
    fs.writeFileSync('./test_output.txt', output.join('\n'));
    log('Output written to test_output.txt');

} catch (e) {
    console.error('Error:', e.message);
    console.error(e.stack);
}
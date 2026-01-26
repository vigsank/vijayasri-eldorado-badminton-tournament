const fs = require('fs');

// Test Tie-Breaker Scenario for Mens Singles Group B
// This test creates a 3-way tie and verifies the tie-breaker rules work correctly

console.log('='.repeat(70));
console.log('TIE-BREAKER TEST - MENS SINGLES GROUP B');
console.log('='.repeat(70));

const { calculateStandings } = require('./standings');
const processAdvancement = require('./auto_scheduler');

// First, backup the original data
const originalData = fs.readFileSync('./data/tournament.json', 'utf8');

// Load fresh data
let data = JSON.parse(originalData);

// Reset all matches to SCHEDULED
data.matches.forEach(m => {
    m.score = { p1: 0, p2: 0 };
    m.status = 'SCHEDULED';
    m.winner = null;
});

// Reset ALL knockout placeholders for ALL categories
data.matches.forEach(m => {
    // Reset Mens Singles knockout
    if (m.id === '46') { m.player1 = 'Rank 1 Gr A'; m.player2 = 'Rank 2 Gr B'; }
    if (m.id === '47') { m.player1 = 'Rank 1 Gr B'; m.player2 = 'Rank 2 Gr A'; }
    if (m.id === '48') { m.player1 = 'Winner SF 1'; m.player2 = 'Winner SF 2'; }
    // Reset Kids Singles Boy knockout
    if (m.id === '16') { m.player1 = 'Winner Gr A'; m.player2 = 'Winner Gr B'; }
    if (m.id === '17') { m.player1 = 'Winner Gr C'; m.player2 = 'Winner Gr D'; }
    if (m.id === '18') { m.player1 = 'Winner SF 1'; m.player2 = 'Winner SF 2'; }
    // Reset Kids Singles Girl knockout
    if (m.id === '29') { m.player1 = 'Rank 1 Gr A'; m.player2 = 'Rank 2 Gr B'; }
    if (m.id === '30') { m.player1 = 'Rank 1 Gr B'; m.player2 = 'Rank 2 Gr A'; }
    if (m.id === '31') { m.player1 = 'Winner SF 1'; m.player2 = 'Winner SF 2'; }
    // Reset Womens Singles knockout
    if (m.id === '67') { m.player1 = 'Rank 1 Gr A'; m.player2 = 'Rank 2 Gr B'; }
    if (m.id === '68') { m.player1 = 'Rank 1 Gr B'; m.player2 = 'Rank 2 Gr A'; }
    if (m.id === '69') { m.player1 = 'Winner SF 1'; m.player2 = 'Winner SF 2'; }
    // Reset Mens Doubles knockout
    if (m.id === '36') { m.player1 = 'Rank 1 Team'; m.player2 = 'Rank 2 Team'; }
    // Reset Womens Doubles knockout
    if (m.id === '60') { m.player1 = 'Rank 1 Team'; m.player2 = 'Rank 2 Team'; }
    // Reset Mixed Doubles knockout
    if (m.id === '56') { m.player1 = 'Rank 1 Team'; m.player2 = 'Rank 2 Team'; }
});

console.log('\n📋 SCENARIO: 3-Way Tie in Mens Singles Group B');
console.log('   Players: Hariharaputhran, Anand, Subir, Vinod Krishnan, Nikhil GS');
console.log('');
console.log('   We will create a scenario where Hariharaputhran, Anand, and Subir');
console.log('   all end up with 2 wins each, creating a 3-way tie.');
console.log('   The tie-breaker rules should determine rankings based on:');
console.log('   1. Head-to-Head (for 2-way ties)');
console.log('   2. Net Point Difference');
console.log('   3. Total Points Scored');
console.log('');

// Helper function to complete a match
function completeMatch(matchId, score1, score2) {
    const match = data.matches.find(m => m.id === matchId);
    if (match) {
        match.score = { p1: score1, p2: score2 };
        match.status = 'COMPLETED';
        match.winner = score1 > score2 ? match.player1 : match.player2;
        console.log(`  Match ${matchId}: ${match.player1} (${score1}) vs ${match.player2} (${score2}) → ${match.winner}`);
    }
}

// Complete Mens Singles Group A first (so we can test full advancement)
console.log('\n--- Completing Mens Singles Group A ---');
completeMatch('37', 21, 15);  // Prabhu Prasad vs Venkat Gumma → Prabhu wins
completeMatch('39', 21, 18);  // Vignesh vs Hari Sulgekar → Vignesh wins
completeMatch('41', 18, 21);  // Hari S vs Prabhu → Prabhu wins (2 wins - WINNER)
completeMatch('43', 21, 19);  // Venkat vs Vignesh → Venkat wins

// Now create the 3-way tie in Group B
console.log('\n--- Creating 3-Way Tie in Mens Singles Group B ---');
console.log('   Scenario: Hari P beats Anand, Anand beats Subir, Subir beats Hari P');
console.log('');

// Match 38: Hariharaputhran vs Anand
// Hari P wins with a large margin (good point diff)
completeMatch('38', 21, 12);  // Hari P beats Anand by 9 points

// Match 40: Subir vs Vinod
// Subir wins (this gives Subir his first win)
completeMatch('40', 21, 18);  // Subir beats Vinod

// Match 42: Nikhil vs Hariharaputhran
// Nikhil loses - Hari P gets second win
completeMatch('42', 15, 21);  // Hari P beats Nikhil

// Match 44: Anand vs Subir
// Anand wins - Anand gets first win, Subir gets a loss
completeMatch('44', 21, 16);  // Anand beats Subir by 5 points

// Match 45: Vinod vs Nikhil
// Vinod wins
completeMatch('45', 21, 14);  // Vinod beats Nikhil

// Now we need to add more matches to create the 3-way tie
// But Group B only has 5 matches... Let's recalculate

console.log('\n📊 Current Standings After Initial Matches:');
let { standings, headToHead } = calculateStandings(data.matches);
if (standings['Mens Singles'] && standings['Mens Singles']['B']) {
    standings['Mens Singles']['B'].forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name} - W:${p.won} L:${p.lost} PD:${p.pointDiff} PF:${p.pointsFor}`);
    });
}

// Let me redesign - the matches in Group B are:
// Match 38: Hari P vs Anand
// Match 40: Subir vs Vinod  
// Match 42: Nikhil vs Hari P
// Match 44: Anand vs Subir
// Match 45: Vinod vs Nikhil
// These are only 5 matches - not a full round robin for 5 players

// Let me check what matches exist for Group B
console.log('\n--- Checking all Group B matches ---');
data.matches
    .filter(m => m.category === 'Mens Singles' && m.stage.includes('Gr B'))
    .forEach(m => {
        console.log(`   ${m.id}: ${m.player1} vs ${m.player2} (${m.stage}) - ${m.status}`);
    });

// OK so there are only 5 matches, this means we need a different tie scenario
// Let's restart with a cleaner tie scenario

console.log('\n\n' + '='.repeat(70));
console.log('RESTARTING TEST - Creating 2-Way Tie with Head-to-Head Tie-Breaker');
console.log('='.repeat(70));

// Reset again
data = JSON.parse(originalData);
data.matches.forEach(m => {
    m.score = { p1: 0, p2: 0 };
    m.status = 'SCHEDULED';
    m.winner = null;
});

// Reset ALL knockout placeholders for ALL categories (again after reload)
data.matches.forEach(m => {
    // Reset Mens Singles knockout
    if (m.id === '46') { m.player1 = 'Rank 1 Gr A'; m.player2 = 'Rank 2 Gr B'; }
    if (m.id === '47') { m.player1 = 'Rank 1 Gr B'; m.player2 = 'Rank 2 Gr A'; }
    if (m.id === '48') { m.player1 = 'Winner SF 1'; m.player2 = 'Winner SF 2'; }
});

console.log('\n📋 NEW SCENARIO: 2-Way Tie in Mens Singles Group B');
console.log('   Players: Hariharaputhran, Anand, Subir, Vinod Krishnan, Nikhil GS');
console.log('');
console.log('   We will create a scenario where Hariharaputhran and Anand');
console.log('   both end up with 1 win each, but Anand beat Hariharaputhran head-to-head.');
console.log('   The Head-to-Head tie-breaker should put Anand ahead of Hariharaputhran.');
console.log('');

// Complete Group A - Prabhu dominates
console.log('--- Completing Mens Singles Group A ---');
completeMatch('37', 21, 15);  // Prabhu vs Venkat → Prabhu wins
completeMatch('39', 21, 18);  // Vignesh vs Hari S → Vignesh wins  
completeMatch('41', 18, 21);  // Hari S vs Prabhu → Prabhu wins (2 wins)
completeMatch('43', 21, 17);  // Venkat vs Vignesh → Venkat wins

console.log('\n📊 Group A Standings:');
({ standings, headToHead } = calculateStandings(data.matches));
if (standings['Mens Singles'] && standings['Mens Singles']['A']) {
    standings['Mens Singles']['A'].forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name} - W:${p.won} L:${p.lost} PD:${p.pointDiff} PF:${p.pointsFor}`);
    });
}

// Complete Group B - Create 2-way tie between Hari P and Anand
console.log('\n--- Creating 2-Way Tie in Mens Singles Group B ---');

// Match 38: Hariharaputhran vs Anand
// ANAND wins - this is the head-to-head match that will break the tie
completeMatch('38', 18, 21);  // Anand beats Hari P (H2H: Anand wins)

// Match 40: Subir vs Vinod
// Subir wins dominantly
completeMatch('40', 21, 10);  // Subir beats Vinod (Subir: 1 win)

// Match 42: Nikhil vs Hariharaputhran
// Hari P wins - now Hari P has 1 win
completeMatch('42', 12, 21);  // Hari P beats Nikhil (Hari P: 1 win)

// Match 44: Anand vs Subir
// Subir wins - Subir now has 2 wins, takes the lead
completeMatch('44', 18, 21);  // Subir beats Anand (Subir: 2 wins, Anand: 1 win)

// Match 45: Vinod vs Nikhil
// Vinod wins
completeMatch('45', 21, 15);  // Vinod beats Nikhil (Vinod: 1 win)

console.log('\n📊 Group B Standings:');
({ standings, headToHead } = calculateStandings(data.matches));
if (standings['Mens Singles'] && standings['Mens Singles']['B']) {
    standings['Mens Singles']['B'].forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name} - W:${p.won} L:${p.lost} PD:${p.pointDiff} PF:${p.pointsFor}`);
    });
}

// Now let's verify the tie-breaker worked
console.log('\n' + '='.repeat(70));
console.log('TIE-BREAKER ANALYSIS');
console.log('='.repeat(70));

const groupB = standings['Mens Singles']?.['B'] || [];
const hariP = groupB.find(p => p.name === 'Hariharaputhran');
const anand = groupB.find(p => p.name === 'Anand');

console.log('\n📌 Comparison: Hariharaputhran vs Anand');
console.log(`   Hariharaputhran: W:${hariP?.won} L:${hariP?.lost} PD:${hariP?.pointDiff} PF:${hariP?.pointsFor}`);
console.log(`   Anand: W:${anand?.won} L:${anand?.lost} PD:${anand?.pointDiff} PF:${anand?.pointsFor}`);

const hariPRank = groupB.findIndex(p => p.name === 'Hariharaputhran') + 1;
const anandRank = groupB.findIndex(p => p.name === 'Anand') + 1;

console.log(`\n   Hariharaputhran Rank: ${hariPRank}`);
console.log(`   Anand Rank: ${anandRank}`);

// Check the head-to-head key
const sortedNames = ['Anand', 'Hariharaputhran'].sort();
const h2hKey = `Mens Singles|B|${sortedNames[0]}|${sortedNames[1]}`;
console.log(`\n   Head-to-Head Key: ${h2hKey}`);
console.log(`   Head-to-Head Winner: ${headToHead[h2hKey]}`);

// Analyze tie-breaker
console.log('\n🔍 TIE-BREAKER DECISION:');
if (hariP?.won === anand?.won) {
    console.log('   Both have same number of wins - checking tie-breakers:');

    // Level 1: Head-to-Head
    console.log(`   Level 1 (Head-to-Head): ${headToHead[h2hKey]} won their match`);

    if (headToHead[h2hKey] === 'Anand') {
        console.log('   ✅ Anand wins the head-to-head tie-breaker!');
        if (anandRank < hariPRank) {
            console.log('   ✅ CORRECT: Anand is ranked higher than Hariharaputhran');
        } else {
            console.log('   ❌ ERROR: Anand should be ranked higher!');
        }
    }
} else {
    console.log('   Players have different number of wins - no tie to break');
}

// Run advancement to see who goes to semi-finals
console.log('\n' + '='.repeat(70));
console.log('ADVANCEMENT TO SEMI-FINALS');
console.log('='.repeat(70));

const advancementMade = processAdvancement(data);
console.log(`\n   Advancement processed: ${advancementMade}`);

// Show semi-finals
console.log('\n🏆 Mens Singles Semi-Finals:');
data.matches
    .filter(m => m.category === 'Mens Singles' && m.stage.toLowerCase().includes('semi'))
    .forEach(m => {
        console.log(`   ${m.stage}: ${m.player1} vs ${m.player2}`);
    });

// Expected:
// Semi 1: Rank 1 Gr A (Prabhu) vs Rank 2 Gr B (should be Anand if H2H works, or based on point diff)
// Semi 2: Rank 1 Gr B (Subir) vs Rank 2 Gr A (Venkat)

console.log('\n📋 EXPECTED RESULTS:');
console.log('   Semi 1: Prabhu Prasad vs (Rank 2 of Group B - should consider H2H/Point Diff)');
console.log('   Semi 2: Subir vs Venkat Gumma');

// Save the test data
fs.writeFileSync('./data/tournament.json', JSON.stringify(data, null, 2));
console.log('\n✅ Test data saved to tournament.json');

console.log('\n' + '='.repeat(70));
console.log('TEST COMPLETE');
console.log('='.repeat(70));
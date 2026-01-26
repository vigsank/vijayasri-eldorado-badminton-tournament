const fs = require('fs');

// Test all categories - complete matches and verify advancement
console.log('='.repeat(60));
console.log('TOURNAMENT ADVANCEMENT TEST - ALL CATEGORIES');
console.log('='.repeat(60));

const { calculateStandings } = require('./standings');
const processAdvancement = require('./auto_scheduler');

// Load fresh tournament data
let data = JSON.parse(fs.readFileSync('./data/tournament.json', 'utf8'));

// Helper function to complete a match with specific scores
function completeMatch(matchId, score1, score2) {
    const match = data.matches.find(m => m.id === matchId);
    if (match && match.status === 'SCHEDULED') {
        match.score = { p1: score1, p2: score2 };
        match.status = 'COMPLETED';
        match.winner = score1 > score2 ? match.player1 : match.player2;
        console.log(`  ✓ ${match.category} - ${match.stage}: ${match.player1} (${score1}) vs ${match.player2} (${score2}) → Winner: ${match.winner}`);
    }
}

// Helper function to show standings for a category
function showStandings(category) {
    const { standings } = calculateStandings(data.matches);
    console.log(`\n  📊 ${category} Standings:`);
    if (standings[category]) {
        Object.entries(standings[category]).forEach(([group, players]) => {
            console.log(`     Group ${group}:`);
            players.forEach((p, i) => {
                console.log(`       ${i + 1}. ${p.name} - W:${p.won} L:${p.lost} PD:${p.pointDiff} PF:${p.pointsFor}`);
            });
        });
    }
}

// Helper function to show knockout matches for a category
function showKnockoutMatches(category) {
    console.log(`\n  🏆 ${category} Knockout Matches:`);
    data.matches
        .filter(m => m.category === category && (m.stage.toLowerCase().includes('semi') || m.stage.toLowerCase().includes('final')))
        .forEach(m => {
            const status = m.status === 'COMPLETED' ? `✓ Winner: ${m.winner}` : '(Scheduled)';
            console.log(`     ${m.stage}: ${m.player1} vs ${m.player2} ${status}`);
        });
}

// =============================================================================
// KIDS SINGLES BOY - 4 Groups (A, B, C, D), 4 players each
// =============================================================================
console.log('\n' + '='.repeat(60));
console.log('1. KIDS SINGLES BOY');
console.log('='.repeat(60));

// Group A: Bhaivab, K Anish, Vedansh, Swayam
// Create scenario where K Anish dominates
completeMatch('1', 8, 11);   // Bhaivab vs K Anish → K Anish wins
completeMatch('5', 11, 7);   // Vedansh vs Swayam → Vedansh wins
completeMatch('9', 11, 9);   // K Anish vs Vedansh → K Anish wins
completeMatch('13', 11, 6);  // Swayam vs Bhaivab → Swayam wins (Bhaivab 0 wins)

// Group B: Trijal, Rana, Roel, Neerav
completeMatch('2', 11, 8);   // Trijal vs Rana → Trijal wins
completeMatch('6', 11, 7);   // Roel vs Neerav → Roel wins
completeMatch('10', 11, 9);  // Rana vs Roel → Rana wins
completeMatch('14', 6, 11);  // Neerav vs Trijal → Trijal wins (2 wins)

// Group C: Dakshith, Parth, Shaurya, Shreyansh
completeMatch('3', 11, 5);   // Dakshith vs Parth → Dakshith wins
completeMatch('7', 11, 8);   // Shaurya vs Shreyansh → Shaurya wins
completeMatch('11', 9, 11);  // Parth vs Shaurya → Shaurya wins
completeMatch('15', 7, 11);  // Shreyansh vs Dakshith → Dakshith wins (2 wins)

// Group D: Harshith, Mudit, Naksh
completeMatch('4', 11, 9);   // Harshith vs Mudit → Harshith wins
completeMatch('8', 11, 8);   // Mudit vs Naksh → Mudit wins
completeMatch('12', 11, 7);  // Naksh vs Harshith → Naksh wins (creates 3-way tie!)

showStandings('Kids Singles Boy');

// Run advancement
console.log('\n  ⏩ Running advancement...');
let advanced = processAdvancement(data);
console.log(`  Advancement made: ${advanced}`);

showKnockoutMatches('Kids Singles Boy');

// =============================================================================
// KIDS SINGLES GIRL - 2 Groups (A, B), 5 players each
// =============================================================================
console.log('\n' + '='.repeat(60));
console.log('2. KIDS SINGLES GIRL');
console.log('='.repeat(60));

// Group A: Ananya, Aadhya S, Harsha, K Aadhya, Tanusha
completeMatch('19', 11, 8);  // Ananya vs Aadhya S → Ananya wins
completeMatch('21', 11, 6);  // Harsha vs K Aadhya → Harsha wins
completeMatch('23', 9, 11);  // Tanusha vs Ananya → Ananya wins (2 wins)
completeMatch('25', 11, 7);  // Aadhya S vs Harsha → Aadhya S wins
completeMatch('27', 11, 8);  // K Aadhya vs Tanusha → K Aadhya wins

// Group B: Divyanshi, Aashi, Shanvi, Khushi, Aradhya
completeMatch('20', 11, 9);  // Divyanshi vs Aashi → Divyanshi wins
completeMatch('22', 11, 7);  // Shanvi vs Khushi → Shanvi wins
completeMatch('24', 8, 11);  // Aradhya vs Divyanshi → Divyanshi wins (2 wins)
completeMatch('26', 11, 8);  // Aashi vs Shanvi → Aashi wins
completeMatch('28', 6, 11);  // Khushi vs Aradhya → Aradhya wins

showStandings('Kids Singles Girl');

// Run advancement
console.log('\n  ⏩ Running advancement...');
advanced = processAdvancement(data);
console.log(`  Advancement made: ${advanced}`);

showKnockoutMatches('Kids Singles Girl');

// =============================================================================
// MENS SINGLES - 2 Groups (A with 4, B with 5 players)
// =============================================================================
console.log('\n' + '='.repeat(60));
console.log('3. MENS SINGLES');
console.log('='.repeat(60));

// Group A: Prabhu, Venkat, Vignesh, Hari S
completeMatch('37', 11, 8);  // Prabhu vs Venkat → Prabhu wins
completeMatch('39', 11, 9);  // Vignesh vs Hari S → Vignesh wins
completeMatch('41', 8, 11);  // Hari S vs Prabhu → Prabhu wins (2 wins)
completeMatch('43', 11, 7);  // Venkat vs Vignesh → Venkat wins

// Group B: Hari P, Anand, Subir, Vinod, Nikhil
completeMatch('38', 11, 8);  // Hari P vs Anand → Hari P wins
completeMatch('40', 11, 7);  // Subir vs Vinod → Subir wins
completeMatch('42', 9, 11);  // Nikhil vs Hari P → Hari P wins (2 wins)
completeMatch('44', 11, 8);  // Anand vs Subir → Anand wins
completeMatch('45', 11, 6);  // Vinod vs Nikhil → Vinod wins

showStandings('Mens Singles');

// Run advancement
console.log('\n  ⏩ Running advancement...');
advanced = processAdvancement(data);
console.log(`  Advancement made: ${advanced}`);

showKnockoutMatches('Mens Singles');

// =============================================================================
// WOMENS SINGLES - 2 Groups (A, B), 3 players each
// =============================================================================
console.log('\n' + '='.repeat(60));
console.log('4. WOMENS SINGLES');
console.log('='.repeat(60));

// Group A: Divya Singh, Ramya, Sinooba
completeMatch('61', 11, 8);  // Divya vs Ramya → Divya wins
completeMatch('63', 11, 7);  // Ramya vs Sinooba → Ramya wins
completeMatch('65', 9, 11);  // Sinooba vs Divya → Divya wins (2 wins)

// Group B: Nandita, Sonali, Cini
completeMatch('62', 11, 6);  // Nandita vs Sonali → Nandita wins
completeMatch('64', 11, 8);  // Sonali vs Cini → Sonali wins
completeMatch('66', 7, 11);  // Cini vs Nandita → Nandita wins (2 wins)

showStandings('Womens Singles');

// Run advancement
console.log('\n  ⏩ Running advancement...');
advanced = processAdvancement(data);
console.log(`  Advancement made: ${advanced}`);

showKnockoutMatches('Womens Singles');

// =============================================================================
// MENS DOUBLES - Pool (4 teams)
// =============================================================================
console.log('\n' + '='.repeat(60));
console.log('5. MENS DOUBLES');
console.log('='.repeat(60));

// Pool: Hari/Vinod, Subir/Nikhil, Vignesh/Hari S, Prabhu/Anand
completeMatch('32', 21, 18);  // Hari/Vinod vs Subir/Nikhil → Hari/Vinod wins
completeMatch('33', 21, 19);  // Vignesh/Hari S vs Prabhu/Anand → Vignesh/Hari S wins
completeMatch('34', 18, 21);  // Prabhu/Anand vs Hari/Vinod → Hari/Vinod wins (2 wins)
completeMatch('35', 21, 16);  // Subir/Nikhil vs Vignesh/Hari S → Subir/Nikhil wins

showStandings('Mens Doubles');

// Run advancement
console.log('\n  ⏩ Running advancement...');
advanced = processAdvancement(data);
console.log(`  Advancement made: ${advanced}`);

showKnockoutMatches('Mens Doubles');

// =============================================================================
// WOMENS DOUBLES - Already completed pool matches (from original data)
// =============================================================================
console.log('\n' + '='.repeat(60));
console.log('6. WOMENS DOUBLES');
console.log('='.repeat(60));

showStandings('Womens Doubles');

// Run advancement
console.log('\n  ⏩ Running advancement...');
advanced = processAdvancement(data);
console.log(`  Advancement made: ${advanced}`);

showKnockoutMatches('Womens Doubles');

// =============================================================================
// MIXED DOUBLES - 2 Groups (A with 4, B with 3 teams)
// =============================================================================
console.log('\n' + '='.repeat(60));
console.log('7. MIXED DOUBLES');
console.log('='.repeat(60));

// Group A: Hari/Ramya, Divya/Vignesh, Vinod/Cini, Prabhu/Sonali
completeMatch('49', 21, 17);  // Hari/Ramya vs Divya/Vignesh → Hari/Ramya wins
completeMatch('51', 21, 18);  // Divya/Vignesh vs Vinod/Cini → Divya/Vignesh wins
completeMatch('53', 21, 15);  // Vinod/Cini vs Prabhu/Sonali → Vinod/Cini wins
completeMatch('55', 18, 21);  // Prabhu/Sonali vs Hari/Ramya → Hari/Ramya wins (2 wins)

// Group B: Nikhil/Sinooba, Subir/Divya R, Nandita/Anand
completeMatch('50', 21, 19);  // Nikhil/Sinooba vs Subir/Divya R → Nikhil/Sinooba wins
completeMatch('52', 21, 17);  // Subir/Divya R vs Nandita/Anand → Subir/Divya R wins
completeMatch('54', 21, 16);  // Nandita/Anand vs Nikhil/Sinooba → Nandita/Anand wins (tie!)

showStandings('Mixed Doubles');

// Run advancement
console.log('\n  ⏩ Running advancement...');
advanced = processAdvancement(data);
console.log(`  Advancement made: ${advanced}`);

showKnockoutMatches('Mixed Doubles');

// =============================================================================
// COMPLETE SEMI-FINALS
// =============================================================================
console.log('\n' + '='.repeat(60));
console.log('COMPLETING SEMI-FINALS');
console.log('='.repeat(60));

// Kids Singles Boy - Semi 1 & 2
const ksbSemi1 = data.matches.find(m => m.id === '16');
const ksbSemi2 = data.matches.find(m => m.id === '17');
if (ksbSemi1 && ksbSemi1.player1 !== 'Winner Gr A' && ksbSemi1.player2 !== 'Winner Gr B') {
    ksbSemi1.score = { p1: 11, p2: 8 };
    ksbSemi1.status = 'COMPLETED';
    ksbSemi1.winner = ksbSemi1.player1;
    console.log(`  ✓ Kids Singles Boy Semi 1: ${ksbSemi1.player1} beats ${ksbSemi1.player2}`);
}
if (ksbSemi2 && ksbSemi2.player1 !== 'Winner Gr C' && ksbSemi2.player2 !== 'Winner Gr D') {
    ksbSemi2.score = { p1: 9, p2: 11 };
    ksbSemi2.status = 'COMPLETED';
    ksbSemi2.winner = ksbSemi2.player2;
    console.log(`  ✓ Kids Singles Boy Semi 2: ${ksbSemi2.player2} beats ${ksbSemi2.player1}`);
}

// Kids Singles Girl - Semi 1 & 2
const ksgSemi1 = data.matches.find(m => m.id === '29');
const ksgSemi2 = data.matches.find(m => m.id === '30');
if (ksgSemi1 && !ksgSemi1.player1.includes('Rank')) {
    ksgSemi1.score = { p1: 11, p2: 7 };
    ksgSemi1.status = 'COMPLETED';
    ksgSemi1.winner = ksgSemi1.player1;
    console.log(`  ✓ Kids Singles Girl Semi 1: ${ksgSemi1.player1} beats ${ksgSemi1.player2}`);
}
if (ksgSemi2 && !ksgSemi2.player1.includes('Rank')) {
    ksgSemi2.score = { p1: 8, p2: 11 };
    ksgSemi2.status = 'COMPLETED';
    ksgSemi2.winner = ksgSemi2.player2;
    console.log(`  ✓ Kids Singles Girl Semi 2: ${ksgSemi2.player2} beats ${ksgSemi2.player1}`);
}

// Mens Singles - Semi 1 & 2
const msSemi1 = data.matches.find(m => m.id === '46');
const msSemi2 = data.matches.find(m => m.id === '47');
if (msSemi1 && !msSemi1.player1.includes('Rank')) {
    msSemi1.score = { p1: 21, p2: 18 };
    msSemi1.status = 'COMPLETED';
    msSemi1.winner = msSemi1.player1;
    console.log(`  ✓ Mens Singles Semi 1: ${msSemi1.player1} beats ${msSemi1.player2}`);
}
if (msSemi2 && !msSemi2.player1.includes('Rank')) {
    msSemi2.score = { p1: 19, p2: 21 };
    msSemi2.status = 'COMPLETED';
    msSemi2.winner = msSemi2.player2;
    console.log(`  ✓ Mens Singles Semi 2: ${msSemi2.player2} beats ${msSemi2.player1}`);
}

// Womens Singles - Semi 1 & 2
const wsSemi1 = data.matches.find(m => m.id === '67');
const wsSemi2 = data.matches.find(m => m.id === '68');
if (wsSemi1 && !wsSemi1.player1.includes('Rank')) {
    wsSemi1.score = { p1: 11, p2: 9 };
    wsSemi1.status = 'COMPLETED';
    wsSemi1.winner = wsSemi1.player1;
    console.log(`  ✓ Womens Singles Semi 1: ${wsSemi1.player1} beats ${wsSemi1.player2}`);
}
if (wsSemi2 && !wsSemi2.player1.includes('Rank')) {
    wsSemi2.score = { p1: 11, p2: 8 };
    wsSemi2.status = 'COMPLETED';
    wsSemi2.winner = wsSemi2.player1;
    console.log(`  ✓ Womens Singles Semi 2: ${wsSemi2.player1} beats ${wsSemi2.player2}`);
}

// Run advancement for finals
console.log('\n  ⏩ Running advancement for finals...');
advanced = processAdvancement(data);
console.log(`  Advancement made: ${advanced}`);

// =============================================================================
// COMPLETE ALL FINALS
// =============================================================================
console.log('\n' + '='.repeat(60));
console.log('COMPLETING FINALS');
console.log('='.repeat(60));

// Complete all final matches
const finals = data.matches.filter(m => m.stage === 'Final');
finals.forEach(final => {
    if (final.status !== 'COMPLETED' && !final.player1.includes('Winner') && !final.player1.includes('Rank')) {
        final.score = { p1: 21, p2: 18 };
        final.status = 'COMPLETED';
        final.winner = final.player1;
        console.log(`  🏆 ${final.category} Final: ${final.player1} WINS vs ${final.player2}`);
    }
});

// =============================================================================
// SAVE DATA
// =============================================================================
console.log('\n' + '='.repeat(60));
console.log('SAVING TOURNAMENT DATA');
console.log('='.repeat(60));

fs.writeFileSync('./data/tournament.json', JSON.stringify(data, null, 2));
console.log('✅ Tournament data saved to ./data/tournament.json');

// =============================================================================
// FINAL SUMMARY
// =============================================================================
console.log('\n' + '='.repeat(60));
console.log('FINAL SUMMARY');
console.log('='.repeat(60));

const completedMatches = data.matches.filter(m => m.status === 'COMPLETED').length;
const totalMatches = data.matches.length;
console.log(`\n📊 Match Statistics:`);
console.log(`   Total Matches: ${totalMatches}`);
console.log(`   Completed: ${completedMatches}`);
console.log(`   Remaining: ${totalMatches - completedMatches}`);

console.log(`\n🏆 Category Champions:`);
data.categories.forEach(cat => {
    const final = data.matches.find(m => m.category === cat && m.stage === 'Final');
    if (final && final.status === 'COMPLETED') {
        console.log(`   ${cat}: ${final.winner}`);
    } else if (final) {
        console.log(`   ${cat}: ${final.player1} vs ${final.player2} (pending)`);
    }
});

console.log('\n' + '='.repeat(60));
console.log('TEST COMPLETE - UI should now show all data');
console.log('='.repeat(60));
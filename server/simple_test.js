const fs = require('fs');

// Simple test to verify advancement logic
const output = [];

try {
    output.push('Starting test...');

    const { calculateStandings } = require('./standings');
    output.push('Loaded standings module');

    const processAdvancement = require('./auto_scheduler');
    output.push('Loaded auto_scheduler module');

    const data = JSON.parse(fs.readFileSync('./data/tournament.json', 'utf8'));
    output.push('Loaded tournament data: ' + data.matches.length + ' matches');

    // Complete all non-knockout matches with player1 always winning
    let completedCount = 0;
    data.matches.forEach(match => {
        if (match.stage.toLowerCase().includes('semi') || match.stage.toLowerCase().includes('final')) {
            return;
        }
        if (match.status !== 'COMPLETED') {
            match.score = { p1: 11, p2: 8 };
            match.status = 'COMPLETED';
            match.winner = match.player1;
            completedCount++;
        }
    });
    output.push('Completed ' + completedCount + ' matches');

    // Calculate standings
    const result = calculateStandings(data.matches);
    output.push('Calculated standings');
    output.push('Result keys: ' + Object.keys(result).join(', '));

    const { standings, headToHead } = result;
    output.push('Standings categories: ' + Object.keys(standings).join(', '));

    // Run advancement
    const advancementMade = processAdvancement(data);
    output.push('Advancement made: ' + advancementMade);

    // Check knockout matches
    output.push('\n=== KNOCKOUT MATCHES ===');
    data.matches.forEach(m => {
        if (m.stage.toLowerCase().includes('semi') || m.stage.toLowerCase().includes('final')) {
            output.push(m.category + ' - ' + m.stage + ': ' + m.player1 + ' vs ' + m.player2);
        }
    });

    output.push('\nTest completed successfully!');
} catch (e) {
    output.push('ERROR: ' + e.message);
    output.push(e.stack);
}

fs.writeFileSync('./simple_test_output.txt', output.join('\n'));
console.log(output.join('\n'));
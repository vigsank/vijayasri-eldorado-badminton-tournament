const xlsx = require('xlsx');
const path = require('path');
const { writeData } = require('./db');
const fs = require('fs');

const FILE_PATH = path.join(__dirname, 'assets', 'Vijayasri Eldorado Badminton Group and Schedule - 2025-26.xlsx');

function excelDateToJSDate(serial) {
    if (!serial) return null;
    // Excel date serial number (days since Dec 30, 1899)
    // JS uses ms since Jan 1, 1970
    // 25569 is the number of days between the two epochs
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return date_info.toISOString().split('T')[0];
}

function excelTimeToStr(serial) {
    if (!serial) return "";
    const totalSeconds = Math.floor(serial * 86400);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

const runImport = () => {
    if (!fs.existsSync(FILE_PATH)) {
        console.error("Excel file not found at:", FILE_PATH);
        return;
    }

    const workbook = xlsx.readFile(FILE_PATH);
    const tournamentData = {
        players: [],
        matches: [],
        categories: [],
        courts: [],
        groups: []
    };

    // 1. Parse Grouping Sheet
    const groupingSheet = workbook.Sheets['Grouping'];
    if (groupingSheet) {
        const groupingData = xlsx.utils.sheet_to_json(groupingSheet);
        groupingData.forEach(row => {
            const category = row['Category'];
            const group = row['Group'];
            const playerOrTeam = row['Player Name/Team'];

            if (!category || !playerOrTeam) return;

            // Add Category if new
            if (!tournamentData.categories.includes(category)) {
                tournamentData.categories.push(category);
            }

            // Add Group info
            let groupObj = tournamentData.groups.find(g => g.name === group && g.category === category);
            if (!groupObj) {
                groupObj = { id: `${category}-${group}`, name: group, category, players: [] };
                tournamentData.groups.push(groupObj);
            }
            groupObj.players.push(playerOrTeam);

            // Add Player (Dedup by name)
            if (!tournamentData.players.find(p => p.name === playerOrTeam)) {
                tournamentData.players.push({
                    id: String(tournamentData.players.length + 1),
                    name: playerOrTeam,
                    phone: null // Phone not in excel
                });
            }
        });
    }

    // 2. Parse Schedule Sheets
    const scheduleSheets = ['Kids Boys', 'Kids Girls', 'Mens Singles', 'Womens Singles', 'Mixed Doubles', 'Mens Doubles', 'Womens Doubles'];

    let matchIdDetails = 1;

    scheduleSheets.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) return;

        const scheduleData = xlsx.utils.sheet_to_json(sheet);
        scheduleData.forEach(row => {
            // 'Day', 'Date', 'Time', 'Court', 'Category', 'Stage', 'Match Details'
            const matchDetails = row['Match Details'];
            if (!matchDetails) return;

            const players = matchDetails.split(' vs ');
            const p1 = players[0] ? players[0].trim() : "TBD";
            const p2 = players[1] ? players[1].trim() : "TBD";

            const match = {
                id: String(matchIdDetails++),
                day: row['Day'],
                date: excelDateToJSDate(row['Date']), // Need conversion if Excel serial
                time: excelTimeToStr(row['Time']), // Need conversion
                court: row['Court'],
                category: row['Category'],
                stage: row['Stage'],
                player1: p1,
                player2: p2,
                score: null, // { p1: [0, 0], p2: [0, 0] }
                status: 'SCHEDULED', // SCHEDULED, PLAYING, COMPLETED
                winner: null
            };

            tournamentData.matches.push(match);

            // Collect unique courts
            if (row['Court'] && !tournamentData.courts.includes(row['Court'])) {
                tournamentData.courts.push(row['Court']);
            }
        });
    });

    console.log(`Imported ${tournamentData.players.length} players, ${tournamentData.matches.length} matches.`);
    writeData(tournamentData);
};

runImport();

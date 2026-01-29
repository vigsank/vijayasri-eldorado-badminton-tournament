const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const ASSETS_DIR = path.join(__dirname, 'assets');
const TOURNAMENT_FILE = path.join(DATA_DIR, 'tournament.json');
const TOURNAMENT_SEED_FILE = path.join(ASSETS_DIR, 'tournament.seed.json');
const ADMINS_FILE = path.join(DATA_DIR, 'admins.json');
const SUPER_ADMINS_FILE = path.join(DATA_DIR, 'super-admins.json');
const { COMMITTEE_PHONES } = require('./constants');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize tournament file from seed if not exists
if (!fs.existsSync(TOURNAMENT_FILE)) {
    console.log('Tournament data file not found. Initializing from seed...');
    if (fs.existsSync(TOURNAMENT_SEED_FILE)) {
        fs.copyFileSync(TOURNAMENT_SEED_FILE, TOURNAMENT_FILE);
        console.log('Tournament data initialized from seed file.');
    } else {
        console.log('Seed file not found. Creating empty tournament data.');
        fs.writeFileSync(TOURNAMENT_FILE, JSON.stringify({
            players: [],
            matches: [],
            categories: [],
            courts: []
        }, null, 2));
    }
}

// Initialize admins file if not exists
if (!fs.existsSync(ADMINS_FILE)) {
    fs.writeFileSync(ADMINS_FILE, JSON.stringify(COMMITTEE_PHONES, null, 2));
}

const readData = () => {
    try {
        const data = fs.readFileSync(TOURNAMENT_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading data:", err);
        return null;
    }
};

const writeData = (data) => {
    try {
        fs.writeFileSync(TOURNAMENT_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error("Error writing data:", err);
        return false;
    }
};

const readAdmins = () => {
    try {
        if (!fs.existsSync(ADMINS_FILE)) return COMMITTEE_PHONES;
        const data = fs.readFileSync(ADMINS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading admins:", err);
        return COMMITTEE_PHONES;
    }
};

const writeAdmins = (admins) => {
    try {
        fs.writeFileSync(ADMINS_FILE, JSON.stringify(admins, null, 2));
        return true;
    } catch (err) {
        console.error("Error writing admins:", err);
        return false;
    }
};

const readSuperAdmins = () => {
    try {
        if (!fs.existsSync(SUPER_ADMINS_FILE)) return [];
        const data = fs.readFileSync(SUPER_ADMINS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading super admins:", err);
        return [];
    }
};

module.exports = {
    readData,
    writeData,
    readAdmins,
    writeAdmins,
    readSuperAdmins
};

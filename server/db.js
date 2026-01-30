const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'badminton';
const TOURNAMENT_ID = process.env.TOURNAMENT_ID || 'default';
const LOCAL_TOURNAMENT_JSON = path.join(__dirname, 'data', 'tournament.json');
// Seed sources for admins and super-admins
const LOCAL_ADMINS_JSON = path.join(__dirname, 'data', 'admins.json');
const LOCAL_SUPER_ADMINS_JSON = path.join(__dirname, 'data', 'super-admins.json');

let client;
let db;

async function initDb() {
  if (!uri || typeof uri !== 'string' || !uri.startsWith('mongodb')) {
    throw new Error('MONGODB_URI is not set or invalid');
  }
  if (!client) {
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    db = client.db(dbName);
    // Optional ping to verify connectivity
    await db.command({ ping: 1 });
  }
  return db;
}

async function readData() {
  try {
    const d = await initDb();
    const doc = await d.collection('tournaments').findOne({ _id: TOURNAMENT_ID });
    if (!doc) {
      // Load from local JSON file as base data
      let seed;
      try {
        const raw = fs.readFileSync(LOCAL_TOURNAMENT_JSON, 'utf8');
        const parsed = JSON.parse(raw);
        seed = { _id: TOURNAMENT_ID, ...parsed, createdAt: new Date() };
        await d.collection('tournaments').insertOne(seed);
        return seed;
      } catch (fileErr) {
        console.error('Failed to read local tournament.json:', fileErr);
        throw new Error('Missing base data: server/data/tournament.json');
      }
    }
    return doc;
  } catch (err) {
    console.error('Error reading data:', err);
    return null;
  }
}

async function writeData(data) {
  try {
    const d = await initDb();
    await d.collection('tournaments').updateOne(
      { _id: TOURNAMENT_ID },
      { $set: { ...data, _id: TOURNAMENT_ID, updatedAt: new Date() } },
      { upsert: true }
    );
    return true;
  } catch (err) {
    console.error('Error writing data:', err);
    return false;
  }
}

async function readAdmins() {
  try {
    const d = await initDb();
    const doc = await d.collection('admins').findOne({ _id: 'admins' });
    if (doc?.list && Array.isArray(doc.list)) return doc.list;

    // Seed from local JSON if not present in DB
    try {
      const raw = fs.readFileSync(LOCAL_ADMINS_JSON, 'utf8');
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length) {
        await d.collection('admins').updateOne(
          { _id: 'admins' },
          { $set: { list, createdAt: new Date(), updatedAt: new Date() } },
          { upsert: true }
        );
        return list;
      }
    } catch (e) {
      // ignore file read errors; fall through to empty list
      console.warn('Admins not found in DB and failed to seed from local file:', e.message);
    }

    return [];
  } catch (err) {
    console.error('Error reading admins:', err);
    return [];
  }
}

async function writeAdmins(admins) {
  try {
    const d = await initDb();
    await d.collection('admins').updateOne(
      { _id: 'admins' },
      { $set: { list: admins, updatedAt: new Date() } },
      { upsert: true }
    );
    return true;
  } catch (err) {
    console.error('Error writing admins:', err);
    return false;
  }
}

async function readSuperAdmins() {
  try {
    const d = await initDb();
    const doc = await d.collection('super_admins').findOne({ _id: 'super_admins' });
    if (doc?.list && Array.isArray(doc.list)) return doc.list;

    // Seed from local JSON if not present in DB
    try {
      const raw = fs.readFileSync(LOCAL_SUPER_ADMINS_JSON, 'utf8');
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length) {
        await d.collection('super_admins').updateOne(
          { _id: 'super_admins' },
          { $set: { list, createdAt: new Date(), updatedAt: new Date() } },
          { upsert: true }
        );
        return list;
      }
    } catch (e) {
      // ignore file read errors; fall through to empty list
      console.warn('Super-admins not found in DB and failed to seed from local file:', e.message);
    }

    return [];
  } catch (err) {
    console.error('Error reading super admins:', err);
    return [];
  }
}

module.exports = {
  readData,
  writeData,
  readAdmins,
  writeAdmins,
  readSuperAdmins,
  initDb
};

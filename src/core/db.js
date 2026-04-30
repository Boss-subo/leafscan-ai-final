import Dexie from 'dexie';

export const db = new Dexie('LeafScanSovereignDB');

db.version(5).stores({
  users: '++id, username, password, email, farmName, avatar',
  credentials: '++id, userId, credentialId, publicKey',
  history: '++id, userId, diseaseName, timestamp',
  plots: '++id, userId, name, crop',
  inventory: '++id, userId, name, category',
  reminders: '++id, userId, task, date, status'
});

console.log("Sovereign Enterprise Database Sync Complete.");

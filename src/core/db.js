import Dexie from 'dexie';

export const db = new Dexie('LeafScanSovereignDB');

db.version(7).stores({
  users: '++id, username, password, email, farmName, avatar, firstName, lastName, dob, address, mobile, ipAddress, biometricEnabled',
  credentials: '++id, userId, credentialId, publicKey',
  history: '++id, userId, diseaseName, timestamp',
  plots: '++id, userId, name, crop',
  inventory: '++id, userId, name, category',
  reminders: '++id, userId, task, date, status',
  analytics: '++id, userId, date, risk, aqi',
  telemetry: '++id, userId, timestamp, data'
});

console.log("Sovereign Enterprise Database Sync Complete.");

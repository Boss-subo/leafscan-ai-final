import Dexie from 'dexie';
import { addDoc, collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db as firestoreDb } from '../services/firebase.js';
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

// ── HISTORY FUNCTIONS (No Firebase Storage) ───────────────────────

async function createThumbnail(base64Str) {
  if (!base64Str || !base64Str.startsWith('data:image')) return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      const size = Math.min(img.width, img.height);
      const x = (img.width - size) / 2;
      const y = (img.height - size) / 2;
      ctx.drawImage(img, x, y, size, size, 0, 0, 64, 64);
      resolve(canvas.toDataURL('image/jpeg', 0.6));
    };
    img.onerror = () => resolve(null);
    img.src = base64Str;
  });
}

export async function saveToHistory(record) {
  const uid = localStorage.getItem('leafscan_uid');
  if (!uid) return;

  const thumbnail = await createThumbnail(record.image);
  
  // Clean record - drop full image, keep metadata + thumbnail
  const { image, ...cleanRecord } = record;
  cleanRecord.thumbnail = thumbnail;
  cleanRecord.timestamp = Date.now();

  // Handle local save logic to Dexie as well to preserve existing dependencies
  try {
    await db.history.add({
      userId: uid,
      diseaseName: record.label || 'Unknown',
      timestamp: Date.now()
    });
  } catch (e) {}

  try {
    if (!navigator.onLine) throw new Error("Offline");
    await addDoc(collection(firestoreDb, 'users', uid, 'history'), cleanRecord);
  } catch (err) {
    console.warn("Cloud save failed, using local fallback");
    const local = JSON.parse(localStorage.getItem('history_fallback_' + uid) || '[]');
    cleanRecord.id = 'local_' + Date.now();
    local.push(cleanRecord);
    localStorage.setItem('history_fallback_' + uid, JSON.stringify(local));
  }
}

export async function loadHistory() {
  const uid = localStorage.getItem('leafscan_uid');
  if (!uid) return [];

  let cloudRecords = [];
  try {
    const q = query(collection(firestoreDb, 'users', uid, 'history'), orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    cloudRecords = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn("Could not load cloud history");
  }

  const localRecords = JSON.parse(localStorage.getItem('history_fallback_' + uid) || '[]');
  const combined = [...cloudRecords, ...localRecords].sort((a,b) => b.timestamp - a.timestamp);
  return combined;
}

export async function clearHistory() {
  const uid = localStorage.getItem('leafscan_uid');
  if (!uid) return;

  try {
    const q = query(collection(firestoreDb, 'users', uid, 'history'));
    const snap = await getDocs(q);
    const promises = snap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(promises);
  } catch (e) {
    console.warn("Cloud clear failed");
  }
  localStorage.removeItem('history_fallback_' + uid);
  try {
    await db.history.where('userId').equals(uid).delete();
  } catch(e) {}
}

export async function deleteScan(id) {
  const uid = localStorage.getItem('leafscan_uid');
  if (!uid || !id) return;

  if (id.startsWith('local_')) {
    let local = JSON.parse(localStorage.getItem('history_fallback_' + uid) || '[]');
    local = local.filter(r => r.id !== id);
    localStorage.setItem('history_fallback_' + uid, JSON.stringify(local));
    return;
  }

  try {
    await deleteDoc(doc(firestoreDb, 'users', uid, 'history', id));
  } catch (e) {
    console.warn("Delete failed", e);
  }
}

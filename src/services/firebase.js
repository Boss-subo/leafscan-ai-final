/**
 * LeafScan AI - Firebase Cloud Backend
 * Provides real-time cross-device sync for all user data.
 */
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL
} from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAYb35NKb2bR7QmEMQtPAhdesx_aKzzX-w",
  authDomain: "leaf-scan-ai.firebaseapp.com",
  projectId: "leaf-scan-ai",
  storageBucket: "leaf-scan-ai.firebasestorage.app",
  messagingSenderId: "567612377357",
  appId: "1:567612377357:web:efbc10f911296d9dbc4844",
  measurementId: "G-N3VX29XCK0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ─── AUTH ────────────────────────────────────────────────────────────────────

export async function cloudRegister(email, password, username, farmName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: username });

  // Create user profile doc in Firestore
  await setDoc(doc(db, 'users', cred.user.uid), {
    uid: cred.user.uid,
    username,
    email,
    farmName: farmName || 'Sovereign Estate',
    createdAt: serverTimestamp()
  });

  return { id: cred.user.uid, username, email, farmName: farmName || 'Sovereign Estate' };
}

export async function cloudLogin(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const profile = await getUserProfile(cred.user.uid);
  return profile || { id: cred.user.uid, username: cred.user.displayName, email };
}

export async function cloudLogout() {
  await signOut(auth);
}

export async function cloudGoogleLogin() {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  
  // Check if profile exists, if not create one
  const profile = await getUserProfile(cred.user.uid);
  if (!profile) {
    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid,
      username: cred.user.displayName,
      email: cred.user.email,
      avatar: cred.user.photoURL,
      farmName: 'Google Estate',
      createdAt: serverTimestamp()
    });
  }
  
  return await getUserProfile(cred.user.uid);
}

// ─── USER PROFILE ─────────────────────────────────────────────────────────────

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  if (snap.exists()) return { id: snap.id, ...snap.data() };
  return null;
}

export async function updateUserProfile(uid, data) {
  await updateDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: serverTimestamp()
  });
}

// ─── STORAGE ─────────────────────────────────────────────────────────────────

export async function uploadImage(userId, base64Str) {
  try {
    const storageRef = ref(storage, `scans/${userId}/${Date.now()}.jpg`);
    await uploadString(storageRef, base64Str, 'data_url');
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.warn("[Firebase Sovereign Sync] Cloud upload blocked by CORS or Network. Falling back to Local Vault.", error);
    return null;
  }
}

// ─── HISTORY ─────────────────────────────────────────────────────────────────

export async function saveHistoryToCloud(userId, record) {
  // Image storage removed as per Sovereign Privacy/Performance Protocol
  await addDoc(collection(db, 'users', userId, 'history'), {
    ...record,
    timestamp: serverTimestamp()
  });
}

export async function loadHistoryFromCloud(userId) {
  const q = query(
    collection(db, 'users', userId, 'history'),
    orderBy('timestamp', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ─── PLOTS SYNC ──────────────────────────────────────────────────────────────

export async function savePlotToCloud(userId, plot) {
  await addDoc(collection(db, 'users', userId, 'plots'), {
    ...plot,
    timestamp: serverTimestamp()
  });
}

export async function loadPlotsFromCloud(userId) {
  const q = query(collection(db, 'users', userId, 'plots'), orderBy('timestamp', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export { onAuthStateChanged };

import { db as localDb } from '../core/db.js';
import { state } from '../core/state.js';
import { showToast } from '../core/utils.js';
import { getUserProfile, updateUserProfile } from '../services/firebase.js';

export async function initProfile() {
  const uid = state.currentUser?.id || state.currentUser?.uid;
  if (!uid) return;

  let user = state.currentUser;

  // Try fetching fresh data from cloud
  try {
    const cloudProfile = await getUserProfile(uid);
    if (cloudProfile) user = cloudProfile;
  } catch(e) {
    console.warn("Cloud profile load failed, using local state.");
  }

  // Fill Form Fields
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  set('profile-fname', user.firstName);
  set('profile-lname', user.lastName);
  set('profile-dob', user.dob);
  set('profile-email', user.email);
  set('profile-mobile', user.mobile);
  set('profile-farm', user.farmName);
  set('profile-address', user.address);

  // Update display elements
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'Operator';
  const farm = user.farmName || 'Sovereign Estate';

  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
  setText('profile-display-name', fullName);
  setText('profile-display-farm', farm.toUpperCase());

  const avatarEl = document.getElementById('profile-avatar-large');
  if (avatarEl) avatarEl.src = user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username || uid}`;

  // Biometric Status
  const creds = await localDb.credentials.where('userId').equals(uid).toArray();
  const bioStatus = document.getElementById('profile-biometric-status');
  if (bioStatus) {
    bioStatus.innerText = creds.length > 0 ? "ACTIVE" : "NOT ENROLLED";
    bioStatus.style.color = creds.length > 0 ? "var(--primary)" : "var(--danger)";
  }

  // Fetch IP
  fetchIP(uid);

  // Bind Save Form
  const form = document.getElementById('profile-form');
  if (form && !form.dataset.bound) {
    form.dataset.bound = 'true';
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveProfile(uid);
    });
  }
}

async function fetchIP(uid) {
  const ipEl = document.getElementById('profile-ip');
  if (!ipEl) return;
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    ipEl.innerText = data.ip;
    await updateUserProfile(uid, { ipAddress: data.ip });
  } catch (e) {
    ipEl.innerText = 'LOCAL_NODE';
  }
}

async function saveProfile(uid) {
  const get = (id) => document.getElementById(id)?.value || '';
  const updates = {
    firstName: get('profile-fname'),
    lastName: get('profile-lname'),
    dob: get('profile-dob'),
    email: get('profile-email'),
    mobile: get('profile-mobile'),
    farmName: get('profile-farm'),
    address: get('profile-address')
  };

  try {
    // Save to cloud
    await updateUserProfile(uid, updates);

    // Update local state
    state.currentUser = { ...state.currentUser, ...updates };

    // Update global UI
    const fullName = [updates.firstName, updates.lastName].filter(Boolean).join(' ') || state.currentUser.username;
    document.getElementById('user-profile-name')?.innerText !== undefined && (document.getElementById('user-profile-name').innerText = fullName);
    document.getElementById('user-farm-name')?.innerText !== undefined && (document.getElementById('user-farm-name').innerText = updates.farmName);
    document.getElementById('profile-display-name')?.innerText !== undefined && (document.getElementById('profile-display-name').innerText = fullName);
    document.getElementById('profile-display-farm')?.innerText !== undefined && (document.getElementById('profile-display-farm').innerText = updates.farmName.toUpperCase());

    showToast("Profile saved to Cloud!", "success");
  } catch (e) {
    console.error(e);
    showToast("Save failed: " + e.message, "error");
  }
}

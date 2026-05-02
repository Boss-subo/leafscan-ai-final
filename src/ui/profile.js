import { state } from '../core/state.js';
import { db } from '../core/db.js';
import { showToast } from '../core/utils.js';

export async function initProfile() {
  const user = await db.users.get(state.currentUser.id);
  if (!user) return;

  // Fill Form
  document.getElementById('profile-fname').value = user.firstName || '';
  document.getElementById('profile-lname').value = user.lastName || '';
  document.getElementById('profile-dob').value = user.dob || '';
  document.getElementById('profile-email').value = user.email || '';
  document.getElementById('profile-mobile').value = user.mobile || '';
  document.getElementById('profile-farm').value = user.farmName || '';
  document.getElementById('profile-address').value = user.address || '';

  // Technical Metadata
  document.getElementById('profile-display-name').innerText = `${user.firstName || 'Operator'} ${user.lastName || ''}`;
  document.getElementById('profile-display-farm').innerText = (user.farmName || 'Sovereign Estate').toUpperCase();
  document.getElementById('profile-avatar-large').src = user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`;
  
  // Biometric Status
  const creds = await db.credentials.where('userId').equals(user.id).toArray();
  const bioStatus = document.getElementById('profile-biometric-status');
  if (bioStatus) {
    bioStatus.innerText = creds.length > 0 ? "ACTIVE" : "DISABLED";
    bioStatus.style.color = creds.length > 0 ? "var(--primary)" : "var(--danger)";
  }

  // IP Address Fetch
  fetchIP();

  // Bind Form Submit
  const form = document.getElementById('profile-form');
  if (form && !form.dataset.bound) {
    form.dataset.bound = 'true';
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveProfile();
    });
  }
}

async function fetchIP() {
  const ipEl = document.getElementById('profile-ip');
  if (!ipEl) return;
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    ipEl.innerText = data.ip;
    // Save IP to DB automatically
    await db.users.update(state.currentUser.id, { ipAddress: data.ip });
  } catch (e) {
    ipEl.innerText = "LOCAL_NODE";
  }
}

async function saveProfile() {
  const updates = {
    firstName: document.getElementById('profile-fname').value,
    lastName: document.getElementById('profile-lname').value,
    dob: document.getElementById('profile-dob').value,
    email: document.getElementById('profile-email').value,
    mobile: document.getElementById('profile-mobile').value,
    farmName: document.getElementById('profile-farm').value,
    address: document.getElementById('profile-address').value
  };

  try {
    await db.users.update(state.currentUser.id, updates);
    
    // Update State & Global UI
    state.currentUser = { ...state.currentUser, ...updates };
    document.getElementById('user-profile-name').innerText = updates.firstName ? `${updates.firstName} ${updates.lastName}` : state.currentUser.username;
    document.getElementById('user-farm-name').innerText = updates.farmName;
    document.getElementById('profile-display-name').innerText = `${updates.firstName} ${updates.lastName}`;
    document.getElementById('profile-display-farm').innerText = updates.farmName.toUpperCase();

    showToast("Sovereign Identity Synchronized.", "success");
  } catch (e) {
    showToast("Update Failed: Database write error.", "error");
  }
}

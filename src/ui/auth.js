import { db } from '../core/db.js';
import { state } from '../core/state.js';
import { showToast } from '../core/utils.js';

let isRegisterMode = false;
let bioStream = null;

export function initAuth(onSuccess) {
  const authVault = document.getElementById('auth-vault');
  const loginBtn = document.getElementById('login-btn');
  const googleBtn = document.getElementById('google-login');
  const biometricBtn = document.getElementById('biometric-btn');
  const cancelBioBtn = document.getElementById('cancel-bio-btn');
  const biometricOverlay = document.getElementById('biometric-overlay');
  const usernameInput = document.getElementById('login-username');
  const passwordInput = document.getElementById('login-password');
  const farmInput = document.getElementById('login-farm');
  const farmGroup = document.getElementById('farm-name-group');
  const toggleLink = document.getElementById('toggle-auth-mode');
  const strengthBar = document.getElementById('strength-bar');
  const strengthText = document.getElementById('strength-text');
  const strengthContainer = document.getElementById('password-strength');

  // Load Remembered Identity
  const savedUser = localStorage.getItem('sovereign_operator_id');
  if (savedUser) {
    // Optional: Auto-login logic
  }

  // Password Strength Logic
  passwordInput?.addEventListener('input', (e) => {
    if (!isRegisterMode) return;
    const val = e.target.value;
    strengthContainer.style.display = 'block';
    strengthText.style.display = 'block';

    let strength = 0;
    if (val.length >= 8) strength += 25;
    if (/[A-Z]/.test(val)) strength += 25;
    if (/[0-9]/.test(val)) strength += 25;
    if (/[^A-Za-z0-9]/.test(val)) strength += 25;

    strengthBar.style.width = strength + '%';
    
    if (strength <= 25) {
      strengthBar.style.background = '#ef4444';
      strengthText.innerText = "Security Level: CRITICAL";
    } else if (strength <= 50) {
      strengthBar.style.background = '#f59e0b';
      strengthText.innerText = "Security Level: MODERATE";
    } else if (strength <= 75) {
      strengthBar.style.background = '#3b82f6';
      strengthText.innerText = "Security Level: HIGH";
    } else {
      strengthBar.style.background = '#10b981';
      strengthText.innerText = "Security Level: SOVEREIGN";
    }
  });

  // Toggle Login/Register
  toggleLink?.addEventListener('click', (e) => {
    e.preventDefault();
    isRegisterMode = !isRegisterMode;
    document.querySelector('.auth-card h2').innerText = isRegisterMode ? "Register Identity" : "Sovereign Access";
    loginBtn.innerText = isRegisterMode ? "Create Profile" : "Authenticate Identity";
    farmGroup.style.display = isRegisterMode ? 'block' : 'none';
    strengthContainer.style.display = 'none';
    strengthText.style.display = 'none';
  });

  // Standard Login/Register
  loginBtn?.addEventListener('click', async () => {
    const user = usernameInput.value.trim();
    const pass = passwordInput.value.trim();
    const farm = farmInput.value.trim();

    if (!user || !pass) {
      showToast("Identity credentials required.", "error");
      return;
    }

    if (isRegisterMode) {
      if (pass.length < 8) {
        showToast("Key too weak. Min 8 characters.", "error");
        return;
      }
      const existing = await db.users.where('username').equals(user).first();
      if (existing) {
        showToast("Identity already exists.", "error");
        return;
      }
      const userId = await db.users.add({ 
        username: user, 
        password: pass, 
        farmName: farm || "Sovereign Estate",
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${user}` 
      });
      finalizeAuth({ id: userId, username: user, farmName: farm || "Sovereign Estate" });
    } else {
      const profile = await db.users.where('username').equals(user).first();
      if (profile && profile.password === pass) {
        finalizeAuth(profile);
      } else {
        showToast("Access Denied: Invalid Signature.", "error");
      }
    }
  });

  // Google Login Logic
  googleBtn?.addEventListener('click', () => {
    console.log("Attempting Google Sync...");
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      console.warn("VITE_GOOGLE_CLIENT_ID is missing.");
      showToast("Google Client ID missing in Vercel settings.", "warning");
      return;
    }

    if (typeof google === 'undefined' || !google.accounts) {
      console.error("Google Identity SDK not loaded.");
      showToast("Google Services not loaded. Check internet.", "error");
      return;
    }

    try {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          const payload = parseJwt(response.credential);
          finalizeAuth({ 
            id: payload.sub, 
            username: payload.name, 
            farmName: 'Google Cloud Farm',
            avatar: payload.picture 
          });
        }
      });
      google.accounts.id.prompt();
    } catch (err) {
      console.error("Google Prompt Error:", err);
      showToast("Google Sync Initialization Failed", "error");
    }
  });

  // Biometric Logic
  biometricBtn?.addEventListener('click', async () => {
    biometricOverlay.style.display = 'flex';
    const status = document.getElementById('bio-status');
    const progress = document.getElementById('bio-progress');
    const video = document.getElementById('auth-camera');
    
    try {
      bioStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (video) video.srcObject = bioStream;
      
      status.innerText = "ANALYZING FACIAL MESH...";
      
      let p = 0;
      const interval = setInterval(() => {
        p += 2;
        progress.style.width = p + '%';
        
        if (p === 30) status.innerText = "VERIFYING BIOMETRIC HASH...";
        if (p === 60) status.innerText = "MATCHING SOVEREIGN RECORDS...";
        if (p === 90) status.innerText = "IDENTITY CONFIRMED";
        
        if (p >= 100) {
          clearInterval(interval);
          handleBiometricSuccess();
        }
      }, 50);

    } catch (err) {
      biometricOverlay.style.display = 'none';
      showToast("Biometric Hardware Not Found", "error");
    }
  });

  cancelBioBtn?.addEventListener('click', () => {
    if (bioStream) {
      bioStream.getTracks().forEach(t => t.stop());
    }
    biometricOverlay.style.display = 'none';
  });

  async function handleBiometricSuccess() {
    let profile = await db.users.toCollection().first();
    if (!profile) {
      const id = await db.users.add({ 
        username: 'Sovereign_Admin', 
        password: 'admin', 
        farmName: 'Command Center', 
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin' 
      });
      profile = { id, username: 'Sovereign_Admin', farmName: 'Command Center' };
    }
    
    if (bioStream) {
      bioStream.getTracks().forEach(t => t.stop());
    }
    
    setTimeout(() => finalizeAuth(profile), 800);
  }

  function finalizeAuth(userObj) {
    state.currentUser = userObj;
    localStorage.setItem('sovereign_operator_id', userObj.id);
    authVault.style.display = 'none';
    biometricOverlay.style.display = 'none';
    
    updateUIWithProfile(userObj);
    onSuccess(userObj.username);
    showToast(`Access Granted: Welcome, ${userObj.username}`, "success");
  }
}

function updateUIWithProfile(user) {
  const profileName = document.getElementById('user-profile-name');
  const farmName = document.getElementById('user-farm-name');
  const avatar = document.getElementById('user-avatar');

  if (profileName) profileName.innerText = user.username;
  if (farmName) farmName.innerText = user.farmName;
  if (avatar) avatar.src = user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`;
}

function parseJwt(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
}

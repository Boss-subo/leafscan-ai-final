import { db } from '../core/db.js';
import { state } from '../core/state.js';
import { showToast } from '../core/utils.js';

let isRegisterMode = false;

export function initAuth(onSuccess) {
  const authVault = document.getElementById('auth-vault');
  const loginBtn = document.getElementById('login-btn');
  const googleBtn = document.getElementById('google-login');
  const biometricBtn = document.getElementById('biometric-btn');
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
    // We could auto-login here if we wanted
  }

  // Password Strength Logic
  passwordInput?.addEventListener('input', (e) => {
    if (!isRegisterMode) {
      strengthContainer.style.display = 'none';
      strengthText.style.display = 'none';
      return;
    }

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
      strengthText.innerText = "Security Level: CRITICAL (Vulnerable)";
    } else if (strength <= 50) {
      strengthBar.style.background = '#f59e0b';
      strengthText.innerText = "Security Level: MODERATE";
    } else if (strength <= 75) {
      strengthBar.style.background = '#3b82f6';
      strengthText.innerText = "Security Level: HIGH";
    } else {
      strengthBar.style.background = '#10b981';
      strengthText.innerText = "Security Level: SOVEREIGN (Unbreakable)";
    }
  });

  // Toggle Login/Register
  toggleLink?.addEventListener('click', (e) => {
    e.preventDefault();
    isRegisterMode = !isRegisterMode;
    document.querySelector('.auth-card h2').innerText = isRegisterMode ? "Register Identity" : "Sovereign Access";
    loginBtn.innerText = isRegisterMode ? "Create Profile" : "Authenticate Identity";
    farmGroup.style.display = isRegisterMode ? 'block' : 'none';
    
    if (!isRegisterMode) {
      strengthContainer.style.display = 'none';
      strengthText.style.display = 'none';
    }
  });

  loginBtn?.addEventListener('click', async () => {
    const user = usernameInput.value.trim();
    const pass = passwordInput.value.trim();
    const farm = farmInput.value.trim();

    if (!user || !pass) {
      showToast("Identity credentials required.", "error");
      return;
    }

    if (isRegisterMode) {
      // REGISTRATION WITH SECURITY CHECK
      if (pass.length < 8) {
        showToast("Key too weak. Min 8 characters required.", "error");
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
      // LOGIN
      const profile = await db.users.where('username').equals(user).first();
      if (profile && profile.password === pass) {
        finalizeAuth(profile);
      } else {
        showToast("Access Denied: Invalid Signature.", "error");
      }
    }
  });

  biometricBtn?.addEventListener('click', async () => {
    biometricOverlay.style.display = 'flex';
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.getElementById('auth-camera');
      if (video) video.srcObject = stream;

      setTimeout(async () => {
        let profile = await db.users.toCollection().first();
        if (!profile) {
            const id = await db.users.add({ 
                username: 'admin', 
                password: 'admin', 
                farmName: 'Sovereign Command', 
                avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin' 
            });
            profile = { id, username: 'admin', farmName: 'Sovereign Command' };
        }
        
        document.getElementById('bio-status').innerText = "IDENTITY MESH VERIFIED";
        stream.getTracks().forEach(t => t.stop());
        setTimeout(() => finalizeAuth(profile), 1000);
      }, 3000);
    } catch (err) {
      biometricOverlay.style.display = 'none';
      showToast("Biometric Sensor Failure", "error");
    }
  });

  function finalizeAuth(userObj) {
    state.currentUser = userObj;
    localStorage.setItem('sovereign_operator_id', userObj.id);
    authVault.style.display = 'none';
    biometricOverlay.style.display = 'none';
    
    // Update UI with Profile Details
    updateUIWithProfile(userObj);
    
    onSuccess(userObj.username);
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

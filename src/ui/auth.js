import { db } from '../core/db.js';
import { state } from '../core/state.js';
import { showToast } from '../core/utils.js';

let isRegisterMode = false;

export function initAuth(onSuccess) {
  const authVault = document.getElementById('auth-vault');
  const loginBtn = document.getElementById('login-btn');
  const googleBtn = document.getElementById('google-login');
  const biometricBtn = document.getElementById('biometric-btn');
  const usernameInput = document.getElementById('login-username');
  const passwordInput = document.getElementById('login-password');
  const farmInput = document.getElementById('login-farm');
  const farmGroup = document.getElementById('farm-name-group');
  const toggleLink = document.getElementById('toggle-auth-mode');
  const strengthBar = document.getElementById('strength-bar');
  const strengthText = document.getElementById('strength-text');
  const strengthContainer = document.getElementById('password-strength');

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
    if (strength <= 25) { strengthBar.style.background = '#ef4444'; strengthText.innerText = "CRITICAL"; }
    else if (strength <= 50) { strengthBar.style.background = '#f59e0b'; strengthText.innerText = "MODERATE"; }
    else if (strength <= 75) { strengthBar.style.background = '#3b82f6'; strengthText.innerText = "HIGH"; }
    else { strengthBar.style.background = '#10b981'; strengthText.innerText = "SOVEREIGN"; }
  });

  toggleLink?.addEventListener('click', (e) => {
    e.preventDefault();
    isRegisterMode = !isRegisterMode;
    document.querySelector('.auth-card h2').innerText = isRegisterMode ? "Register Identity" : "Sovereign Access";
    loginBtn.innerText = isRegisterMode ? "Create Profile" : "Authenticate Identity";
    farmGroup.style.display = isRegisterMode ? 'block' : 'none';
  });

  loginBtn?.addEventListener('click', async () => {
    const user = usernameInput.value.trim();
    const pass = passwordInput.value.trim();
    const farm = farmInput.value.trim();

    if (!user || !pass) { showToast("Credentials required.", "error"); return; }

    if (isRegisterMode) {
      const existing = await db.users.where('username').equals(user).first();
      if (existing) { showToast("Identity exists.", "error"); return; }
      const userId = await db.users.add({ username: user, password: pass, farmName: farm || "Sovereign Estate" });
      finalizeAuth({ id: userId, username: user, farmName: farm || "Sovereign Estate" });
    } else {
      const profile = await db.users.where('username').equals(user).first();
      if (profile && profile.password === pass) { finalizeAuth(profile); }
      else { showToast("Invalid Signature.", "error"); }
    }
  });

  // REAL BIOMETRIC LOGIN (WebAuthn)
  biometricBtn?.addEventListener('click', async () => {
    try {
      const credentials = await db.credentials.toArray();
      if (credentials.length === 0) {
        showToast("No biometric data found. Please login with password first.", "warning");
        return;
      }

      const options = {
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          timeout: 60000,
          allowCredentials: credentials.map(c => ({
            id: base64ToUint8Array(c.credentialId),
            type: 'public-key'
          })),
          userVerification: 'required'
        }
      };

      const assertion = await navigator.credentials.get(options);
      if (assertion) {
        const credId = uint8ArrayToBase64(new Uint8Array(assertion.rawId));
        const storedCred = await db.credentials.where('credentialId').equals(credId).first();
        const user = await db.users.get(storedCred.userId);
        finalizeAuth(user);
      }
    } catch (err) {
      console.error(err);
      showToast("Biometric Authentication Failed", "error");
    }
  });

  googleBtn?.addEventListener('click', () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) { showToast("Google Client ID missing.", "warning"); return; }
    google.accounts.id.initialize({
      client_id: clientId,
      callback: (res) => {
        const payload = parseJwt(res.credential);
        finalizeAuth({ id: payload.sub, username: payload.name, farmName: 'Google Estate', avatar: payload.picture });
      }
    });
    google.accounts.id.prompt();
  });

  function finalizeAuth(userObj) {
    state.currentUser = userObj;
    localStorage.setItem('sovereign_operator_id', userObj.id);
    authVault.style.display = 'none';
    updateUIWithProfile(userObj);
    onSuccess(userObj);
    showToast(`Welcome back, Operator ${userObj.username}`, "success");

    // Ask to enable biometrics if not already enabled
    checkBiometricEnrollment(userObj.id);
  }
}

async function checkBiometricEnrollment(userId) {
  const existing = await db.credentials.where('userId').equals(userId).first();
  if (!existing) {
    setTimeout(() => {
      if (confirm("Would you like to enable Real Biometrics (Fingerprint/Face ID) for faster login next time?")) {
        enrollBiometrics(userId);
      }
    }, 2000);
  }
}

async function enrollBiometrics(userId) {
  try {
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      showToast("Biometrics require a secure HTTPS connection.", "warning");
      return;
    }

    const user = await db.users.get(userId);
    const enc = new TextEncoder();
    const options = {
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: { name: "LeafScan AI", id: window.location.hostname },
        user: {
          id: enc.encode(String(userId)), // Ensure ID is a valid Uint8Array
          name: user.username,
          displayName: user.username
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        timeout: 60000,
        authenticatorSelection: { 
          userVerification: "required",
          residentKey: "preferred"
        }
      }
    };

    const credential = await navigator.credentials.create(options);
    if (credential) {
      const credId = uint8ArrayToBase64(new Uint8Array(credential.rawId));
      await db.credentials.add({
        userId: userId,
        credentialId: credId,
        publicKey: "" // Simplified for demo
      });
      showToast("Biometrics Registered Successfully!", "success");
    }
  } catch (err) {
    console.error("Biometric Enrollment Error:", err);
    showToast(`Enrollment Failed: ${err.message}`, "error");
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

function parseJwt(t) {
  const base64 = t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
}

function uint8ArrayToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return window.btoa(binary);
}

function base64ToUint8Array(base64) {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary_string.charCodeAt(i);
  return bytes;
}

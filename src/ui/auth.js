import { db as localDb } from '../core/db.js';
import { state } from '../core/state.js';
import { showToast } from '../core/utils.js';
import {
  cloudRegister,
  cloudLogin,
  cloudLogout,
  getUserProfile,
  updateUserProfile,
  saveHistoryToCloud,
  loadHistoryFromCloud,
  cloudGoogleLogin
} from '../services/firebase.js';

let isRegisterMode = false;

export function initAuth(onSuccess) {
  const authVault = document.getElementById('auth-vault');
  const loginBtn = document.getElementById('login-btn');
  const googleBtn = document.getElementById('google-login');
  const biometricBtn = document.getElementById('biometric-btn');
  const usernameInput = document.getElementById('login-username');
  const passwordInput = document.getElementById('login-password');
  const emailInput = document.getElementById('login-email');
  const farmInput = document.getElementById('login-farm');
  const farmGroup = document.getElementById('farm-name-group');
  const emailGroup = document.getElementById('email-group');
  const toggleLink = document.getElementById('toggle-auth-mode');
  const strengthBar = document.getElementById('strength-bar');
  const strengthText = document.getElementById('strength-text');
  const strengthContainer = document.getElementById('password-strength');

  // Password Strength
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
    loginBtn.innerText = isRegisterMode ? "Create Cloud Profile" : "Authenticate Identity";
    if (farmGroup) farmGroup.style.display = isRegisterMode ? 'block' : 'none';
    if (emailGroup) emailGroup.style.display = isRegisterMode ? 'block' : 'none';
  });

  loginBtn?.addEventListener('click', async () => {
    const username = usernameInput?.value.trim();
    const password = passwordInput?.value.trim();
    const email = emailInput?.value.trim();
    const farm = farmInput?.value.trim();

    if (!password) { showToast("Password required.", "error"); return; }

    loginBtn.innerText = isRegisterMode ? "Creating..." : "Authenticating...";
    loginBtn.disabled = true;

    try {
      let userObj;

      if (isRegisterMode) {
        if (!email || !username) { showToast("Email and username required.", "error"); return; }
        userObj = await cloudRegister(email, password, username, farm);
        showToast("Cloud Identity Created!", "success");
      } else {
        // Login with email
        const loginEmail = email || username; // support email in username field too
        if (!loginEmail) { showToast("Email required.", "error"); return; }
        userObj = await cloudLogin(loginEmail, password);
        showToast(`Welcome back, ${userObj.username || 'Operator'}!`, "success");
      }

      finalizeAuth(userObj);
    } catch (err) {
      console.error("Auth error:", err);
      let msg = "Authentication failed.";
      if (err.code === 'auth/email-already-in-use') msg = "Email already registered. Please login.";
      else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') msg = "Invalid email or password.";
      else if (err.code === 'auth/user-not-found') msg = "No account found. Please register.";
      else if (err.code === 'auth/invalid-email') msg = "Invalid email format.";
      else if (err.code === 'auth/weak-password') msg = "Password too weak (min 6 characters).";
      showToast(msg, "error");
    } finally {
      loginBtn.innerText = isRegisterMode ? "Create Cloud Profile" : "Authenticate Identity";
      loginBtn.disabled = false;
    }
  });

  googleBtn?.addEventListener('click', async () => {
    try {
      googleBtn.disabled = true;
      const userObj = await cloudGoogleLogin();
      showToast(`Sovereign Sync Complete: Welcome ${userObj.username}!`, "success");
      finalizeAuth(userObj);
    } catch (err) {
      console.error(err);
      showToast("Google Authentication Failed.", "error");
    } finally {
      googleBtn.disabled = false;
    }
  });

  // Biometric Login
  biometricBtn?.addEventListener('click', async () => {
    try {
      if (!window.isSecureContext) {
        showToast("Biometrics require HTTPS.", "warning");
        return;
      }
      const credentials = await localDb.credentials.toArray();
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
          userVerification: 'preferred'
        }
      };
      const assertion = await navigator.credentials.get(options);
      if (assertion) {
        const credId = uint8ArrayToBase64(new Uint8Array(assertion.rawId));
        const storedCred = await localDb.credentials.where('credentialId').equals(credId).first();
        if (storedCred) {
          const profile = await getUserProfile(storedCred.userId);
          if (profile) finalizeAuth(profile);
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Biometric Authentication Failed: " + err.message, "error");
    }
  });

  function finalizeAuth(userObj) {
    state.currentUser = userObj;
    localStorage.setItem('leafscan_uid', userObj.id || userObj.uid);
    authVault.style.display = 'none';
    updateUIWithProfile(userObj);
    onSuccess(userObj);

    // Offer biometrics after login
    setTimeout(() => checkBiometricEnrollment(userObj.id || userObj.uid), 2500);
  }
}

async function checkBiometricEnrollment(userId) {
  const existing = await localDb.credentials.where('userId').equals(userId).first();
  if (!existing && window.isSecureContext) {
    setTimeout(() => {
      if (confirm("Enable Biometric Login (Fingerprint/Face ID) for next time?")) {
        enrollBiometrics(userId);
      }
    }, 500);
  }
}

async function enrollBiometrics(userId) {
  try {
    const enc = new TextEncoder();
    const profile = await getUserProfile(userId);
    const options = {
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: { name: "LeafScan AI" },
        user: {
          id: enc.encode(String(userId)),
          name: profile?.email || profile?.username || userId,
          displayName: profile?.username || 'Operator'
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        timeout: 60000,
        authenticatorSelection: {
          userVerification: "preferred",
          authenticatorAttachment: "platform"
        }
      }
    };
    const credential = await navigator.credentials.create(options);
    if (credential) {
      const credId = uint8ArrayToBase64(new Uint8Array(credential.rawId));
      await localDb.credentials.add({ userId, credentialId: credId, publicKey: "" });
      showToast("Biometrics Registered!", "success");
    }
  } catch (err) {
    console.error("Biometric Enrollment:", err);
    let msg = err.message;
    if (err.name === 'NotAllowedError') msg = "Cancelled or timed out.";
    showToast("Enrollment Error: " + msg, "error");
  }
}

function updateUIWithProfile(user) {
  const username = user.username || user.displayName || 'Operator';
  const farm = user.farmName || 'Sovereign Estate';
  const profileName = document.getElementById('user-profile-name');
  const farmName = document.getElementById('user-farm-name');
  const avatar = document.getElementById('user-avatar');
  if (profileName) profileName.innerText = username;
  if (farmName) farmName.innerText = farm;
  if (avatar) avatar.src = user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;
}

function uint8ArrayToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return window.btoa(binary);
}

function base64ToUint8Array(base64) {
  const binary_string = window.atob(base64);
  const bytes = new Uint8Array(binary_string.length);
  for (let i = 0; i < binary_string.length; i++) bytes[i] = binary_string.charCodeAt(i);
  return bytes;
}

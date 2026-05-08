// LeafScan AI - Neural Event Listeners
import { state } from '../core/state.js';
import { db } from '../core/db.js';
import { analyzeLeaf } from '../engines/analysis-logic.js';
import { startAutonomousMission, exportMissionJSON } from '../engines/fleet-engine.js';
import { switchTab } from './navigation.js';
import { sendMessage, testGeminiKey, toggleMic, syncAiModel } from './chat.js';
import { exportToPDF } from '../services/pdf-export.js';
import { showToast } from '../core/utils.js';

// --- ELITE CHAT ENGINE (Top-Level Global Bridge) ---
export const handleChat = async () => {
  const input = document.getElementById('chat-input');
  const messages = document.getElementById('chat-messages');
  
  if (!input || !messages) return;

  const text = input.value.trim();
  if (text) {
    input.value = '';
    await sendMessage(text, messages);
  }
};

// Bind to Window IMMEDIATELY on module load
window.handleChat = handleChat;

// Aggressive Top-Level Binding (Retries for DOM readiness)
const bindChat = () => {
  const chatForm = document.getElementById('chat-form');
  const micBtn = document.getElementById('mic-btn');

  if (chatForm && !chatForm.dataset.bound) {
    chatForm.dataset.bound = 'true';
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleChat();
    });
  }

  if (micBtn && !micBtn.dataset.bound) {
    micBtn.dataset.bound = 'true';
    micBtn.addEventListener('click', () => toggleMic());
  }

  const syncBtn = document.getElementById('sync-ai-btn');
  if (syncBtn && !syncBtn.dataset.bound) {
    syncBtn.dataset.bound = 'true';
    syncBtn.addEventListener('click', async () => {
      syncBtn.classList.add('spinning');
      await syncAiModel();
      syncBtn.classList.remove('spinning');
    });
  }
};

// Polling for DOM readiness because chat tab might be late
setInterval(bindChat, 1000);

export function setupEventListeners(elements) {
  console.log("LeafScan AI: Establishing Neural Listeners...");
  // Sidebar Navigation
  document.querySelectorAll('.nav-links li').forEach(li => {
    li.addEventListener('click', () => switchTab(li.dataset.tab, elements));
  });

  // Action Buttons
  elements.analyzeBtn?.addEventListener('click', () => analyzeLeaf(elements));

  elements.exportMissionBtn?.addEventListener('click', () => {
    if (!state.currentRiskPolygon) {
      showToast("No active risk zone detected. Scan a leaf first.", "error");
      return;
    }
    switchTab('plots', elements);
    startAutonomousMission(state.currentRiskPolygon, state.map, elements);
  });

  elements.downloadMissionJson?.addEventListener('click', exportMissionJSON);
  elements.downloadPdf?.addEventListener('click', () => exportToPDF(elements.resultPanel, 'Diagnostic_Report.pdf'));

  // --- Neural Reset ---
  document.getElementById('reset-scan-btn')?.addEventListener('click', () => {
    state.currentImage = null;
    elements.resultPanel.style.display = 'none';
    elements.imagePreview.style.display = 'none';
    elements.video.style.display = 'none';
    elements.analyzeBtn.style.display = 'none';
    elements.dropZone.style.display = 'flex';
    elements.captureBtn.innerHTML = '<i data-lucide="camera"></i> CAPTURE MATRIX';
    
    // Clear heatmap if exists
    const heatmap = document.getElementById('xai-heatmap-img');
    if (heatmap) heatmap.remove();

    showToast("Neural Matrix Reset. Ready for new sample.", "info");
    if (window.lucide) lucide.createIcons();
  });

  // --- Scanner Interactions ---
  elements.uploadBtn?.addEventListener('click', () => elements.fileInput?.click());
  elements.dropZone?.addEventListener('click', () => elements.fileInput?.click());

  elements.fileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (re) => {
        state.currentImage = re.target.result;
        elements.imagePreview.src = re.target.result;
        elements.imagePreview.style.display = 'block';
        elements.video.style.display = 'none';
        elements.analyzeBtn.style.display = 'block';
        elements.dropZone.style.display = 'none';
      };
      reader.readAsDataURL(file);
    }
  });

  elements.captureBtn?.addEventListener('click', async () => {
    if (!state.isStreaming) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        elements.video.srcObject = stream;
        elements.video.style.display = 'block';
        elements.imagePreview.style.display = 'none';
        elements.dropZone.style.display = 'none';
        state.isStreaming = true;
        elements.captureBtn.innerHTML = '<i data-lucide="camera"></i> SNAP';
        if (window.lucide) lucide.createIcons();
      } catch (err) {
        showToast("Camera access denied or not available.", "error");
      }
    } else {
      const canvas = document.createElement('canvas');
      canvas.width = elements.video.videoWidth;
      canvas.height = elements.video.videoHeight;
      canvas.getContext('2d').drawImage(elements.video, 0, 0);
      const data = canvas.toDataURL('image/jpeg');

      state.currentImage = data;
      elements.imagePreview.src = data;
      elements.imagePreview.style.display = 'block';
      elements.video.style.display = 'none';
      elements.analyzeBtn.style.display = 'block';

      const stream = elements.video.srcObject;
      stream.getTracks().forEach(t => t.stop());
      state.isStreaming = false;
      elements.captureBtn.innerHTML = '<i data-lucide="camera"></i> CAPTURE';
      if (window.lucide) lucide.createIcons();
    }
  });

  // Config Modal
  document.getElementById('config-btn')?.addEventListener('click', () => {
    const modal = document.getElementById('config-modal');
    if (modal) {
      modal.style.display = 'flex';
      
      // Pre-populate keys
      const gKey = document.getElementById('gemini-key');
      const wKey = document.getElementById('weather-key');
      if (gKey) gKey.value = state.geminiKey || '';
      if (wKey) wKey.value = state.weatherKey || '';

      // Run Diagnostics
      updateDiagnostics();
    }
  });

  async function updateDiagnostics() {
    const dWeather = document.getElementById('diag-weather');
    const dGemini = document.getElementById('diag-gemini');
    const dGeo = document.getElementById('diag-geo');

    if (dWeather) {
      dWeather.textContent = state.weatherKey ? "CONNECTED" : "MISSING KEY";
      dWeather.style.color = state.weatherKey ? "var(--primary)" : "var(--danger)";
    }
    if (dGemini) {
      dGemini.textContent = state.geminiKey ? "CONNECTED" : "MISSING KEY";
      dGemini.style.color = state.geminiKey ? "var(--primary)" : "var(--danger)";
    }
    if (dGeo) {
      navigator.geolocation.getCurrentPosition(() => {
        dGeo.textContent = "ACTIVE";
        dGeo.style.color = "var(--primary)";
      }, () => {
        dGeo.textContent = "BLOCKED";
        dGeo.style.color = "var(--danger)";
      });
    }
  }

  document.getElementById('save-config')?.addEventListener('click', async () => {
    const gKey = document.getElementById('gemini-key').value;
    const wKey = document.getElementById('weather-key').value;
    
    showToast("Synchronizing Identity Vault...", "info");
    
    state.geminiKey = gKey;
    state.weatherKey = wKey;
    localStorage.setItem('gemini_key', gKey);
    localStorage.setItem('weather_key', wKey);
    
    // Tiny delay to ensure localStorage and state are locked
    await new Promise(r => setTimeout(r, 500));
    
    document.getElementById('config-modal').style.display = 'none';
    showToast("Sovereign Keys Synchronized. Reloading Engine...", "success");
    
    setTimeout(() => {
      location.reload();
    }, 1000);
  });

  document.getElementById('test-api')?.addEventListener('click', async () => {
    const gKey = document.getElementById('gemini-key').value;
    const wKey = document.getElementById('weather-key').value;
    
    showToast("Testing Handshake with Global Mesh...", "info");
    
    // Test Weather
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=22.57&lon=88.36&appid=${wKey}`);
      if (res.ok) {
        showToast("Weather API: AUTHENTICATED", "success");
        const dWeather = document.getElementById('diag-weather');
        if (dWeather) { dWeather.textContent = "VERIFIED"; dWeather.style.color = "var(--primary)"; }
      } else {
        showToast("Weather API: ACCESS DENIED (Invalid Key)", "error");
        const dWeather = document.getElementById('diag-weather');
        if (dWeather) { dWeather.textContent = "FAILED"; dWeather.style.color = "var(--danger)"; }
      }
    } catch (e) {
      showToast("Weather API: CONNECTION FAILED", "error");
    }

    // Test Gemini
    const geminiOk = await testGeminiKey(gKey);
    if (geminiOk) {
      showToast("Gemini Intel: AUTHENTICATED", "success");
      const dGemini = document.getElementById('diag-gemini');
      if (dGemini) { dGemini.textContent = "VERIFIED"; dGemini.style.color = "var(--primary)"; }
    } else {
      showToast("Gemini Intel: AUTHENTICATION FAILED", "error");
      const dGemini = document.getElementById('diag-gemini');
      if (dGemini) { dGemini.textContent = "FAILED"; dGemini.style.color = "var(--danger)"; }
    }
  });

  document.getElementById('sign-out-btn')?.addEventListener('click', () => {
    showToast("Terminating Secure Session...", "info");
    setTimeout(() => {
      document.getElementById('app').style.display = 'none';
      document.getElementById('auth-vault').style.display = 'flex';
      // Optional: Clear remember me if you want it strict
      // localStorage.removeItem('sovereign_operator');
    }, 1000);
  });

  document.getElementById('clear-cache-btn')?.addEventListener('click', async () => {
    showToast("Purging System & Service Worker Cache...", "info");
    localStorage.clear();
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
    }
    setTimeout(() => {
      location.reload(true);
    }, 1000);
  });

  // Final Refresh
  if (window.lucide) lucide.createIcons();
}

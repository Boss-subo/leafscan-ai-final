import { state } from '../core/state.js';
import { db } from '../core/db.js';
import { analyzeLeaf } from '../engines/analysis-logic.js';
import { startAutonomousMission, exportMissionJSON } from '../engines/fleet-engine.js';
import { switchTab } from './navigation.js';
import { sendMessage } from './chat.js';
import { exportToPDF } from '../services/pdf-export.js';
import { showToast } from '../core/utils.js';

export function setupEventListeners(elements) {
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

  document.getElementById('save-config')?.addEventListener('click', () => {
    const gKey = document.getElementById('gemini-key').value;
    const wKey = document.getElementById('weather-key').value;
    
    state.geminiKey = gKey;
    state.weatherKey = wKey;
    localStorage.setItem('gemini_key', gKey);
    localStorage.setItem('weather_key', wKey);
    
    document.getElementById('config-modal').style.display = 'none';
    showToast("Global Settings Synchronized. Re-initializing...", "success");
    
    // Force immediate refresh of all systems
    if (typeof window.bootstrap === 'function') {
      window.bootstrap();
    } else {
      location.reload(); // Fallback to refresh the page to apply keys
    }
  });

  // --- Chat Interactions ---
  const chatInput = document.getElementById('chat-input');
  const chatBtn = document.getElementById('send-chat');
  const chatContainer = document.getElementById('chat-messages');

  if (chatBtn && chatInput) {
    const triggerChat = () => {
      const text = chatInput.value.trim();
      if (text) {
        console.log("Triggering AI Pathologist for:", text);
        sendMessage(text, chatContainer);
        chatInput.value = '';
      }
    };

    chatBtn.onclick = triggerChat;
    chatInput.onkeypress = (e) => {
      if (e.key === 'Enter') triggerChat();
    };
    console.log("AI Pathologist Listeners Synchronized.");
  }

  document.getElementById('sign-out-btn')?.addEventListener('click', () => {
    showToast("Terminating Secure Session...", "info");
    setTimeout(() => {
      document.getElementById('app').style.display = 'none';
      document.getElementById('auth-vault').style.display = 'flex';
      // Optional: Clear remember me if you want it strict
      // localStorage.removeItem('sovereign_operator');
    }, 1000);
  });
}

import { state } from '../core/state.js';
import { db } from '../core/db.js';
import { initGlobalRiskChart, updateCharts } from './charts.js';
import { loadHistory } from './history.js';
import { loadInventory } from './inventory.js';
import { initMap } from './map.js';
import { loadReminders } from './reminders.js';
import { initChat } from './chat.js';
import { initProfile } from './profile.js';
import { initPlotsMap } from './plots.js';

export async function switchTab(tabId, elements) {
  if (!tabId) return;
  
  // 1. Update Navigation UI
  document.querySelectorAll('.nav-links li').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tabId);
  });
  
  document.querySelectorAll('.tab-content').forEach(c => {
    c.style.display = c.id === `${tabId}-tab` ? 'block' : 'none';
  });

  state.activeTab = tabId;

  // 2. Tab-specific data loading
  try {
    switch (tabId) {
      case 'dashboard':
        // Dashboard is default, but we can refresh weather here if needed
        break;
      case 'history':
        await loadHistory();
        break;
      case 'inventory':
        await loadInventory();
        break;
      case 'analytics':
        await updateCharts();
        break;
      case 'plots':
        initPlotsMap();
        // Double-Handshake: Force Leaflet to refresh twice during DOM transitions
        setTimeout(() => { if (state.map) state.map.invalidateSize(); }, 100);
        setTimeout(() => { if (state.map) state.map.invalidateSize(); }, 500);
        break;
      case 'reminders':
        await loadReminders();
        break;
      case 'chat':
        initChat();
        break;
      case 'command':
        initGlobalRiskChart();
        startSovereignIntelStream();
        break;
      case 'account':
        await initProfile();
        break;
    }
  } catch (err) {
    console.error(`Error loading tab ${tabId}:`, err);
  }

  // 3. Global UI Refresh (Lucide Icons)
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

export function initTelemetry() {
  const terminal = document.getElementById('telemetry-terminal');
  const iotMoisture = document.getElementById('iot-moisture');
  const iotPh = document.getElementById('iot-ph');
  
  const thoughts = [
    "Analyzing Arabica Leaf Vein patterns...",
    "IoT moisture sensor ping: STABLE",
    "Calculating Export Compliance Score...",
    "Global Elite Engine V3.0: STABLE",
    "Establishing secure handshake with Regional Specialist Models..."
  ];

  // Drive IoT Hub with realistic biological drift
  setInterval(() => {
    if (iotMoisture) {
      const current = parseFloat(iotMoisture.textContent) || 45;
      const drift = (Math.random() * 2 - 1).toFixed(1);
      iotMoisture.textContent = `${(parseFloat(current) + parseFloat(drift)).toFixed(1)}%`;
    }
    if (iotPh) {
      const current = parseFloat(iotPh.textContent) || 6.5;
      const drift = (Math.random() * 0.2 - 0.1).toFixed(2);
      iotPh.textContent = (parseFloat(current) + parseFloat(drift)).toFixed(2);
    }
  }, 5000);

  if (!terminal) return;
  setInterval(() => {
    const msg = thoughts[Math.floor(Math.random() * thoughts.length)];
    const time = new Date().toLocaleTimeString();
    terminal.innerHTML += `<br>[${time}] ${msg}`;
    terminal.scrollTop = terminal.scrollHeight;
  }, 8000);
}

export function updateTelemetry(msg) {
  const terminal = document.getElementById('telemetry-terminal');
  if (terminal) {
    const time = new Date().toLocaleTimeString();
    terminal.innerHTML += `<br>[${time}] ${msg}`;
    terminal.scrollTop = terminal.scrollHeight;
  }
}

export function startSovereignIntelStream() {
  const logEl = document.getElementById('sovereign-logs');
  if (!logEl || state.intelStreamInterval) return;

  const intelMessages = [
    "Analyzing spectral shift in Maharashtra cluster...",
    "Deep-Edge Sync: Node 824 verified.",
    "Pathogen spread velocity calculated: 4.2 km/h.",
    "Updating Jute Specialist weights (Delta: 0.02MB).",
    "Satellite anomaly detected: Sector 7G obscured.",
    "Autonomous mission LS-921 finalized in North Plot.",
    "Sovereign Moat Integrity: 100%.",
    "Cross-referencing soil pH with fungal latency..."
  ];

  state.intelStreamInterval = setInterval(() => {
    const msg = intelMessages[Math.floor(Math.random() * intelMessages.length)];
    const time = new Date().toLocaleTimeString();
    logEl.innerHTML += `<br>> [${time}] ${msg}`;
    logEl.scrollTop = logEl.scrollHeight;
    
    const pathogenLoad = document.getElementById('sov-pathogen-load');
    if (pathogenLoad) {
      const currentVal = parseFloat(pathogenLoad.textContent);
      const newVal = (currentVal + (Math.random() - 0.5)).toFixed(1);
      pathogenLoad.textContent = `${newVal}%`;
    }
  }, 3000);
}

// LeafScan AI - Main Entry Point (Elite v2.1)
import { state } from './core/state.js';
import { db } from './core/db.js';
import { fetchLocationAndAQI } from './services/weather-geo.js';
import { initCharts } from './ui/charts.js';
import { initTelemetry, switchTab } from './ui/navigation.js';
import { loadLocalModel } from './engines/ai-engine.js';
import { initCropSelector } from './engines/analysis-logic.js';
import { setupEventListeners } from './ui/events.js';
import { initAuth } from './ui/auth.js';
import { seedUserData } from './core/seed-data.js';

let elements = {};

function initElements() {
  elements = {
    // Navigation & Global
    currentLocText: document.getElementById('current-location'),
    tempMini: document.getElementById('weather-temp-mini'),
    aqiMini: document.getElementById('aqi-value-mini'),

    // Scanner
    video: document.getElementById('video-preview'),
    imagePreview: document.getElementById('image-preview'),
    fileInput: document.getElementById('file-input'),
    analyzeBtn: document.getElementById('analyze-btn'),
    captureBtn: document.getElementById('capture-btn'),
    uploadBtn: document.getElementById('upload-btn'),
    dropZone: document.getElementById('drop-zone'),

    // Results
    resultPanel: document.getElementById('result-panel'),
    downloadPdf: document.getElementById('download-pdf'),

    // Fleet
    dronePanel: document.getElementById('drone-fleet-command'),
    missionStatusText: document.getElementById('mission-status-text'),
    droneAlt: document.getElementById('drone-alt'),
    droneVel: document.getElementById('drone-vel'),
    exportMissionBtn: document.getElementById('export-mission-btn'),
    downloadMissionJson: document.getElementById('download-mission-json'),
    
    // Chat
    chatInput: document.getElementById('chat-input'),
    sendChatBtn: document.getElementById('send-chat'),
    chatMessages: document.getElementById('chat-messages'),
  };
  return elements;
}

async function bootstrap() {
  window.bootstrap = bootstrap; // Make available for re-init
  const els = initElements();

  // Initialize listeners
  setupEventListeners(els);

  // Start Services
  fetchLocationAndAQI(els);
  loadLocalModel();
  initCharts();
  initTelemetry();
  initCropSelector();

  switchTab('dashboard', els);
  
  // Refresh icons
  if (window.lucide) window.lucide.createIcons();
}

// Initial entry logic
document.addEventListener('DOMContentLoaded', () => {
  const splash = document.getElementById('splash-screen');
  const authVault = document.getElementById('auth-vault');
  const app = document.getElementById('app');

  // Step 1: Initialize Auth
  initAuth(async (user) => {
    // On Success: Hide Auth, Show Splash
    if (authVault) authVault.style.display = 'none';
    if (splash) {
      splash.style.display = 'flex';
      splash.style.opacity = '1';
    }

    state.currentUser = user;
    await seedUserData(user.id);

    // Step 2: Show App after splash
    setTimeout(() => {
      if (splash) splash.style.opacity = '0';
      setTimeout(() => {
        if (splash) splash.style.display = 'none';
        if (app) app.style.display = 'flex';
        bootstrap();
      }, 600);
    }, 2000);
  });

  // If already logged in (firebase state check is handled in initAuth)
  // We just wait for initAuth to trigger the callback
  
  // Show login vault initially
  if (authVault) authVault.style.display = 'flex';
  
  // Hide splash if it was visible
  if (splash) splash.style.display = 'none';
});

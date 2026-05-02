// LeafScan AI - Main Entry Point
import { state } from './core/state.js';
import { db } from './core/db.js';
import { fetchLocationAndAQI } from './services/weather-geo.js';
import { initCharts } from './ui/charts.js';
import { initTelemetry, switchTab } from './ui/navigation.js';
import { loadLocalModel } from './engines/ai-engine.js';
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

  // Important: Initialize listeners before async loads so buttons aren't dead during load
  setupEventListeners(els);

  // Start Services
  fetchLocationAndAQI(els);
  loadLocalModel();
  initCharts();
  initTelemetry();

  switchTab('dashboard', els);
}

// Landing Logic
(function initLanding() {
  const enterBtn = document.getElementById('enter-app-btn');
  const landingScreen = document.getElementById('landing-screen');
  const particlesContainer = document.getElementById('landing-particles');

  // Generate Particles
  if (particlesContainer) {
    for (let i = 0; i < 50; i++) {
      const p = document.createElement('div');
      p.className = 'landing-particle';
      p.style.left = Math.random() * 100 + 'vw';
      p.style.animationDelay = Math.random() * 8 + 's';
      p.style.opacity = Math.random() * 0.5 + 0.1;
      particlesContainer.appendChild(p);
    }
  }

  // Animate Stats (Numeric only)
  const stats = document.querySelectorAll('.landing-stat-value');
  stats.forEach(s => {
    const targetText = s.textContent.replace('+', '');
    const target = parseInt(targetText);
    if (isNaN(target)) return; // Skip non-numeric stats like "Fleet"

    let current = 0;
    const interval = setInterval(() => {
      if (current >= target) {
        s.textContent = target + (s.textContent.includes('+') ? '+' : '');
        clearInterval(interval);
      } else {
        current += Math.ceil(target / 20);
        s.textContent = current + (s.textContent.includes('+') ? '+' : '');
      }
    }, 50);
  });

  if (enterBtn) {
    enterBtn.addEventListener('click', () => {
      landingScreen.classList.add('exit');
      setTimeout(() => {
        landingScreen.style.display = 'none';
        const authVault = document.getElementById('auth-vault');
        if (authVault) {
          authVault.style.display = 'flex';
          initAuth(async (user) => {
            state.currentUser = user;
            
            const splash = document.getElementById('splash-screen');
            if (splash) {
              splash.style.display = 'flex';
              splash.style.opacity = '1';
            }
            
            // Seed demo data for new users
            await seedUserData(user.id);
            
            setTimeout(() => {
              if (splash) splash.style.opacity = '0';
              setTimeout(() => {
                if (splash) splash.style.display = 'none';
                document.getElementById('app').style.display = 'flex';
                bootstrap();
              }, 600);
            }, 2000);
          });
        } else {
          document.getElementById('app').style.display = 'flex';
          bootstrap();
        }
      }, 800);
    });
  }

  // Refresh Icons for Landing
  if (window.lucide) window.lucide.createIcons();
})();

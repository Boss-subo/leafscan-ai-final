import { db as localDb } from '../core/db.js';
import { state } from '../core/state.js';
import { showToast } from '../core/utils.js';
import { savePlotToCloud, loadPlotsFromCloud } from '../services/firebase.js';
import { updateMapMarkers } from './map.js';

export async function loadPlots() {
  const uid = state.currentUser?.id || state.currentUser?.uid;
  if (!uid) return;

  const container = document.getElementById('plots-grid');
  if (!container) return;

  container.innerHTML = '<div style="color:var(--text-muted); font-size:0.8rem; padding:1rem;">Syncing cloud plots...</div>';

  let plots = [];
  try {
    // Load from cloud (cross-device)
    plots = await loadPlotsFromCloud(uid);
  } catch (e) {
    console.warn("Cloud plots failed, loading local:", e);
    // Fallback to local
    plots = await localDb.plots.where('userId').equals(uid).toArray();
  }

  if (plots.length === 0) {
    container.innerHTML = '<div style="color:var(--text-muted); font-size:0.8rem; padding:1.5rem; text-align:center; border:1px dashed var(--glass-border); border-radius:12px;">No plots mapped yet. Click "New Field Plot" to start.</div>';
    return;
  }

  container.innerHTML = plots.map(p => `
    <div class="glass-card plot-card" style="padding: 1.25rem; margin-bottom: 1rem; border: 1px solid var(--glass-border); transition: all 0.3s ease;">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
        <div>
          <h4 style="font-size: 1.1rem; color: #fff;">${p.name}</h4>
          <span style="font-size: 0.7rem; color: var(--primary-light); text-transform: uppercase; letter-spacing: 1px;">${p.crop}</span>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 1.2rem; font-weight: 800; color: ${p.health > 80 ? 'var(--primary)' : 'var(--accent-gold)'};">${p.health}%</div>
          <small style="font-size: 0.6rem; color: var(--text-muted);">HEALTH</small>
        </div>
      </div>
      <div style="display: flex; gap: 10px; margin-top: 1rem;">
        <button class="btn btn-secondary" style="flex: 1; font-size: 0.7rem; padding: 0.5rem;" onclick="window.viewPlotOnMap(${p.lat}, ${p.lng})">
          <i data-lucide="map-pin" style="width:12px;"></i> LOCATE
        </button>
        <button class="btn" style="background: rgba(255,255,255,0.05); color: var(--text-muted); font-size: 0.7rem; padding: 0.5rem;">
          <i data-lucide="external-link" style="width:12px;"></i> DETAILS
        </button>
      </div>
    </div>
  `).join('');

  if (window.lucide) window.lucide.createIcons();
  
  // Update map markers
  updateMapMarkers(plots.map(p => ({ ...p, location: { lat: p.lat, lng: p.lng } })));
}

export async function addPlot() {
  const uid = state.currentUser?.id || state.currentUser?.uid;
  const name = prompt("Enter Field/Plot Name:", "North Sector A1");
  const crop = prompt("Enter Crop Type:", "Wheat");
  
  if (!name || !crop) return;

  // Mock location for demo, in real use we'd pick from map click
  const lat = 22.5726 + (Math.random() - 0.5) * 0.05;
  const lng = 88.3639 + (Math.random() - 0.5) * 0.05;
  const health = Math.floor(Math.random() * 20) + 80;

  const plot = {
    userId: uid,
    name,
    crop,
    lat,
    lng,
    health
  };

  showToast("Synchronizing plot with Sovereign Mesh...", "info");

  try {
    // 1. Save to Cloud
    await savePlotToCloud(uid, plot);
    
    // 2. Save to Local DB (fallback)
    await localDb.plots.add(plot);
    
    showToast("Plot Mapped & Synced Successfully!", "success");
    await loadPlots();
  } catch (e) {
    console.error(e);
    showToast("Sync Failed: " + e.message, "error");
  }
}

// Global helper for the Locate button
window.viewPlotOnMap = (lat, lng) => {
  if (state.map) {
    state.map.setView([lat, lng], 16);
    showToast("Centering Satellite Feed...", "info");
  }
};

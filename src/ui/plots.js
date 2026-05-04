/**
 * LEAFSCAN AI — FIELD MAPPING ENGINE v3.0
 * Full-featured plots tab: draw boundaries, disease heatmap,
 * satellite imagery, crop type management.
 */

// ─── STATE ────────────────────────────────────────────────────────────────────
const PlotsState = {
  map: null,
  plots: [],          // { id, name, crop, polygon, heatData, createdAt }
  activeLayer: null,
  drawnItems: null,
  heatLayer: null,
  drawControl: null,
  isDrawing: false,
  satelliteMode: false,
  baseLayers: {},
  selectedPlotId: null,
};

// ─── CROP OPTIONS ─────────────────────────────────────────────────────────────
const CROPS = [
  { value: 'wheat',   label: 'Wheat',      icon: '🌾', color: '#f59e0b' },
  { value: 'rice',    label: 'Rice',       icon: '🌾', color: '#10b981' },
  { value: 'cotton',  label: 'Cotton',     icon: '🌿', color: '#e2e8f0' },
  { value: 'sugarcane',label:'Sugarcane',  icon: '🎋', color: '#84cc16' },
  { value: 'maize',   label: 'Maize',      icon: '🌽', color: '#f97316' },
  { value: 'soybean', label: 'Soybean',    icon: '🫘', color: '#65a30d' },
  { value: 'tomato',  label: 'Tomato',     icon: '🍅', color: '#ef4444' },
  { value: 'other',   label: 'Other',      icon: '🌱', color: '#94a3b8' },
];

// ─── DISEASE RISK COLORS ──────────────────────────────────────────────────────
const RISK_GRADIENT = {
  0.0: 'rgba(16,185,129,0)',
  0.3: 'rgba(16,185,129,0.6)',
  0.5: 'rgba(245,158,11,0.7)',
  0.8: 'rgba(239,68,68,0.8)',
  1.0: 'rgba(185,28,28,1.0)',
};

// ─── INIT MAP ─────────────────────────────────────────────────────────────────
export function initPlotsMap() {
  if (PlotsState.map) return; // already initialized

  const container = document.getElementById('plot-map');
  if (!container) return;

  // Default center: India (good default for AgriTech)
  const map = L.map('plot-map', {
    center: [20.5937, 78.9629],
    zoom: 5,
    zoomControl: false,
  });

  // ── Base layers ──
  const streets = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { attribution: '© OpenStreetMap', maxZoom: 21 }
  );

  const satellite = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { attribution: '© Esri Satellite', maxZoom: 21 }
  );

  const hybrid = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    { attribution: '', maxZoom: 21, opacity: 0.7 }
  );

  streets.addTo(map);
  PlotsState.baseLayers = { streets, satellite, hybrid };

  // ── Custom zoom control ──
  L.control.zoom({ position: 'bottomright' }).addTo(map);

  // ── Drawn items layer ──
  const drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);

  // ── Draw control ──
  const drawControl = new L.Control.Draw({
    position: 'topright',
    draw: {
      polygon: {
        allowIntersection: false,
        showArea: true,
        shapeOptions: {
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.2,
          weight: 2,
        },
      },
      rectangle: {
        shapeOptions: {
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.2,
          weight: 2,
        },
      },
      polyline: false,
      circle: false,
      circlemarker: false,
      marker: false,
    },
    edit: {
      featureGroup: drawnItems,
      remove: true,
    },
  });

  map.addControl(drawControl);

  // ── Draw events ──
  map.on(L.Draw.Event.CREATED, (e) => {
    const layer = e.layer;
    drawnItems.addLayer(layer);
    openAddPlotModal(layer);
  });

  map.on(L.Draw.Event.DELETED, (e) => {
    e.layers.eachLayer((layer) => {
      const plot = PlotsState.plots.find(p => p._layer === layer);
      if (plot) deletePlot(plot.id, false);
    });
    renderPlotsList();
  });

  // ── Locate user ──
  map.locate({ setView: true, maxZoom: 13 });

  PlotsState.map = map;
  PlotsState.drawnItems = drawnItems;
  PlotsState.drawControl = drawControl;

  // Load saved plots
  loadPlotsFromStorage();
  renderPlotsList();
  setupPlotsUI();
}

// ─── MODAL: ADD PLOT ──────────────────────────────────────────────────────────
function openAddPlotModal(layer) {
  const modal = document.getElementById('add-plot-modal');
  if (!modal) return;

  modal.style.display = 'flex';
  modal.dataset.pendingLayer = 'true';
  PlotsState.activeLayer = layer;

  // Pre-fill area
  const area = calcArea(layer);
  const areaEl = document.getElementById('plot-area-display');
  if (areaEl) areaEl.textContent = area;

  // Focus name input
  setTimeout(() => document.getElementById('plot-name-input')?.focus(), 100);

  // Save handler
  document.getElementById('save-plot-btn').onclick = () => savePlot(layer);
  document.getElementById('cancel-plot-btn').onclick = () => {
    PlotsState.drawnItems.removeLayer(layer);
    modal.style.display = 'none';
  };
}

// ─── SAVE PLOT ─────────────────────────────────────────────────────────────────
function savePlot(layer) {
  const name = document.getElementById('plot-name-input')?.value.trim();
  const crop = document.getElementById('plot-crop-select')?.value;
  const modal = document.getElementById('add-plot-modal');

  if (!name) {
    document.getElementById('plot-name-input').style.borderColor = '#ef4444';
    return;
  }

  const cropData = CROPS.find(c => c.value === crop) || CROPS[7];
  const latlngs = getLayerLatLngs(layer);

  // Style layer with crop color
  layer.setStyle({
    color: cropData.color,
    fillColor: cropData.color,
    fillOpacity: 0.15,
    weight: 2,
  });

  const plot = {
    id: `plot_${Date.now()}`,
    name,
    crop,
    cropData,
    latlngs,
    area: calcArea(layer),
    heatData: generateMockHeatData(latlngs),
    createdAt: new Date().toISOString(),
    _layer: layer,
  };

  // Bind popup
  layer.bindPopup(buildPopupHTML(plot));
  layer.on('click', () => selectPlot(plot.id));

  PlotsState.plots.push(plot);
  savePlotsToStorage();
  renderPlotsList();

  if (modal) modal.style.display = 'none';
  document.getElementById('plot-name-input').value = '';

  // Show heatmap for new plot
  selectPlot(plot.id);
}

// ─── SELECT / FOCUS PLOT ──────────────────────────────────────────────────────
function selectPlot(id) {
  PlotsState.selectedPlotId = id;
  const plot = PlotsState.plots.find(p => p.id === id);
  if (!plot || !PlotsState.map) return;

  // Fly to plot
  const bounds = plot._layer.getBounds();
  PlotsState.map.flyToBounds(bounds, { padding: [60, 60], duration: 1.2 });

  // Show heatmap
  showHeatmap(plot);

  // Highlight in list
  document.querySelectorAll('.plot-item').forEach(el => el.classList.remove('active'));
  document.querySelector(`[data-plot-id="${id}"]`)?.classList.add('active');

  // Open popup
  plot._layer.openPopup();
}

// ─── HEATMAP ──────────────────────────────────────────────────────────────────
function showHeatmap(plot) {
  if (!PlotsState.map) return;
  
  if (PlotsState.heatLayer) {
    PlotsState.map.removeLayer(PlotsState.heatLayer);
    PlotsState.heatLayer = null;
  }

  if (!plot) return;

  if (!plot.heatData || plot.heatData.length === 0) {
    import('../core/utils.js').then(m => m.showToast("Synthesizing Satellite Risk Data...", "info"));
    return;
  }

  if (typeof L.heatLayer !== 'function') {
    console.error("LeafScan AI: Heatmap Plugin Handshake Failed.");
    import('../core/utils.js').then(m => m.showToast("Heatmap Engine Offline. Check Connection.", "error"));
    return;
  }

  PlotsState.heatLayer = L.heatLayer(plot.heatData, {
    radius: 25,
    blur: 20,
    maxZoom: 18,
    gradient: RISK_GRADIENT,
  }).addTo(PlotsState.map);
}

// Robust ID-based lookup for popup buttons
function showHeatmapByID(id) {
  const plot = PlotsState.plots.find(p => p.id === id);
  if (plot) showHeatmap(plot);
}

function generateMockHeatData(latlngs) {
  if (!latlngs || latlngs.length < 3) return [];
  const points = [];
  const bounds = L.latLngBounds(latlngs);
  const minLat = bounds.getSouth(), maxLat = bounds.getNorth();
  const minLng = bounds.getWest(), maxLng = bounds.getEast();

  for (let i = 0; i < 40; i++) {
    const lat = minLat + Math.random() * (maxLat - minLat);
    const lng = minLng + Math.random() * (maxLng - minLng);
    const intensity = Math.random();
    points.push([lat, lng, intensity]);
  }
  return points;
}

// ─── SATELLITE TOGGLE ─────────────────────────────────────────────────────────
export function toggleSatellite() {
  const { map, baseLayers } = PlotsState;
  if (!map) return;

  PlotsState.satelliteMode = !PlotsState.satelliteMode;

  if (PlotsState.satelliteMode) {
    map.removeLayer(baseLayers.streets);
    baseLayers.satellite.addTo(map);
    baseLayers.hybrid.addTo(map);
  } else {
    map.removeLayer(baseLayers.satellite);
    map.removeLayer(baseLayers.hybrid);
    baseLayers.streets.addTo(map);
  }

  const btn = document.getElementById('satellite-toggle-btn');
  if (btn) {
    btn.classList.toggle('active', PlotsState.satelliteMode);
    btn.innerHTML = PlotsState.satelliteMode
      ? '<i data-lucide="layers"></i> Street View'
      : '<i data-lucide="satellite"></i> Satellite';
    if (window.lucide) window.lucide.createIcons();
  }
}

// ─── DELETE PLOT ──────────────────────────────────────────────────────────────
function deletePlot(id, removeLayer = true) {
  const idx = PlotsState.plots.findIndex(p => p.id === id);
  if (idx === -1) return;

  const plot = PlotsState.plots[idx];
  if (removeLayer && plot._layer) {
    PlotsState.drawnItems.removeLayer(plot._layer);
  }

  PlotsState.plots.splice(idx, 1);
  savePlotsToStorage();
  renderPlotsList();

  if (PlotsState.heatLayer && PlotsState.selectedPlotId === id) {
    PlotsState.map.removeLayer(PlotsState.heatLayer);
    PlotsState.heatLayer = null;
  }
}

// ─── RENDER PLOTS LIST ────────────────────────────────────────────────────────
function renderPlotsList() {
  const grid = document.getElementById('plots-grid');
  if (!grid) return;

  if (PlotsState.plots.length === 0) {
    grid.innerHTML = `
      <div class="plots-empty-state">
        <div class="empty-icon">🗺️</div>
        <h3>No Plots Yet</h3>
        <p>Click <strong>New Plot</strong> or use the draw tool on the map to define your first field boundary.</p>
      </div>`;
    return;
  }

  grid.innerHTML = PlotsState.plots.map(plot => `
    <div class="plot-item ${plot.id === PlotsState.selectedPlotId ? 'active' : ''}"
         data-plot-id="${plot.id}"
         onclick="window.LeafScanPlots.selectPlot('${plot.id}')">
      <div class="plot-item-header">
        <div class="plot-crop-badge" style="background: ${plot.cropData.color}22; border-color: ${plot.cropData.color}44;">
          <span>${plot.cropData.icon}</span>
          <span style="color: ${plot.cropData.color}">${plot.cropData.label}</span>
        </div>
        <button class="plot-delete-btn" onclick="event.stopPropagation(); window.LeafScanPlots.deletePlot('${plot.id}')">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
      <h4 class="plot-name">${plot.name}</h4>
      <div class="plot-meta">
        <span><i data-lucide="maximize-2"></i> ${plot.area}</span>
        <span><i data-lucide="calendar"></i> ${new Date(plot.createdAt).toLocaleDateString('en-IN')}</span>
      </div>
      <div class="plot-risk-bar">
        <div class="risk-label">
          <span>Disease Risk</span>
          <span class="risk-pct" style="color: ${getRiskColor(plot.riskScore || 0.3)}">${Math.round((plot.riskScore || 0.3) * 100)}%</span>
        </div>
        <div class="risk-track">
          <div class="risk-fill" style="width: ${(plot.riskScore || 0.3) * 100}%; background: ${getRiskColor(plot.riskScore || 0.3)}"></div>
        </div>
      </div>
    </div>
  `).join('');

  if (window.lucide) window.lucide.createIcons();
}

// ─── POPUP HTML ───────────────────────────────────────────────────────────────
function buildPopupHTML(plot) {
  return `
    <div class="map-popup">
      <div class="popup-header">
        <span>${plot.cropData.icon}</span>
        <strong>${plot.name}</strong>
      </div>
      <div class="popup-row"><span>Crop:</span><span>${plot.cropData.label}</span></div>
      <div class="popup-row"><span>Area:</span><span>${plot.area}</span></div>
      <div class="popup-row"><span>Risk:</span><span style="color:${getRiskColor(plot.riskScore||0.3)}">${Math.round((plot.riskScore||0.3)*100)}%</span></div>
      <button onclick="window.LeafScanPlots.showHeatmapByID('${plot.id}')" class="popup-btn">View Heatmap</button>
    </div>`;
}

// ─── SETUP UI BUTTONS ─────────────────────────────────────────────────────────
function setupPlotsUI() {
  // New plot button triggers draw
  const addBtn = document.getElementById('add-plot-btn');
  if (addBtn) {
    addBtn.onclick = () => {
      // Trigger Leaflet.draw polygon tool
      new L.Draw.Polygon(PlotsState.map, PlotsState.drawControl.options.draw.polygon).enable();
    };
  }

  // Satellite toggle
  const satBtn = document.getElementById('satellite-toggle-btn');
  if (satBtn) satBtn.onclick = toggleSatellite;

  // Heatmap toggle
  const heatBtn = document.getElementById('heatmap-toggle-btn');
  if (heatBtn) {
    heatBtn.onclick = () => {
      if (PlotsState.heatLayer) {
        PlotsState.map.removeLayer(PlotsState.heatLayer);
        PlotsState.heatLayer = null;
        heatBtn.classList.remove('active');
      } else if (PlotsState.selectedPlotId) {
        const plot = PlotsState.plots.find(p => p.id === PlotsState.selectedPlotId);
        if (plot) { showHeatmap(plot); heatBtn.classList.add('active'); }
      }
    };
  }

  // Locate me
  const locBtn = document.getElementById('locate-me-btn');
  if (locBtn) {
    locBtn.onclick = () => PlotsState.map?.locate({ setView: true, maxZoom: 14 });
  }
}

// ─── STORAGE ──────────────────────────────────────────────────────────────────
function savePlotsToStorage() {
  const data = PlotsState.plots.map(p => ({
    id: p.id,
    name: p.name,
    crop: p.crop,
    cropData: p.cropData,
    latlngs: p.latlngs,
    area: p.area,
    heatData: p.heatData,
    riskScore: p.riskScore || 0.3,
    createdAt: p.createdAt,
  }));
  try { localStorage.setItem('leafscan_plots', JSON.stringify(data)); } catch(e) {}
}

function loadPlotsFromStorage() {
  try {
    const raw = localStorage.getItem('leafscan_plots');
    if (!raw) return;
    const data = JSON.parse(raw);

    data.forEach(p => {
      const layer = L.polygon(p.latlngs, {
        color: p.cropData?.color || '#10b981',
        fillColor: p.cropData?.color || '#10b981',
        fillOpacity: 0.15,
        weight: 2,
      });

      const plot = { ...p, cropData: p.cropData || CROPS[7], _layer: layer };
      plot._layer = layer;

      layer.bindPopup(buildPopupHTML(plot));
      layer.on('click', () => selectPlot(plot.id));

      PlotsState.drawnItems.addLayer(layer);
      PlotsState.plots.push(plot);
    });
  } catch(e) { console.warn('Could not load plots:', e); }
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
function calcArea(layer) {
  try {
    const latlngs = getLayerLatLngs(layer);
    if (!latlngs.length) return 'N/A';
    // Shoelace formula approximation
    let area = 0;
    const R = 6371000;
    for (let i = 0; i < latlngs.length; i++) {
      const j = (i + 1) % latlngs.length;
      const xi = latlngs[i][1] * Math.PI / 180;
      const xj = latlngs[j][1] * Math.PI / 180;
      const yi = latlngs[i][0] * Math.PI / 180;
      const yj = latlngs[j][0] * Math.PI / 180;
      area += (xj - xi) * (2 + Math.sin(yi) + Math.sin(yj));
    }
    area = Math.abs(area * R * R / 2);
    if (area < 10000) return `${Math.round(area)} m²`;
    return `${(area / 10000).toFixed(2)} ha`;
  } catch(e) { return 'N/A'; }
}

function getLayerLatLngs(layer) {
  const ll = layer.getLatLngs();
  const flat = Array.isArray(ll[0]) ? ll[0] : ll;
  return flat.map(p => [p.lat, p.lng]);
}

function getRiskColor(score) {
  if (score < 0.3) return '#10b981';
  if (score < 0.6) return '#f59e0b';
  return '#ef4444';
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────
window.LeafScanPlots = {
  init: initPlotsMap,
  selectPlot,
  deletePlot,
  showHeatmap,
  showHeatmapByID,
  toggleSatellite,
  getPlot: (id) => PlotsState.plots.find(p => p.id === id),
};

export { selectPlot, deletePlot, showHeatmap };

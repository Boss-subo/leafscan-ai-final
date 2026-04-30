import { state } from '../core/state.js';

export function initMap() {
  if (state.map) return;
  
  const mapEl = document.getElementById('plot-map');
  if (!mapEl) return;

  state.map = L.map('plot-map', {
    zoomControl: false,
    attributionControl: false
  }).setView([22.5726, 88.3639], 13);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 20
  }).addTo(state.map);

  // Add custom zoom control
  L.control.zoom({ position: 'bottomright' }).addTo(state.map);
  
  console.log("Sovereign Map Layer Synchronized.");
}

export function updateMapMarkers(plots) {
  if (!state.map) return;
  state.markers.forEach(m => state.map.removeLayer(m));
  state.markers = [];

  plots.forEach(plot => {
    if (plot.location) {
      const marker = L.marker([plot.location.lat, plot.location.lng]).addTo(state.map);
      marker.bindPopup(`<b>${plot.name}</b><br>${plot.crop}`);
      state.markers.push(marker);
    }
  });
}

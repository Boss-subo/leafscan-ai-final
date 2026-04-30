import { state } from '../core/state.js';
import { showToast } from '../core/utils.js';

export const WaypointEngine = {
  generateBoustrophedon: (polygonCoords) => {
    const latMin = Math.min(...polygonCoords.map(c => c[0]));
    const latMax = Math.max(...polygonCoords.map(c => c[0]));
    const lngMin = Math.min(...polygonCoords.map(c => c[1]));
    const lngMax = Math.max(...polygonCoords.map(c => c[1]));
    
    const steps = 6;
    const latStep = (latMax - latMin) / steps;
    const path = [];
    
    for (let i = 0; i <= steps; i++) {
      const lat = latMin + (i * latStep);
      if (i % 2 === 0) {
        path.push([lat, lngMin]);
        path.push([lat, lngMax]);
      } else {
        path.push([lat, lngMax]);
        path.push([lat, lngMin]);
      }
    }
    return path;
  }
};

export async function startAutonomousMission(polygonCoords, map, elements) {
  if (state.drone.interval) clearInterval(state.drone.interval);
  
  const path = WaypointEngine.generateBoustrophedon(polygonCoords);
  state.drone.path = path;
  state.drone.missionID = Math.floor(1000 + Math.random() * 9000);
  
  if (state.drone.polyline) map.removeLayer(state.drone.polyline);
  if (state.drone.marker) map.removeLayer(state.drone.marker);
  
  state.drone.polyline = L.polyline(path, {
    color: 'var(--primary)',
    weight: 2,
    dashArray: '5, 10',
    opacity: 0.8
  }).addTo(map);
  
  const droneIcon = L.divIcon({
    className: 'drone-icon-pulse',
    html: '<div style="background:var(--primary); width:12px; height:12px; border-radius:50%; border:2px solid white; box-shadow:0 0 15px var(--primary);"></div>',
    iconSize: [12, 12]
  });
  
  state.drone.marker = L.marker(path[0], { icon: droneIcon }).addTo(map);
  map.fitBounds(state.drone.polyline.getBounds(), { padding: [50, 50] });
  
  elements.dronePanel.style.display = 'block';
  elements.missionStatusText.textContent = `MISSION LS-${state.drone.missionID}: UPLOADING...`;
  showToast(`Drone Mission LS-${state.drone.missionID} Synchronized`, "success");
  
  let progress = 0;
  state.drone.interval = setInterval(() => {
    progress += 0.01;
    if (progress >= 1) {
      clearInterval(state.drone.interval);
      elements.missionStatusText.textContent = `MISSION LS-${state.drone.missionID}: COMPLETE`;
      showToast("Precision Spraying Mission Finalized", "success");
      return;
    }
    
    const pointCount = path.length - 1;
    const segment = Math.floor(progress * pointCount);
    const segmentProgress = (progress * pointCount) - segment;
    
    const p1 = path[segment];
    const p2 = path[segment + 1];
    
    const curLat = p1[0] + (p2[0] - p1[0]) * segmentProgress;
    const curLng = p1[1] + (p2[1] - p1[1]) * segmentProgress;
    
    state.drone.marker.setLatLng([curLat, curLng]);
    
    elements.missionStatusText.textContent = `MISSION LS-${state.drone.missionID}: EXECUTING`;
    elements.droneAlt.textContent = `${(10 + Math.sin(progress * 20) * 2).toFixed(1)} m`;
    elements.droneVel.textContent = `${(4.5 + Math.random() * 0.5).toFixed(1)} m/s`;
  }, 100);
}

export function exportMissionJSON() {
  const mission = {
    missionID: state.drone.missionID,
    timestamp: new Date().toISOString(),
    droneType: "DJI-T40-EQUIV",
    operation: "Precision Spraying",
    waypoints: state.drone.path.map((p, i) => ({
      id: i,
      lat: p[0],
      lng: p[1],
      alt: 10,
      action: i % 2 === 0 ? "SPRAY_ON" : "SPRAY_OFF"
    }))
  };
  
  const blob = new Blob([JSON.stringify(mission, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Drone_Mission_LS${state.drone.missionID}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

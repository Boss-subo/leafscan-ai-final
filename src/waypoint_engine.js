/**
 * LEAFSCAN APEX: WAYPOINT GENERATION ENGINE
 * Converts spatial risk polygons into actionable GPS missions for 
 * autonomous agricultural machinery (Drones/Tractors).
 */

const WaypointEngine = {
  /**
   * Generates a "Boustrophedon" (Zig-Zag) pattern inside a polygon.
   * @param {Array} polygon - Array of [lat, lng] points
   * @param {number} spacing - Spacing between spray rows in meters
   */
  generateMission(polygon, spacing = 5) {
    console.log("Generating Autonomous Mission Waypoints...");
    
    // 1. Calculate Bounds
    const lats = polygon.map(p => p[0]);
    const lngs = polygon.map(p => p[1]);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // 2. Generate Grid (Approximate lat/lng conversion for meters)
    const latDegreeInMeters = 111132;
    const lngDegreeInMeters = 40075000 * Math.cos(minLat * Math.PI / 180) / 360;
    
    const latStep = spacing / latDegreeInMeters;
    const waypoints = [];
    let reverse = false;

    for (let lat = minLat; lat <= maxLat; lat += latStep) {
      const row = [];
      // Simple scanline approach
      for (let lng = minLng; lng <= maxLng; lng += (spacing / lngDegreeInMeters)) {
        if (this.isPointInPolygon([lat, lng], polygon)) {
          row.push({ lat, lng, alt: 3, action: "SPRAY_ON" });
        }
      }

      if (row.length > 0) {
        if (reverse) row.reverse();
        waypoints.push(...row);
        reverse = !reverse;
      }
    }

    return {
      missionID: `LS-${Date.now()}`,
      exportDate: new Date().toISOString(),
      totalPoints: waypoints.length,
      estimatedDuration: Math.round(waypoints.length * 0.5), // Approx seconds
      waypoints: waypoints
    };
  },

  /**
   * Ray-casting algorithm for point-in-polygon test
   */
  isPointInPolygon(point, polygon) {
    const x = point[0], y = point[1];
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0], yi = polygon[i][1];
      const xj = polygon[j][0], yj = polygon[j][1];
      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  },

  /**
   * Triggers a browser download for the mission file
   */
  exportGPX(mission) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mission, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `drone_mission_${mission.missionID}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }
};

export default WaypointEngine;

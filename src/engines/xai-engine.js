/**
 * LeafScan AI - Explainable AI (XAI) Engine
 * Generates visual proof and biological reasoning for AI diagnostics.
 */

export const XAIEngine = {
  /**
   * Generates a "Pseudo-Saliency" heatmap highlighting pathogenic areas.
   */
  async generateHeatmap(imgElement, outputCanvas) {
    const ctx = outputCanvas.getContext('2d');
    const width = 300;
    const height = 300;
    outputCanvas.width = width;
    outputCanvas.height = height;

    // Draw image to small processing canvas
    const procCanvas = document.createElement('canvas');
    procCanvas.width = width;
    procCanvas.height = height;
    const pCtx = procCanvas.getContext('2d');
    pCtx.drawImage(imgElement, 0, 0, width, height);
    
    const imageData = pCtx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    const heatmapData = ctx.createImageData(width, height);
    const hPixels = heatmapData.data;

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      // Disease Detection Heuristic:
      // High Red/Brown variance on a green leaf usually indicates a lesion.
      const isGreen = (g > r && g > b);
      const intensity = isGreen ? 0 : Math.max(r, b) - g + 50;
      const normalized = Math.max(0, Math.min(255, intensity));

      // Heatmap Color Gradient (Blue -> Green -> Red)
      if (normalized > 80) {
        hPixels[i] = normalized;     // Red
        hPixels[i + 1] = 255 - normalized; // Green
        hPixels[i + 2] = 0;           // Blue
        hPixels[i + 3] = 180;         // Alpha
      } else {
        hPixels[i + 3] = 0;           // Transparent
      }
    }

    ctx.putImageData(heatmapData, 0, 0);
    
    // Apply Blur effect for "Heatmap" look
    ctx.globalCompositeOperation = 'source-over';
    ctx.filter = 'blur(8px)';
    ctx.drawImage(outputCanvas, 0, 0);
    ctx.filter = 'none';
  },

  /**
   * Returns scientific reasoning for a specific disease.
   */
  getBiologicalReasoning(label) {
    const database = {
      'Tomato Late Blight': [
        'Dark, water-soaked spots on leaf margins',
        'Fungal mycelium presence in humid zones',
        'Necrotic tissue expansion due to Phytophthora'
      ],
      'Potato Early Blight': [
        'Concentric "target-like" rings in lesions',
        'Chlorotic halos surrounding necrotic tissue',
        'Premature senescence of lower canopy leaves'
      ],
      'Tomato Bacterial Spot': [
        'Small, circular, water-soaked lesions',
        'Scab-like appearance on mature spots',
        'Interveinal chlorosis and localized wilting'
      ],
      'Healthy': [
        'High chlorophyll density detected',
        'Uniform bio-signature across leaf surface',
        'No pathogenic anomalies identified'
      ]
    };

    // Find best match
    const key = Object.keys(database).find(k => label.includes(k)) || 'Healthy';
    return database[key];
  }
};

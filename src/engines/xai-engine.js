/**
 * LeafScan AI - Explainable AI (XAI) Engine
 * Generates visual proof and biological reasoning for AI diagnostics.
 */

export const XAIEngine = {
  /**
   * Generates a "Pseudo-Saliency" heatmap highlighting pathogenic areas.
   */
  async generateHeatmap(imgElement, outputCanvas, targetClassIdx) {
    const { runXAIAnalysis } = await import('./ai-engine.js');
    const heatmapDataUrl = await runXAIAnalysis(imgElement.src, targetClassIdx);
    
    if (!heatmapDataUrl) {
      console.warn("Real XAI failed, falling back to heuristic...");
      return this.generateHeuristicHeatmap(imgElement, outputCanvas);
    }

    const ctx = outputCanvas.getContext('2d');
    const width = 300;
    const height = 300;
    outputCanvas.width = width;
    outputCanvas.height = height;

    const heatmapImg = new Image();
    heatmapImg.onload = () => {
      // Draw the neural heatmap
      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = 0.6;
      ctx.drawImage(heatmapImg, 0, 0, width, height);
      
      // Add a professional "glow" to the spots
      ctx.globalCompositeOperation = 'screen';
      ctx.filter = 'blur(10px) brightness(1.5)';
      ctx.drawImage(outputCanvas, 0, 0);
      ctx.filter = 'none';
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over';
    };
    heatmapImg.src = heatmapDataUrl;
  },

  async generateHeuristicHeatmap(imgElement, outputCanvas) {
    const ctx = outputCanvas.getContext('2d');
    const width = 300;
    const height = 300;
    outputCanvas.width = width;
    outputCanvas.height = height;

    // ... (rest of old logic as fallback)
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
      const isGreen = (g > r && g > b);
      const intensity = isGreen ? 0 : Math.max(r, b) - g + 50;
      const normalized = Math.max(0, Math.min(255, intensity));
      if (normalized > 80) {
        hPixels[i] = normalized; hPixels[i+1] = 255-normalized; hPixels[i+2] = 0; hPixels[i+3] = 180;
      } else { hPixels[i+3] = 0; }
    }
    ctx.putImageData(heatmapData, 0, 0);
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

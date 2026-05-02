import { state } from '../core/state.js';
import { db } from '../core/db.js';
import { updateTelemetry } from '../ui/navigation.js';
import { showToast, getTreatment } from '../core/utils.js';
import { runLocalInference, runVMSAnalysis } from './ai-engine.js';
import { XAIEngine } from './xai-engine.js';
import { EconomicEngine } from './economic-engine.js';

export async function analyzeLeaf(elements) {
  const image = state.currentImage;
  if (!image) {
    showToast("No sample image selected.", "error");
    return;
  }

  // UI Setup
  elements.resultPanel.style.display = 'block';
  elements.analyzeBtn.style.display = 'none';
  const cotOverlay = document.getElementById('cot-visualizer');
  if (cotOverlay) cotOverlay.style.display = 'flex';
  
  try {
    const steps = [
      document.getElementById('cot-step-1'),
      document.getElementById('cot-step-2'),
      document.getElementById('cot-step-3'),
      document.getElementById('cot-step-4')
    ];
    
    steps.forEach(s => s?.classList.remove('active'));
    
    // Step 1: Matrix Isolation
    updateTelemetry("Sovereign Routing: Isolating Biological Matrix...");
    steps[0]?.classList.add('active');
    await new Promise(r => setTimeout(r, 800));
    
    // Step 2: Edge Inference
    updateTelemetry("Deep-Edge AI: Running Local Inference...");
    steps[1]?.classList.add('active');
    const localResult = await runLocalInference(image);
    await new Promise(r => setTimeout(r, 800));
    
    // Step 3: VMS Sweep (if enabled)
    let vmsData = null;
    if (state.vmsEnabled) {
      updateTelemetry("Initiating Virtual Multi-Spectral Sweep...");
      steps[2]?.classList.add('active');
      vmsData = await runVMSAnalysis(image);
    }
    await new Promise(r => setTimeout(r, 800));
    
    // Step 4: Finalize
    steps[3]?.classList.add('active');
    await new Promise(r => setTimeout(r, 500));
    if (cotOverlay) cotOverlay.style.display = 'none';

    if (localResult) {
      const confidence = Math.round(localResult.confidence * 100);
      const treatment = getTreatment(localResult.label);
      
      // Render Results
      const resultContent = document.getElementById('result-content');
      if (resultContent) {
        resultContent.innerHTML = `
          <div class="glass-card" style="border-left: 4px solid var(--primary); padding: 1.5rem;">
            <h3 style="color:var(--primary); margin-bottom:1rem;">${localResult.label}</h3>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
              <div class="stat-card">
                <small>CONFIDENCE</small>
                <div style="font-size:1.5rem; font-weight:800;">${confidence}%</div>
              </div>
              <div class="stat-card">
                <small>HEALTH INDEX</small>
                <div style="font-size:1.5rem; font-weight:800;">${100 - (vmsData?.stress || 0)}%</div>
              </div>
            </div>
            <div style="margin-top:1.5rem;">
              <h4 style="font-size:0.75rem; color:var(--text-muted); margin-bottom:0.5rem;">RECOMMENDED TREATMENT</h4>
              <p>${treatment?.action || "No specific treatment required."}</p>
            </div>
          </div>
        `;
      }

      // XAI Heatmap
      const heatmapCanvas = document.getElementById('xai-heatmap');
      if (heatmapCanvas) {
        heatmapCanvas.style.opacity = '1';
        XAIEngine.generateHeatmap(elements.imagePreview, heatmapCanvas, localResult.classIdx);
      }

      // Save to History
      await db.history.add({
        userId: state.currentUser?.id,
        timestamp: new Date(),
        image: image,
        diseaseName: localResult.label,
        confidence: confidence,
        vms: vmsData
      });

      showToast(`Sovereign Diagnosis Complete: ${localResult.label}`, "success");
    }
  } catch (err) {
    console.error("Analysis failed", err);
    showToast("Diagnostic Error: See Console", "error");
    if (cotOverlay) cotOverlay.style.display = 'none';
  }
}

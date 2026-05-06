import { state } from '../core/state.js';
import { db } from '../core/db.js';
import { updateTelemetry } from '../ui/navigation.js';
import { showToast, getTreatment } from '../core/utils.js';
import { runLocalInference, runVMSAnalysis, runXAIAnalysis } from './ai-engine.js';
import { saveHistoryToCloud } from '../services/firebase.js';

/**
 * Initializes the Crop Specialist Selector UI
 */
export function initCropSelector() {
  const chips = document.querySelectorAll('.crop-chip');
  const hint = document.getElementById('crop-hint');
  
  if (!state.selectedCrop) state.selectedCrop = 'Wheat'; // Default specialist

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      
      const crop = chip.dataset.crop;
      state.selectedCrop = crop;
      
      if (hint) {
        hint.textContent = `${crop} Specialist activated — Initializing neural weights...`;
        hint.classList.add('pulse');
        setTimeout(() => hint.classList.remove('pulse'), 1000);
      }
      
      showToast(`${crop} Specialist Loaded`, "info");
    });
  });
}

/**
 * Executes the Multi-Tier Diagnostic Protocol
 */
export async function analyzeLeaf(elements) {
  const image = state.currentImage;
  if (!image) {
    showToast("No sample image selected.", "error");
    return;
  }

  // UI Handshake
  elements.resultPanel.style.display = 'block';
  elements.analyzeBtn.style.display = 'none';
  const cotOverlay = document.getElementById('cot-visualizer');
  if (cotOverlay) cotOverlay.style.display = 'flex';
  
  try {
    // 1. Neural Matrix Isolation
    updateTelemetry("Isolating Biological Matrix...");
    await new Promise(r => setTimeout(r, 600));
    
    // 2. High-Precision Specialist Inference
    updateTelemetry(`Specialist Inference: Analyzing ${state.selectedCrop}...`);
    const localResult = await runLocalInference(image);
    
    // 3. VMS Stress Sweep
    updateTelemetry("Initiating Multi-Spectral Stress Sweep...");
    const vmsData = await runVMSAnalysis(image);
    
    if (cotOverlay) cotOverlay.style.display = 'none';

    if (localResult) {
      // ─── NEURAL SECURITY HANDLING ───
      
      if (localResult.status === 'rejected') {
        renderInconclusive(localResult.message);
        return;
      }

      const confidence = Math.round(localResult.confidence * 100);
      const treatment = getTreatment(localResult.label);
      
      // Render Elite Results
      renderResults(localResult, confidence, vmsData, treatment);

      // 4. XAI Heatmap Generation
      updateTelemetry("Generating Explainable AI Heatmap...");
      const heatmapData = await runXAIAnalysis(image, localResult.classIdx);
      if (heatmapData) {
        const heatmapImg = document.getElementById('xai-heatmap-img') || document.createElement('img');
        heatmapImg.id = 'xai-heatmap-img';
        heatmapImg.src = heatmapData;
        heatmapImg.className = 'heatmap-overlay';
        
        const container = document.querySelector('.scanner-viewport');
        if (container) {
            // Remove old heatmap if exists
            const old = document.getElementById('xai-heatmap-img');
            if (old) old.remove();
            container.appendChild(heatmapImg);
        }
      }

      // 5. Data Persistence
      const uid = state.currentUser?.id || state.currentUser?.uid;
      const historyRecord = {
        userId: uid,
        timestamp: new Date(),
        image: image,
        crop: state.selectedCrop,
        diseaseName: localResult.label,
        confidence: confidence,
        vms: vmsData,
        status: localResult.status
      };

      await db.history.add(historyRecord);
      try {
        await saveHistoryToCloud(uid, historyRecord);
      } catch(e) { console.warn('Cloud sync delayed:', e); }

      showToast(`Diagnosis Complete: ${localResult.label}`, "success");
    }
  } catch (err) {
    console.error("Diagnostic Failure", err);
    showToast("Error: System Malfunction", "error");
    if (cotOverlay) cotOverlay.style.display = 'none';
  }
}

function renderResults(result, confidence, vms, treatment) {
  const resultContent = document.getElementById('result-content');
  const diseaseTitle = document.getElementById('disease-name');
  
  if (diseaseTitle) diseaseTitle.textContent = result.label;

  if (resultContent) {
    resultContent.innerHTML = `
      <div class="result-card ${result.status}">
        <div class="result-header">
          <span class="status-badge">${result.status.toUpperCase()}</span>
          ${result.status === 'warning' ? `<p class="warning-msg">${result.message}</p>` : ''}
        </div>
        
        <div class="result-stats">
          <div class="stat-item">
            <label>AI CONFIDENCE</label>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${confidence}%"></div>
            </div>
            <span>${confidence}%</span>
          </div>
          <div class="stat-item">
            <label>VMS STRESS</label>
            <div class="progress-bar">
              <div class="progress-fill stress" style="width: ${vms.stress}%"></div>
            </div>
            <span>${vms.stress}%</span>
          </div>
        </div>

        <div class="treatment-box">
          <h4><i data-lucide="shield-check"></i> RECOMMENDED ACTION</h4>
          <p>${treatment?.action || "No immediate action required. Maintain monitoring."}</p>
        </div>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  }
}

function renderInconclusive(message) {
  const resultContent = document.getElementById('result-content');
  if (resultContent) {
    resultContent.innerHTML = `
      <div class="result-card rejected">
        <div class="rejected-icon"><i data-lucide="alert-triangle"></i></div>
        <h3>INCONCLUSIVE SCAN</h3>
        <p>${message}</p>
        <button class="btn btn-secondary" onclick="location.reload()" style="margin-top:1rem; width:100%;">RETRY SCAN</button>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  }
}

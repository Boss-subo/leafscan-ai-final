import { state } from '../core/state.js';
// History save - safe wrapper
const saveToHistory = async (data) => {
  try {
    if (window.db?.saveToHistory) await window.db.saveToHistory(data);
    else if (window.addScanToHistory) await window.addScanToHistory(data);
  } catch(e) { console.warn('History save skipped:', e); }
};

import { updateTelemetry } from '../ui/navigation.js';
import { showToast, getTreatment } from '../core/utils.js';
import { runLocalInference, runVMSAnalysis, runXAIAnalysis, CROP_SPECIALISTS } from './ai-engine.js';
import { saveHistoryToCloud } from '../services/firebase.js';

// Clean label display
const cleanLabel = (label) => label.replace(/___/g, ' - ').replace(/_/g, ' ');

/**
 * Programmatically selects a crop specialist
 * @param {string} crop - The crop name (Tomato, Wheat, etc)
 * @param {HTMLElement} chip - Optional chip element to activate
 */
export function selectCrop(crop, chip) {
  state.selectedCrop = crop;
  
  // UI Sync
  const chips = document.querySelectorAll('.crop-chip');
  chips.forEach(c => c.classList.remove('active'));
  
  if (chip) {
    chip.classList.add('active');
  } else {
    // Find chip by data attribute if element not provided
    const target = document.querySelector(`.crop-chip[data-crop="${crop}"]`);
    if (target) target.classList.add('active');
  }

  const hint = document.getElementById('crop-hint');
  if (hint) {
    hint.textContent = `${crop} Specialist activated — Initializing neural weights...`;
    hint.classList.add('pulse');
    setTimeout(() => hint.classList.remove('pulse'), 1000);
  }
  
  showToast(`${crop} Specialist Loaded`, "info");
}

/**
 * Initializes the Crop Specialist Selector UI
 */
export function initCropSelector() {
  const container = document.querySelector('.crop-chips');
  if (!container) return;

  // Clear hardcoded chips
  container.innerHTML = '';

  // Get all registered crops from our Elite Registry
  const crops = Object.keys(CROP_SPECIALISTS || {});
  
  // Create search bar if not present
  if (!document.getElementById('crop-search')) {
    const searchWrap = document.createElement('div');
    searchWrap.className = 'input-wrapper';
    searchWrap.style.marginBottom = '1rem';
    searchWrap.innerHTML = `
      <i data-lucide="search" style="position:absolute; left:1rem; top:50%; transform:translateY(-50%); color:#64748b; font-size:14px;"></i>
      <input type="text" id="crop-search" placeholder="Search 102 Specialists (e.g. Rice, Mango, Amla)..." 
             style="width:100%; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:0.6rem 1rem 0.6rem 2.8rem; color:white; font-size:0.8rem; outline:none;">
    `;
    container.parentNode.insertBefore(searchWrap, container);
    
    // Wire up search
    document.getElementById('crop-search').addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      document.querySelectorAll('.crop-chip').forEach(chip => {
        const match = chip.dataset.crop.toLowerCase().includes(term);
        chip.style.display = match ? 'inline-block' : 'none';
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }

  // Render all chips
  crops.forEach(cropId => {
    const specialist = CROP_SPECIALISTS[cropId];
    const chip = document.createElement('div');
    chip.className = 'crop-chip';
    if (state.selectedCrop?.toLowerCase() === cropId) chip.classList.add('active');
    chip.dataset.crop = specialist.model;
    
    // Add emoji based on name if possible
    let icon = '🌱';
    if (cropId.includes('wheat')) icon = '🌾';
    if (cropId.includes('tomato')) icon = '🍅';
    if (cropId.includes('corn')) icon = '🌽';
    if (cropId.includes('apple')) icon = '🍎';
    if (cropId.includes('rice')) icon = '🍚';
    if (cropId.includes('mango')) icon = '🥭';
    if (cropId.includes('potato')) icon = '🥔';
    if (cropId.includes('banana')) icon = '🍌';
    if (cropId.includes('grape')) icon = '🍇';

    chip.textContent = `${icon} ${specialist.model}`;
    
    chip.addEventListener('click', () => selectCrop(specialist.model, chip));
    container.appendChild(chip);
  });

  if (!state.selectedCrop) {
    state.selectedCrop = 'Wheat';
    const firstChip = container.querySelector('[data-crop="Wheat"]');
    if (firstChip) firstChip.classList.add('active');
  }

  // Expose global bridge for console testing
  window.LeafScanAnalysis = { selectCrop };
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

      await saveToHistory(historyRecord);
      try {
        await saveHistoryToCloud(uid, historyRecord);
      } catch(e) { console.warn('Cloud sync delayed:', e); }

      showToast(`Diagnosis Complete: ${cleanLabel(localResult.label)}`, "success");
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
  
  if (diseaseTitle) diseaseTitle.textContent = cleanLabel(result.label);

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

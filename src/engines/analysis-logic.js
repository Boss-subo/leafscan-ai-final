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
 * Initializes the Dynamic Crop Specialist Selector UI
 */
export function initCropSelector() {
  const container = document.querySelector('.crop-chips');
  if (!container) return;

  // 1. Add Neural Filter (Search Bar)
  const parent = document.querySelector('.crop-selector-container');
  if (parent && !document.getElementById('crop-search')) {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'crop-search';
    searchInput.placeholder = '🔍 Search 102 Specialists...';
    searchInput.className = 'crop-search-input';
    parent.insertBefore(searchInput, container);

    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      const chips = document.querySelectorAll('.crop-chip');
      chips.forEach(chip => {
        const crop = chip.dataset.crop.toLowerCase();
        chip.style.display = crop.includes(term) ? 'flex' : 'none';
      });
    });
  }

  // 2. Clear hardcoded chips
  container.innerHTML = '';

  // 3. Generate 102 Elite Chips
  const crops = Object.keys(CROP_SPECIALISTS).sort();
  
  crops.forEach(cropId => {
    const spec = CROP_SPECIALISTS[cropId];
    const chip = document.createElement('div');
    chip.className = 'crop-chip';
    chip.dataset.crop = spec.model;
    
    // Add icon based on crop name (simple mapping or default)
    const icon = getCropEmoji(spec.model);
    chip.innerHTML = `${icon} ${spec.model}`;
    
    if (state.selectedCrop === spec.model) chip.classList.add('active');

    chip.addEventListener('click', () => {
      selectCrop(spec.model, chip);
    });

    container.appendChild(chip);
  });

  if (!state.selectedCrop) {
    state.selectedCrop = 'Wheat';
    const wheatChip = container.querySelector('[data-crop="Wheat"]');
    if (wheatChip) wheatChip.classList.add('active');
  }

  // Expose global bridge
  window.LeafScanAnalysis = { selectCrop };
}

function getCropEmoji(name) {
  const map = {
    'Apple': '🍎', 'Banana': '🍌', 'Corn': '🌽', 'Grape': '🍇', 'Rice': '🌾',
    'Tomato': '🍅', 'Wheat': '🌾', 'Potato': '🥔', 'Orange': '🍊', 'Lemon': '🍋',
    'Mango': '🥭', 'Strawberry': '🍓', 'Pineapple': '🍍', 'Coffee': '☕', 'Tea': '🍵'
  };
  return map[name] || '🌿';
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

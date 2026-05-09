/**
 * LEAFSCAN — UI FIXES
 * Fixes: analyze button state, crop search filter, loading states
 */

// ── ANALYZE BUTTON STATE ──────────────────────────────────────────
export function setAnalyzeReady(ready) {
  const btn = document.getElementById('analyze-btn');
  if (!btn) return;

  if (ready) {
    btn.disabled = false;
    btn.style.display = 'flex';
    btn.style.opacity = '1';
    btn.style.cursor = 'pointer';
    btn.style.pointerEvents = 'auto';
    btn.style.width = '100%';
    btn.style.marginTop = '1rem';
  } else {
    btn.disabled = true;
    btn.style.opacity = '0.45';
    btn.style.cursor = 'not-allowed';
    btn.style.pointerEvents = 'none';
  }
}

// ── CROP CHIP SEARCH FILTER ───────────────────────────────────────
window.filterCropChips = function(query) {
  const chips = document.querySelectorAll('#crop-chips-container .crop-chip, .crop-chips .crop-chip');
  const q = query.toLowerCase().trim();

  chips.forEach(chip => {
    const cropName = (chip.dataset.crop || chip.textContent || '').toLowerCase();
    if (!q || cropName.includes(q)) {
      chip.classList.remove('hidden');
    } else {
      chip.classList.add('hidden');
    }
  });

  const visible = [...chips].filter(c => !c.classList.contains('hidden'));
  const container = document.querySelector('#crop-chips-container, .crop-chips');
  const noResults = document.getElementById('crop-no-results');

  if (visible.length === 0 && q) {
    if (!noResults && container) {
      const msg = document.createElement('p');
      msg.id = 'crop-no-results';
      msg.style.cssText = 'font-size:0.75rem;color:#475569;padding:0.5rem 0;font-style:italic;';
      msg.textContent = `No specialist found for "${query}"`;
      container.appendChild(msg);
    }
  } else {
    noResults?.remove();
  }
};

// ── SPECIALIST LOADING STATE ──────────────────────────────────────
export function setSpecialistLoading(cropName) {
  const hint = document.getElementById('crop-hint');
  if (!hint) return;
  hint.textContent = `Loading ${cropName} specialist...`;
  hint.className = 'crop-hint loading';
}

export function setSpecialistReady(cropName, classCount) {
  const hint = document.getElementById('crop-hint');
  if (!hint) return;
  hint.textContent = `${cropName} Specialist active — detecting ${classCount} conditions`;
  hint.className = 'crop-hint';
}

export function setSpecialistError(cropName) {
  const hint = document.getElementById('crop-hint');
  if (!hint) return;
  hint.textContent = `Failed to load ${cropName} specialist. Check model files.`;
  hint.className = 'crop-hint';
  hint.style.color = '#ef4444';
}

// ── IMAGE LOAD LISTENERS ──────────────────────────────────────────
export function setupImageListeners() {
  const fileInput = document.getElementById('file-input');
  const uploadBtn = document.getElementById('upload-btn');
  const imagePreview = document.getElementById('image-preview');

  fileInput?.addEventListener('change', (e) => {
    if (e.target.files?.length > 0) {
      setAnalyzeReady(true);
    }
  });

  uploadBtn?.addEventListener('click', () => {
    fileInput?.click();
  });

  imagePreview?.addEventListener('load', () => {
    if (imagePreview.src && imagePreview.src !== window.location.href) {
      setAnalyzeReady(true);
      imagePreview.style.display = 'block';
      const dropZone = document.getElementById('drop-zone');
      if (dropZone) dropZone.style.display = 'none';
    }
  });

  document.getElementById('reset-scan-btn')?.addEventListener('click', () => {
    setAnalyzeReady(false);
    if (imagePreview) {
      imagePreview.style.display = 'none';
      imagePreview.src = '';
    }
    const dropZone = document.getElementById('drop-zone');
    if (dropZone) dropZone.style.display = 'flex';
    const resultPanel = document.getElementById('result-panel');
    if (resultPanel) resultPanel.style.display = 'none';
  });
}

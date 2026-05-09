/**
 * LEAFSCAN — HISTORY TAB RENDERER
 * Add to src/ui/history.js (new file)
 * Import and call initHistoryTab() when history tab opens
 */

import { loadHistory, clearHistory, deleteScan } from '../core/db.js';

// ── INIT ──────────────────────────────────────────────────────────
export async function initHistoryTab() {
  const grid = document.getElementById('history-grid');
  if (!grid) return;

  grid.innerHTML = `
    <div class="history-loading" style="grid-column:1/-1;text-align:center;padding:3rem;color:#475569;">
      <div style="font-size:1.5rem;margin-bottom:0.5rem">⏳</div>
      <p style="font-size:0.85rem;">Loading diagnostic logs...</p>
    </div>`;

  const records = await loadHistory();
  renderHistory(records);

  // Wire clear button
  document.getElementById('clear-history')?.addEventListener('click', async () => {
    if (!confirm('Clear all scan history?')) return;
    await clearHistory();
    renderHistory([]);
  });
}

// ── RENDER ────────────────────────────────────────────────────────
function renderHistory(records) {
  const grid = document.getElementById('history-grid');
  if (!grid) return;

  if (!records || records.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <i data-lucide="folder-open"></i>
        <p style="margin-top:1rem;font-size:0.9rem;">No diagnostic logs found.</p>
        <p style="font-size:0.8rem;color:#475569;margin-top:0.5rem;">
          Run a scan to start building your history.
        </p>
      </div>`;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  grid.innerHTML = records.map(record => buildHistoryCard(record)).join('');
  if (window.lucide) window.lucide.createIcons();
}

// ── CARD BUILDER ──────────────────────────────────────────────────
function buildHistoryCard(record) {
  const isHealthy = record.label?.toLowerCase().includes('healthy');
  const confPct   = Math.round((record.confidence || 0) * 100);
  const riskColor = isHealthy ? '#10b981'
    : confPct > 90 ? '#ef4444' : '#f59e0b';

  const date = new Date(record.timestamp);
  const dateStr = date.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
  const timeStr = date.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit'
  });

  const cleanLabel = (record.label || 'Unknown')
    .replace(/___/g, ' - ')
    .replace(/_/g, ' ');

  const thumbnail = record.thumbnail
    ? `<img src="${record.thumbnail}" 
           style="width:56px;height:56px;border-radius:10px;object-fit:cover;
                  border:1px solid rgba(255,255,255,0.08);flex-shrink:0;">`
    : `<div style="width:56px;height:56px;border-radius:10px;
                   background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.15);
                   display:flex;align-items:center;justify-content:center;
                   font-size:1.5rem;flex-shrink:0;">🌿</div>`;

  return `
    <div class="history-item glass-card" style="position:relative;">
      <div style="display:flex;gap:1rem;align-items:flex-start;">
        ${thumbnail}
        <div style="flex:1;min-width:0;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.5rem;">
            <div>
              <span style="font-size:0.65rem;font-weight:700;letter-spacing:1px;
                           color:#475569;text-transform:uppercase;">${record.cropName || 'Unknown'}</span>
              <h4 style="font-size:0.95rem;font-weight:700;margin-top:2px;
                         color:${riskColor};">
                ${isHealthy ? '✅' : '⚠️'} ${cleanLabel}
              </h4>
            </div>
            <button onclick="window.deleteScanRecord('${record.id}')"
                    style="background:transparent;border:none;color:#475569;
                           cursor:pointer;padding:4px;border-radius:6px;
                           transition:color 0.2s;flex-shrink:0;"
                    onmouseover="this.style.color='#ef4444'"
                    onmouseout="this.style.color='#475569'">
              <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
            </button>
          </div>

          <!-- Confidence bar -->
          <div style="margin-bottom:0.5rem;">
            <div style="display:flex;justify-content:space-between;
                        font-size:0.65rem;color:#475569;margin-bottom:4px;">
              <span>AI CONFIDENCE</span>
              <span style="color:${riskColor};font-weight:700;">${confPct}%</span>
            </div>
            <div style="height:4px;background:rgba(255,255,255,0.05);border-radius:2px;overflow:hidden;">
              <div style="width:${confPct}%;height:100%;background:${riskColor};
                          border-radius:2px;transition:width 0.8s ease;"></div>
            </div>
          </div>

          <!-- Meta row -->
          <div style="display:flex;gap:1rem;font-size:0.72rem;color:#475569;">
            <span>📅 ${dateStr}</span>
            <span>🕐 ${timeStr}</span>
            ${record.vmsStress ? `<span>🌡️ Stress: ${record.vmsStress}%</span>` : ''}
          </div>
        </div>
      </div>
    </div>`;
}

// ── DELETE HANDLER ────────────────────────────────────────────────
window.deleteScanRecord = async function(id) {
  if (!id) return;
  await deleteScan(id);
  await initHistoryTab(); // re-render
};

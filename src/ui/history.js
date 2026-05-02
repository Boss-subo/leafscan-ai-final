import { db as localDb } from '../core/db.js';
import { state } from '../core/state.js';
import { showToast } from '../core/utils.js';
import { loadHistoryFromCloud } from '../services/firebase.js';

export async function loadHistory() {
  if (!state.currentUser) return;
  const uid = state.currentUser.id || state.currentUser.uid;

  const container = document.getElementById('history-grid');
  const emptyState = document.getElementById('empty-history');
  if (!container) return;

  container.innerHTML = '<div style="color:var(--text-muted); font-size:0.8rem; padding:1rem;">Loading cloud history...</div>';

  let history = [];
  try {
    // Load from cloud (cross-device)
    history = await loadHistoryFromCloud(uid);
  } catch (e) {
    console.warn("Cloud history failed, loading local:", e);
    // Fallback to local
    history = await localDb.history
      .where('userId').equals(uid)
      .reverse().toArray();
  }

  if (history.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    container.innerHTML = '';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  container.innerHTML = history.map(h => {
    const date = h.timestamp?.toDate ? h.timestamp.toDate() : new Date(h.timestamp);
    return `
      <div class="glass-card history-item" style="padding: 1rem; background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border);">
        ${h.image ? `<img src="${h.image}" style="width:100%; aspect-ratio:1; object-fit:cover; border-radius:8px; margin-bottom:0.75rem;">` : `<div style="width:100%; aspect-ratio:1; background:rgba(16,185,129,0.05); border-radius:8px; margin-bottom:0.75rem; display:flex; align-items:center; justify-content:center; color:var(--text-muted); font-size:0.7rem;">No Image</div>`}
        <div>
          <h4 style="font-size:0.9rem; color:#fff;">${h.diseaseName}</h4>
          <small style="color:var(--text-muted)">${date.toLocaleDateString('en-IN')}</small>
        </div>
        <div class="confidence-badge" style="margin-top:0.5rem; display:inline-block; padding:2px 8px; background:var(--primary); border-radius:10px; font-size:0.7rem; font-weight:800;">${h.confidence}%</div>
      </div>
    `;
  }).join('');
}

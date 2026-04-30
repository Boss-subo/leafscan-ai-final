import { db } from '../core/db.js';
import { state } from '../core/state.js';
import { showToast } from '../core/utils.js';

export async function loadHistory() {
  if (!state.currentUser) return;
  
  const history = await db.history
    .where('userId')
    .equals(state.currentUser.id)
    .reverse()
    .toArray();

  const container = document.getElementById('history-grid');
  const emptyState = document.getElementById('empty-history');
  if (!container) return;
  
  if (history.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    container.innerHTML = '';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  container.innerHTML = history.map(h => `
    <div class="glass-card history-item" style="padding: 1rem; background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border);">
      <img src="${h.image || '/placeholder_leaf.png'}" style="width:100%; aspect-ratio:1; object-fit:cover; border-radius:8px; margin-bottom:0.75rem;">
      <div>
        <h4 style="font-size:0.9rem; color:#fff;">${h.diseaseName}</h4>
        <small style="color:var(--text-muted)">${new Date(h.timestamp).toLocaleDateString()}</small>
      </div>
      <div class="confidence-badge" style="margin-top:0.5rem; display:inline-block; padding:2px 8px; background:var(--primary); border-radius:10px; font-size:0.7rem; font-weight:800;">${h.confidence}%</div>
    </div>
  `).join('');
}

import { db } from '../core/db.js';
import { state } from '../core/state.js';

export async function loadInventory() {
  if (!state.currentUser) return;

  const items = await db.inventory
    .where('userId')
    .equals(state.currentUser.id)
    .toArray();

  const container = document.getElementById('inventory-grid');
  if (!container) return;
  
  if (items.length === 0) {
    container.innerHTML = '<div class="glass-card" style="grid-column: 1/-1; padding: 2rem; text-align: center; color: var(--text-muted);">No resources in inventory. Click "Add Resource" to begin.</div>';
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="glass-card inventory-item" style="padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid ${item.quantity < (item.minStock || 5) ? 'var(--danger)' : 'var(--primary)'}">
      <div>
        <h4 style="color: #fff;">${item.name}</h4>
        <small style="color: var(--text-muted);">${item.category}</small>
      </div>
      <div style="text-align:right">
        <div style="font-weight:bold; color: var(--primary-light); font-size: 1.1rem;">${item.quantity} ${item.unit}</div>
        <small style="color:${item.quantity < (item.minStock || 5) ? 'var(--danger)' : 'var(--primary)'}; font-weight: 800; font-size: 0.65rem;">
          ${item.quantity < (item.minStock || 5) ? 'LOW STOCK' : 'IN STOCK'}
        </small>
      </div>
    </div>
  `).join('');
}

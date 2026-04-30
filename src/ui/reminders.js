import { db } from '../core/db.js';
import { state } from '../core/state.js';

export async function loadReminders() {
  if (!state.currentUser) return;

  const tasks = await db.reminders
    .where('userId')
    .equals(state.currentUser.id)
    .toArray();

  const container = document.getElementById('reminders-list');
  if (!container) return;
  
  if (tasks.length === 0) {
    container.innerHTML = '<div class="glass-card" style="padding: 2rem; text-align: center; color: var(--text-muted);">No treatment tasks scheduled.</div>';
    return;
  }

  container.innerHTML = tasks.map(t => `
    <div class="glass-card reminder-item" style="display: flex; align-items: center; gap: 1rem; padding: 1.25rem; margin-bottom: 1rem; border-left: 4px solid var(--primary);">
      <input type="checkbox" ${t.status === 'done' ? 'checked' : ''} style="width: 18px; height: 18px;">
      <div style="flex:1">
        <div style="font-weight: 600; color: #fff;">${t.task}</div>
        <small style="color: var(--text-muted);">${new Date(t.date).toLocaleDateString()}</small>
      </div>
    </div>
  `).join('');
}

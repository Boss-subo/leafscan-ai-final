import { state } from './state.js';

export function normalizeLabel(label) {
  if (!label) return 'Unknown';
  return label.replace(/[___()]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function getTreatment(label) {
  const normLabel = normalizeLabel(label).toLowerCase();
  
  if (state.treatments[label]) return state.treatments[label];
  
  for (const key in state.treatments) {
    if (normalizeLabel(key).toLowerCase() === normLabel) {
      return state.treatments[key];
    }
  }
  
  return null;
}

export function formatMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^\* (.*$)/gm, '<li>$1</li>')
    .replace(/\n/g, '<br>');
}

export function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

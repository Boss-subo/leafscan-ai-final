import Chart from 'chart.js/auto';
import { db } from '../core/db.js';

let riskChart, pollutantChart, globalRiskChart;

export async function initCharts() {
  const ctxRisk = document.getElementById('riskChart')?.getContext('2d');
  const ctxPoll = document.getElementById('pollutantChart')?.getContext('2d');
  if (!ctxRisk || !ctxPoll) return;

  riskChart = new Chart(ctxRisk, {
    type: 'line',
    data: { labels: [], datasets: [{ label: 'Risk %', data: [], borderColor: '#10b981', fill: true }] },
    options: { responsive: true, maintainAspectRatio: false }
  });

  pollutantChart = new Chart(ctxPoll, {
    type: 'bar',
    data: { labels: [], datasets: [{ label: 'AQI', data: [], backgroundColor: '#3b82f6' }] },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

export async function updateCharts() {
  const data = await db.analytics.orderBy('date').limit(7).toArray();
  const labels = data.map(d => d.date);
  if (riskChart) {
    riskChart.data.labels = labels;
    riskChart.data.datasets[0].data = data.map(d => d.risk);
    riskChart.update();
  }
  if (pollutantChart) {
    pollutantChart.data.labels = labels;
    pollutantChart.data.datasets[0].data = data.map(d => d.aqi);
    pollutantChart.update();
  }
}

export function initGlobalRiskChart() {
  const canvas = document.getElementById('globalRiskChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  const dataPoints = Array.from({ length: 24 }, () => Math.floor(Math.random() * 40) + 10);
  globalRiskChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      datasets: [{
        label: 'Global Pathogen Index',
        data: dataPoints,
        borderColor: '#10b981',
        fill: true,
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        tension: 0.4
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

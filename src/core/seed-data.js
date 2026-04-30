import { db } from './db.js';

export async function seedUserData(userId) {
  // 1. Seed Analytics
  const analyticsCount = await db.analytics.where('userId').equals(userId).count();
  if (analyticsCount === 0) {
    const now = new Date();
    const demoData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      demoData.push({
        userId,
        date: date.toISOString().split('T')[0],
        risk: Math.floor(Math.random() * 30) + 10,
        aqi: Math.floor(Math.random() * 50) + 20
      });
    }
    await db.analytics.bulkAdd(demoData);
  }

  // 2. Seed History
  const historyCount = await db.history.where('userId').equals(userId).count();
  if (historyCount === 0) {
    await db.history.add({
      userId,
      diseaseName: 'Rice Blast (Detected)',
      timestamp: Date.now() - 86400000,
      image: 'https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?q=80&w=200&auto=format&fit=crop'
    });
  }

  // 3. Seed Plots
  const plotsCount = await db.plots.where('userId').equals(userId).count();
  if (plotsCount === 0) {
    await db.plots.add({
      userId,
      name: 'North Plot (Paddy)',
      crop: 'Rice',
      health: 85,
      lat: 22.5726,
      lng: 88.3639
    });
  }
}

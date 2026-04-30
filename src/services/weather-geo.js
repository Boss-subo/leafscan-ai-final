import { state } from '../core/state.js';
import { showToast } from '../core/utils.js';

export async function fetchWeather(lat, lng, elements) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${state.weatherKey}&units=metric`;
    const res = await fetch(url);
    if (!res.ok) return;
    const data = await res.json();
    state.currentWeather = data;

    // Update Sidebar
    if (elements.tempMini) elements.tempMini.textContent = `${Math.round(data.main.temp)}°C`;

    // Update Dashboard Cards
    const liveTemp = document.getElementById('live-temp');
    const liveHumid = document.getElementById('live-humidity');
    const liveWind = document.getElementById('live-wind');

    if (liveTemp) liveTemp.textContent = `${Math.round(data.main.temp)}°C`;
    if (liveHumid) liveHumid.textContent = `${data.main.humidity}%`;
    if (liveWind) liveWind.textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;

    return data;
  } catch (error) {
    console.error('Weather failed:', error);
  }
}

export async function fetchAQI(lat, lng, elements) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=${state.weatherKey}`;
    const res = await fetch(url);
    if (!res.ok) return;
    const data = await res.json();
    if (data.list && data.list.length > 0) {
      const aqi = data.list[0].main.aqi;
      if (elements.aqiMini) elements.aqiMini.textContent = aqi;
    }
  } catch (e) {
    console.error('AQI failed:', e);
  }
}

export async function fetchLocationAndAQI(elements) {
  if (elements.currentLocText) elements.currentLocText.textContent = "Detecting...";
  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;
    state.location = { latitude, longitude };
    if (state.weatherKey) {
      fetchAQI(latitude, longitude, elements);
      fetchWeather(latitude, longitude, elements);
    }
    // Reverse Geocode
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      const data = await res.json();
      if (elements.currentLocText) elements.currentLocText.textContent = data.address.city || data.address.town || "Location Found";
    } catch (e) { }
  }, (error) => {
    state.location = { latitude: 22.5726, longitude: 88.3639 }; // Default
    if (elements.currentLocText) elements.currentLocText.textContent = "Kolkata (Default)";
  });
}

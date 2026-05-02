import { state } from '../core/state.js';
import { showToast } from '../core/utils.js';

export async function fetchWeather(lat, lng, elements) {
  if (!state.weatherKey) {
    console.warn("Weather Key missing from state.");
    return;
  }
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${state.weatherKey}&units=metric`;
    const res = await fetch(url);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error(`Weather API Error: ${res.status} - ${errData.message || 'Unknown Error'}`);
      if (res.status === 401) showToast("Weather API Key Invalid", "error");
      return;
    }
    const data = await res.json();
    state.currentWeather = data;

    if (elements.tempMini) elements.tempMini.textContent = `${Math.round(data.main.temp)}°C`;
    
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
  if (!state.weatherKey) return;
  try {
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=${state.weatherKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`AQI API Error: ${res.status}`);
      return;
    }
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
  
  const timeout = setTimeout(() => {
    useDefaultLocation(elements);
  }, 5000);

  navigator.geolocation.getCurrentPosition(async (position) => {
    clearTimeout(timeout);
    const { latitude, longitude } = position.coords;
    state.location = { latitude, longitude };
    
    fetchAQI(latitude, longitude, elements);
    fetchWeather(latitude, longitude, elements);
    
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      const data = await res.json();
      if (elements.currentLocText) elements.currentLocText.textContent = data.address.city || data.address.town || "Location Found";
    } catch (e) {
      if (elements.currentLocText) elements.currentLocText.textContent = "Location Found";
    }
  }, (error) => {
    clearTimeout(timeout);
    useDefaultLocation(elements);
  }, { timeout: 5000 });
}

function useDefaultLocation(elements) {
  state.location = { latitude: 22.5726, longitude: 88.3639 }; // Kolkata
  if (elements.currentLocText) elements.currentLocText.textContent = "Kolkata (Default)";
  fetchAQI(state.location.latitude, state.location.longitude, elements);
  fetchWeather(state.location.latitude, state.location.longitude, elements);
}

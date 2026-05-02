import { state } from '../core/state.js';
import { formatMarkdown, showToast } from '../core/utils.js';

/**
 * AI Pathologist Direct-Fetch Engine (Zero-Dependency)
 */

export async function initChat() {
  const container = document.getElementById('chat-messages');
  if (container && container.children.length <= 1) {
    const welcomeMsg = document.createElement('div');
    welcomeMsg.className = 'message ai';
    welcomeMsg.textContent = "Welcome to the LeafScan Intelligence Hub. I am your specialized AI Pathologist. How can I assist you with your crops today?";
    container.appendChild(welcomeMsg);
  }
}

export async function syncAiModel(keyOverride = null) {
  const key = keyOverride || state.geminiKey;
  if (!key) return null;
  
  const endpoints = [
    'https://generativelanguage.googleapis.com/v1/models',
    'https://generativelanguage.googleapis.com/v1beta/models'
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(`${endpoint}?key=${key}`);
      const data = await res.json();
      if (res.ok && data.models) {
        const validModel = data.models.find(m => m.supportedGenerationMethods.includes('generateContent'));
        if (validModel) {
          const modelId = validModel.name.split('/').pop();
          state.activeGeminiModel = modelId;
          localStorage.setItem('leafscan_active_model', modelId);
          console.log(`[AI Sync] Found working model: ${modelId} via ${endpoint}`);
          return modelId;
        }
      }
    } catch (e) {
      console.warn(`[AI Sync] Failed on ${endpoint}`, e);
    }
  }
  return null;
}

export async function sendMessage(text, containerId) {
  const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
  if (!container) return;

  if (!state.geminiKey) {
    showToast("Gemini Key Missing. Check Settings.", "error");
    return;
  }

  // UI: Add User Message
  const userMsg = document.createElement('div');
  userMsg.className = 'message user animate-in';
  userMsg.textContent = text;
  container.appendChild(userMsg);

  // UI: Add Loading
  const loadingMsg = document.createElement('div');
  loadingMsg.className = 'message ai loading';
  loadingMsg.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
  container.appendChild(loadingMsg);
  container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });

  // Prompt Construction
  const systemPrompt = `You are the LeafScan AI Pathologist. Be concise, professional, and prioritize organic/sustainable solutions. 
    ${state.lastDiagnosis ? `CONTEXT: User scanned a plant. Result: ${state.lastDiagnosis.diseaseName}.` : ''}`;
  const fullPrompt = `${systemPrompt}\n\nUser: ${text}`;

  // Candidate Models (Priority Order)
  const candidates = [
    state.activeGeminiModel,
    localStorage.getItem('leafscan_active_model'),
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro'
  ].filter(Boolean);

  let success = false;
  for (const model of [...new Set(candidates)]) {
    try {
      console.log(`[AI Pathologist] Attempting Handshake with ${model}...`);
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${state.geminiKey}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] })
      });

      const data = await response.json();
      if (!response.ok) continue; // Try next model if this one fails

      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!aiText) continue;

      // Success!
      if (loadingMsg) loadingMsg.remove();
      const aiMsg = document.createElement('div');
      aiMsg.className = 'message ai animate-in';
      aiMsg.innerHTML = formatMarkdown(aiText);
      container.appendChild(aiMsg);
      
      state.activeGeminiModel = model; // Remember the working one
      localStorage.setItem('leafscan_active_model', model);
      
      setTimeout(() => container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' }), 100);
      success = true;
      break; 
    } catch (e) {
      console.warn(`[AI Pathologist] Model ${model} failed, trying next...`);
    }
  }

  if (!success) {
    if (loadingMsg) loadingMsg.remove();
    showToast("AI Intelligence Mesh connection failed. Please click 'Sync AI'.", "error");
    const errDiv = document.createElement('div');
    errDiv.className = 'message system';
    errDiv.style.color = 'var(--danger)';
    errDiv.textContent = "Error: All available AI models failed to respond. Check your API key and quota.";
    container.appendChild(errDiv);
  }
}

export async function testGeminiKey(key) {
  if (!key) return false;
  const discoveredModel = await syncAiModel(key);
  const model = discoveredModel || state.activeGeminiModel || 'gemini-1.5-flash';
  
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'hi' }] }] })
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

let recognition;
export function toggleMic() {
  const micBtn = document.getElementById('mic-btn');
  const chatInput = document.getElementById('chat-input');

  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    showToast("Speech recognition not supported in this browser.", "error");
    return;
  }

  if (recognition) {
    recognition.stop();
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = state.prefLang === 'Hindi' ? 'hi-IN' : 'en-US';
  recognition.interimResults = false;

  recognition.onstart = () => {
    micBtn.classList.add('listening');
    showToast("Listening...", "info");
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    chatInput.value = transcript;
    micBtn.classList.remove('listening');
    
    // Manually trigger the chat handling
    if (window.handleChat) {
      window.handleChat();
    }
  };

  recognition.onerror = (event) => {
    console.error("Speech Recognition Error:", event.error);
    micBtn.classList.remove('listening');
    showToast(`Voice Error: ${event.error}`, "error");
    recognition = null;
  };

  recognition.onend = () => {
    micBtn.classList.remove('listening');
    recognition = null;
  };

  recognition.start();
}

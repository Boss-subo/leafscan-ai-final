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

export async function testGeminiKey(key) {
  if (!key) return false;
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'hi' }] }]
      })
    });
    return res.ok;
  } catch (e) {
    console.error("Gemini Test Failed:", e);
    return false;
  }
}

export async function sendMessage(text, containerId) {
  const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
  if (!container) return;

  if (!state.geminiKey) {
    showToast("Gemini Key Missing. Check Settings.", "error");
    return;
  }

  // Add User Message
  const userMsg = document.createElement('div');
  userMsg.className = 'message user';
  userMsg.textContent = text;
  container.appendChild(userMsg);

  // Add Loading
  const loadingMsg = document.createElement('div');
  loadingMsg.className = 'message ai loading';
  loadingMsg.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
  container.appendChild(loadingMsg);
  container.scrollTop = container.scrollHeight;

  // Build Context-Aware Prompt
  let systemPrompt = "You are the LeafScan AI Pathologist. Be concise, professional, and prioritize organic/sustainable solutions.";
  if (state.lastDiagnosis) {
    systemPrompt += ` The user just performed a scan. Result: ${state.lastDiagnosis.diseaseName} with ${state.lastDiagnosis.confidence}% confidence.`;
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${state.geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: text }] }],
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        }
      })
    });

    const data = await response.json();
    loadingMsg.remove();

    if (!response.ok) throw new Error(data.error?.message || 'API Error');

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, but I couldn't generate a response. Please try again.";
    const aiMsg = document.createElement('div');
    aiMsg.className = 'message ai';
    aiMsg.innerHTML = formatMarkdown(aiText);
    container.appendChild(aiMsg);
    container.scrollTop = container.scrollHeight;

  } catch (e) {
    if (loadingMsg) loadingMsg.remove();
    console.error("Gemini Send Failed:", e);
    showToast(`AI Engine Error: ${e.message}`, "error");
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
    recognition = null;
    micBtn.classList.remove('listening');
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
    window.handleChat();
  };

  recognition.onerror = () => {
    micBtn.classList.remove('listening');
    recognition = null;
  };

  recognition.onend = () => {
    micBtn.classList.remove('listening');
    recognition = null;
  };

  recognition.start();
}

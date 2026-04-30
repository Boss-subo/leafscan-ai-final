import { GoogleGenerativeAI } from '@google/generative-ai';
import { state } from '../core/state.js';

let genAI, model;

export async function initChat() {
  if (!state.geminiKey) return;
  genAI = new GoogleGenerativeAI(state.geminiKey);
  model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
}

export async function sendMessage(text, container) {
  if (!model) await initChat();
  if (!model) return;

  const userMsg = document.createElement('div');
  userMsg.className = 'chat-msg user';
  userMsg.textContent = text;
  container.appendChild(userMsg);

  try {
    const result = await model.generateContent(text);
    const response = await result.response;
    const aiMsg = document.createElement('div');
    aiMsg.className = 'chat-msg ai';
    aiMsg.textContent = response.text();
    container.appendChild(aiMsg);
  } catch (e) {
    const errorMsg = document.createElement('div');
    errorMsg.className = 'chat-msg ai system-error';
    if (e.message.includes('429')) {
      errorMsg.textContent = "[SYSTEM ERROR] Gemini API Quota Exceeded. Please check your billing or API key limits in Google AI Studio.";
    } else {
      errorMsg.textContent = `[SYSTEM ERROR] Connection failed: ${e.message}`;
    }
    container.appendChild(errorMsg);
  }
}

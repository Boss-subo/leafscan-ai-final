import { GoogleGenerativeAI } from '@google/generative-ai';
import { state } from '../core/state.js';

let genAI, model;

export async function initChat() {
  if (!state.geminiKey) {
    console.warn("Gemini Key missing from state.");
    return;
  }
  try {
    genAI = new GoogleGenerativeAI(state.geminiKey);
    model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    console.log("Gemini Model Initialized.");
  } catch (e) {
    console.error("Gemini Init Failed:", e);
  }
}

export async function sendMessage(text, container) {
  // Always try to init if model is missing
  if (!model) await initChat();
  
  if (!model) {
    const aiMsg = document.createElement('div');
    aiMsg.className = 'chat-msg ai system-error';
    aiMsg.textContent = "AI Pathologist is currently Offline. Please set your Gemini API Key in 'Settings' to enable biological intelligence.";
    container.appendChild(aiMsg);
    return;
  }

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
    console.error("Gemini Send Failed:", e);
    const errorMsg = document.createElement('div');
    errorMsg.className = 'chat-msg ai system-error';
    if (e.message.includes('429')) {
      errorMsg.textContent = "[SYSTEM ERROR] Gemini API Quota Exceeded. Please check your billing or API key limits.";
    } else {
      errorMsg.textContent = `[SYSTEM ERROR] Connection failed: ${e.message}`;
    }
    container.appendChild(errorMsg);
  }
}

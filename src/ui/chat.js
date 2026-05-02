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
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${key}`, {
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
  if (!container) {
    console.error("Chat container missing!");
    return;
  }

  if (!state.geminiKey) {
    showToast("Gemini Key Missing. Check Settings.", "error");
    return;
  }

  console.log("Sending message to AI Pathologist:", text);

  // Add User Message
  const userMsg = document.createElement('div');
  userMsg.className = 'message user animate-in';
  userMsg.textContent = text;
  container.appendChild(userMsg);

  // Add Loading
  const loadingMsg = document.createElement('div');
  loadingMsg.className = 'message ai loading';
  loadingMsg.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
  container.appendChild(loadingMsg);
  
  // Smooth scroll to bottom
  container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });

  // Build Context-Aware Prompt
  let systemPrompt = "You are the LeafScan AI Pathologist. Be concise, professional, and prioritize organic/sustainable solutions.";
  if (state.lastDiagnosis) {
    systemPrompt += ` CONTEXT: The user just scanned a plant. Detection: ${state.lastDiagnosis.diseaseName} (${state.lastDiagnosis.confidence}% confidence). Use this for follow-up questions.`;
  }

  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${state.geminiKey}`;
    
    // Combine instructions for maximum compatibility across all API versions
    const fullPrompt = `${systemPrompt}\n\nUser Query: ${text}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: fullPrompt }] 
        }]
      })
    });

    const data = await response.json();
    console.log("AI Pathologist Response received:", data);

    if (loadingMsg && loadingMsg.parentNode) {
      loadingMsg.remove();
    }

    if (!response.ok) {
      const errMsg = data.error?.message || 'Handshake Error';
      throw new Error(errMsg);
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!aiText) {
      throw new Error("Empty response from Intelligence Mesh.");
    }

    const aiMsg = document.createElement('div');
    aiMsg.className = 'message ai animate-in';
    aiMsg.innerHTML = formatMarkdown(aiText);
    container.appendChild(aiMsg);
    
    // Ensure scroll after content is rendered
    setTimeout(() => {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }, 100);

  } catch (e) {
    console.error("AI Pathologist Failure:", e);
    if (loadingMsg && loadingMsg.parentNode) {
      loadingMsg.remove();
    }
    showToast(`AI Engine Error: ${e.message}`, "error");
    
    // Add error message to chat so it doesn't "disappear"
    const errDiv = document.createElement('div');
    errDiv.className = 'message system';
    errDiv.style.color = 'var(--danger)';
    errDiv.textContent = `Error: ${e.message}`;
    container.appendChild(errDiv);
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

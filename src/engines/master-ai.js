/**
 * LEAFSCAN — MASTER AI CONSENSUS BRIDGE
 * Connects the mobile client to the high-performance Python GPU backend.
 */

const MASTER_API_URL = "https://boss-subo-leafscan-master-ai.hf.space/analyze";

export async function requestMasterConsensus(base64Image) {
  try {
    console.log("[Master AI] Requesting High-Precision Consensus...");
    
    // Convert base64 to Blob for multipart upload
    const blob = await (await fetch(base64Image)).blob();
    const formData = new FormData();
    formData.append('file', blob, 'sample.jpg');

    const response = await fetch(MASTER_API_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error("Master Node Offline");

    const data = await response.json();
    console.log("[Master AI] Consensus Received:", data);
    return data;
  } catch (err) {
    console.warn("[Master AI] Handshake Failed:", err);
    return null;
  }
}

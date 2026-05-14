/**
 * LEAFSCAN — CLOUDINARY FREE STORAGE BRIDGE
 * Allows storing high-res diagnostic images for free.
 */

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dpw9syh9y/image/upload";
const UPLOAD_PRESET = "leafscan_unsigned"; // Verified from user screenshot

export async function uploadToCloudinary(base64Image) {
  try {
    // Basic verification
    if (!base64Image || !base64Image.startsWith('data:image')) return null;

    const formData = new FormData();
    formData.append('file', base64Image);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'leafscan_diagnostics');

    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      console.warn("Cloudinary Upload Failed:", error);
      return null;
    }

    const data = await response.json();
    return data.secure_url; // This is the persistent link to the image
  } catch (err) {
    console.error("Cloudinary Bridge Error:", err);
    return null;
  }
}

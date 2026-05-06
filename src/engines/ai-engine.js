import { state } from '../core/state.js';
import { showToast } from '../core/utils.js';

const CROP_SPECIALISTS = {
  'Tomato': { model: 'Tomato', classes: ['Tomato___Bacterial_spot', 'Tomato___Early_blight', 'Tomato___Late_blight', 'Tomato___Leaf_Mold', 'Tomato___Septoria_leaf_spot', 'Tomato___Spider_mites Two-spotted_spider_mite', 'Tomato___Target_Spot', 'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Tomato_mosaic_virus', 'Tomato___healthy'] },
  'Wheat': { model: 'Wheat', classes: ['Wheat___Brown_Rust', 'Wheat___Healthy', 'Wheat___Yellow_Rust'] },
  'Corn': { model: 'Corn', classes: ['Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', 'Corn_(maize)___Common_rust_', 'Corn_(maize)___Northern_Leaf_Blight', 'Corn_(maize)___healthy'] },
  'Grape': { model: 'Grape', classes: ['Grape___Black_rot', 'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 'Grape___healthy'] },
  'Apple': { model: 'Apple', classes: ['Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy'] }
};

const CONFIG = {
  MODELS_BASE: '/model_tfjs/'
};

/**
 * Loads a specialized crop model dynamically based on selection
 * @param {string} cropName - The name of the crop specialist to load
 */
export async function loadLocalModel(cropName) {
  if (!cropName) {
    console.warn("AI Engine: No crop specialist specified for loading.");
    return;
  }

  // Load TensorFlow.js if not present
  if (typeof tf === 'undefined') {
    try {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    } catch (e) {
      console.error("TFJS Load Failed", e);
      showToast("Critical: AI Runtime failed to initialize.", "error");
      return;
    }
  }

  try {
    const specialist = CROP_SPECIALISTS[cropName];
    if (!specialist) {
        console.warn(`No specialist configuration found for ${cropName}`);
    }

    const modelFolder = specialist ? specialist.model : cropName;
    const modelUrl = `${CONFIG.MODELS_BASE}${modelFolder}/model.json`;
    
    console.log(`[AI Engine] Deploying ${cropName} specialist from ${modelUrl}...`);
    
    state.localModel = await tf.loadLayersModel(modelUrl);
    state.currentSpecialist = cropName;
    
    // Inject exact classes into state
    if (specialist && specialist.classes) {
      state.modelLabels = specialist.classes;
    } else {
      console.warn(`No classes defined for ${cropName}, relying on global fallback.`);
    }
    
    showToast(`${cropName} specialist active.`, "success");
  } catch (e) {
    console.error(`Neural Handshake Failed for ${cropName}:`, e);
    showToast(`Error: ${cropName} specialist offline.`, "error");
  }
}

/**
 * Runs inference with multi-tier confidence security logic
 */
export async function runLocalInference(imgData) {
  const selectedCrop = state.selectedCrop || 'General';
  
  // Ensure the correct specialist is loaded
  if (!state.localModel || state.currentSpecialist !== selectedCrop) {
    await loadLocalModel(selectedCrop);
  }
  
  if (!state.localModel) return null;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = async () => {
      const result = tf.tidy(() => {
        const tensor = tf.browser.fromPixels(img)
          .resizeNearestNeighbor([224, 224])
          .toFloat()
          .expandDims()
          .div(255.0);
          
        const prediction = state.localModel.predict(tensor);
        const data = prediction.dataSync();
        const maxIdx = data.indexOf(Math.max(...data));
        const confidence = data[maxIdx];

        // ─── NEURAL SECURITY CHECKS ───
        
        // 1. Tier 3: Inconclusive (Reject)
        if (confidence < 0.70) {
          return { 
            label: 'Inconclusive', 
            confidence, 
            status: 'rejected',
            message: 'Low diagnostic confidence. Please ensure the leaf is centered and lighting is optimal.' 
          };
        }

        // 2. Tier 2: Warning (Accept with Caution)
        if (confidence < 0.85) {
          return { 
            label: state.modelLabels[maxIdx] || 'Unknown Pathogen', 
            confidence, 
            status: 'warning',
            message: 'Caution: Visual verification recommended for this detection.',
            classIdx: maxIdx 
          };
        }

        // 3. Tier 1: Elite Result (Full Confidence)
        return { 
          label: state.modelLabels[maxIdx] || 'Unknown Pathogen', 
          confidence, 
          status: 'verified',
          message: 'High-precision diagnostic match.',
          classIdx: maxIdx,
          allScores: data // Return full profile for advanced telemetry
        };
      });
      resolve(result);
    };
    img.src = imgData;
  });
}

/**
 * Grad-CAM / XAI Analysis for diagnostic hotspots
 */
export async function runXAIAnalysis(imgData, targetClassIdx) {
  if (!state.localModel) return null;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = async () => {
      const heatmap = tf.tidy(() => {
        const tensor = tf.browser.fromPixels(img)
          .resizeNearestNeighbor([224, 224])
          .toFloat()
          .expandDims()
          .div(255.0);

        let lastConvLayer;
        for (let i = state.localModel.layers.length - 1; i >= 0; i--) {
          if (state.localModel.layers[i].outputShape.length === 4) {
            lastConvLayer = state.localModel.layers[i];
            break;
          }
        }

        if (!lastConvLayer) return null;

        const subModel = tf.model({
          inputs: state.localModel.inputs,
          outputs: [lastConvLayer.output, state.localModel.outputs[0]]
        });

        const [convOut, predictions] = subModel.predict(tensor);
        const finalDenseLayer = state.localModel.layers.find(l => l.getClassName() === 'Dense');
        if (!finalDenseLayer) return null;
        
        const weights = finalDenseLayer.getWeights()[0];
        const classWeights = weights.slice([0, targetClassIdx], [-1, 1]).reshape([-1]);

        const [h, w, channels] = convOut.shape.slice(1);
        const reshapedConv = convOut.reshape([h * w, channels]);
        const cam = reshapedConv.matMul(classWeights.reshape([channels, 1]));
        
        const normalizedCam = cam.sub(cam.min()).div(cam.max().sub(cam.min()));
        return normalizedCam.reshape([h, w]);
      });

      if (!heatmap) {
        resolve(null);
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = 224;
      canvas.height = 224;
      await tf.browser.toPixels(heatmap.resizeBilinear([224, 224]), canvas);
      
      heatmap.dispose();
      resolve(canvas.toDataURL());
    };
    img.src = imgData;
  });
}

/**
 * VMS: Vegetation Stress Analysis
 */
export async function runVMSAnalysis(imgData) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 100;
      canvas.height = 100;
      ctx.drawImage(img, 0, 0, 100, 100);
      const pixels = ctx.getImageData(0, 0, 100, 100).data;
      let gSum = 0, rSum = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        rSum += pixels[i];
        gSum += pixels[i+1];
      }
      const stress = Math.max(0, Math.min(100, Math.round((rSum / (gSum + 1)) * 100 - 20)));
      resolve({
        stress,
        signature: stress < 20 ? 'Optimal' : stress < 50 ? 'Early Warning' : 'Critical Stress',
        reflectance: stress < 30 ? 'Stable' : 'Unstable'
      });
    };
    img.src = imgData;
  });
}

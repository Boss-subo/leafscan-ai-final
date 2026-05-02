import { state } from '../core/state.js';
import { showToast, normalizeLabel } from '../core/utils.js';

export async function loadLocalModel() {
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
      return;
    }
  }

  try {
    state.localModel = await tf.loadLayersModel('/model_tfjs/model.json');
    const resp = await fetch('/model_tfjs/labels.txt');
    if (resp.ok) {
      const text = await resp.text();
      state.modelLabels = text.split('\n').map(l => l.trim()).filter(l => l);
    }
  } catch (e) {
    console.warn("Local model load failed", e);
  }
}

export async function runLocalInference(imgData) {
  if (!state.localModel) await loadLocalModel();
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
        return { 
          label: state.modelLabels[maxIdx], 
          confidence: data[maxIdx],
          classIdx: maxIdx 
        };
      });
      resolve(result);
    };
    img.src = imgData;
  });
}

export async function runXAIAnalysis(imgData, targetClassIdx) {
  if (!state.localModel) return null;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = async () => {
      const heatmap = tf.tidy(() => {
        // 1. Preprocess Image
        const tensor = tf.browser.fromPixels(img)
          .resizeNearestNeighbor([224, 224])
          .toFloat()
          .expandDims()
          .div(255.0);

        // 2. Find the last convolutional layer
        // For MobileNetV2, it's usually the last layer with 4D output before pooling
        let lastConvLayer;
        for (let i = state.localModel.layers.length - 1; i >= 0; i--) {
          if (state.localModel.layers[i].outputShape.length === 4) {
            lastConvLayer = state.localModel.layers[i];
            break;
          }
        }

        if (!lastConvLayer) return null;

        // 3. Create a sub-model that outputs both the last conv layer and the final prediction
        const subModel = tf.model({
          inputs: state.localModel.inputs,
          outputs: [lastConvLayer.output, state.localModel.outputs[0]]
        });

        const [convOut, predictions] = subModel.predict(tensor);
        
        // 4. Get weights of the final dense layer
        const finalDenseLayer = state.localModel.layers.find(l => l.getClassName() === 'Dense');
        if (!finalDenseLayer) return null;
        
        const weights = finalDenseLayer.getWeights()[0]; // [channels, classes]
        const classWeights = weights.slice([0, targetClassIdx], [-1, 1]).reshape([-1]);

        // 5. Compute CAM: Weighted sum of feature maps
        // convOut shape: [1, h, w, channels]
        const [h, w, channels] = convOut.shape.slice(1);
        const reshapedConv = convOut.reshape([h * w, channels]);
        const cam = reshapedConv.matMul(classWeights.reshape([channels, 1]));
        
        // 6. Normalize and Upsample
        const normalizedCam = cam.sub(cam.min()).div(cam.max().sub(cam.min()));
        return normalizedCam.reshape([h, w]);
      });

      if (!heatmap) {
        resolve(null);
        return;
      }

      // Convert heatmap to canvas data
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

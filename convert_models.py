import os
import shutil
import tensorflowjs as tfjs
import tensorflow as tf
import tf_keras as legacy_k

# --- CONFIGURATION ---
MODELS_PATH = 'ml_engine/models/'
OUTPUT_BASE = 'public/model_tfjs/'

def convert_all_specialists():
    print("!!! INITIATING SOVEREIGN NEURAL CONVERSION !!!")
    
    if not os.path.exists(OUTPUT_BASE):
        os.makedirs(OUTPUT_BASE)
        
    for file in os.listdir(MODELS_PATH):
        if file.endswith('.h5'):
            # Extract crop name: e.g. 'pathologist_Wheat.h5' -> 'Wheat'
            crop = file.replace('pathologist_', '').replace('.h5', '')
            print(f"\n[CONVERT] Processing {crop} specialist...")
            
            try:
                # Load the high-precision model
                model_path = os.path.join(MODELS_PATH, file)
                model = legacy_k.models.load_model(model_path)
                
                # Define output path for this specific specialist
                target_dir = os.path.join(OUTPUT_BASE, crop)
                if os.path.exists(target_dir):
                    shutil.rmtree(target_dir)
                os.makedirs(target_dir)
                
                # Cross-compile to TF.js format
                tfjs.converters.save_keras_model(model, target_dir)
                print(f"[SUCCESS] {crop} specialist deployed to {target_dir}")
                
            except Exception as e:
                print(f"[ERROR] Failed to convert {crop}: {str(e)}")

if __name__ == '__main__':
    convert_all_specialists()
    print("\n[COMPLETE] All specialists are browser-ready.")

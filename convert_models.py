import os
import shutil
import numpy as np
import sys
import types

# --- SOVEREIGN MOCK BRIDGE ---
# Bypass broken tensorflow_decision_forests Windows installation
sys.modules['tensorflow_decision_forests'] = types.ModuleType('tensorflow_decision_forests')
sys.modules['tensorflow_decision_forests.keras'] = types.ModuleType('tensorflow_decision_forests.keras')
sys.modules['tensorflow_decision_forests.keras.core'] = types.ModuleType('tensorflow_decision_forests.keras.core')
sys.modules['tensorflow_decision_forests.keras.core_inference'] = types.ModuleType('tensorflow_decision_forests.keras.core_inference')

# Bypass broken JAX Windows installation
sys.modules['jax'] = types.ModuleType('jax')
m = types.ModuleType('jax.experimental')
m.jax2tf = types.ModuleType('jax.experimental.jax2tf')
sys.modules['jax.experimental'] = m
sys.modules['jax.experimental.jax2tf'] = m.jax2tf


# --- SOVEREIGN SYSTEM OVERRIDE ---
# 1. Fix np.object deprecation
np.object = object

# 2. Force-inject estimator into sys.modules to bypass Hub errors
try:
    import tensorflow as tf
    import tensorflow_estimator
    sys.modules['tensorflow.compat.v1.estimator'] = tensorflow_estimator.python.estimator.api._v1.estimator
    tf.compat.v1.estimator = tensorflow_estimator.python.estimator.api._v1.estimator
except Exception:
    pass

import tensorflowjs as tfjs
import tf_keras as legacy_k

# Bypass 'optional' keyword argument error when loading newer Keras models
original_init = legacy_k.layers.InputLayer.__init__
def new_init(self, *args, **kwargs):
    kwargs.pop('optional', None)
    original_init(self, *args, **kwargs)
legacy_k.layers.InputLayer.__init__ = new_init


# --- CONFIGURATION ---
MODELS_PATH = 'ml_engine/models/'
OUTPUT_BASE = 'public/model_tfjs/'

def convert_all_specialists():
    print("!!! INITIATING SOVEREIGN NEURAL CONVERSION !!!")
    
    if not os.path.exists(OUTPUT_BASE):
        os.makedirs(OUTPUT_BASE)
        
    for file in os.listdir(MODELS_PATH):
        if file.endswith('.h5'):
            crop = file.replace('pathologist_', '').replace('.h5', '')
            print(f"\n[CONVERT] Processing {crop} specialist...")
            
            try:
                model_path = os.path.join(MODELS_PATH, file)
                model = legacy_k.models.load_model(model_path)
                
                target_dir = os.path.join(OUTPUT_BASE, crop)
                if os.path.exists(target_dir):
                    shutil.rmtree(target_dir)
                os.makedirs(target_dir)
                
                tfjs.converters.save_keras_model(model, target_dir)
                print(f"[SUCCESS] {crop} specialist deployed to {target_dir}")
                
            except Exception as e:
                print(f"[ERROR] Failed to convert {crop}: {str(e)}")

if __name__ == '__main__':
    convert_all_specialists()
    print("\n[COMPLETE] All specialists are browser-ready.")

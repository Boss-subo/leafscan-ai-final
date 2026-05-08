import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

import tf_keras as keras
import numpy as np
from tf_keras.preprocessing.image import ImageDataGenerator

# Bypass 'optional' keyword argument error when loading newer Keras models
original_init = keras.layers.InputLayer.__init__
def new_init(self, *args, **kwargs):
    kwargs.pop('optional', None)
    original_init(self, *args, **kwargs)
keras.layers.InputLayer.__init__ = new_init

DATASET_PATH = 'ml_engine/master_dataset/'
MODELS_PATH  = 'ml_engine/models/'

# Test these crops first
TEST_CROPS = ['Wheat', 'Tomato', 'Corn', 'Grape']

datagen = ImageDataGenerator(rescale=1./255)

print("\n" + "="*55)
print("  LEAFSCAN CLASS INDEX VERIFIER")
print("="*55)

for crop in TEST_CROPS:
    # Find folders for this crop
    folders = [f for f in os.listdir(DATASET_PATH)
               if f.startswith(crop) and
               os.path.isdir(os.path.join(DATASET_PATH, f))]

    if not folders:
        print(f"\n[{crop}] x No folders found")
        continue

    folders.sort()  # This is the key - alphabetical sort

    print(f"\n[{crop}] v {len(folders)} classes found:")
    for i, folder in enumerate(folders):
        print(f"   Index {i} -> '{folder}'")

    # Load model and test one image
    model_path = os.path.join(MODELS_PATH, f'pathologist_{crop}.h5')
    if not os.path.exists(model_path):
        print(f"   Model file not found at {model_path}")
        continue

    try:
        model = keras.models.load_model(model_path, compile=False)

        # Test with first image from first class
        first_class_path = os.path.join(DATASET_PATH, folders[0])
        images = [img for img in os.listdir(first_class_path) if img.lower().endswith(('.png', '.jpg', '.jpeg'))]
        
        if not images:
             print(f"   No images found in {folders[0]}")
             continue
             
        first_img = images[0]
        img_path = os.path.join(first_class_path, first_img)

        img = keras.preprocessing.image.load_img(img_path, target_size=(224,224))
        arr = keras.preprocessing.image.img_to_array(img) / 255.0
        arr = np.expand_dims(arr, 0)

        pred = model.predict(arr, verbose=0)
        predicted_idx = np.argmax(pred[0])
        confidence = pred[0][predicted_idx] * 100

        print(f"   Test image: '{folders[0]}/{first_img}'")
        print(f"   Prediction: Index {predicted_idx} = '{folders[predicted_idx]}' ({confidence:.1f}%)")
        print(f"   Raw scores: {[f'{s:.3f}' for s in pred[0]]}")

        if predicted_idx == 0:
            print(f"   v CORRECT - predicted '{folders[0]}' for a '{folders[0]}' image")
        else:
            print(f"   ! Label swap detected!")

    except Exception as e:
        print(f"   Model test failed: {e}")

print("\n" + "="*55)
print("Copy these exact class orders into ai-engine.js!")
print("="*55 + "\n")

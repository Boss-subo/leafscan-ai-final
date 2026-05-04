import tensorflow as tf
import tf_keras as legacy_k
from tf_keras.applications import MobileNetV2
from tf_keras.models import Model
from tf_keras.preprocessing.image import ImageDataGenerator
from tf_keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau, Callback
import os
import shutil
import time
import numpy as np
from sklearn.utils.class_weight import compute_class_weight
from tf_keras.layers import Dense, GlobalAveragePooling2D, Dropout, BatchNormalization

# --- ELITE CONFIGURATION (99% ACCURACY TARGET) ---
DATASET_PATH = 'ml_engine/master_dataset/'
MODELS_PATH = 'ml_engine/models/'
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
WARMUP_EPOCHS = 5
FINE_TUNE_EPOCHS = 25
TOTAL_EPOCHS = WARMUP_EPOCHS + FINE_TUNE_EPOCHS

def build_elite_model(num_classes, model_name):
    print(f"\n[BUILD] Elite Architecture: {model_name} | Classes: {num_classes}")
    base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
    
    # Initially freeze base model
    base_model.trainable = False 
    
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(512, activation='relu')(x)
    x = BatchNormalization()(x) # Better — add BatchNorm + two dense layers
    x = Dropout(0.4)(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.3)(x)
    predictions = Dense(num_classes, activation='softmax')(x)
    
    model = Model(inputs=base_model.input, outputs=predictions)
    model.compile(optimizer=legacy_k.optimizers.Adam(learning_rate=0.001), 
                  loss='categorical_crossentropy', 
                  metrics=['accuracy'])
    return model, base_model

def prepare_hierarchy():
    if not os.path.exists(DATASET_PATH):
        print(f"Error: Dataset not found at {DATASET_PATH}")
        return None

    hierarchy = {}
    for folder in os.listdir(DATASET_PATH):
        folder_path = os.path.join(DATASET_PATH, folder)
        if not os.path.isdir(folder_path): continue
        
        # ELITE FILTER: Only include folders that have at least 10 images
        try:
            image_count = len([f for f in os.listdir(folder_path) if f.lower().endswith(('.png', '.jpg', '.jpeg'))])
            if image_count < 10:
                print(f"[DATA-WIPE] Skipping {folder} (Insufficient data: {image_count} images)")
                continue
        except:
            continue

        if '___' in folder:
            crop = folder.split('___')[0]
            if crop not in hierarchy: hierarchy[crop] = []
            hierarchy[crop].append(folder)
        elif ' ' in folder:
            crop = folder.split(' ')[0]
            if crop not in hierarchy: hierarchy[crop] = []
            hierarchy[crop].append(folder)
            
    return hierarchy

def train_specialist(crop, folders):
    print(f"\n" + "="*60)
    print(f"ELITE TRAINING: {crop} Specialist (Target: 99%)")
    print("="*60)
    
    # Create temporary directory for high-intensity training
    l2_tmp = f'ml_engine/l2_tmp_{crop}'
    if os.path.exists(l2_tmp): shutil.rmtree(l2_tmp)
    os.makedirs(l2_tmp)
    for folder in folders:
        shutil.copytree(os.path.join(DATASET_PATH, folder), os.path.join(l2_tmp, folder))
    
    # High-Intensity Augmentation
    datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=40,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.3,
        horizontal_flip=True,
        brightness_range=[0.8, 1.2],
        validation_split=0.2
    )
    
    train_gen = datagen.flow_from_directory(l2_tmp, target_size=IMG_SIZE, batch_size=BATCH_SIZE, subset='training')
    val_gen = datagen.flow_from_directory(l2_tmp, target_size=IMG_SIZE, batch_size=BATCH_SIZE, subset='validation')
    
    model, base_model = build_elite_model(len(folders), f"Pathologist_{crop}")
    model_path = os.path.join(MODELS_PATH, f'pathologist_{crop}.h5')
    
    # STAGE 1: WARMUP (Head Only)
    print(f"\n[STAGE 1] Warmup: Training Head for {WARMUP_EPOCHS} epochs...")
    
    # Calculate Class Weights to handle imbalance
    class_weights = compute_class_weight(
        class_weight='balanced',
        classes=np.unique(train_gen.classes),
        y=train_gen.classes
    )
    class_weight_dict = dict(enumerate(class_weights))
    
    model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=WARMUP_EPOCHS,
        class_weight=class_weight_dict,
        callbacks=[ReduceLROnPlateau(factor=0.2, patience=2)]
    )
    
    # STAGE 2: DEEP FINE-TUNING (Unfreeze top layers)
    print(f"\n[STAGE 2] Deep Learning: Unfreezing brain and fine-tuning...")
    base_model.trainable = True
    # Better — last 30 layers for 38 classes
    fine_tune_at = len(base_model.layers) - 30
    for layer in base_model.layers[:fine_tune_at]:
        layer.trainable = False

    model.compile(optimizer=legacy_k.optimizers.Adam(learning_rate=0.0001), # Standard Fine-tuning LR
                  loss='categorical_crossentropy',
                  metrics=['accuracy'])
    
    model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=FINE_TUNE_EPOCHS,
        class_weight=class_weight_dict,
        callbacks=[
            ModelCheckpoint(model_path, save_best_only=True, monitor='val_accuracy', mode='max'),
            EarlyStopping(patience=8, restore_best_weights=True),
            ReduceLROnPlateau(factor=0.1, patience=4)
        ]
    )
    
    shutil.rmtree(l2_tmp)
    print(f"\n[SUCCESS] Elite {crop} Specialist deployed to /models.")

if __name__ == '__main__':
    print("!!! INITIATING ELITE 99% ACCURACY MASTER SESSION !!!")
    os.makedirs(MODELS_PATH, exist_ok=True)
    hierarchy = prepare_hierarchy()
    if hierarchy:
        # Sort crops to ensure consistent order
        for crop in sorted(hierarchy.keys()):
            folders = hierarchy[crop]
            
            # ELITE FIX: Only train if there is more than 1 category (e.g., Healthy + Disease)
            if len(folders) < 2:
                print(f"[SKIP] {crop} has only {len(folders)} category. Needs at least 2 for diagnostic training.")
                continue
                
            train_specialist(crop, folders)
        print("\n[COMPLETE] All Elite Sovereign Models Saved.")

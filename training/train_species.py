"""
LeafGuard AI – Medicinal Plant Species Model Training Script
Academic Major Project: Electronics and Communication Engineering (ECE)

Pipeline:
1. Load dataset with data augmentation
2. MobileNetV2 Transfer Learning Architecture
3. Train and fine-tune model
4. Save trained model to models/species_model.keras
5. Save class names to models/species_class_names.json
6. Save training history to results/species_history.json
7. Automatically generate training accuracy and loss visualization graphs
"""

import os
import sys
import json
import argparse
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models, callbacks
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

# Add project root to sys.path to import src.visualizations
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from src.visualizations import (
    save_training_history,
    plot_training_accuracy,
    plot_training_loss,
    plot_dataset_distribution,
    load_class_names,
    ensure_dir
)

IMG_SIZE = (224, 224)
BATCH_SIZE = 32
DEFAULT_INITIAL_EPOCHS = 15
DEFAULT_FINE_TUNE_EPOCHS = 10
CLASS_NAMES_FILE = "models/species_class_names.json"


def get_species_classes(dataset_dir: str) -> list:
    """Gets class names dynamically from dataset folder or falls back to JSON file."""
    if os.path.exists(dataset_dir):
        classes = sorted([
            d for d in os.listdir(dataset_dir)
            if os.path.isdir(os.path.join(dataset_dir, d)) and not d.startswith('.')
        ])
        if classes:
            ensure_dir(CLASS_NAMES_FILE)
            with open(CLASS_NAMES_FILE, 'w', encoding='utf-8') as f:
                json.dump(classes, f, indent=2)
            return classes

    saved = load_class_names(CLASS_NAMES_FILE)
    if saved:
        return saved

    default_classes = ['neem', 'tulsi', 'aloe_vera', 'ashwagandha', 'mint', 'curry_leaf']
    ensure_dir(CLASS_NAMES_FILE)
    with open(CLASS_NAMES_FILE, 'w', encoding='utf-8') as f:
        json.dump(default_classes, f, indent=2)
    return default_classes


def build_data_augmentation():
    """Defines spatial data augmentation for leaf specimens."""
    return tf.keras.Sequential([
        layers.RandomFlip("horizontal_and_vertical"),
        layers.RandomRotation(0.2),
        layers.RandomZoom(0.15),
        layers.RandomTranslation(0.1, 0.1),
        layers.RandomContrast(0.15),
    ], name="species_data_augmentation")


def build_species_model(num_classes: int):
    """
    Constructs MobileNetV2 transfer learning model for medicinal plant species identification.
    """
    inputs = tf.keras.Input(shape=(224, 224, 3), name="species_leaf_input")
    augmented = build_data_augmentation()(inputs)
    preprocessed = preprocess_input(augmented)

    base_model = MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=False,
        weights='imagenet'
    )
    base_model.trainable = False

    x = base_model(preprocessed, training=False)
    x = layers.GlobalAveragePooling2D(name="global_avg_pool")(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dense(256, activation='relu', name="dense_feature_projection")(x)
    x = layers.Dropout(0.3, name="dropout_regularization")(x)
    outputs = layers.Dense(num_classes, activation='softmax', name="species_probabilities")(x)

    model = models.Model(inputs=inputs, outputs=outputs, name="LeafGuard_Species_MobileNetV2")
    return model, base_model


def train_species(
    dataset_dir: str = "dataset/species",
    output_model_path: str = "models/species_model.keras",
    epochs: int = DEFAULT_INITIAL_EPOCHS,
    fine_tune_epochs: int = DEFAULT_FINE_TUNE_EPOCHS
):
    """Main training routine for medicinal plant species classification."""
    ensure_dir(output_model_path)
    classes = get_species_classes(dataset_dir)
    print(f"[*] Target Species Classes ({len(classes)}): {classes}")

    # Generate dataset distribution graph if directory exists
    if os.path.exists(dataset_dir):
        try:
            plot_dataset_distribution(
                dataset_dir,
                save_path="results/dataset_species_distribution.png",
                dataset_name="Species"
            )
        except Exception as e:
            print(f"[!] Warning: Could not generate species dataset distribution: {e}")

    if not os.path.exists(dataset_dir):
        print(f"[!] Dataset folder '{dataset_dir}' does not exist on disk.")
        print("    Academic Note: Model evaluation and training graphs will be produced once dataset is populated.")
        print("    Initializing model architecture and saving checkpoint to:", output_model_path)
        model, _ = build_species_model(len(classes))
        model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
        model.save(output_model_path)
        print(f"[✓] Model architecture initialized and exported to '{output_model_path}'.")
        return

    # Ingest data
    print(f"[*] Ingesting dataset from '{dataset_dir}'...")
    train_ds = tf.keras.utils.image_dataset_from_directory(
        dataset_dir,
        validation_split=0.2,
        subset="training",
        seed=42,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode="categorical"
    )

    val_ds = tf.keras.utils.image_dataset_from_directory(
        dataset_dir,
        validation_split=0.2,
        subset="validation",
        seed=42,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode="categorical"
    )

    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.cache().prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)

    model, base_model = build_species_model(len(classes))

    # Phase 1: Train Head
    print("\n--- Phase 1: Training Custom Classification Head ---")
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    cb_list = [
        callbacks.EarlyStopping(monitor='val_loss', patience=4, restore_best_weights=True),
        callbacks.ModelCheckpoint(output_model_path, monitor='val_accuracy', save_best_only=True, verbose=1),
        callbacks.ReduceLROnPlateau(monitor='val_loss', factor=0.2, patience=2, min_lr=1e-6)
    ]

    history_1 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs,
        callbacks=cb_list
    )

    # Phase 2: Fine-Tuning Top Convolutional Layers
    print("\n--- Phase 2: Fine-Tuning MobileNetV2 Layers ---")
    base_model.trainable = True
    for layer in base_model.layers[:100]:
        layer.trainable = False

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    history_2 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs + fine_tune_epochs,
        initial_epoch=epochs,
        callbacks=cb_list
    )

    # Merge history
    combined_history = {}
    for k in history_1.history.keys():
        combined_history[k] = history_1.history[k] + history_2.history.get(k, [])

    # 1. Save history to results/species_history.json
    history_file = "results/species_history.json"
    save_training_history(combined_history, history_file)

    # 2. Automatically generate training graphs
    try:
        plot_training_accuracy(
            combined_history,
            save_path="results/species_training_accuracy.png",
            model_name="Species"
        )
    except Exception as e:
        print(f"[!] Warning: Could not plot species training accuracy: {e}")

    try:
        plot_training_loss(
            combined_history,
            save_path="results/species_training_loss.png",
            model_name="Species"
        )
    except Exception as e:
        print(f"[!] Warning: Could not plot species training loss: {e}")

    print(f"\n[✓] Species Model training and graph generation completed successfully.")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Train LeafGuard AI Species Model")
    parser.add_argument("--data", default="dataset/species", help="Path to medicinal leaf species images")
    parser.add_argument("--output", default="models/species_model.keras", help="Path to save trained .keras model")
    parser.add_argument("--epochs", type=int, default=DEFAULT_INITIAL_EPOCHS, help="Initial training epochs")
    parser.add_argument("--fine_tune_epochs", type=int, default=DEFAULT_FINE_TUNE_EPOCHS, help="Fine-tuning epochs")
    args = parser.parse_args()

    train_species(args.data, args.output, args.epochs, args.fine_tune_epochs)

"""
LeafGuard AI – Unified Training Runner
Academic Major Project: Electronics and Communication Engineering (ECE)

Trains both Species and Disease models, saves models to models/,
records training history to results/, and automatically plots training accuracy & loss curves.
"""

import os
import argparse
from training.train_species import train_species
from training.train_disease import train_disease

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="LeafGuard AI Unified Training Pipeline")
    parser.add_argument("--species_data", default="dataset/species", help="Path to medicinal leaf species images")
    parser.add_argument("--disease_data", default="dataset/disease", help="Path to leaf health/disease images")
    parser.add_argument("--epochs", type=int, default=15, help="Training epochs")
    parser.add_argument("--fine_tune_epochs", type=int, default=10, help="Fine tuning epochs")
    args = parser.parse_args()

    print("\n[1/2] Training Species Identification Model...")
    train_species(
        dataset_dir=args.species_data,
        output_model_path="models/species_model.keras",
        epochs=args.epochs,
        fine_tune_epochs=args.fine_tune_epochs
    )

    print("\n[2/2] Training Foliar Disease Detection Model...")
    train_disease(
        dataset_dir=args.disease_data,
        output_model_path="models/disease_model.keras",
        epochs=args.epochs,
        fine_tune_epochs=args.fine_tune_epochs
    )

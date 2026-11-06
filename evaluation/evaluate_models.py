"""
LeafGuard AI – Academic Model Evaluation & Performance Visualization Script
Department of Electronics and Communication Engineering (ECE) Major Project

Evaluates both Species and Disease/Health models on holdout test datasets:
1. Loads trained species & disease models
2. Loads test datasets (dataset/species_test, dataset/test, dataset/disease_test)
3. Generates actual deep learning predictions
4. Calculates Accuracy, Precision (Macro), Recall (Macro), F1-Score (Macro)
5. Generates Raw & Normalized Confusion Matrices
6. Generates Per-Class Performance Bar Charts
7. Generates Multi-Model Performance Comparison Bar Chart
8. Generates Binary ROC/AUC Curve if mathematically applicable
9. Saves high-resolution (300 DPI) graphs and metrics to results/
"""

import os
import sys
import json
import argparse
from typing import Dict, Any, Tuple, Optional
import numpy as np
import tensorflow as tf
from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    classification_report
)

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from src.visualizations import (
    load_class_names,
    plot_confusion_matrix,
    plot_normalized_confusion_matrix,
    plot_model_comparison,
    plot_per_class_metrics,
    plot_roc_curve,
    plot_dataset_distribution,
    ensure_dir
)

IMG_SIZE = (224, 224)
BATCH_SIZE = 32


def evaluate_single_model(
    model_path: str,
    test_dir: str,
    class_names_path: str,
    model_name: str = "Species"
) -> Tuple[Optional[Dict[str, float]], Optional[Dict[str, Any]], Optional[np.ndarray], Optional[np.ndarray], list]:
    """
    Evaluates one model on its test split and calculates actual predictions & metrics.
    """
    if not os.path.exists(model_path):
        print(f"[!] {model_name} model file not found at: {model_path}")
        return None, None, None, None, []

    if not os.path.exists(test_dir):
        print(f"[!] Test dataset directory for {model_name} not found at: {test_dir}")
        return None, None, None, None, []

    class_names = load_class_names(class_names_path)
    if not class_names:
        class_names = sorted([d for d in os.listdir(test_dir) if os.path.isdir(os.path.join(test_dir, d))])

    print(f"[*] Ingesting {model_name} test dataset from: {test_dir}")
    test_ds = tf.keras.utils.image_dataset_from_directory(
        test_dir,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        shuffle=False,
        label_mode='categorical'
    )

    actual_classes = test_ds.class_names
    if actual_classes and len(actual_classes) == len(class_names):
        class_names = actual_classes

    print(f"[*] Loading model from '{model_path}'...")
    model = tf.keras.models.load_model(model_path)

    y_true_list = []
    y_prob_list = []

    print(f"[*] Running inference on {model_name} test specimens...")
    for images, labels in test_ds:
        preds = model.predict(images, verbose=0)
        y_prob_list.append(preds)
        y_true_list.append(np.argmax(labels.numpy(), axis=1))

    y_true = np.concatenate(y_true_list, axis=0)
    y_prob = np.concatenate(y_prob_list, axis=0)
    y_pred = np.argmax(y_prob, axis=1)

    acc = float(accuracy_score(y_true, y_pred))
    prec, rec, f1, _ = precision_recall_fscore_support(y_true, y_pred, average='macro', zero_division=0)

    summary_metrics = {
        "accuracy": round(acc, 4),
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "f1_score": round(float(f1), 4),
        "test_samples": int(len(y_true))
    }

    report = classification_report(
        y_true,
        y_pred,
        target_names=class_names,
        output_dict=True,
        zero_division=0
    )

    return summary_metrics, report, y_true, y_prob, class_names


def run_full_evaluation(
    species_model_path: str = "models/species_model.keras",
    disease_model_path: str = "models/disease_model.keras",
    species_test_dir: str = "dataset/test",
    disease_test_dir: str = "dataset/disease_test",
    species_classes_path: str = "models/species_class_names.json",
    disease_classes_path: str = "models/disease_class_names.json",
    results_dir: str = "results"
) -> Dict[str, Any]:
    """
    Executes full academic evaluation across all models and automatically generates all required graphs.
    """
    os.makedirs(results_dir, exist_ok=True)
    metrics_summary: Dict[str, Any] = {}

    print("=" * 65)
    print("      LEAFGUARD AI – AUTOMATIC ACADEMIC EVALUATION SYSTEM")
    print("=" * 65)

    # 1. Evaluate Species Model
    print("\n--- Evaluating Species Identification Model ---")
    sp_metrics, sp_report, sp_true, sp_prob, sp_classes = evaluate_single_model(
        species_model_path,
        species_test_dir,
        species_classes_path,
        model_name="Species"
    )

    if sp_metrics is not None and sp_report is not None and sp_true is not None:
        metrics_summary["species"] = sp_metrics
        sp_pred = np.argmax(sp_prob, axis=1)

        # Generate Confusion Matrices
        plot_confusion_matrix(
            sp_true,
            sp_pred,
            sp_classes,
            save_path=os.path.join(results_dir, "species_confusion_matrix.png"),
            model_name="Species"
        )
        plot_normalized_confusion_matrix(
            sp_true,
            sp_pred,
            sp_classes,
            save_path=os.path.join(results_dir, "species_confusion_matrix_normalized.png"),
            model_name="Species"
        )

        # Generate Per-Class Performance
        plot_per_class_metrics(
            sp_report,
            sp_classes,
            save_path=os.path.join(results_dir, "species_per_class_metrics.png"),
            model_name="Species"
        )

        # Save per-class metrics JSON
        with open(os.path.join(results_dir, "species_per_class_metrics.json"), 'w', encoding='utf-8') as f:
            json.dump(sp_report, f, indent=2)

    # 2. Evaluate Disease Model
    print("\n--- Evaluating Foliar Disease & Health Model ---")
    # Check alternate paths for disease test dataset if default does not exist
    actual_disease_test = disease_test_dir
    if not os.path.exists(actual_disease_test) and os.path.exists("dataset/disease"):
        actual_disease_test = "dataset/disease"

    dis_metrics, dis_report, dis_true, dis_prob, dis_classes = evaluate_single_model(
        disease_model_path,
        actual_disease_test,
        disease_classes_path,
        model_name="Disease"
    )

    if dis_metrics is not None and dis_report is not None and dis_true is not None:
        metrics_summary["disease"] = dis_metrics
        dis_pred = np.argmax(dis_prob, axis=1)

        # Generate Confusion Matrices
        plot_confusion_matrix(
            dis_true,
            dis_pred,
            dis_classes,
            save_path=os.path.join(results_dir, "disease_confusion_matrix.png"),
            model_name="Disease"
        )
        plot_normalized_confusion_matrix(
            dis_true,
            dis_pred,
            dis_classes,
            save_path=os.path.join(results_dir, "disease_confusion_matrix_normalized.png"),
            model_name="Disease"
        )

        # Generate Per-Class Performance
        plot_per_class_metrics(
            dis_report,
            dis_classes,
            save_path=os.path.join(results_dir, "disease_per_class_metrics.png"),
            model_name="Disease"
        )

        # Binary ROC Curve if applicable
        if len(np.unique(dis_true)) == 2 and dis_prob.shape[1] == 2:
            try:
                plot_roc_curve(
                    dis_true,
                    dis_prob,
                    save_path=os.path.join(results_dir, "disease_roc_curve.png"),
                    model_name="Disease"
                )
            except Exception as e:
                print(f"[!] ROC Curve skipped: {e}")
        else:
            print("[*] ROC Curve skipped: Not configured as binary probability output.")

        # Save per-class metrics JSON
        with open(os.path.join(results_dir, "disease_per_class_metrics.json"), 'w', encoding='utf-8') as f:
            json.dump(dis_report, f, indent=2)

    # 3. Model Performance Comparison Graph
    if metrics_summary:
        plot_model_comparison(
            metrics_summary,
            save_path=os.path.join(results_dir, "model_metrics_comparison.png")
        )

        # Save metrics.json
        metrics_file = os.path.join(results_dir, "metrics.json")
        with open(metrics_file, 'w', encoding='utf-8') as f:
            json.dump(metrics_summary, f, indent=2)
        print(f"\n[✓] Evaluation metrics successfully saved to: {metrics_file}")

    # 4. Dataset Class Distribution Graphs (if folders exist)
    if os.path.exists("dataset/species"):
        plot_dataset_distribution("dataset/species", os.path.join(results_dir, "dataset_species_distribution.png"), "Species")
    if os.path.exists("dataset/disease"):
        plot_dataset_distribution("dataset/disease", os.path.join(results_dir, "dataset_disease_distribution.png"), "Disease")

    print("\n" + "=" * 65)
    print("      EVALUATION AND GRAPH GENERATION COMPLETE")
    print("=" * 65)
    return metrics_summary


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Evaluate LeafGuard AI Models and Generate Graphs")
    parser.add_argument("--species_model", default="models/species_model.keras")
    parser.add_argument("--disease_model", default="models/disease_model.keras")
    parser.add_argument("--species_test", default="dataset/test")
    parser.add_argument("--disease_test", default="dataset/disease_test")
    parser.add_argument("--results_dir", default="results")
    args = parser.parse_args()

    run_full_evaluation(
        species_model_path=args.species_model,
        disease_model_path=args.disease_model,
        species_test_dir=args.species_test,
        disease_test_dir=args.disease_test,
        results_dir=args.results_dir
    )

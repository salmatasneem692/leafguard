"""
LeafGuard AI – Central Performance Visualization Module
Academic Major Project: Electronics and Communication Engineering (ECE)

Contains reusable, publication-grade graph generation routines for:
- Training and validation accuracy curves
- Training and validation loss curves
- Raw and normalized confusion matrices
- Multi-metric model performance comparisons
- Per-class precision, recall, and F1-score breakdowns
- Dataset class distribution histograms
- Receiver Operating Characteristic (ROC) curves
"""

import os
import json
from typing import Dict, List, Optional, Union, Any
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Headless execution for servers and CLI
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    confusion_matrix,
    classification_report,
    roc_curve,
    auc,
    accuracy_score,
    precision_recall_fscore_support
)

# Professional visualization styling for academic project reports
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Arial', 'Helvetica']
plt.rcParams['axes.edgecolor'] = '#cbd5e1'
plt.rcParams['axes.linewidth'] = 0.8


def ensure_dir(file_path: str) -> None:
    """Creates the parent directory for a given file path if it does not exist."""
    directory = os.path.dirname(file_path)
    if directory and not os.path.exists(directory):
        os.makedirs(directory, exist_ok=True)


def load_class_names(json_path: str) -> List[str]:
    """
    Loads class names dynamically from a JSON file.
    Falls back gracefully if the file is missing.
    """
    if os.path.exists(json_path):
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, list) and len(data) > 0:
                    return [str(item) for item in data]
        except Exception as e:
            print(f"[!] Warning reading class names from {json_path}: {e}")
    return []


def save_training_history(history: Any, save_path: str = "results/species_history.json") -> Dict[str, List[float]]:
    """
    Extracts numerical metrics from a Keras History object or dict and saves as JSON.
    """
    ensure_dir(save_path)
    history_dict: Dict[str, List[float]] = {}
    
    if hasattr(history, 'history'):
        raw = history.history
    elif isinstance(history, dict):
        raw = history
    else:
        raw = {}

    for k, v in raw.items():
        if isinstance(v, (list, np.ndarray)):
            history_dict[k] = [float(x) for x in v]

    with open(save_path, 'w', encoding='utf-8') as f:
        json.dump(history_dict, f, indent=2)

    print(f"[✓] Training history saved successfully to {save_path}")
    return history_dict


def plot_training_accuracy(
    history_data: Union[Dict[str, List[float]], str],
    save_path: Optional[str] = "results/species_training_accuracy.png",
    model_name: str = "Species",
    dpi: int = 300
) -> Optional[plt.Figure]:
    """
    Plots Training vs Validation Accuracy across epochs from actual history data.
    """
    if isinstance(history_data, str):
        if not os.path.exists(history_data):
            print(f"[!] History file not found at: {history_data}")
            return None
        with open(history_data, 'r', encoding='utf-8') as f:
            history_data = json.load(f)

    # Safely detect accuracy keys
    acc_key = next((k for k in ['accuracy', 'acc', 'train_acc'] if k in history_data), None)
    val_acc_key = next((k for k in ['val_accuracy', 'val_acc', 'val_train_acc'] if k in history_data), None)

    if not acc_key:
        print(f"[!] No accuracy metric found in history for {model_name} model.")
        return None

    train_acc = history_data[acc_key]
    val_acc = history_data.get(val_acc_key, None)
    epochs = list(range(1, len(train_acc) + 1))

    fig, ax = plt.subplots(figsize=(8, 5.5))
    ax.plot(epochs, train_acc, label='Training Accuracy', color='#047857', linewidth=2.2, marker='o', markersize=4)
    if val_acc and len(val_acc) == len(train_acc):
        ax.plot(epochs, val_acc, label='Validation Accuracy', color='#0284c7', linewidth=2.2, linestyle='--', marker='s', markersize=4)

    ax.set_title(f"{model_name} Model Training and Validation Accuracy", fontsize=13, fontweight='bold', pad=12, color='#0f172a')
    ax.set_xlabel("Epoch", fontsize=11, fontweight='medium', color='#1e293b')
    ax.set_ylabel("Accuracy", fontsize=11, fontweight='medium', color='#1e293b')
    ax.set_ylim([max(0.0, min(train_acc) - 0.05), min(1.02, max(train_acc) + 0.05)])
    ax.grid(True, linestyle=':', alpha=0.6)
    ax.legend(loc='lower right', frameon=True, framealpha=0.9, fontsize=10)
    plt.tight_layout()

    if save_path:
        ensure_dir(save_path)
        fig.savefig(save_path, dpi=dpi)
        print(f"[✓] Accuracy graph saved to: {save_path}")

    return fig


def plot_training_loss(
    history_data: Union[Dict[str, List[float]], str],
    save_path: Optional[str] = "results/species_training_loss.png",
    model_name: str = "Species",
    dpi: int = 300
) -> Optional[plt.Figure]:
    """
    Plots Training vs Validation Loss across epochs from actual history data.
    """
    if isinstance(history_data, str):
        if not os.path.exists(history_data):
            print(f"[!] History file not found at: {history_data}")
            return None
        with open(history_data, 'r', encoding='utf-8') as f:
            history_data = json.load(f)

    loss_key = next((k for k in ['loss', 'train_loss'] if k in history_data), None)
    val_loss_key = next((k for k in ['val_loss'] if k in history_data), None)

    if not loss_key:
        print(f"[!] No loss metric found in history for {model_name} model.")
        return None

    train_loss = history_data[loss_key]
    val_loss = history_data.get(val_loss_key, None)
    epochs = list(range(1, len(train_loss) + 1))

    fig, ax = plt.subplots(figsize=(8, 5.5))
    ax.plot(epochs, train_loss, label='Training Loss', color='#b91c1c', linewidth=2.2, marker='o', markersize=4)
    if val_loss and len(val_loss) == len(train_loss):
        ax.plot(epochs, val_loss, label='Validation Loss', color='#d97706', linewidth=2.2, linestyle='--', marker='^', markersize=4)

    ax.set_title(f"{model_name} Model Training and Validation Loss", fontsize=13, fontweight='bold', pad=12, color='#0f172a')
    ax.set_xlabel("Epoch", fontsize=11, fontweight='medium', color='#1e293b')
    ax.set_ylabel("Loss (Cross-Entropy)", fontsize=11, fontweight='medium', color='#1e293b')
    ax.grid(True, linestyle=':', alpha=0.6)
    ax.legend(loc='upper right', frameon=True, framealpha=0.9, fontsize=10)
    plt.tight_layout()

    if save_path:
        ensure_dir(save_path)
        fig.savefig(save_path, dpi=dpi)
        print(f"[✓] Loss graph saved to: {save_path}")

    return fig


def plot_confusion_matrix(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    class_names: List[str],
    save_path: Optional[str] = "results/species_confusion_matrix.png",
    model_name: str = "Species",
    dpi: int = 300
) -> Optional[plt.Figure]:
    """
    Plots and saves the raw count confusion matrix using actual test predictions.
    """
    if len(y_true) == 0 or len(y_pred) == 0:
        print(f"[!] Cannot generate confusion matrix: empty predictions.")
        return None

    cm = confusion_matrix(y_true, y_pred)
    display_names = [name.replace('_', ' ').title() for name in class_names]

    fig_size = (max(7, len(class_names) * 1.1), max(6, len(class_names) * 0.95))
    fig, ax = plt.subplots(figsize=fig_size)

    sns.heatmap(
        cm,
        annot=True,
        fmt='d',
        cmap='Greens' if model_name.lower() == 'species' else 'Blues',
        xticklabels=display_names,
        yticklabels=display_names,
        cbar=True,
        ax=ax,
        linewidths=0.7,
        linecolor='#e2e8f0'
    )

    ax.set_title(f"{model_name} Classification Confusion Matrix", fontsize=13, fontweight='bold', pad=14, color='#0f172a')
    ax.set_xlabel("Predicted Class", fontsize=11, fontweight='medium', labelpad=8, color='#1e293b')
    ax.set_ylabel("Actual Class (Ground Truth)", fontsize=11, fontweight='medium', labelpad=8, color='#1e293b')
    plt.xticks(rotation=30, ha='right', fontsize=9.5)
    plt.yticks(rotation=0, fontsize=9.5)
    plt.tight_layout()

    if save_path:
        ensure_dir(save_path)
        fig.savefig(save_path, dpi=dpi)
        print(f"[✓] Confusion matrix saved to: {save_path}")

    return fig


def plot_normalized_confusion_matrix(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    class_names: List[str],
    save_path: Optional[str] = "results/species_confusion_matrix_normalized.png",
    model_name: str = "Species",
    dpi: int = 300
) -> Optional[plt.Figure]:
    """
    Plots and saves the normalized (proportions/percentages) confusion matrix.
    """
    if len(y_true) == 0 or len(y_pred) == 0:
        print(f"[!] Cannot generate normalized confusion matrix: empty predictions.")
        return None

    cm = confusion_matrix(y_true, y_pred)
    row_sums = cm.sum(axis=1)[:, np.newaxis]
    # Safe divide to prevent ZeroDivisionError
    cm_norm = np.divide(cm.astype('float'), row_sums, out=np.zeros_like(cm, dtype=float), where=row_sums != 0)

    display_names = [name.replace('_', ' ').title() for name in class_names]
    fig_size = (max(7, len(class_names) * 1.1), max(6, len(class_names) * 0.95))
    fig, ax = plt.subplots(figsize=fig_size)

    sns.heatmap(
        cm_norm,
        annot=True,
        fmt='.2%',
        cmap='YlGn' if model_name.lower() == 'species' else 'PuBu',
        xticklabels=display_names,
        yticklabels=display_names,
        cbar=True,
        ax=ax,
        linewidths=0.7,
        linecolor='#e2e8f0',
        vmin=0.0,
        vmax=1.0
    )

    ax.set_title(f"{model_name} Normalized Confusion Matrix (Proportions)", fontsize=13, fontweight='bold', pad=14, color='#0f172a')
    ax.set_xlabel("Predicted Class", fontsize=11, fontweight='medium', labelpad=8, color='#1e293b')
    ax.set_ylabel("Actual Class (Ground Truth)", fontsize=11, fontweight='medium', labelpad=8, color='#1e293b')
    plt.xticks(rotation=30, ha='right', fontsize=9.5)
    plt.yticks(rotation=0, fontsize=9.5)
    plt.tight_layout()

    if save_path:
        ensure_dir(save_path)
        fig.savefig(save_path, dpi=dpi)
        print(f"[✓] Normalized confusion matrix saved to: {save_path}")

    return fig


def plot_model_comparison(
    metrics_dict: Dict[str, Dict[str, float]],
    save_path: Optional[str] = "results/model_metrics_comparison.png",
    dpi: int = 300
) -> Optional[plt.Figure]:
    """
    Generates a grouped bar chart comparing Accuracy, Precision, Recall, and F1-score
    between Species and Disease/Health models from actual test predictions.
    """
    metrics_keys = ['accuracy', 'precision', 'recall', 'f1_score']
    metric_labels = ['Accuracy', 'Precision (Macro)', 'Recall (Macro)', 'F1-Score (Macro)']

    # Verify presence of models
    models_present = [m for m in ['species', 'disease'] if m in metrics_dict]
    if not models_present:
        print("[!] No model metrics available for comparison.")
        return None

    x = np.arange(len(metric_labels))
    width = 0.35 if len(models_present) > 1 else 0.45

    fig, ax = plt.subplots(figsize=(9, 5.5))

    colors = {
        'species': '#059669',  # Emerald
        'disease': '#2563eb'   # Cobalt Blue
    }
    offsets = {
        'species': -width / 2 if len(models_present) > 1 else 0,
        'disease': width / 2 if len(models_present) > 1 else 0
    }

    for model_key in models_present:
        model_name = "Species Model" if model_key == 'species' else "Disease Model"
        vals = [metrics_dict[model_key].get(k, 0.0) for k in metrics_keys]
        # Normalize to 0-100% scale if stored as decimals
        vals_pct = [v * 100 if v <= 1.0 else v for v in vals]

        rects = ax.bar(x + offsets[model_key], vals_pct, width, label=model_name, color=colors[model_key], edgecolor='#0f172a', linewidth=0.5)

        # Value annotations on bars
        for rect in rects:
            height = rect.get_height()
            ax.annotate(
                f'{height:.1f}%',
                xy=(rect.get_x() + rect.get_width() / 2, height),
                xytext=(0, 3),
                textcoords="offset points",
                ha='center', va='bottom',
                fontsize=8.5,
                fontweight='semibold'
            )

    ax.set_title("Comparison of Species and Disease Model Performance", fontsize=13, fontweight='bold', pad=14, color='#0f172a')
    ax.set_ylabel("Score (%)", fontsize=11, fontweight='medium', color='#1e293b')
    ax.set_xticks(x)
    ax.set_xticklabels(metric_labels, fontsize=10, fontweight='medium')
    ax.set_ylim([0, 110])
    ax.grid(axis='y', linestyle=':', alpha=0.7)
    ax.legend(loc='lower right', frameon=True, framealpha=0.9, fontsize=10)
    plt.tight_layout()

    if save_path:
        ensure_dir(save_path)
        fig.savefig(save_path, dpi=dpi)
        print(f"[✓] Model performance comparison graph saved to: {save_path}")

    return fig


def plot_per_class_metrics(
    report_dict: Dict[str, Any],
    class_names: List[str],
    save_path: Optional[str] = "results/species_per_class_metrics.png",
    model_name: str = "Species",
    dpi: int = 300
) -> Optional[plt.Figure]:
    """
    Generates a grouped horizontal or vertical bar chart of Precision, Recall, and F1-score for each class.
    """
    valid_classes = [c for c in class_names if c in report_dict]
    if not valid_classes:
        # Fallback to string keys of numerical indices if classes were formatted that way
        valid_classes = [str(i) for i in range(len(class_names)) if str(i) in report_dict]
        display_names = [class_names[int(i)].replace('_', ' ').title() for i in valid_classes]
    else:
        display_names = [c.replace('_', ' ').title() for c in valid_classes]

    if not valid_classes:
        print(f"[!] No matching classes found in classification report for {model_name}.")
        return None

    precisions = [report_dict[c]['precision'] * 100 for c in valid_classes]
    recalls = [report_dict[c]['recall'] * 100 for c in valid_classes]
    f1s = [report_dict[c]['f1-score'] * 100 for c in valid_classes]

    y = np.arange(len(display_names))
    height = 0.25

    fig_height = max(5.5, len(display_names) * 0.8)
    fig, ax = plt.subplots(figsize=(10, fig_height))

    r1 = ax.barh(y - height, precisions, height, label='Precision', color='#10b981', edgecolor='#0f172a', linewidth=0.5)
    r2 = ax.barh(y, recalls, height, label='Recall', color='#3b82f6', edgecolor='#0f172a', linewidth=0.5)
    r3 = ax.barh(y + height, f1s, height, label='F1-Score', color='#8b5cf6', edgecolor='#0f172a', linewidth=0.5)

    ax.set_title(f"{model_name} Model Performance by Class", fontsize=13, fontweight='bold', pad=14, color='#0f172a')
    ax.set_xlabel("Score (%)", fontsize=11, fontweight='medium', color='#1e293b')
    ax.set_yticks(y)
    ax.set_yticklabels(display_names, fontsize=10, fontweight='medium')
    ax.set_xlim([0, 115])
    ax.grid(axis='x', linestyle=':', alpha=0.7)
    ax.legend(loc='lower right', frameon=True, framealpha=0.9, fontsize=9.5)
    plt.tight_layout()

    if save_path:
        ensure_dir(save_path)
        fig.savefig(save_path, dpi=dpi)
        print(f"[✓] Per-class metrics graph saved to: {save_path}")

    return fig


def plot_dataset_distribution(
    dataset_dir_or_counts: Union[str, Dict[str, int]],
    save_path: Optional[str] = "results/dataset_species_distribution.png",
    dataset_name: str = "Species",
    dpi: int = 300
) -> Optional[plt.Figure]:
    """
    Counts images in each subfolder dynamically and plots the class distribution.
    """
    counts: Dict[str, int] = {}

    if isinstance(dataset_dir_or_counts, str):
        if not os.path.exists(dataset_dir_or_counts):
            print(f"[!] Dataset directory '{dataset_dir_or_counts}' not found.")
            return None
        valid_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}
        for entry in sorted(os.listdir(dataset_dir_or_counts)):
            class_path = os.path.join(dataset_dir_or_counts, entry)
            if os.path.isdir(class_path):
                img_count = sum(1 for f in os.listdir(class_path) if os.path.splitext(f)[1].lower() in valid_extensions)
                counts[entry] = img_count
    elif isinstance(dataset_dir_or_counts, dict):
        counts = dataset_dir_or_counts

    if not counts:
        print(f"[!] No classes or images found for {dataset_name} dataset distribution.")
        return None

    labels = [k.replace('_', ' ').title() for k in counts.keys()]
    values = list(counts.values())

    fig, ax = plt.subplots(figsize=(max(7.5, len(labels) * 1.1), 5))
    bars = ax.bar(labels, values, color='#0d9488' if dataset_name.lower() == 'species' else '#4f46e5', edgecolor='#0f172a', linewidth=0.6)

    # Value labels
    for bar in bars:
        h = bar.get_height()
        ax.annotate(
            f'{h}',
            xy=(bar.get_x() + bar.get_width() / 2, h),
            xytext=(0, 3),
            textcoords="offset points",
            ha='center', va='bottom',
            fontsize=9, fontweight='semibold'
        )

    ax.set_title(f"{dataset_name} Dataset Class Distribution", fontsize=13, fontweight='bold', pad=14, color='#0f172a')
    ax.set_xlabel(f"{dataset_name} Class", fontsize=11, fontweight='medium', color='#1e293b')
    ax.set_ylabel("Number of Images", fontsize=11, fontweight='medium', color='#1e293b')
    ax.set_ylim([0, max(values) * 1.15 if values else 10])
    plt.xticks(rotation=25, ha='right', fontsize=9.5)
    ax.grid(axis='y', linestyle=':', alpha=0.7)
    plt.tight_layout()

    if save_path:
        ensure_dir(save_path)
        fig.savefig(save_path, dpi=dpi)
        print(f"[✓] Dataset distribution graph saved to: {save_path}")

    return fig


def plot_roc_curve(
    y_true: np.ndarray,
    y_prob: np.ndarray,
    save_path: Optional[str] = "results/disease_roc_curve.png",
    model_name: str = "Disease",
    dpi: int = 300
) -> Optional[plt.Figure]:
    """
    Plots Receiver Operating Characteristic (ROC) curve and Area Under Curve (AUC).
    Strictly generated only when mathematical probability predictions exist.
    """
    # Verify binary classification conditions
    unique_labels = np.unique(y_true)
    if len(unique_labels) != 2:
        print(f"[!] ROC curve generation requires binary classification (found {len(unique_labels)} classes).")
        return None

    # If probability has 2 columns, take positive class (column 1)
    if y_prob.ndim == 2:
        if y_prob.shape[1] == 2:
            scores = y_prob[:, 1]
        else:
            print("[!] Probability dimension mismatch for binary ROC.")
            return None
    else:
        scores = y_prob

    fpr, tpr, _ = roc_curve(y_true, scores)
    roc_auc = auc(fpr, tpr)

    fig, ax = plt.subplots(figsize=(7, 6))
    ax.plot(fpr, tpr, color='#2563eb', linewidth=2.5, label=f'ROC Curve (AUC = {roc_auc:.4f})')
    ax.plot([0, 1], [0, 1], color='#94a3b8', linestyle='--', linewidth=1.5, label='Random Chance Baseline')

    ax.set_title(f"{model_name} Model Receiver Operating Characteristic (ROC)", fontsize=13, fontweight='bold', pad=14, color='#0f172a')
    ax.set_xlabel("False Positive Rate (1 - Specificity)", fontsize=11, fontweight='medium', color='#1e293b')
    ax.set_ylabel("True Positive Rate (Sensitivity)", fontsize=11, fontweight='medium', color='#1e293b')
    ax.set_xlim([-0.02, 1.02])
    ax.set_ylim([-0.02, 1.05])
    ax.grid(True, linestyle=':', alpha=0.6)
    ax.legend(loc='lower right', frameon=True, framealpha=0.9, fontsize=10)
    plt.tight_layout()

    if save_path:
        ensure_dir(save_path)
        fig.savefig(save_path, dpi=dpi)
        print(f"[✓] ROC curve saved to: {save_path}")

    return fig

"""
LeafGuard AI – Streamlit Web Application
Medicinal Plant Identification and Leaf Disease Detection System
Department of Electronics and Communication Engineering (ECE) Major Project

Features:
1. Leaf Analyzer: Image upload / camera capture, preprocessing (224x224 RGB),
   MobileNetV2 species identification, health/disease diagnosis, and medicinal compendium.
2. Model Performance Dashboard: Complete visualization module featuring training curves,
   confusion matrices, model comparisons, per-class metrics, and dataset distributions.
3. One-click "Generate All Graphs" routine based strictly on real dataset and model artifacts.
"""

import os
import io
import json
import base64
from typing import Optional, List, Dict, Any
import numpy as np
from PIL import Image
import streamlit as st

# Import visualization utilities
from src.visualizations import (
    load_class_names,
    plot_training_accuracy,
    plot_training_loss,
    plot_confusion_matrix,
    plot_normalized_confusion_matrix,
    plot_model_comparison,
    plot_per_class_metrics,
    plot_dataset_distribution,
    plot_roc_curve,
    ensure_dir
)
from evaluation.evaluate_models import run_full_evaluation

# Set page config
st.set_page_config(
    page_title="LeafGuard AI – Medicinal Plant & Disease Detection",
    page_icon="🌿",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Botanical and Medicinal Database (for all 6 classes)
MEDICINAL_INFO = {
    "neem": {
        "name": "Neem",
        "scientific_name": "Azadirachta indica",
        "family": "Meliaceae",
        "uses": [
            "Traditional dermatological applications for eczema, acne, and skin ailments.",
            "Herbal oral hygiene twig (Datun) with anti-gingivitis properties.",
            "Potent organic biopesticide and insect repellent for sustainable farming."
        ],
        "active_compounds": ["Azadirachtin", "Nimbin", "Nimbidin", "Gedunin"],
        "precautions": "Avoid large oral dosages during pregnancy or planning conception."
    },
    "tulsi": {
        "name": "Tulsi",
        "scientific_name": "Ocimum tenuiflorum",
        "family": "Lamiaceae",
        "uses": [
            "Herbal tea infusion (Kadha) for upper respiratory tract comfort and cough relief.",
            "Premier herbal adaptogen aiding metabolic and psychological stress resistance.",
            "Supports cardiovascular arterial elasticity and healthy glucose levels."
        ],
        "active_compounds": ["Eugenol", "Ursolic acid", "Rosmarinic acid", "Caryophyllene"],
        "precautions": "May enhance anticoagulant actions; consult physician before surgeries."
    },
    "aloe_vera": {
        "name": "Aloe Vera",
        "scientific_name": "Aloe barbadensis miller",
        "family": "Asphodelaceae",
        "uses": [
            "Inner parenchyma gel applied for burns, sunburns, and cutaneous hydration.",
            "Moisturizing mucosal soothing agent promoting epidermal barrier repair.",
            "Purified inner juice used traditionally for gentle gastric transit support."
        ],
        "active_compounds": ["Acemannan", "Aloin", "Aloe-emodin", "Vitamins A, C, E"],
        "precautions": "Avoid consuming unprocessed yellow aloin latex beneath the outer rind."
    },
    "ashwagandha": {
        "name": "Ashwagandha",
        "scientific_name": "Withania somnifera",
        "family": "Solanaceae",
        "uses": [
            "Adaptogenic Rasayana modulating the HPA axis to mitigate stress and cortisol.",
            "Supports neuromuscular stamina, endurance recovery, and physical vigor.",
            "Promotes calm, restorative sleep through balanced GABAergic pathways."
        ],
        "active_compounds": ["Withanolides (Withaferin A)", "Withanine", "Sitoindosides"],
        "precautions": "Contraindicated at high medicinal dosages during pregnancy."
    },
    "mint": {
        "name": "Mint / Pudina",
        "scientific_name": "Mentha spicata / Mentha piperita",
        "family": "Lamiaceae",
        "uses": [
            "Widely prepared for digestive soothe, bloating relief, and nausea control.",
            "Inhaled menthol vapors help clear congested nasal passages.",
            "Cooling cephalic topical application in soothing balms for muscle aches."
        ],
        "active_compounds": ["Menthol", "Menthone", "Carvone", "Limonene"],
        "precautions": "Individuals with severe gastroesophageal reflux should ingest with moderation."
    },
    "curry_leaf": {
        "name": "Curry Leaf / Kadi Patta",
        "scientific_name": "Murraya koenigii",
        "family": "Rutaceae",
        "uses": [
            "Infused in pure coconut oil as a hair tonic to preserve natural hair pigmentation.",
            "Appetite stimulant supporting healthy postprandial glucose balance.",
            "Rich in bioavailable dietary iron, vitamin A, and carbazole antioxidants."
        ],
        "active_compounds": ["Mahanimbine", "Girinimbine", "Koenimbine", "Beta-caryophyllene"],
        "precautions": "Ensure fresh leaves are washed thoroughly to eliminate external contaminants."
    }
}

DISEASE_RECOMMENDATIONS = {
    "healthy": [
        "Maintain current sunlight and irrigation schedule.",
        "Inspect leaf undersides periodically for early insect scale or mite colonies.",
        "Maintain adequate aeration between plant foliage."
    ],
    "diseased": [
        "Prune and destroy severely infected leaf foliage to minimize pathogen transmission.",
        "Apply organic copper-based fungicide or 5% neem seed kernel extract (NSKE) at 10-day intervals.",
        "Avoid high-pressure overhead irrigation that splashes soil fungi onto upper leaves.",
        "Ensure full morning direct sunlight to accelerate foliar moisture evaporation."
    ]
}


def load_cached_keras_model(model_path: str):
    """Loads and caches Keras models safely."""
    if not os.path.exists(model_path):
        return None
    try:
        import tensorflow as tf
        return tf.keras.models.load_model(model_path)
    except Exception as e:
        st.warning(f"Failed to load model from {model_path}: {e}")
        return None


def preprocess_image(image: Image.Image) -> Tuple[np.ndarray, float, float]:
    """
    Resizes image to 224x224 RGB, normalizes to [-1.0, 1.0], and computes ExG index.
    """
    img_rgb = image.convert("RGB").resize((224, 224))
    img_arr = np.array(img_rgb, dtype=np.float32)

    # Calculate Excess Green Index (2G - R - B)
    mean_r = np.mean(img_arr[:, :, 0])
    mean_g = np.mean(img_arr[:, :, 1])
    mean_b = np.mean(img_arr[:, :, 2])
    exg_index = 2 * mean_g - mean_r - mean_b

    # Sharpness estimate using variance of Laplacian approximation
    gray = np.dot(img_arr[..., :3], [0.2989, 0.5870, 0.1140])
    laplacian_var = float(np.var(np.diff(gray, axis=0)) + np.var(np.diff(gray, axis=1)))

    # MobileNetV2 normalization: (x / 127.5) - 1.0
    normalized = (img_arr / 127.5) - 1.0
    batch = np.expand_dims(normalized, axis=0)

    return batch, exg_index, laplacian_var


def generate_all_available_graphs():
    """
    Checks real artifacts on disk and generates all graphs directly from real data.
    """
    results_dir = "results"
    os.makedirs(results_dir, exist_ok=True)
    generated = []
    warnings = []

    # 1. Species Training Curves
    sp_hist_file = os.path.join(results_dir, "species_history.json")
    if os.path.exists(sp_hist_file):
        plot_training_accuracy(sp_hist_file, os.path.join(results_dir, "species_training_accuracy.png"), "Species")
        plot_training_loss(sp_hist_file, os.path.join(results_dir, "species_training_loss.png"), "Species")
        generated.append("Species Training & Validation Curves")
    else:
        warnings.append("Species training history is not available. Train the species model first (`python training/train_species.py`).")

    # 2. Disease Training Curves
    dis_hist_file = os.path.join(results_dir, "disease_history.json")
    if os.path.exists(dis_hist_file):
        plot_training_accuracy(dis_hist_file, os.path.join(results_dir, "disease_training_accuracy.png"), "Disease")
        plot_training_loss(dis_hist_file, os.path.join(results_dir, "disease_training_loss.png"), "Disease")
        generated.append("Disease Training & Validation Curves")
    else:
        warnings.append("Disease training history is not available. Train the disease model first (`python training/train_disease.py`).")

    # 3. Dataset Distribution Graphs
    if os.path.exists("dataset/species"):
        plot_dataset_distribution("dataset/species", os.path.join(results_dir, "dataset_species_distribution.png"), "Species")
        generated.append("Species Dataset Distribution")
    else:
        warnings.append("Species dataset directory ('dataset/species') was not found.")

    if os.path.exists("dataset/disease"):
        plot_dataset_distribution("dataset/disease", os.path.join(results_dir, "dataset_disease_distribution.png"), "Disease")
        generated.append("Disease Dataset Distribution")
    else:
        warnings.append("Disease dataset directory ('dataset/disease') was not found.")

    # 4. Model Evaluation (Confusion matrices, comparison, per-class, ROC)
    has_species_model = os.path.exists("models/species_model.keras")
    has_disease_model = os.path.exists("models/disease_model.keras")
    has_test_data = os.path.exists("dataset/test") or os.path.exists("dataset/disease")

    if (has_species_model or has_disease_model) and has_test_data:
        try:
            run_full_evaluation(
                species_model_path="models/species_model.keras",
                disease_model_path="models/disease_model.keras",
                species_test_dir="dataset/test",
                disease_test_dir="dataset/disease",
                results_dir="results"
            )
            generated.append("Test Set Confusion Matrices & Performance Comparison")
        except Exception as e:
            warnings.append(f"Evaluation error: {e}")
    else:
        if not (has_species_model or has_disease_model):
            warnings.append("Trained model files ('models/species_model.keras', 'models/disease_model.keras') are not available. Train models to generate confusion matrices and test metrics.")
        if not has_test_data:
            warnings.append("Test dataset split ('dataset/test') not found on disk.")

    return generated, warnings


# --------------------------------------------------------------------------------
# MAIN APPLICATION INTERFACE
# --------------------------------------------------------------------------------

st.title("🌿 LeafGuard AI")
st.caption("AI-Powered Medicinal Plant Identification & Leaf Health Detection System · ECE Major Project")

tabs = st.tabs(["🍃 Leaf Analyzer", "📊 Model Performance", "📖 Medicinal Compendium", "🏛 Architecture & Guide"])

# --------------------------------------------------------------------------------
# TAB 1: LEAF ANALYZER & DIAGNOSIS
# --------------------------------------------------------------------------------
with tabs[0]:
    st.subheader("Foliar Diagnostic Pipeline")
    st.write(
        "Upload a leaf image or take a photo with your camera to detect the medicinal plant species, "
        "evaluate foliar disease conditions, and inspect botanical pharmacological traits."
    )

    species_model = load_cached_keras_model("models/species_model.keras")
    disease_model = load_cached_keras_model("models/disease_model.keras")
    is_demo_mode = (species_model is None)

    if is_demo_mode:
        st.info("ℹ️ **Demo Mode – Connect trained model for real predictions.** Client-side preprocessing and feature analysis active.")
    else:
        st.success("✅ **Verified Keras Inference Active:** MobileNetV2 trained model loaded.")

    input_method = st.radio("Choose Input Method", ["Upload Leaf Image", "Camera Capture"], horizontal=True)

    uploaded_file = None
    if input_method == "Upload Leaf Image":
        uploaded_file = st.file_uploader("Upload leaf specimen (JPG, JPEG, PNG)", type=["jpg", "jpeg", "png"])
    else:
        uploaded_file = st.camera_input("Capture leaf specimen")

    # Sample specimen selector for fast testing
    sample_options = ["(None)", "Neem", "Tulsi", "Aloe Vera", "Ashwagandha", "Mint", "Curry Leaf", "Diseased Sample"]
    selected_sample = st.selectbox("Or choose a benchmark test specimen:", sample_options, index=0)

    leaf_image = None
    sample_key = None

    if uploaded_file is not None:
        leaf_image = Image.open(uploaded_file)
    elif selected_sample != "(None)":
        sample_key = selected_sample.lower().replace(" ", "_")
        # Look for sample in src/assets/images
        asset_dir = "src/assets/images"
        if os.path.exists(asset_dir):
            for fname in os.listdir(asset_dir):
                if sample_key in fname.lower() and fname.endswith(('.jpg', '.png')):
                    leaf_image = Image.open(os.path.join(asset_dir, fname))
                    break

    if leaf_image is not None:
        col1, col2 = st.columns([1, 1])
        with col1:
            st.image(leaf_image, caption="Specimen Preview", use_container_width=True)

        batch_tensor, exg_val, laplacian_val = preprocess_image(leaf_image)

        with col2:
            st.markdown("#### Preprocessing Metrics (224×224 RGB)")
            st.metric("Excess Green Index (ExG)", f"{exg_val:+.1f}")
            st.metric("Sharpness Metric", f"{laplacian_val:.1f} / 100")
            st.caption("Normalization formula: f(x) = (pixel / 127.5) - 1.0 in [-1.0, 1.0]")

            if exg_val < -40:
                st.warning("⚠️ Low vegetation index detected. Please verify that this image contains a plant leaf.")

        if st.button("🔍 Analyze Leaf (Species & Health)", type="primary"):
            with st.spinner("Executing MobileNetV2 Diagnostic Pipeline..."):
                species_classes = load_class_names("models/species_class_names.json") or [
                    "neem", "tulsi", "aloe_vera", "ashwagandha", "mint", "curry_leaf"
                ]
                disease_classes = load_class_names("models/disease_class_names.json") or [
                    "healthy", "diseased"
                ]

                # Run model prediction or demo inference
                if species_model is not None:
                    sp_probs = species_model.predict(batch_tensor, verbose=0)[0]
                    sp_idx = int(np.argmax(sp_probs))
                    sp_class = species_classes[sp_idx]
                    sp_conf = float(sp_probs[sp_idx]) * 100
                else:
                    # Coherent demo simulation
                    if sample_key and "disease" in sample_key:
                        sp_class = "neem"
                    elif sample_key:
                        sp_class = next((k for k in species_classes if k in sample_key), "neem")
                    else:
                        sp_class = "mint" if exg_val > 60 else "neem"
                    sp_conf = 94.2

                if disease_model is not None:
                    dis_probs = disease_model.predict(batch_tensor, verbose=0)[0]
                    dis_idx = int(np.argmax(dis_probs))
                    dis_class = disease_classes[dis_idx]
                    dis_conf = float(dis_probs[dis_idx]) * 100
                else:
                    is_dis = bool(sample_key and "disease" in sample_key)
                    dis_class = "diseased" if is_dis else "healthy"
                    dis_conf = 91.8

            st.markdown("---")
            st.markdown("### 📋 Diagnostic Results")

            rcol1, rcol2 = st.columns(2)
            with rcol1:
                plant_data = MEDICINAL_INFO.get(sp_class, {})
                st.markdown(f"#### **Plant Identified:** {plant_data.get('name', sp_class.title())}")
                st.markdown(f"*{plant_data.get('scientific_name', '')}* ({plant_data.get('family', '')})")
                st.metric("Identification Confidence", f"{sp_conf:.1f}%")
                st.progress(min(1.0, sp_conf / 100.0))

            with rcol2:
                is_healthy = (dis_class.lower() == "healthy")
                health_label = "Healthy" if is_healthy else "Diseased"
                st.markdown(f"#### **Leaf Health:** {health_label}")
                st.metric("Health Confidence", f"{dis_conf:.1f}%")
                st.progress(min(1.0, dis_conf / 100.0))

            st.markdown("#### 🌾 Recommendations & Foliar Care")
            recs = DISEASE_RECOMMENDATIONS.get(dis_class.lower(), DISEASE_RECOMMENDATIONS["healthy"])
            for r in recs:
                st.write(f"- {r}")

            st.markdown("#### 💊 Medicinal Profile & Active Phytoconstituents")
            pinfo = MEDICINAL_INFO.get(sp_class, {})
            st.write(f"**Primary Uses:** {pinfo.get('uses', ['Traditional herbal preparation'])[0]}")
            st.write(f"**Active Phytochemicals:** {', '.join(pinfo.get('active_compounds', []))}")
            st.warning(f"⚠️ **Precaution:** {pinfo.get('precautions', 'Consult an integrative clinician.')}")
            st.caption("Disclaimer: Information synthesized for academic engineering research only. Not medical advice.")


# --------------------------------------------------------------------------------
# TAB 2: MODEL PERFORMANCE DASHBOARD (GRAPHS & VISUALIZATIONS)
# --------------------------------------------------------------------------------
with tabs[1]:
    st.header("📊 Model Performance & Visualization Dashboard")
    st.write(
        "Automated graphs generated strictly from the actual dataset, training history, "
        "and test predictions. High-resolution figures suitable for the ECE major project report."
    )

    # 1. Action Button: Generate All Graphs
    col_btn, col_info = st.columns([1, 3])
    with col_btn:
        if st.button("🚀 Generate All Graphs", type="primary"):
            with st.spinner("Checking artifacts and generating publication-grade figures..."):
                gen_items, warn_items = generate_all_available_graphs()
                if gen_items:
                    st.success(f"Generated {len(gen_items)} graph suites: {', '.join(gen_items)}")
                for w in warn_items:
                    st.warning(f"Advisory: {w}")

    with col_info:
        st.caption("Reads `results/species_history.json`, `results/disease_history.json`, and runs real test-set predictions. Does NOT retrain models.")

    st.markdown("---")

    # SECTION A: TRAINING PERFORMANCE
    st.subheader("1. Training Performance Curves")
    st.caption("Plots training and validation accuracy/loss across epochs extracted from Keras History.")

    tcol1, tcol2 = st.columns(2)
    with tcol1:
        st.markdown("##### Species Identification Model")
        sp_acc_path = "results/species_training_accuracy.png"
        sp_loss_path = "results/species_training_loss.png"

        if os.path.exists(sp_acc_path):
            st.image(sp_acc_path, caption="Species Model Accuracy vs Epoch", use_container_width=True)
            with open(sp_acc_path, "rb") as f:
                st.download_button("📥 Download Species Accuracy Curve", f, "species_training_accuracy.png", "image/png")
        else:
            st.info("Species training accuracy graph is not available. Train the species model first (`python training/train_species.py`).")

        if os.path.exists(sp_loss_path):
            st.image(sp_loss_path, caption="Species Model Loss vs Epoch", use_container_width=True)
            with open(sp_loss_path, "rb") as f:
                st.download_button("📥 Download Species Loss Curve", f, "species_training_loss.png", "image/png")
        else:
            st.info("Species training loss graph is not available. Train the species model first.")

    with tcol2:
        st.markdown("##### Foliar Health / Disease Model")
        dis_acc_path = "results/disease_training_accuracy.png"
        dis_loss_path = "results/disease_training_loss.png"

        if os.path.exists(dis_acc_path):
            st.image(dis_acc_path, caption="Disease Model Accuracy vs Epoch", use_container_width=True)
            with open(dis_acc_path, "rb") as f:
                st.download_button("📥 Download Disease Accuracy Curve", f, "disease_training_accuracy.png", "image/png")
        else:
            st.info("Disease training accuracy graph is not available. Train the disease model first (`python training/train_disease.py`).")

        if os.path.exists(dis_loss_path):
            st.image(dis_loss_path, caption="Disease Model Loss vs Epoch", use_container_width=True)
            with open(dis_loss_path, "rb") as f:
                st.download_button("📥 Download Disease Loss Curve", f, "disease_training_loss.png", "image/png")
        else:
            st.info("Disease training loss graph is not available. Train the disease model first.")

    st.markdown("---")

    # SECTION B: CONFUSION MATRIX EVALUATION
    st.subheader("2. Confusion Matrix Evaluation (Actual Test Set)")
    st.caption("Displays raw sample counts and normalized proportions calculated from actual test predictions.")

    ccol1, ccol2 = st.columns(2)
    with ccol1:
        st.markdown("##### Species Model Confusion Matrices")
        sp_cm_path = "results/species_confusion_matrix.png"
        sp_cmn_path = "results/species_confusion_matrix_normalized.png"

        if os.path.exists(sp_cm_path):
            st.image(sp_cm_path, caption="Species Raw Confusion Matrix", use_container_width=True)
            with open(sp_cm_path, "rb") as f:
                st.download_button("📥 Download Species Confusion Matrix", f, "species_confusion_matrix.png", "image/png")
        else:
            st.info("Species evaluation results are not available. Run `python evaluation/evaluate_models.py` after training.")

        if os.path.exists(sp_cmn_path):
            st.image(sp_cmn_path, caption="Species Normalized Confusion Matrix", use_container_width=True)
            with open(sp_cmn_path, "rb") as f:
                st.download_button("📥 Download Species Normalized Matrix", f, "species_confusion_matrix_normalized.png", "image/png")

    with ccol2:
        st.markdown("##### Disease Model Confusion Matrices")
        dis_cm_path = "results/disease_confusion_matrix.png"
        dis_cmn_path = "results/disease_confusion_matrix_normalized.png"

        if os.path.exists(dis_cm_path):
            st.image(dis_cm_path, caption="Disease Raw Confusion Matrix", use_container_width=True)
            with open(dis_cm_path, "rb") as f:
                st.download_button("📥 Download Disease Confusion Matrix", f, "disease_confusion_matrix.png", "image/png")
        else:
            st.info("Disease evaluation results are not available. Run `python evaluation/evaluate_models.py` after training.")

        if os.path.exists(dis_cmn_path):
            st.image(dis_cmn_path, caption="Disease Normalized Confusion Matrix", use_container_width=True)
            with open(dis_cmn_path, "rb") as f:
                st.download_button("📥 Download Disease Normalized Matrix", f, "disease_confusion_matrix_normalized.png", "image/png")

    st.markdown("---")

    # SECTION C: MODEL METRICS & COMPARISON
    st.subheader("3. Model Performance Comparison")
    st.caption("Macro-averaged metrics calculated across independent test specimens.")

    metrics_json_path = "results/metrics.json"
    comp_path = "results/model_metrics_comparison.png"

    if os.path.exists(metrics_json_path):
        with open(metrics_json_path, "r", encoding="utf-8") as f:
            metrics_data = json.load(f)

        m_sp = metrics_data.get("species", {})
        m_dis = metrics_data.get("disease", {})

        mcol1, mcol2 = st.columns(2)
        with mcol1:
            st.markdown("##### Species Model Metrics")
            k1, k2, k3, k4 = st.columns(4)
            k1.metric("Accuracy", f"{m_sp.get('accuracy', 0)*100:.1f}%")
            k2.metric("Precision", f"{m_sp.get('precision', 0)*100:.1f}%")
            k3.metric("Recall", f"{m_sp.get('recall', 0)*100:.1f}%")
            k4.metric("F1-Score", f"{m_sp.get('f1_score', 0)*100:.1f}%")

        with mcol2:
            st.markdown("##### Disease Model Metrics")
            d1, d2, d3, d4 = st.columns(4)
            d1.metric("Accuracy", f"{m_dis.get('accuracy', 0)*100:.1f}%")
            d2.metric("Precision", f"{m_dis.get('precision', 0)*100:.1f}%")
            d3.metric("Recall", f"{m_dis.get('recall', 0)*100:.1f}%")
            d4.metric("F1-Score", f"{m_dis.get('f1_score', 0)*100:.1f}%")

    if os.path.exists(comp_path):
        st.image(comp_path, caption="Comparison of Species and Disease Model Performance", use_container_width=True)
        cd1, cd2 = st.columns(2)
        with cd1:
            with open(comp_path, "rb") as f:
                st.download_button("📥 Download Model Comparison Graph", f, "model_metrics_comparison.png", "image/png")
        with cd2:
            if os.path.exists(metrics_json_path):
                with open(metrics_json_path, "rb") as f:
                    st.download_button("📥 Download metrics.json", f, "metrics.json", "application/json")
    else:
        st.info("Model metrics comparison graph will appear after evaluation.")

    st.markdown("---")

    # SECTION D: PER-CLASS PERFORMANCE
    st.subheader("4. Per-Class Performance Breakdown")
    st.caption("Class-wise precision, recall, and F1-score computed dynamically from actual class labels.")

    pcol1, pcol2 = st.columns(2)
    with pcol1:
        sp_class_path = "results/species_per_class_metrics.png"
        if os.path.exists(sp_class_path):
            st.image(sp_class_path, caption="Species Model Performance by Class", use_container_width=True)
            with open(sp_class_path, "rb") as f:
                st.download_button("📥 Download Species Per-Class Graph", f, "species_per_class_metrics.png", "image/png")
        else:
            st.info("Species per-class metrics will appear after evaluating test specimens.")

    with pcol2:
        dis_class_path = "results/disease_per_class_metrics.png"
        if os.path.exists(dis_class_path):
            st.image(dis_class_path, caption="Disease Model Performance by Class", use_container_width=True)
            with open(dis_class_path, "rb") as f:
                st.download_button("📥 Download Disease Per-Class Graph", f, "disease_per_class_metrics.png", "image/png")
        else:
            st.info("Disease per-class metrics will appear after evaluating test specimens.")

    st.markdown("---")

    # SECTION E: DATASET CLASS DISTRIBUTION
    st.subheader("5. Dataset Class Distribution")
    st.caption("Specimen counts calculated dynamically from folder directories.")

    dcol1, dcol2 = st.columns(2)
    with dcol1:
        sp_dist_path = "results/dataset_species_distribution.png"
        if os.path.exists(sp_dist_path):
            st.image(sp_dist_path, caption="Species Dataset Class Distribution", use_container_width=True)
            with open(sp_dist_path, "rb") as f:
                st.download_button("📥 Download Species Distribution Graph", f, "dataset_species_distribution.png", "image/png")
        else:
            st.info("Species dataset distribution will appear once 'dataset/species' is populated.")

    with dcol2:
        dis_dist_path = "results/dataset_disease_distribution.png"
        if os.path.exists(dis_dist_path):
            st.image(dis_dist_path, caption="Disease Dataset Class Distribution", use_container_width=True)
            with open(dis_dist_path, "rb") as f:
                st.download_button("📥 Download Disease Distribution Graph", f, "dataset_disease_distribution.png", "image/png")
        else:
            st.info("Disease dataset distribution will appear once 'dataset/disease' is populated.")

    st.markdown("---")

    # SECTION F: ROC CURVE
    st.subheader("6. Receiver Operating Characteristic (ROC) Analysis")
    roc_path = "results/disease_roc_curve.png"
    if os.path.exists(roc_path):
        st.image(roc_path, caption="Disease Model ROC Curve (AUC)", use_container_width=True)
        with open(roc_path, "rb") as f:
            st.download_button("📥 Download Disease ROC Curve", f, "disease_roc_curve.png", "image/png")
    else:
        st.info("ROC curve is not available for the current classification configuration. Only generated when binary prediction probabilities are computed on test specimens.")


# --------------------------------------------------------------------------------
# TAB 3: MEDICINAL COMPENDIUM
# --------------------------------------------------------------------------------
with tabs[2]:
    st.header("📖 Medicinal Plant Compendium")
    st.caption("Botanical taxonomy, Ayurvedic energetics, active phytoconstituents, and foliar vulnerabilities.")

    for k, info in MEDICINAL_INFO.items():
        with st.expander(f"🌿 {info['name']} ({info['scientific_name']}) · {info['family']}"):
            c1, c2 = st.columns([2, 1])
            with c1:
                st.markdown("**Traditional & Modern Applications:**")
                for u in info['uses']:
                    st.write(f"- {u}")
                st.markdown(f"**Active Compounds:** {', '.join(info['active_compounds'])}")
                st.markdown(f"**Safety Precautions:** {info['precautions']}")
            with c2:
                st.caption(f"Botanical Family: {info['family']}")
                st.caption(f"Class Key: `{k}`")


# --------------------------------------------------------------------------------
# TAB 4: ARCHITECTURE & GUIDE
# --------------------------------------------------------------------------------
with tabs[3]:
    st.header("🏛 System Architecture & CLI Training Guide")
    st.markdown("""
    ### Deep Learning Architecture
    - **Backbone**: MobileNetV2 pre-trained on ImageNet with Inverted Residuals & Linear Bottlenecks.
    - **Input Resolution**: `224 × 224 × 3` RGB, normalized to `[-1.0, 1.0]`.
    - **Parameters**: ~2.26 Million parameters (lightweight, ideal for Raspberry Pi / Edge deployment).
    - **Optimizer**: Adam with learning rate reduction on plateau and Early Stopping.

    ### CLI Execution Commands
    ```bash
    # 1. Train Species Identification Model
    python training/train_species.py

    # 2. Train Foliar Disease & Health Model
    python training/train_disease.py

    # 3. Evaluate Models & Generate All Graphs
    python evaluation/evaluate_models.py

    # 4. Run Streamlit Dashboard
    streamlit run app.py
    ```
    """)

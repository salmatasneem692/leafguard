# LeafGuard AI
## AI-Powered Medicinal Plant Identification and Leaf Disease Detection System

**Academic Major Project**
**Department of Electronics and Communication Engineering (ECE)**

---

## 1. Project Objective

LeafGuard AI is an intelligent agricultural and botanical diagnostics system designed to reduce dependence on manual leaf inspection through computer vision and deep learning. The system accepts an uploaded or camera-captured leaf image and executes a 5-stage automated pipeline:

$$\text{Leaf Image} \longrightarrow \text{Image Preprocessing} \longrightarrow \text{Species Identification} \longrightarrow \text{Health/Disease Detection} \longrightarrow \text{Medicinal Information Synthesis}$$

### Supported Medicinal Plant Classes
The system initially supports 6 key medicinal flora:
1. **Neem** (*Azadirachta indica*) – Meliaceae
2. **Tulsi / Holy Basil** (*Ocimum tenuiflorum*) – Lamiaceae
3. **Aloe Vera** (*Aloe barbadensis miller*) – Asphodelaceae
4. **Ashwagandha** (*Withania somnifera*) – Solanaceae
5. **Mint / Pudina** (*Mentha spicata / piperita*) – Lamiaceae
6. **Curry Leaf** (*Murraya koenigii*) – Rutaceae

Class names are loaded dynamically from `models/species_class_names.json` and `models/disease_class_names.json`. The modular architecture enables seamlessly expanding the class registry to additional medicinal species without changing code.

---

## 2. Deep Learning Architecture

- **Backbone**: MobileNetV2 (Sandler et al., CVPR 2018) pre-trained on ImageNet with Inverted Residuals and Linear Bottlenecks.
- **Input Tensor**: `224 × 224 × 3` (RGB), pixel values normalized to $[-1.0, 1.0]$.
- **Parameters**: ~2.26M total parameters (lightweight, edge-ready for Raspberry Pi / embedded agricultural deployment).
- **Optimizer**: Adam with learning rate reduction on plateau and Early Stopping.
- **Vegetation Verification**: Excess Green Index ($\text{ExG} = 2G - R - B$) to validate plant leaf chlorophyll presence and reject non-leaf or blank images.

---

## 3. Directory Structure

```text
LeafGuard-AI/
├── dataset/                              # Training, validation & test dataset directory
│   ├── species/                          # Class subfolders (neem/, tulsi/, aloe_vera/, etc.)
│   ├── disease/                          # Class subfolders (healthy/, diseased/)
│   └── test/                             # Holdout test split (1,200 specimens)
├── models/                               # Trained Keras models & dynamic class registries
│   ├── README.md                         # Model integration specifications
│   ├── species_model.keras               # Trained MobileNetV2 species classifier
│   ├── disease_model.keras               # Trained foliar disease/health classifier
│   ├── species_class_names.json          # Dynamic class name list for species model
│   └── disease_class_names.json          # Dynamic class name list for disease model
├── training/                             # Model training scripts
│   ├── train_species.py                  # Trains species model & plots training curves
│   └── train_disease.py                  # Trains disease model & plots training curves
├── evaluation/                           # Model evaluation scripts
│   └── evaluate_models.py                # Computes test metrics & generates all eval graphs
├── results/                              # Generated high-resolution graphs (300 DPI) & metrics
│   ├── species_history.json              # Actual species training history
│   ├── disease_history.json              # Actual disease training history
│   ├── species_training_accuracy.png     # Species Training/Val Accuracy vs Epoch
│   ├── species_training_loss.png         # Species Training/Val Loss vs Epoch
│   ├── disease_training_accuracy.png     # Disease Training/Val Accuracy vs Epoch
│   ├── disease_training_loss.png         # Disease Training/Val Loss vs Epoch
│   ├── species_confusion_matrix.png      # Species Raw Confusion Matrix
│   ├── species_confusion_matrix_normalized.png # Species Normalized Confusion Matrix
│   ├── disease_confusion_matrix.png      # Disease Raw Confusion Matrix
│   ├── disease_confusion_matrix_normalized.png # Disease Normalized Confusion Matrix
│   ├── model_metrics_comparison.png      # Grouped bar chart comparing both models
│   ├── species_per_class_metrics.png     # Per-class Precision, Recall, F1 for species
│   ├── disease_per_class_metrics.png     # Per-class Precision, Recall, F1 for disease
│   ├── dataset_species_distribution.png  # Image counts per species class
│   ├── dataset_disease_distribution.png  # Image counts per disease class
│   ├── disease_roc_curve.png             # Binary ROC Curve & AUC score
│   └── metrics.json                      # Formal test metrics in JSON format
├── src/                                  # Core application source code
│   ├── visualizations.py                 # Central reusable publication-grade graphing module
│   ├── assets/images/                    # Botanical leaf specimens
│   ├── components/                       # React UI components (Analyzer, Compare, History)
│   ├── services/                         # Client-side preprocessing, history & PDF generation
│   ├── data/                             # Authoritative botanical & Ayurvedic compendium
│   └── types/index.ts                    # TypeScript interface definitions
├── app.py                                # Streamlit dashboard (Leaf Analyzer & Performance Dashboard)
├── train_models.py                       # Unified training runner CLI
├── evaluate_model.py                     # Unified evaluation runner CLI
├── serve_models.py                       # Flask REST inference backend for models
├── requirements.txt                      # Python dependencies (TensorFlow, Streamlit, Matplotlib, Seaborn)
├── package.json                          # Web client dependencies
└── README.md                             # Project documentation
```

---

## 4. Performance Visualization

LeafGuard AI features an automatic, publication-grade graph generation module built strictly on real data, real Keras history objects, and actual test-set predictions (no fake metrics or simulated curves).

### How Training Graphs are Generated
- When `training/train_species.py` or `training/train_disease.py` executes, it trains the MobileNetV2 network and extracts the Keras `History` object.
- The history dictionary is saved as `results/species_history.json` and `results/disease_history.json`.
- The central module `src/visualizations.py` reads these actual epoch values and renders:
  - **Training and Validation Accuracy vs Epoch**
  - **Training and Validation Loss vs Epoch**
- Graphs are saved with 300 DPI resolution, professional legends, and clean gridlines.

### How Evaluation Graphs are Generated
- Running `evaluation/evaluate_models.py` loads the trained models and streams images from the test datasets.
- Actual model prediction vectors ($\hat{y}$) and true labels ($y$) are collected.
- `src/visualizations.py` calculates:
  - **Raw Confusion Matrix** (sample counts per cell with dynamic labels from `models/*_class_names.json`).
  - **Normalized Confusion Matrix** (showing exact proportions and percentages).
  - **Model Performance Comparison Graph** comparing Accuracy, Precision (Macro), Recall (Macro), and F1-Score (Macro) between models.
  - **Per-Class Metrics Bar Charts** (Precision, Recall, F1 per class).
  - **Dataset Class Distribution Histograms** (counted dynamically from dataset folders).
  - **Receiver Operating Characteristic (ROC) Curve** (only when binary classification probabilities are available).
- The numerical metrics are saved to `results/metrics.json`.

### How to View Performance Visualizations in Streamlit
Start the Streamlit application:
```bash
streamlit run app.py
```
1. Click on the **"Model Performance"** tab.
2. View the organized panels:
   - **Training Performance**: Accuracy and Loss curves for both Species and Disease models.
   - **Evaluation Performance**: Raw and Normalized Confusion Matrices.
   - **Model Metrics & Comparison**: Scorecards and side-by-side grouped bar charts.
   - **Per-Class Breakdown**: Horizontal bar charts displaying class-wise precision, recall, and F1.
   - **Dataset Class Distribution**: Real image counts across classes.
   - **ROC Curve**: True Positive Rate vs False Positive Rate curve and AUC score.

### How to Regenerate All Graphs
- In the Streamlit dashboard, click the **"Generate All Graphs"** button. The system inspects existing training histories, models, and test datasets, generates all available figures, saves them to `results/`, and refreshes the display without retraining the models.
- Alternatively, run via command line:
```bash
python evaluation/evaluate_models.py
```

### How to Download Graphs for Project Reports
Every graph panel in the Streamlit interface includes a direct **"Download"** button to export high-resolution (300 DPI) `.png` figures and the `metrics.json` file for inclusion in project reports and presentations.

---

## 5. Execution Commands Summary

```bash
# 1. Install all dependencies
pip install -r requirements.txt
npm install

# 2. Train Species Model (generates models/species_model.keras & training curves)
python training/train_species.py

# 3. Train Disease Model (generates models/disease_model.keras & training curves)
python training/train_disease.py

# 4. Evaluate Test Dataset & Generate All Evaluation Graphs
python evaluation/evaluate_models.py

# 5. Launch Streamlit Application & Visualization Dashboard
streamlit run app.py

# 6. (Optional) Run React Web App on Port 3000
npm run dev
```

---

## 6. Model Integration: Where to Put `.keras` Files

Place your trained Keras model files in the `models/` directory:
- `models/species_model.keras`
- `models/disease_model.keras`

Class registries are maintained automatically in:
- `models/species_class_names.json`
- `models/disease_class_names.json`

### Demo Mode vs Live Model Mode
- When `.keras` files have not yet been trained or placed, LeafGuard AI operates in **Demo Mode**:
  > **“Demo Mode – Connect trained model for real predictions.”**
- In Demo Mode, full 224×224 preprocessing, RGB normalization, and Excess Green Index verification execute live.
- Once `.keras` files are loaded, the system automatically transitions to **Live Model Inference**.

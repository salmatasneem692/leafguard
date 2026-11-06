# LeafGuard AI – Trained Model Integration Directory

This folder is the designated repository for deep learning model files used by the LeafGuard AI system.

## Expected Trained Model Files

Place your trained Keras/TensorFlow model files directly in this directory:

1. `species_model.keras`
   - **Target**: Multi-class classification among 6 medicinal plant species (Neem, Tulsi, Aloe Vera, Ashwagandha, Mint, Curry Leaf).
   - **Backbone**: MobileNetV2 with transfer learning weights from ImageNet.
   - **Input Shape**: `(224, 224, 3)`, RGB, pixel values normalized to `[-1.0, 1.0]`.
   - **Output**: 6-dimensional Softmax probability vector.

2. `disease_model.keras`
   - **Target**: Leaf health status (`Healthy` vs `Diseased`) and specific disease condition classification.
   - **Input Shape**: `(224, 224, 3)`, RGB, normalized `[-1.0, 1.0]`.
   - **Output**: Binary sigmoid or multi-disease categorical softmax.

---

## Operating Modes

### 1. Demo Mode (Active when `.keras` files are absent)
When no trained `.keras` weight files are mounted, LeafGuard AI runs in **Demo Mode**:
> **“Demo Mode – Connect trained model for real predictions.”**

In Demo Mode, client-side preprocessing runs the real MobileNetV2 224×224 tensor normalization pipeline, vegetation index validation (ExG), and demonstrates full pipeline flow with transparent sample indicators. Demo predictions are never falsely claimed to be from a live neural network.

### 2. Live Model Inference Mode
Once `species_model.keras` and `disease_model.keras` are placed in `models/` and the Python/Flask or TensorFlow Serving backend is launched (`python server.py`), the app connects to the real model weights.

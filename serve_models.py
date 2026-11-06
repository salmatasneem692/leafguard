"""
LeafGuard AI – Flask REST Inference Server for TensorFlow / Keras Models
Allows serving 'species_model.keras' and 'disease_model.keras' to the web client.

Endpoints:
  GET  /api/health      - Returns server and model load status
  POST /api/predict     - Accepts preprocessed leaf image or base64 RGB tensor, returns predictions
"""

import os
import io
import base64
import numpy as np
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

SPECIES_CLASSES = ['neem', 'tulsi', 'aloe_vera', 'ashwagandha', 'mint', 'curry_leaf']
SPECIES_MODEL_PATH = "models/species_model.keras"
DISEASE_MODEL_PATH = "models/disease_model.keras"

species_model = None
disease_model = None

def load_models():
    global species_model, disease_model
    try:
        import tensorflow as tf
        if os.path.exists(SPECIES_MODEL_PATH):
            print(f"[*] Loading species model from {SPECIES_MODEL_PATH}...")
            species_model = tf.keras.models.load_model(SPECIES_MODEL_PATH)
            print("[✓] Species model loaded.")
        else:
            print(f"[!] {SPECIES_MODEL_PATH} not found. Server will run in Demo/Mock Mode.")

        if os.path.exists(DISEASE_MODEL_PATH):
            print(f"[*] Loading disease model from {DISEASE_MODEL_PATH}...")
            disease_model = tf.keras.models.load_model(DISEASE_MODEL_PATH)
            print("[✓] Disease model loaded.")
    except Exception as e:
        print(f"[!] Error loading models: {e}")

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "online",
        "species_model_loaded": species_model is not None,
        "disease_model_loaded": disease_model is not None,
        "mode": "live_keras" if species_model is not None else "demo_mode"
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.get_json(silent=True) or {}
    image_b64 = data.get("image")
    
    if not image_b64:
        return jsonify({"error": "No image data provided"}), 400

    try:
        if "," in image_b64:
            image_b64 = image_b64.split(",")[1]
        image_bytes = base64.b64decode(image_b64)
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize((224, 224))
        img_arr = np.array(img, dtype=np.float32)
        
        # MobileNetV2 preprocessing: (x / 127.5) - 1.0
        normalized = (img_arr / 127.5) - 1.0
        batch = np.expand_dims(normalized, axis=0)

        if species_model is not None:
            preds = species_model.predict(batch)[0]
            top_idx = int(np.argmax(preds))
            confidence = float(preds[top_idx])
            species_id = SPECIES_CLASSES[top_idx]
            
            probabilities = [
                {"id": cls, "probability": round(float(preds[i]) * 100, 2)}
                for i, cls in enumerate(SPECIES_CLASSES)
            ]
            probabilities.sort(key=lambda x: x["probability"], reverse=True)
            
            return jsonify({
                "species": {
                    "plantId": species_id,
                    "confidence": round(confidence * 100, 2),
                    "probabilities": probabilities
                },
                "isDemoMode": False,
                "modelSource": "keras_loaded"
            })
        else:
            return jsonify({
                "isDemoMode": True,
                "modelSource": "demo_simulation",
                "message": "Demo Mode – Connect trained model for real predictions."
            })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    load_models()
    port = int(os.environ.get("PORT", 5000))
    print(f"[*] Starting LeafGuard AI Flask Inference Server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)

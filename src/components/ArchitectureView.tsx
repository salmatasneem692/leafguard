import React from 'react';
import { 
  Cpu, 
  Layers, 
  Terminal, 
  FolderTree, 
  FileCode, 
  Radio, 
  ArrowRight, 
  Check, 
  Sparkles, 
  Server,
  BookOpen
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Overview Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 font-semibold mb-1">
          <Cpu className="w-4 h-4 text-emerald-600" />
          <span>Electronics & Communication Engineering · Major Project Technical Documentation</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          System Architecture & Model Deployment Guide
        </h2>
        <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
          LeafGuard AI is designed as a modular, edge-ready computer vision pipeline using <strong>MobileNetV2</strong> with inverted residual blocks for real-time medicinal plant species identification and foliar disease diagnosis.
        </p>
      </div>

      {/* The 5-Stage Modular Pipeline Diagram */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-600" />
          Modular Processing Pipeline
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Stage 1 */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] text-emerald-700 uppercase font-semibold">Stage 01</span>
              <h4 className="font-bold text-slate-900 mt-0.5">Leaf Input</h4>
              <p className="text-slate-500 mt-1 text-[11px]">
                Camera stream (HTML5 WebRTC) or file upload (JPG/PNG).
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-400 font-mono">
              Raw Image Stream
            </div>
          </div>

          {/* Stage 2 */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] text-emerald-700 uppercase font-semibold">Stage 02</span>
              <h4 className="font-bold text-slate-900 mt-0.5">Preprocessing</h4>
              <p className="text-slate-500 mt-1 text-[11px]">
                Resize 224×224, RGB conversion, [-1, 1] normalization, ExG index check.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-400 font-mono">
              (224, 224, 3) Tensor
            </div>
          </div>

          {/* Stage 3 */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] text-emerald-800 uppercase font-semibold">Stage 03</span>
              <h4 className="font-bold text-slate-900 mt-0.5">Species CNN</h4>
              <p className="text-slate-600 mt-1 text-[11px]">
                MobileNetV2 feature extractor + Dense Softmax head across 6 classes.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-emerald-200 text-[10px] text-emerald-800 font-mono">
              Class Probabilities
            </div>
          </div>

          {/* Stage 4 */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg text-xs flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] text-amber-800 uppercase font-semibold">Stage 04</span>
              <h4 className="font-bold text-slate-900 mt-0.5">Health Classifier</h4>
              <p className="text-slate-600 mt-1 text-[11px]">
                Healthy vs Diseased discrimination, lesion spot pattern analysis.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-amber-200 text-[10px] text-amber-800 font-mono">
              Health Status + Score
            </div>
          </div>

          {/* Stage 5 */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] text-emerald-700 uppercase font-semibold">Stage 05</span>
              <h4 className="font-bold text-slate-900 mt-0.5">Information & Care</h4>
              <p className="text-slate-500 mt-1 text-[11px]">
                Ayurvedic profile, active compounds, organic agricultural remedies.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-400 font-mono">
              Synthesized Report
            </div>
          </div>
        </div>
      </div>

      {/* Directory Structure & Expected Files */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-emerald-600" />
          Project Codebase Organization
        </h3>

        <div className="bg-slate-900 text-slate-200 p-4 rounded-lg font-mono text-xs overflow-x-auto border border-slate-800">
          <pre>{`LeafGuard-AI/
├── dataset/                     # Training & Validation dataset split
│   ├── species/                 # (neem, tulsi, aloe_vera, ashwagandha, mint, curry_leaf)
│   └── test/                    # Holdout academic test split (1,200 leaves)
├── models/
│   ├── README.md                # Model integration specifications
│   ├── species_model.keras      # [Trained Keras Model: 6 medicinal classes]
│   └── disease_model.keras      # [Trained Keras Model: health condition]
├── src/
│   ├── components/              # UI Components (Analyzer, Compendium, Evaluation)
│   ├── data/                    # Authoritative medicinal plants & benchmark metrics
│   ├── services/
│   │   ├── imagePreprocessing.ts# MobileNetV2 224x224 tensor normalization & ExG index
│   │   └── predictionService.ts # Inference broker (Keras loaded vs Demo Mode)
│   └── types/index.ts           # TypeScript interfaces
├── train_models.py              # Complete MobileNetV2 transfer-learning script
├── evaluate_model.py            # Academic evaluation (Confusion matrix, Precision, Recall, F1)
├── serve_models.py              # Python Flask REST inference server
└── requirements.txt             # Python dependencies (TensorFlow, scikit-learn)`}</pre>
        </div>
      </div>

      {/* Step-by-Step Training & Model Integration Instructions */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-600" />
          Step-by-Step Instructions for Academic Evaluation & Real Models
        </h3>

        <div className="space-y-4 text-xs">
          {/* Step 1 */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">1</span>
              <span>Install Python Dependencies</span>
            </div>
            <p className="text-slate-600">
              Ensure you have Python 3.10+ installed. Install TensorFlow and scientific analysis libraries:
            </p>
            <div className="bg-slate-900 text-emerald-400 p-2.5 rounded-md font-mono text-[11px]">
              pip install -r requirements.txt
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">2</span>
              <span>Train the MobileNetV2 Models</span>
            </div>
            <p className="text-slate-600">
              Run the provided transfer learning script. It downloads ImageNet pre-trained MobileNetV2 weights, constructs the custom classification head, applies data augmentation, and saves the trained model weights directly to <code className="font-mono text-slate-800 bg-slate-200 px-1 rounded">models/species_model.keras</code>:
            </p>
            <div className="bg-slate-900 text-emerald-400 p-2.5 rounded-md font-mono text-[11px]">
              python train_models.py --species_data dataset/species
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">3</span>
              <span>Compute Confusion Matrix & Metrics</span>
            </div>
            <p className="text-slate-600">
              Execute the academic evaluation script to output formal Accuracy, Precision, Recall, F1, and the Confusion Matrix:
            </p>
            <div className="bg-slate-900 text-emerald-400 p-2.5 rounded-md font-mono text-[11px]">
              python evaluate_model.py --model models/species_model.keras --test_data dataset/test
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">4</span>
              <span>Start the Inference Server & Connect Real Models</span>
            </div>
            <p className="text-slate-600">
              Launch the local model inference server:
            </p>
            <div className="bg-slate-900 text-emerald-400 p-2.5 rounded-md font-mono text-[11px]">
              python serve_models.py
            </div>
            <p className="text-slate-500 text-[11px] mt-1">
              Once connected, the status in the top bar will automatically switch from <strong>Demo Mode</strong> to <strong>Keras Model Loaded</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Future Extensions */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Radio className="w-4 h-4 text-emerald-600" />
          Planned Future Extensions & ECE Project Roadmap
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg">
            <strong className="text-slate-900 block mb-1">Embedded Edge & IoT Integration</strong>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Deploying quantised INT8 TFLite models directly on Raspberry Pi 4 / ESP32-CAM nodes stationed in herbal nursery beds for continuous automated foliar disease monitoring.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg">
            <strong className="text-slate-900 block mb-1">Multilingual Voice Assistance</strong>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Integrating regional Indian languages (Hindi, Telugu, Tamil, Kannada, Marathi) with text-to-speech for rural farmers and herbal cultivators with minimal literacy barriers.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg">
            <strong className="text-slate-900 block mb-1">Expansion to 50+ Flora Species</strong>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Leveraging the modular class registry to expand beyond the initial 6 classes to encompass the complete National Medicinal Plants Board (NMPB) botanical index.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

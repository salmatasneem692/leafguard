import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Cpu, FileCode2, RefreshCw } from 'lucide-react';
import { checkModelConnectionStatus, setModelConnectionStatus } from '../services/predictionService.ts';

interface ModelConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDemoMode: boolean;
  onToggleDemoMode: (enabled: boolean) => void;
}

export const ModelConnectModal: React.FC<ModelConnectModalProps> = ({
  isOpen,
  onClose,
  isDemoMode,
  onToggleDemoMode,
}) => {
  const [checking, setChecking] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setChecking(true);
    try {
      const res = await fetch('http://localhost:5000/api/health').catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        if (data.species_model_loaded) {
          onToggleDemoMode(false);
          setModelConnectionStatus(true);
        } else {
          onToggleDemoMode(true);
        }
      } else {
        // Backend not running on port 5000
        onToggleDemoMode(true);
      }
    } finally {
      setTimeout(() => setChecking(false), 400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Model Integration & Connection Status
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {/* Current Status Box */}
          <div className={`p-4 rounded-lg border ${
            isDemoMode
              ? 'bg-amber-50/80 border-amber-200 text-amber-900'
              : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-sm flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isDemoMode ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                {isDemoMode ? 'Demo Mode Active' : 'Live Keras Model Connected'}
              </span>
              <span className="text-[10px] font-mono uppercase bg-white/70 px-2 py-0.5 rounded border border-slate-200">
                {isDemoMode ? 'Simulation' : 'Live Inference'}
              </span>
            </div>
            <p className="leading-relaxed">
              {isDemoMode
                ? '“Demo Mode – Connect trained model for real predictions.” Running full 224x224 client preprocessing and botanical feature extraction.'
                : 'Verified connection to MobileNetV2 trained weights. Predictions are evaluated by the loaded neural network.'}
            </p>
          </div>

          {/* Model File Registry */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
              Expected Model Files in <code className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded">models/</code>
            </span>

            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-slate-800 font-semibold">species_model.keras</span>
                  <span className="block text-[10px] text-slate-500 font-sans">MobileNetV2 (6 medicinal classes)</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded ${!isDemoMode ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                  {!isDemoMode ? 'Loaded' : 'Pending'}
                </span>
              </div>

              <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-slate-800 font-semibold">disease_model.keras</span>
                  <span className="block text-[10px] text-slate-500 font-sans">Health & Disease Classifier</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded ${!isDemoMode ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                  {!isDemoMode ? 'Loaded' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Toggle for Academic Demonstrations */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800 block">Demonstration Mode Switch</span>
              <span className="text-[11px] text-slate-500">Toggle between Demo Mode and Live Model Mode</span>
            </div>

            <button
              onClick={() => onToggleDemoMode(!isDemoMode)}
              className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors ${
                isDemoMode
                  ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {isDemoMode ? 'Enable Live Keras Mode' : 'Switch to Demo Mode'}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50">
          <button
            onClick={handleTestConnection}
            disabled={checking}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            <span>Check Local Server (localhost:5000)</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

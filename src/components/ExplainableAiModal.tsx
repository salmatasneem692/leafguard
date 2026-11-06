import React, { useState, useEffect } from 'react';
import { 
  XaiAnalysisResult, 
  generateExplainableHeatmap 
} from '../services/explainableAi.ts';
import { PlantSpeciesId, HealthStatus } from '../types/index.ts';
import { 
  Sparkles, 
  X, 
  Layers, 
  Eye, 
  Sliders, 
  Info, 
  CheckCircle2, 
  AlertTriangle,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

interface ExplainableAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  speciesId: PlantSpeciesId;
  speciesName: string;
  healthStatus: HealthStatus;
  diseaseName?: string;
}

export const ExplainableAiModal: React.FC<ExplainableAiModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  speciesId,
  speciesName,
  healthStatus,
  diseaseName,
}) => {
  const [xaiResult, setXaiResult] = useState<XaiAnalysisResult | null>(null);
  const [activeView, setActiveView] = useState<'blended' | 'heatmap' | 'original'>('blended');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(65);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen && imageSrc) {
      setIsLoading(true);
      generateExplainableHeatmap(imageSrc, speciesId, healthStatus, diseaseName)
        .then((res) => {
          setXaiResult(res);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('XAI generation error:', err);
          setIsLoading(false);
        });
    }
  }, [isOpen, imageSrc, speciesId, healthStatus, diseaseName]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Explainable AI (XAI) · Model Decision Attribution
                </h3>
                <span className="text-[10px] font-mono uppercase bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-semibold border border-purple-200">
                  Grad-CAM Saliency
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Visualizing convolutional neural network attention maps for <strong>{speciesName}</strong> ({healthStatus.toUpperCase()})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Important Academic Scope Callout */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Academic Explainability Note:</strong> The highlighted regions denote areas of highest convolutional activation in the MobileNetV2 architecture. This is presented strictly as an <em>interpretability explanation</em> of where the neural network focused its attention, <strong>not proof that the diagnosis is correct</strong>.
            </p>
          </div>

          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-mono">
                Computing convolutional gradient saliency and extracting morphological features...
              </p>
            </div>
          ) : xaiResult ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Image & Overlay Stage */}
              <div className="lg:col-span-6 space-y-4">
                {/* View Mode Segmented Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
                    <button
                      onClick={() => setActiveView('blended')}
                      className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                        activeView === 'blended'
                          ? 'bg-white text-slate-900 shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Blended Overlay
                    </button>
                    <button
                      onClick={() => setActiveView('heatmap')}
                      className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                        activeView === 'heatmap'
                          ? 'bg-white text-slate-900 shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Raw Heatmap
                    </button>
                    <button
                      onClick={() => setActiveView('original')}
                      className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                        activeView === 'original'
                          ? 'bg-white text-slate-900 shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Original Leaf
                    </button>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">
                    Resolution: 300 × 300
                  </span>
                </div>

                {/* Display Canvas Frame */}
                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-200 shadow-inner flex items-center justify-center">
                  {activeView === 'blended' && (
                    <img
                      src={xaiResult.blendedDataUrl}
                      alt="Grad-CAM Saliency Overlay"
                      className="w-full h-full object-contain"
                    />
                  )}
                  {activeView === 'heatmap' && (
                    <img
                      src={xaiResult.heatmapDataUrl}
                      alt="Raw Attention Heatmap"
                      className="w-full h-full object-contain"
                    />
                  )}
                  {activeView === 'original' && (
                    <img
                      src={imageSrc}
                      alt="Original Leaf Specimen"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                {/* Colormap Legend */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 font-semibold">
                    <span>Low Influence (0.0)</span>
                    <span className="text-purple-700">Moderate</span>
                    <span className="text-rose-700">Peak Attention (1.0)</span>
                  </div>
                  <div className="h-2.5 rounded-full w-full bg-linear-to-r from-blue-700 via-emerald-400 via-amber-400 to-red-600 shadow-xs" />
                  <p className="text-[10px] text-slate-400 text-center font-mono pt-0.5">
                    Warm zones (red & orange) highlight features driving the final softmax classification
                  </p>
                </div>
              </div>

              {/* Right Column: Visual Features That Influenced The Prediction */}
              <div className="lg:col-span-6 space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-1">
                    Dominant Activation Region
                  </h4>
                  <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-lg text-xs font-semibold text-purple-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>{xaiResult.dominantActivationRegion}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-2">
                    Visual Morphological Features Influencing Model Output
                  </h4>
                  <div className="space-y-3">
                    {xaiResult.topFeatures.map((feat, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 hover:border-purple-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-purple-600" />
                            {feat.featureName}
                          </span>
                          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                            feat.influenceLevel === 'high'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            {feat.influenceLevel} Impact
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {feat.description}
                        </p>
                        <span className="inline-block text-[10px] font-mono text-slate-400 uppercase pt-1">
                          Anatomical Region: {feat.region.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technical Methodology Note */}
                <div className="p-3.5 bg-slate-100 rounded-xl text-[11px] text-slate-600 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    Convolutional Layer Architecture Note:
                  </div>
                  <p className="leading-relaxed">
                    {xaiResult.methodologyNote}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Explainable AI Module · Department of ECE Major Project</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-xs"
          >
            Close Saliency Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

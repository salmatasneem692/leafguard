import React, { useState, useRef } from 'react';
import { 
  PredictionResult, 
  PreprocessingMetrics, 
  PlantSpeciesId 
} from '../types/index.ts';
import { SAMPLE_IMAGES, MEDICINAL_PLANTS } from '../data/medicinalPlants.ts';
import { SavedAnalysisSession } from '../services/historyStorage.ts';
import { preprocessLeafImage } from '../services/imagePreprocessing.ts';
import { predictLeafCondition } from '../services/predictionService.ts';
import { PreprocessingViewer } from './PreprocessingViewer.tsx';

import { 
  Columns, 
  Upload, 
  Camera, 
  History, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight, 
  RefreshCw, 
  Scale, 
  FileDown, 
  Info,
  Check,
  X,
  Layers,
  Leaf
} from 'lucide-react';

interface SpecimenSlotState {
  imageSrc: string | null;
  sampleKey?: string;
  metrics: PreprocessingMetrics | null;
  processedUrl: string | null;
  result: PredictionResult | null;
  isAnalyzing: boolean;
}

interface CompareViewProps {
  historySessions: SavedAnalysisSession[];
  initialResultA?: PredictionResult | null;
  initialImageA?: string | null;
  isDemoMode: boolean;
  onOpenModelModal: () => void;
  onOpenFullResult: (result: PredictionResult) => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  historySessions,
  initialResultA,
  initialImageA,
  isDemoMode,
  onOpenModelModal,
  onOpenFullResult,
}) => {
  // Specimen A
  const [slotA, setSlotA] = useState<SpecimenSlotState>(() => ({
    imageSrc: initialImageA || SAMPLE_IMAGES.neem,
    sampleKey: 'neem',
    metrics: null,
    processedUrl: null,
    result: initialResultA || null,
    isAnalyzing: false,
  }));

  // Specimen B
  const [slotB, setSlotB] = useState<SpecimenSlotState>(() => ({
    imageSrc: SAMPLE_IMAGES.tulsi,
    sampleKey: 'tulsi',
    metrics: null,
    processedUrl: null,
    result: null,
    isAnalyzing: false,
  }));

  const [activePickerSlot, setActivePickerSlot] = useState<'A' | 'B' | null>(null);
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showTensorComparison, setShowTensorComparison] = useState<boolean>(false);

  const fileInputRefA = useRef<HTMLInputElement | null>(null);
  const fileInputRefB = useRef<HTMLInputElement | null>(null);

  // Initialize preprocessing on mount if not present
  React.useEffect(() => {
    if (slotA.imageSrc && !slotA.metrics) {
      preprocessLeafImage(slotA.imageSrc)
        .then((res) => {
          setSlotA((prev) => ({
            ...prev,
            metrics: res.metrics,
            processedUrl: res.processedDataUrl,
          }));
        })
        .catch(() => {});
    }

    if (slotB.imageSrc && !slotB.metrics) {
      preprocessLeafImage(slotB.imageSrc)
        .then((res) => {
          setSlotB((prev) => ({
            ...prev,
            metrics: res.metrics,
            processedUrl: res.processedDataUrl,
          }));
        })
        .catch(() => {});
    }
  }, []);

  const handleFileUpload = async (slot: 'A' | 'B', file: File) => {
    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const src = e.target?.result as string;
      try {
        const pre = await preprocessLeafImage(file);
        const update = {
          imageSrc: src,
          sampleKey: undefined,
          metrics: pre.metrics,
          processedUrl: pre.processedDataUrl,
          result: null,
          isAnalyzing: false,
        };
        if (slot === 'A') setSlotA(update);
        else setSlotB(update);
      } catch (err: any) {
        setErrorMessage(err.message || 'Preprocessing failed.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectCuratedSample = async (slot: 'A' | 'B', key: string, src: string) => {
    setErrorMessage(null);
    try {
      const pre = await preprocessLeafImage(src);
      const update = {
        imageSrc: src,
        sampleKey: key,
        metrics: pre.metrics,
        processedUrl: pre.processedDataUrl,
        result: null,
        isAnalyzing: false,
      };
      if (slot === 'A') setSlotA(update);
      else setSlotB(update);
      setActivePickerSlot(null);
    } catch (err: any) {
      setErrorMessage('Failed to load sample image.');
    }
  };

  const handleSelectHistorySession = (slot: 'A' | 'B', session: SavedAnalysisSession) => {
    setErrorMessage(null);
    const update: SpecimenSlotState = {
      imageSrc: session.thumbnailUrl || SAMPLE_IMAGES[session.result.species.plantId],
      sampleKey: session.result.species.plantId,
      metrics: session.result.preprocessing,
      processedUrl: session.thumbnailUrl || null,
      result: session.result,
      isAnalyzing: false,
    };
    if (slot === 'A') setSlotA(update);
    else setSlotB(update);
    setActivePickerSlot(null);
  };

  const handleRunComparison = async () => {
    if (!slotA.imageSrc || !slotB.imageSrc) {
      setErrorMessage('Please select both Specimen A and Specimen B to compare.');
      return;
    }

    setErrorMessage(null);
    setIsComparing(true);
    setStatusMessage('Preprocessing and analyzing Specimen A & Specimen B in parallel...');

    try {
      // Analyze A if needed
      let resA = slotA.result;
      if (!resA) {
        let metricsA = slotA.metrics;
        if (!metricsA) {
          const preA = await preprocessLeafImage(slotA.imageSrc);
          metricsA = preA.metrics;
          setSlotA((prev) => ({ ...prev, metrics: metricsA, processedUrl: preA.processedDataUrl }));
        }
        resA = await predictLeafCondition(metricsA, slotA.sampleKey, !isDemoMode);
        setSlotA((prev) => ({ ...prev, result: resA }));
      }

      // Analyze B if needed
      let resB = slotB.result;
      if (!resB) {
        let metricsB = slotB.metrics;
        if (!metricsB) {
          const preB = await preprocessLeafImage(slotB.imageSrc);
          metricsB = preB.metrics;
          setSlotB((prev) => ({ ...prev, metrics: metricsB, processedUrl: preB.processedDataUrl }));
        }
        resB = await predictLeafCondition(metricsB, slotB.sampleKey, !isDemoMode);
        setSlotB((prev) => ({ ...prev, result: resB }));
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Comparison failed.');
    } finally {
      setIsComparing(false);
      setStatusMessage('');
    }
  };

  const handleSwapSlots = () => {
    const temp = { ...slotA };
    setSlotA({ ...slotB });
    setSlotB(temp);
  };

  const hasBothResults = !!slotA.result && !!slotB.result;
  const isSameSpecies = hasBothResults && slotA.result!.species.plantId === slotB.result!.species.plantId;
  const isSameHealth = hasBothResults && slotA.result!.health.status === slotB.result!.health.status;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 font-semibold mb-1">
              <Scale className="w-4 h-4 text-emerald-600" />
              <span>Comparative Analytics & Differential Diagnosis</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Analyze & Compare Two Leaf Specimens
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Side-by-side computer vision evaluation to detect taxonomic classification divergence and health contrasts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSwapSlots}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Swap A ⇄ B</span>
            </button>
            <button
              onClick={handleRunComparison}
              disabled={isComparing || !slotA.imageSrc || !slotB.imageSrc}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:pointer-events-none rounded-lg transition-all shadow-xs"
            >
              {isComparing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Comparing...</span>
                </>
              ) : (
                <>
                  <Scale className="w-4 h-4 text-emerald-200" />
                  <span>Execute Comparison</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Error Banner */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-600" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-600 hover:text-rose-800 font-semibold text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRefA}
        type="file"
        accept=".jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFileUpload('A', f);
        }}
      />
      <input
        ref={fileInputRefB}
        type="file"
        accept=".jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFileUpload('B', f);
        }}
      />

      {/* Dual Specimen Input Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Specimen Slot A */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 font-mono flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">A</span>
                <span>Specimen A</span>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => fileInputRefA.current?.click()}
                  className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                >
                  Upload
                </button>
                <button
                  onClick={() => setActivePickerSlot(activePickerSlot === 'A' ? null : 'A')}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                    activePickerSlot === 'A'
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Pick Specimen
                </button>
              </div>
            </div>

            {/* Specimen Picker Popover if active */}
            {activePickerSlot === 'A' && (
              <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-3">
                <div className="flex items-center justify-between font-semibold text-slate-800 text-[11px]">
                  <span>Choose from Curated Specimens or History:</span>
                  <button onClick={() => setActivePickerSlot(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { key: 'neem', name: 'Neem', img: SAMPLE_IMAGES.neem },
                    { key: 'tulsi', name: 'Tulsi', img: SAMPLE_IMAGES.tulsi },
                    { key: 'aloe', name: 'Aloe Vera', img: SAMPLE_IMAGES.aloe_vera },
                    { key: 'ashwagandha', name: 'Ashwagandha', img: SAMPLE_IMAGES.ashwagandha },
                    { key: 'mint', name: 'Mint', img: SAMPLE_IMAGES.mint },
                    { key: 'curry', name: 'Curry Leaf', img: SAMPLE_IMAGES.curry_leaf },
                    { key: 'disease', name: 'Tulsi (Diseased)', img: SAMPLE_IMAGES.diseased_sample },
                  ].map((s) => (
                    <button
                      key={s.key}
                      onClick={() => handleSelectCuratedSample('A', s.key, s.img)}
                      className="p-1 rounded bg-white border border-slate-200 hover:border-emerald-500 text-left text-[10px] truncate"
                    >
                      <img src={s.img} alt={s.name} className="w-full aspect-square object-cover rounded-xs mb-0.5" />
                      <span className="block truncate">{s.name}</span>
                    </button>
                  ))}
                </div>

                {historySessions.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[10px] font-mono text-slate-500 block mb-1">From Past Scans:</span>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {historySessions.slice(0, 4).map((sess) => (
                        <button
                          key={sess.id}
                          onClick={() => handleSelectHistorySession('A', sess)}
                          className="w-full text-left p-1.5 rounded bg-white border border-slate-200 hover:border-emerald-500 text-[11px] flex items-center justify-between"
                        >
                          <span className="font-medium text-slate-800">{sess.plantName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{sess.dateStr}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Specimen A Image Viewport */}
            <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center">
              {slotA.imageSrc ? (
                <img src={slotA.imageSrc} alt="Specimen A" className="w-full h-full object-contain" />
              ) : (
                <span className="text-xs text-slate-400">No leaf loaded</span>
              )}
            </div>

            {/* Preprocessing Indicators */}
            {slotA.metrics && (
              <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded-md">
                <span>ExG: <strong className="text-emerald-700">{slotA.metrics.greenIndex > 0 ? `+${slotA.metrics.greenIndex}` : slotA.metrics.greenIndex}</strong></span>
                <span>Sharpness: {slotA.metrics.blurScore}/100</span>
                <span>Shape: 224×224</span>
              </div>
            )}
          </div>

          {/* Quick Result A Badge */}
          {slotA.result && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-900">{slotA.result.species.name}</span>
                <span className="text-xs text-emerald-700 font-mono ml-2 font-semibold">
                  {slotA.result.species.confidence.toFixed(1)}%
                </span>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                slotA.result.health.status === 'healthy' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {slotA.result.health.status.toUpperCase()} ({slotA.result.health.confidence.toFixed(1)}%)
              </span>
            </div>
          )}
        </div>

        {/* Specimen Slot B */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-800 font-mono flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">B</span>
                <span>Specimen B</span>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => fileInputRefB.current?.click()}
                  className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                >
                  Upload
                </button>
                <button
                  onClick={() => setActivePickerSlot(activePickerSlot === 'B' ? null : 'B')}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                    activePickerSlot === 'B'
                      ? 'bg-sky-600 text-white font-semibold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Pick Specimen
                </button>
              </div>
            </div>

            {/* Specimen Picker Popover if active */}
            {activePickerSlot === 'B' && (
              <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-3">
                <div className="flex items-center justify-between font-semibold text-slate-800 text-[11px]">
                  <span>Choose from Curated Specimens or History:</span>
                  <button onClick={() => setActivePickerSlot(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { key: 'neem', name: 'Neem', img: SAMPLE_IMAGES.neem },
                    { key: 'tulsi', name: 'Tulsi', img: SAMPLE_IMAGES.tulsi },
                    { key: 'aloe', name: 'Aloe Vera', img: SAMPLE_IMAGES.aloe_vera },
                    { key: 'ashwagandha', name: 'Ashwagandha', img: SAMPLE_IMAGES.ashwagandha },
                    { key: 'mint', name: 'Mint', img: SAMPLE_IMAGES.mint },
                    { key: 'curry', name: 'Curry Leaf', img: SAMPLE_IMAGES.curry_leaf },
                    { key: 'disease', name: 'Tulsi (Diseased)', img: SAMPLE_IMAGES.diseased_sample },
                  ].map((s) => (
                    <button
                      key={s.key}
                      onClick={() => handleSelectCuratedSample('B', s.key, s.img)}
                      className="p-1 rounded bg-white border border-slate-200 hover:border-sky-500 text-left text-[10px] truncate"
                    >
                      <img src={s.img} alt={s.name} className="w-full aspect-square object-cover rounded-xs mb-0.5" />
                      <span className="block truncate">{s.name}</span>
                    </button>
                  ))}
                </div>

                {historySessions.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[10px] font-mono text-slate-500 block mb-1">From Past Scans:</span>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {historySessions.slice(0, 4).map((sess) => (
                        <button
                          key={sess.id}
                          onClick={() => handleSelectHistorySession('B', sess)}
                          className="w-full text-left p-1.5 rounded bg-white border border-slate-200 hover:border-sky-500 text-[11px] flex items-center justify-between"
                        >
                          <span className="font-medium text-slate-800">{sess.plantName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{sess.dateStr}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Specimen B Image Viewport */}
            <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center">
              {slotB.imageSrc ? (
                <img src={slotB.imageSrc} alt="Specimen B" className="w-full h-full object-contain" />
              ) : (
                <span className="text-xs text-slate-400">No leaf loaded</span>
              )}
            </div>

            {/* Preprocessing Indicators */}
            {slotB.metrics && (
              <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded-md">
                <span>ExG: <strong className="text-sky-700">{slotB.metrics.greenIndex > 0 ? `+${slotB.metrics.greenIndex}` : slotB.metrics.greenIndex}</strong></span>
                <span>Sharpness: {slotB.metrics.blurScore}/100</span>
                <span>Shape: 224×224</span>
              </div>
            )}
          </div>

          {/* Quick Result B Badge */}
          {slotB.result && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-900">{slotB.result.species.name}</span>
                <span className="text-xs text-sky-700 font-mono ml-2 font-semibold">
                  {slotB.result.species.confidence.toFixed(1)}%
                </span>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                slotB.result.health.status === 'healthy' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {slotB.result.health.status.toUpperCase()} ({slotB.result.health.confidence.toFixed(1)}%)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* COMPARATIVE ANALYSIS REPORT SECTION (When both are analyzed) */}
      {hasBothResults && slotA.result && slotB.result && (
        <div className="space-y-6">
          {/* Contrast Scorecard & Key Differential Highlights */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Scale className="w-5 h-5 text-emerald-600" />
              Differential Diagnostic Summary
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              {/* Species Match / Contrast */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase block">Species Relationship</span>
                <div className="flex items-center gap-1.5 mt-1 font-bold text-sm">
                  {isSameSpecies ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Homologous Species ({slotA.result.species.name})
                    </span>
                  ) : (
                    <span className="text-indigo-700 flex items-center gap-1">
                      <Columns className="w-4 h-4" />
                      Divergent Species ({slotA.result.species.name} vs {slotB.result.species.name})
                    </span>
                  )}
                </div>
              </div>

              {/* Health Contrast */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase block">Health State Differential</span>
                <div className="flex items-center gap-1.5 mt-1 font-bold text-sm">
                  {isSameHealth ? (
                    <span className={slotA.result.health.status === 'healthy' ? 'text-emerald-700' : 'text-amber-700'}>
                      Both {slotA.result.health.status.toUpperCase()}
                    </span>
                  ) : (
                    <span className="text-amber-700 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      Status Contrast (One Healthy / One Diseased)
                    </span>
                  )}
                </div>
              </div>

              {/* Confidence Differential */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase block">Confidence Delta (Δ)</span>
                <div className="mt-1 font-bold text-sm text-slate-800">
                  Species: <span className="text-emerald-700 tabular-nums">
                    {Math.abs(slotA.result.species.confidence - slotB.result.species.confidence).toFixed(1)}%
                  </span> · Health: <span className="text-slate-700 tabular-nums">
                    {Math.abs(slotA.result.health.confidence - slotB.result.health.confidence).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Side-by-Side Detailed Comparison Matrix */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4">
              Side-by-Side Architectural & Pharmacological Breakdown
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-mono text-[10px]">
                    <th className="py-2.5 px-3 w-1/4">Evaluation Attribute</th>
                    <th className="py-2.5 px-3 w-3/8 text-emerald-900 font-semibold bg-emerald-50/50">Specimen A</th>
                    <th className="py-2.5 px-3 w-3/8 text-sky-900 font-semibold bg-sky-50/50">Specimen B</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Plant Species */}
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">Identified Species</td>
                    <td className="py-2.5 px-3 bg-emerald-50/20">
                      <strong className="text-slate-900">{slotA.result.species.name}</strong>
                      <span className="block text-[11px] text-slate-500 italic font-serif">
                        {slotA.result.species.scientificName}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 bg-sky-50/20">
                      <strong className="text-slate-900">{slotB.result.species.name}</strong>
                      <span className="block text-[11px] text-slate-500 italic font-serif">
                        {slotB.result.species.scientificName}
                      </span>
                    </td>
                  </tr>

                  {/* Botanical Family */}
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">Botanical Family</td>
                    <td className="py-2.5 px-3 bg-emerald-50/20 font-mono text-slate-800">{slotA.result.medicinalInfo.family}</td>
                    <td className="py-2.5 px-3 bg-sky-50/20 font-mono text-slate-800">{slotB.result.medicinalInfo.family}</td>
                  </tr>

                  {/* Species Confidence */}
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">Model Confidence</td>
                    <td className="py-2.5 px-3 bg-emerald-50/20 font-mono font-bold text-emerald-700 tabular-nums">
                      {slotA.result.species.confidence.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 bg-sky-50/20 font-mono font-bold text-sky-700 tabular-nums">
                      {slotB.result.species.confidence.toFixed(1)}%
                    </td>
                  </tr>

                  {/* Health Status */}
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">Foliar Health Condition</td>
                    <td className="py-2.5 px-3 bg-emerald-50/20">
                      <span className={`inline-flex items-center gap-1 font-semibold ${
                        slotA.result.health.status === 'healthy' ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        {slotA.result.health.status === 'healthy' ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                        {slotA.result.health.status.toUpperCase()} ({slotA.result.health.confidence.toFixed(1)}%)
                      </span>
                      {slotA.result.health.diseaseName && (
                        <span className="block text-[11px] text-rose-700 mt-0.5 font-medium">
                          {slotA.result.health.diseaseName}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 bg-sky-50/20">
                      <span className={`inline-flex items-center gap-1 font-semibold ${
                        slotB.result.health.status === 'healthy' ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        {slotB.result.health.status === 'healthy' ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                        {slotB.result.health.status.toUpperCase()} ({slotB.result.health.confidence.toFixed(1)}%)
                      </span>
                      {slotB.result.health.diseaseName && (
                        <span className="block text-[11px] text-rose-700 mt-0.5 font-medium">
                          {slotB.result.health.diseaseName}
                        </span>
                      )}
                    </td>
                  </tr>

                  {/* Key Phytochemicals */}
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">Key Active Phytochemicals</td>
                    <td className="py-2.5 px-3 bg-emerald-50/20">
                      <ul className="list-disc pl-4 text-[11px] text-slate-700 space-y-0.5 font-mono">
                        {slotA.result.medicinalInfo.activePhytochemicals.slice(0, 2).map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-2.5 px-3 bg-sky-50/20">
                      <ul className="list-disc pl-4 text-[11px] text-slate-700 space-y-0.5 font-mono">
                        {slotB.result.medicinalInfo.activePhytochemicals.slice(0, 2).map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>

                  {/* Primary Medicinal Application */}
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">Primary Herbal Application</td>
                    <td className="py-2.5 px-3 bg-emerald-50/20 text-[11px] text-slate-700 leading-relaxed">
                      {slotA.result.medicinalInfo.primaryMedicinalUses[0]}
                    </td>
                    <td className="py-2.5 px-3 bg-sky-50/20 text-[11px] text-slate-700 leading-relaxed">
                      {slotB.result.medicinalInfo.primaryMedicinalUses[0]}
                    </td>
                  </tr>

                  {/* Preprocessing Vegetation Index */}
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">Vegetation Index (2G - R - B)</td>
                    <td className="py-2.5 px-3 bg-emerald-50/20 font-mono text-emerald-800">
                      {slotA.result.preprocessing.greenIndex > 0 ? `+${slotA.result.preprocessing.greenIndex}` : slotA.result.preprocessing.greenIndex}
                    </td>
                    <td className="py-2.5 px-3 bg-sky-50/20 font-mono text-sky-800">
                      {slotB.result.preprocessing.greenIndex > 0 ? `+${slotB.result.preprocessing.greenIndex}` : slotB.result.preprocessing.greenIndex}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Actions for each result */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => onOpenFullResult(slotA.result!)}
                className="px-3 py-1.5 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 font-semibold rounded-md transition-colors"
              >
                Inspect Specimen A Full Report →
              </button>
              <button
                onClick={() => onOpenFullResult(slotB.result!)}
                className="px-3 py-1.5 text-sky-800 bg-sky-50 hover:bg-sky-100 font-semibold rounded-md transition-colors"
              >
                Inspect Specimen B Full Report →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

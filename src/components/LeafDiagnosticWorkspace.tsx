import React, { useState, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { PredictionResult, PreprocessingMetrics } from '../types/index.ts';
import { SAMPLE_IMAGES } from '../data/medicinalPlants.ts';
import { PreprocessingViewer } from './PreprocessingViewer.tsx';
import { ImageQualityChecker } from './ImageQualityChecker.tsx';
import { AnalysisResultView } from './AnalysisResultView.tsx';
import {
  Upload,
  Camera,
  Sparkles,
  Leaf,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  Eye,
  Microscope,
  ShieldCheck,
  AlertTriangle,
  Stethoscope,
  FlaskConical,
  Sprout,
  Cpu,
} from 'lucide-react';

interface LeafDiagnosticWorkspaceProps {
  mode: 'identify' | 'disease';
  selectedImageSrc: string | null;
  selectedSampleKey?: string;
  preprocessedData: {
    dataUrl: string;
    metrics: PreprocessingMetrics;
  } | null;
  analysisResult: PredictionResult | null;
  isAnalyzing: boolean;
  analysisStatus: string;
  errorMessage: string | null;
  isDemoMode: boolean;
  onDismissError: () => void;
  onFileUpload: (file: File) => void;
  onSelectSample: (key: string, img: string) => void;
  onOpenCamera: () => void;
  onRunAnalysis: () => void;
  onResetResult: () => void;
  onOpenCompare: () => void;
  onSwitchDiagnosticMode: (mode: 'identify' | 'disease') => void;
}

function getPossibleCauses(result: PredictionResult): string[] {
  if (result.health.status === 'healthy') {
    return [
      'Balanced chlorophyll pigmentation (ExG vegetation index) with zero necrotic disruption.',
      'Adequate moisture drainage and sunlight exposure preventing opportunistic fungal spores.',
      'Healthy epidermal integrity without pest feeding damage or chlorotic halos.',
    ];
  }

  switch (result.health.pathogenType) {
    case 'pest':
      return [
        'Leaf miner larvae tunneling beneath the upper leaflet epidermis and distorting new flush growth.',
        'Sap-sucking insects secreting sweet honeydew that fosters secondary black sooty mold.',
        'Warm shaded canopy pockets reducing beneficial predator insect activity.',
      ];
    case 'bacterial':
      return [
        'Bacteria entering leaf stomata during periods of high relative humidity or overhead irrigation.',
        'Rain-splash transmission carrying pathogens from topsoil onto lower leaves.',
      ];
    case 'fungal':
    default:
      return [
        'Prolonged leaf-surface moisture from evening misting, rain, or overhead watering.',
        'Airborne fungal spores (such as Cercospora or mildew hyphae) germinating in humid microclimates.',
        'Overcrowded foliage canopy limiting morning sunlight and cross-ventilation.',
      ];
  }
}

export const LeafDiagnosticWorkspace: React.FC<LeafDiagnosticWorkspaceProps> = ({
  mode,
  selectedImageSrc,
  selectedSampleKey,
  preprocessedData,
  analysisResult,
  isAnalyzing,
  analysisStatus,
  errorMessage,
  isDemoMode,
  onDismissError,
  onFileUpload,
  onSelectSample,
  onOpenCamera,
  onRunAnalysis,
  onResetResult,
  onOpenCompare,
  onSwitchDiagnosticMode,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [isDragging, setIsDragging] = useState(false);
  const [showPreprocessing, setShowPreprocessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isIdentify = mode === 'identify';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileUpload(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileUpload(file);
  };

  const sampleButtons = isIdentify
    ? [
        { key: 'neem', name: 'Neem', img: SAMPLE_IMAGES.neem },
        { key: 'tulsi', name: 'Tulsi', img: SAMPLE_IMAGES.tulsi },
        { key: 'aloe', name: 'Aloe Vera', img: SAMPLE_IMAGES.aloe_vera },
        { key: 'ashwagandha', name: 'Ashwagandha', img: SAMPLE_IMAGES.ashwagandha },
        { key: 'mint', name: 'Mint', img: SAMPLE_IMAGES.mint },
        { key: 'curry', name: 'Curry Leaf', img: SAMPLE_IMAGES.curry_leaf },
        { key: 'disease', name: 'Tulsi (Leaf Spot)', img: SAMPLE_IMAGES.diseased_sample, isDisease: true },
      ]
    : [
        { key: 'disease', name: 'Tulsi (Cercospora Spot)', img: SAMPLE_IMAGES.diseased_sample, isDisease: true },
        { key: 'tulsi', name: 'Tulsi (Healthy)', img: SAMPLE_IMAGES.tulsi },
        { key: 'neem', name: 'Neem (Healthy)', img: SAMPLE_IMAGES.neem },
        { key: 'aloe', name: 'Aloe Vera', img: SAMPLE_IMAGES.aloe_vera },
        { key: 'ashwagandha', name: 'Ashwagandha', img: SAMPLE_IMAGES.ashwagandha },
        { key: 'mint', name: 'Mint', img: SAMPLE_IMAGES.mint },
        { key: 'curry', name: 'Curry Leaf', img: SAMPLE_IMAGES.curry_leaf },
      ];

  return (
    <div className="space-y-6">
      {/* Mode Hero Header Banner */}
      <div className="bg-gradient-to-r from-[#123D2A] via-[#175138] to-[#18251E] text-white rounded-2xl p-6 sm:p-8 border border-[#123D2A]/20 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono text-[#4ade80] font-semibold">
            {isIdentify ? <Leaf className="w-4 h-4" /> : <Microscope className="w-4 h-4" />}
            <span>
              {isIdentify
                ? 'Module 01 · Botanical Taxonomic Classification'
                : 'Module 02 · Foliar Pathology & Disease Diagnostics'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {isIdentify
              ? 'Medicinal Plant Identification'
              : 'Intelligent Leaf Disease Detection'}
          </h1>
          <p className="text-sm text-[#E8F5EC]/80 leading-relaxed">
            {isIdentify
              ? 'Upload or photograph a medicinal leaf to identify its exact botanical species, scientific taxonomy, key morphological characteristics, phytoconstituents, and traditional healing uses.'
              : 'Screen leaves for fungal spots, rust, mildew, or pest damage with live MobileNetV2 & ResNet feature extraction, symptom mapping, causal analysis, and organic treatment steps.'}
          </p>
        </div>

        {/* Clean Switcher between Identification & Disease Detection */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
          <div className="flex items-center p-1 bg-[#0c291c]/80 rounded-xl border border-[#E8F5EC]/15">
            <button
              type="button"
              onClick={() => onSwitchDiagnosticMode('identify')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                isIdentify ? 'bg-[#16A36A] text-white' : 'text-[#E8F5EC]/75 hover:text-white'
              }`}
            >
              <Leaf className="w-3.5 h-3.5" />
              <span>Identify Plant</span>
            </button>
            <button
              type="button"
              onClick={() => onSwitchDiagnosticMode('disease')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                !isIdentify ? 'bg-[#16A36A] text-white' : 'text-[#E8F5EC]/75 hover:text-white'
              }`}
            >
              <Microscope className="w-3.5 h-3.5" />
              <span>Detect Disease</span>
            </button>
          </div>
        </div>
      </div>

      {/* Classification Advisory Alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="font-semibold block mb-0.5">Classification Advisory</strong>
            <p>{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={onDismissError}
            className="text-rose-600 hover:text-rose-800 font-mono text-xs font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Upload & Specimen Input Workspace OR Results Workspace */}
      {!analysisResult ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): Interactive Drag & Drop + Benchmark Samples */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="bg-white rounded-2xl p-6 border border-[#123D2A]/12 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#123D2A]/10">
                <div>
                  <h2 className="text-base font-bold text-[#123D2A]">
                    Step 1 · Upload or Capture Leaf Specimen
                  </h2>
                  <p className="text-xs text-[#18251E]/65">
                    Connected to {isDemoMode ? 'Client Neural Preprocessing Pipeline' : 'Live Flask Keras Inference Backend'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#123D2A] bg-[#E8F5EC] hover:bg-[#d6ede0] rounded-xl transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Browse File</span>
                  </button>
                  <button
                    type="button"
                    onClick={onOpenCamera}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#16A36A] hover:bg-[#148e5c] rounded-xl transition-colors shadow-xs cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Camera</span>
                  </button>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Interactive Drag & Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#16A36A] bg-[#E8F5EC]/70 scale-[1.01]'
                    : 'border-[#123D2A]/20 hover:border-[#16A36A] bg-[#FAFCF8] hover:bg-[#E8F5EC]/35'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-[#E8F5EC] text-[#16A36A] flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-[#123D2A]">
                  Drag & drop a leaf photo here, or click to upload
                </p>
                <p className="text-xs text-[#18251E]/60 mt-1 font-mono">
                  Supports JPG, JPEG, PNG · Automatically normalized to 224 × 224 RGB tensor
                </p>
              </div>

              {/* 1-Click Benchmark Leaf Specimens */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#123D2A]/75 font-mono">
                    Curated Medicinal Specimens (1-Click Load)
                  </span>
                  <span className="text-[11px] text-[#18251E]/55 font-mono">7 Specimens</span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                  {sampleButtons.map((specimen) => (
                    <button
                      key={specimen.key}
                      type="button"
                      onClick={() => onSelectSample(specimen.key, specimen.img)}
                      className={`p-1.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedSampleKey === specimen.key
                          ? 'border-[#16A36A] bg-[#E8F5EC] ring-2 ring-[#16A36A]/25'
                          : 'border-[#123D2A]/12 bg-white hover:border-[#16A36A]/60'
                      }`}
                    >
                      <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 mb-1.5 border border-[#123D2A]/10">
                        <img
                          src={specimen.img}
                          alt={specimen.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span
                        className={`block text-[11px] font-semibold truncate ${
                          specimen.isDisease ? 'text-amber-800' : 'text-[#18251E]'
                        }`}
                      >
                        {specimen.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Expandable Preprocessing Tensor Inspector */}
            {preprocessedData && (
              <div className="bg-white rounded-2xl p-5 border border-[#123D2A]/12 shadow-xs">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#123D2A] font-mono">
                      Tensor Preprocessing Telemetry
                    </h3>
                    <p className="text-xs text-[#18251E]/65 mt-0.5">
                      224×224 RGB Rescaling · Excess Green Index (ExG = {preprocessedData.metrics.greenIndex})
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPreprocessing((prev) => !prev)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#123D2A] bg-[#E8F5EC] hover:bg-[#d7eee0] rounded-lg transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{showPreprocessing ? 'Hide Tensor Map' : 'Inspect Tensor'}</span>
                  </button>
                </div>

                {showPreprocessing && (
                  <div className="mt-4">
                    <PreprocessingViewer
                      metrics={preprocessedData.metrics}
                      processedDataUrl={preprocessedData.dataUrl}
                    />
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Right Column (5 cols): Specimen Preview Viewport & Analyze / Identify Action */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.06 }}
            className="lg:col-span-5"
          >
            <div className="bg-white rounded-2xl p-6 border border-[#123D2A]/12 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#123D2A]/10 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#123D2A] font-mono">
                    Specimen Preview
                  </span>
                  {preprocessedData && (
                    <span className="text-[11px] font-mono text-[#123D2A] bg-[#E8F5EC] px-2.5 py-0.5 rounded-md font-semibold tabular-nums">
                      {preprocessedData.metrics.originalDimensions.width} ×{' '}
                      {preprocessedData.metrics.originalDimensions.height} px
                    </span>
                  )}
                </div>

                {/* Image Preview Viewport with Animated Neural Scan Overlay */}
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden border border-[#123D2A]/15 bg-[#18251E] flex items-center justify-center">
                  {selectedImageSrc ? (
                    <img
                      src={selectedImageSrc}
                      alt="Uploaded leaf specimen preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-6 text-[#E8F5EC]/60">
                      <Leaf className="w-10 h-10 mx-auto mb-2 opacity-60" />
                      <p className="text-xs">Upload or select a leaf specimen</p>
                    </div>
                  )}

                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-[#123D2A]/88 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white">
                      {!prefersReducedMotion && (
                        <motion.div
                          aria-hidden="true"
                          className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#4ade80] to-transparent"
                          animate={{ top: ['12%', '88%', '12%'] }}
                          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      )}
                      <RefreshCw className="w-8 h-8 text-[#4ade80] animate-spin mb-3" />
                      <span className="text-sm font-bold mb-1">
                        {isIdentify ? 'Identifying Plant Species...' : 'Scanning Foliar Pathology...'}
                      </span>
                      <span className="text-xs text-[#E8F5EC]/80 font-mono max-w-xs">
                        {analysisStatus}
                      </span>
                    </div>
                  )}
                </div>

                {/* Pre-flight Telemetry Readout */}
                {preprocessedData && !isAnalyzing && (
                  <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs font-mono">
                    <div className="p-3 bg-[#FAFCF8] rounded-xl border border-[#123D2A]/10">
                      <span className="text-[10px] text-[#18251E]/55 uppercase block">
                        Vegetation Index (ExG)
                      </span>
                      <span className="text-[#123D2A] font-bold tabular-nums text-sm">
                        {preprocessedData.metrics.greenIndex > 0
                          ? `+${preprocessedData.metrics.greenIndex}`
                          : preprocessedData.metrics.greenIndex}
                      </span>
                    </div>
                    <div className="p-3 bg-[#FAFCF8] rounded-xl border border-[#123D2A]/10">
                      <span className="text-[10px] text-[#18251E]/55 uppercase block">
                        Focus Sharpness
                      </span>
                      <span className="text-[#123D2A] font-bold tabular-nums text-sm">
                        {preprocessedData.metrics.blurScore} / 100
                      </span>
                    </div>
                  </div>
                )}

                {selectedImageSrc && !isAnalyzing && (
                  <div className="mt-4">
                    <ImageQualityChecker imageSrc={selectedImageSrc} />
                  </div>
                )}
              </div>

              {/* Primary Execution CTA */}
              <div className="mt-6 pt-4 border-t border-[#123D2A]/10">
                <button
                  type="button"
                  onClick={onRunAnalysis}
                  disabled={isAnalyzing || !selectedImageSrc}
                  className="w-full py-3.5 px-6 text-sm font-bold text-white bg-[#16A36A] hover:bg-[#138f5d] disabled:opacity-50 disabled:pointer-events-none rounded-xl transition-all shadow-md shadow-[#16A36A]/20 flex items-center justify-center gap-2 group cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Running Deep Vision Model...</span>
                    </>
                  ) : (
                    <>
                      {isIdentify ? (
                        <Sparkles className="w-4 h-4 text-[#E8F5EC]" />
                      ) : (
                        <Microscope className="w-4 h-4 text-[#E8F5EC]" />
                      )}
                      <span>{isIdentify ? 'Identify Plant' : 'Analyze Leaf'}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        /* DIAGNOSTIC RESULTS STAGE */
        <div className="space-y-6">
          {/* Focused Top Executive Summary Matching Mode (Identify vs Disease) */}
          {isIdentify ? (
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-[#123D2A]/15 shadow-sm space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#123D2A]/10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#123D2A]/15 bg-[#18251E] shrink-0">
                    <img
                      src={selectedImageSrc || analysisResult.medicinalInfo.sampleImage}
                      alt={analysisResult.species.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-semibold text-[#16A36A] uppercase tracking-wider">
                      Predicted Plant Identification
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123D2A]">
                      {analysisResult.species.name}
                    </h2>
                    <p className="text-sm italic text-[#18251E]/70 font-serif">
                      {analysisResult.species.scientificName} · {analysisResult.medicinalInfo.family}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-left md:text-right">
                    <span className="text-xs font-mono text-[#18251E]/60 block">
                      Confidence Percentage
                    </span>
                    <span className="text-3xl font-extrabold font-mono text-[#16A36A] tabular-nums">
                      {analysisResult.species.confidence.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#123D2A] flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4 text-[#16A36A]" />
                    <span>Medicinal Uses & Pharmacological Value</span>
                  </h3>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-[#18251E]/85 list-disc pl-4 leading-relaxed">
                    {analysisResult.medicinalInfo.primaryMedicinalUses.slice(0, 3).map((use, idx) => (
                      <li key={idx}>{use}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#123D2A] flex items-center gap-1.5">
                    <Sprout className="w-4 h-4 text-[#16A36A]" />
                    <span>Important Botanical Characteristics</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-[#18251E]/85 leading-relaxed">
                    {analysisResult.medicinalInfo.leafMorphology}
                  </p>
                  <div className="pt-1 text-xs font-mono text-[#123D2A]/80">
                    Active Compounds:{' '}
                    {analysisResult.medicinalInfo.activePhytochemicals
                      .slice(0, 3)
                      .map((c) => c.split('(')[0].trim())
                      .join(' · ')}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-[#123D2A]/15 shadow-sm space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#123D2A]/10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#123D2A]/15 bg-[#18251E] shrink-0">
                    <img
                      src={selectedImageSrc || analysisResult.medicinalInfo.sampleImage}
                      alt={analysisResult.species.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-semibold text-[#16A36A] uppercase tracking-wider">
                      Foliar Disease Detection Summary · {analysisResult.species.name}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      {analysisResult.health.status === 'healthy' ? (
                        <ShieldCheck className="w-6 h-6 text-[#16A36A] shrink-0" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                      )}
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123D2A]">
                        {analysisResult.health.status === 'healthy'
                          ? 'Healthy Foliage (No Disease Detected)'
                          : analysisResult.health.diseaseName || 'Diseased Leaf Condition'}
                      </h2>
                    </div>
                    <p className="text-xs font-mono text-[#18251E]/65 mt-1">
                      Pathogen Type: <strong className="capitalize">{analysisResult.health.pathogenType || 'None'}</strong>
                      {' · '}
                      Severity: <strong className="capitalize">{analysisResult.health.severity || 'Normal'}</strong>
                    </p>
                  </div>
                </div>

                <div className="text-left md:text-right">
                  <span className="text-xs font-mono text-[#18251E]/60 block">
                    Prediction Confidence
                  </span>
                  <span
                    className={`text-3xl font-extrabold font-mono tabular-nums ${
                      analysisResult.health.status === 'healthy' ? 'text-[#16A36A]' : 'text-amber-600'
                    }`}
                  >
                    {analysisResult.health.confidence.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Symptoms */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#123D2A] flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-[#16A36A]" />
                    <span>Disease Symptoms</span>
                  </h3>
                  <ul className="space-y-1.5 text-xs text-[#18251E]/85 list-disc pl-4 leading-relaxed">
                    {analysisResult.health.symptoms && analysisResult.health.symptoms.length > 0 ? (
                      analysisResult.health.symptoms.map((sym, i) => <li key={i}>{sym}</li>)
                    ) : (
                      <li>
                        Uniform healthy chlorophyll tone with smooth unblemished margins and no necrotic lesions.
                      </li>
                    )}
                  </ul>
                </div>

                {/* Possible Causes */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#123D2A] flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-[#16A36A]" />
                    <span>Possible Causes</span>
                  </h3>
                  <ul className="space-y-1.5 text-xs text-[#18251E]/85 list-disc pl-4 leading-relaxed">
                    {getPossibleCauses(analysisResult).map((cause, i) => (
                      <li key={i}>{cause}</li>
                    ))}
                  </ul>
                </div>

                {/* Prevention & Treatment */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#123D2A] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#16A36A]" />
                    <span>Prevention & Treatment</span>
                  </h3>
                  <ul className="space-y-1.5 text-xs text-[#18251E]/85 list-disc pl-4 leading-relaxed">
                    {analysisResult.health.recommendations?.map((rec, i) => <li key={i}>{rec}</li>)}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* Complete Deep-Dive Result Inspector (AI Explanation, Kannada/Hindi/English Voice & Mic, Grad-CAM XAI, Care, Weather, PDF) */}
          <AnalysisResultView
            result={analysisResult}
            onReset={onResetResult}
            onOpenPreprocessing={() => setShowPreprocessing((prev) => !prev)}
            onStartCompare={onOpenCompare}
          />
        </div>
      )}
    </div>
  );
};

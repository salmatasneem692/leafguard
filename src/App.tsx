/**
 * LeafGuard AI – Medicinal Plant Identification and Leaf Disease Detection System
 * Academic Major Project: Electronics and Communication Engineering (ECE)
 */

import React, { useState, useRef } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { CameraModal } from './components/CameraModal.tsx';
import { PreprocessingViewer } from './components/PreprocessingViewer.tsx';
import { AnalysisResultView } from './components/AnalysisResultView.tsx';
import { MedicinalCompendium } from './components/MedicinalCompendium.tsx';
import { EvaluationView } from './components/EvaluationView.tsx';
import { ArchitectureView } from './components/ArchitectureView.tsx';
import { ModelConnectModal } from './components/ModelConnectModal.tsx';
import { HistoryView } from './components/HistoryView.tsx';
import { CompareView } from './components/CompareView.tsx';
import { BatchProcessingView } from './components/BatchProcessingView.tsx';
import { ImageQualityChecker } from './components/ImageQualityChecker.tsx';

import { preprocessLeafImage } from './services/imagePreprocessing.ts';
import { predictLeafCondition } from './services/predictionService.ts';
import { 
  getAnalysisHistory, 
  saveAnalysisSession, 
  deleteAnalysisSession, 
  clearAnalysisHistory, 
  SavedAnalysisSession 
} from './services/historyStorage.ts';
import { SAMPLE_IMAGES, MEDICINAL_PLANTS } from './data/medicinalPlants.ts';
import { PredictionResult, PreprocessingMetrics, PlantSpeciesId } from './types/index.ts';

import { 
  Upload, 
  Camera, 
  Sparkles, 
  Leaf, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Info, 
  Cpu, 
  ShieldAlert,
  ArrowRight,
  Eye,
  Sliders,
  Scale,
  Files
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'history' | 'compendium' | 'evaluation' | 'architecture'>('analyzer');
  const [analyzerSubMode, setAnalyzerSubMode] = useState<'single' | 'compare' | 'batch'>('single');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isModelModalOpen, setIsModelModalOpen] = useState<boolean>(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [historySessions, setHistorySessions] = useState<SavedAnalysisSession[]>(() => getAnalysisHistory());

  // Analyzer States
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(SAMPLE_IMAGES.neem);
  const [selectedSampleKey, setSelectedSampleKey] = useState<string | undefined>('neem');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStatus, setAnalysisStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPreprocessing, setShowPreprocessing] = useState<boolean>(false);
  const [preprocessedData, setPreprocessedData] = useState<{
    dataUrl: string;
    metrics: PreprocessingMetrics;
  } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<PredictionResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Pre-load default neem sample metrics on mount
  React.useEffect(() => {
    if (SAMPLE_IMAGES.neem) {
      preprocessLeafImage(SAMPLE_IMAGES.neem)
        .then((res) => {
          setPreprocessedData({
            dataUrl: res.processedDataUrl,
            metrics: res.metrics,
          });
        })
        .catch(() => {});
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate format
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMessage('Unsupported image format. Please upload a JPG, JPEG, or PNG leaf image.');
      return;
    }

    setErrorMessage(null);
    setAnalysisResult(null);
    setSelectedSampleKey(undefined);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const src = event.target?.result as string;
        setSelectedImageSrc(src);

        // Run preprocessing
        try {
          const preRes = await preprocessLeafImage(file);
          setPreprocessedData({
            dataUrl: preRes.processedDataUrl,
            metrics: preRes.metrics,
          });
        } catch (err: any) {
          setErrorMessage(err.message || 'Image preprocessing failed.');
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMessage('Failed to read image file.');
    }
  };

  const handleCameraCapture = async (imageDataUrl: string) => {
    setErrorMessage(null);
    setAnalysisResult(null);
    setSelectedSampleKey(undefined);
    setSelectedImageSrc(imageDataUrl);

    try {
      const preRes = await preprocessLeafImage(imageDataUrl);
      setPreprocessedData({
        dataUrl: preRes.processedDataUrl,
        metrics: preRes.metrics,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Preprocessing camera frame failed.');
    }
  };

  const handleSelectSample = async (key: string, src: string) => {
    setErrorMessage(null);
    setAnalysisResult(null);
    setSelectedSampleKey(key);
    setSelectedImageSrc(src);

    try {
      const preRes = await preprocessLeafImage(src);
      setPreprocessedData({
        dataUrl: preRes.processedDataUrl,
        metrics: preRes.metrics,
      });
    } catch (err: any) {
      setErrorMessage('Preprocessing sample image failed.');
    }
  };

  const handleRunAnalysis = async () => {
    if (!selectedImageSrc) {
      setErrorMessage('Please upload or capture a leaf image first.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      // Step 1: Preprocessing pipeline
      setAnalysisStatus('Executing MobileNetV2 Preprocessing (224×224, RGB, [-1, 1] normalization)...');
      let currentMetrics = preprocessedData?.metrics;
      if (!currentMetrics) {
        const preRes = await preprocessLeafImage(selectedImageSrc);
        setPreprocessedData({
          dataUrl: preRes.processedDataUrl,
          metrics: preRes.metrics,
        });
        currentMetrics = preRes.metrics;
      }

      await new Promise((r) => setTimeout(r, 220));

      // Step 2: Species CNN Forward Pass
      setAnalysisStatus('Inference: Extracting features via MobileNetV2 depthwise separable convolutions...');
      await new Promise((r) => setTimeout(r, 250));

      // Step 3: Health Classification & Medicinal synthesis
      setAnalysisStatus('Evaluating leaf pathology & synthesizing medicinal pharmacological profile...');
      const result = await predictLeafCondition(currentMetrics, selectedSampleKey, !isDemoMode);

      setAnalysisResult(result);

      // Save to local storage history
      try {
        const savedSession = await saveAnalysisSession(result, selectedImageSrc);
        setHistorySessions((prev) => [savedSession, ...prev.filter((s) => s.id !== savedSession.id)].slice(0, 30));
      } catch (err) {
        console.warn('Could not auto-save to history:', err);
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMessage(err.message || 'Analysis failed. Please upload a clearer leaf image.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStatus('');
    }
  };

  const handleDeleteHistorySession = (id: string) => {
    const updated = deleteAnalysisSession(id);
    setHistorySessions(updated);
  };

  const handleClearAllHistory = () => {
    clearAnalysisHistory();
    setHistorySessions([]);
  };

  const handleSelectHistorySession = (session: SavedAnalysisSession) => {
    setAnalysisResult(session.result);
    if (session.thumbnailUrl) {
      setSelectedImageSrc(session.thumbnailUrl);
    } else {
      setSelectedImageSrc(SAMPLE_IMAGES[session.result.species.plantId]);
    }
    setSelectedSampleKey(session.result.species.plantId);
    setActiveTab('analyzer');
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 3-Zone Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDemoMode={isDemoMode}
        onOpenModelModal={() => setIsModelModalOpen(true)}
        historyCount={historySessions.length}
      />

      {/* Main Body Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* VIEW 1: HOME & ANALYZER */}
        {activeTab === 'analyzer' && (
          <div className="space-y-6">
            {/* Academic Hero Lockup */}
            <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="relative z-10 max-w-3xl">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 font-semibold mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>ECE Major Project · Computer Vision & Edge AI in Agriculture</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 text-balance">
                  LeafGuard AI
                </h1>
                <p className="text-sm sm:text-base font-medium text-emerald-800 mt-1">
                  AI-Powered Medicinal Plant Identification & Leaf Health Detection System
                </p>

                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed max-w-2xl">
                  Automated computer vision pipeline utilizing transfer learning (<strong>MobileNetV2</strong>) for rapid medicinal flora classification, foliar disease diagnosis, and evidence-based herbal pharmacological profiling.
                </p>

                {/* Demo Mode Notice Banner as required */}
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>
                    {isDemoMode
                      ? 'Demo Mode – Connect trained model for real predictions.'
                      : 'Live Inference Active – Connected to Keras model weights.'}
                  </span>
                  <button
                    onClick={() => setIsModelModalOpen(true)}
                    className="ml-2 underline font-semibold text-amber-800 hover:text-amber-950"
                  >
                    Instructions
                  </button>
                </div>
              </div>
            </div>

            {/* Analyzer Sub-Mode Switcher */}
            <div className="flex items-center justify-between flex-wrap gap-3 pb-1">
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
                <button
                  onClick={() => setAnalyzerSubMode('single')}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                    analyzerSubMode === 'single'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Single Specimen</span>
                </button>
                <button
                  onClick={() => setAnalyzerSubMode('compare')}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                    analyzerSubMode === 'compare'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Analyze & Compare</span>
                </button>
                <button
                  onClick={() => setAnalyzerSubMode('batch')}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                    analyzerSubMode === 'batch'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Files className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Batch Processing Mode</span>
                </button>
              </div>

              <span className="text-xs text-slate-500 font-mono">
                {analyzerSubMode === 'batch'
                  ? 'Multi-Specimen High-Throughput Screening'
                  : analyzerSubMode === 'compare'
                  ? 'Dual MobileNetV2 Differential Stage'
                  : 'Standard 5-Stage Diagnostic Pipeline'}
              </span>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <strong className="font-semibold block mb-0.5">Classification Advisory</strong>
                  <p>{errorMessage}</p>
                </div>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="text-rose-500 hover:text-rose-700 font-mono text-xs font-semibold"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Batch Mode View */}
            {analyzerSubMode === 'batch' ? (
              <BatchProcessingView
                isDemoMode={isDemoMode}
                onOpenModelModal={() => setIsModelModalOpen(true)}
                onOpenSingleResult={(res, src) => {
                  setAnalysisResult(res);
                  setSelectedImageSrc(src);
                  setAnalyzerSubMode('single');
                }}
                onHistoryUpdated={(newSessions) => {
                  setHistorySessions((prev) => {
                    const map = new Map<string, SavedAnalysisSession>();
                    [...newSessions, ...prev].forEach((s) => map.set(s.id, s));
                    return Array.from(map.values()).slice(0, 30);
                  });
                }}
              />
            ) : analyzerSubMode === 'compare' ? (
              <CompareView
                historySessions={historySessions}
                initialResultA={analysisResult}
                initialImageA={selectedImageSrc}
                isDemoMode={isDemoMode}
                onOpenModelModal={() => setIsModelModalOpen(true)}
                onOpenFullResult={(res) => {
                  setAnalysisResult(res);
                  setAnalyzerSubMode('single');
                }}
              />
            ) : analysisResult ? (
              /* Single Mode: Result View */
              <AnalysisResultView
                result={analysisResult}
                onReset={handleReset}
                onOpenPreprocessing={() => setShowPreprocessing(true)}
                onStartCompare={() => setAnalyzerSubMode('compare')}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Image Input Controls & Interactive Specimens (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Primary Input Card */}
                  <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h2 className="text-sm font-bold text-slate-900">
                          Step 1 · Provide Leaf Specimen
                        </h2>
                        <p className="text-xs text-slate-500">
                          Supports high-resolution JPG, JPEG, and PNG leaf photography
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Upload Leaf
                        </button>
                        <button
                          onClick={() => setIsCameraModalOpen(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          Use Camera
                        </button>
                      </div>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    {/* Drag & Drop Visual Box */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-emerald-50/20"
                    >
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-700">
                        Click to browse file or drag and drop leaf photo here
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 font-mono">
                        Formats: JPG, JPEG, PNG · Minimum resolution: 224 × 224 px
                      </p>
                    </div>

                    {/* Curated 1-Click Test Leaf Specimens */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
                          Or Select Curated Benchmark Specimen:
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">1-click test</span>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                        {[
                          { key: 'neem', name: 'Neem', img: SAMPLE_IMAGES.neem },
                          { key: 'tulsi', name: 'Tulsi', img: SAMPLE_IMAGES.tulsi },
                          { key: 'aloe', name: 'Aloe Vera', img: SAMPLE_IMAGES.aloe_vera },
                          { key: 'ashwagandha', name: 'Ashwagandha', img: SAMPLE_IMAGES.ashwagandha },
                          { key: 'mint', name: 'Mint', img: SAMPLE_IMAGES.mint },
                          { key: 'curry', name: 'Curry Leaf', img: SAMPLE_IMAGES.curry_leaf },
                          { key: 'disease', name: 'Tulsi (Diseased)', img: SAMPLE_IMAGES.diseased_sample, isDisease: true },
                        ].map((specimen) => (
                          <button
                            key={specimen.key}
                            onClick={() => handleSelectSample(specimen.key, specimen.img)}
                            className={`p-1.5 rounded-lg border text-left transition-all ${
                              selectedSampleKey === specimen.key
                                ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="aspect-square rounded-md overflow-hidden bg-slate-100 mb-1 border border-slate-100">
                              <img
                                src={specimen.img}
                                alt={specimen.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className={`block text-[11px] font-medium truncate ${
                              specimen.isDisease ? 'text-amber-800' : 'text-slate-800'
                            }`}>
                              {specimen.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Preprocessing Inspector Toggle */}
                  {preprocessedData && (
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                            Stage 2 · Preprocessing Metrics
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Spatial resizing (224×224) and Excess Green Index (ExG = {preprocessedData.metrics.greenIndex})
                          </p>
                        </div>
                        <button
                          onClick={() => setShowPreprocessing(!showPreprocessing)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{showPreprocessing ? 'Hide Tensor Data' : 'Inspect Tensor Data'}</span>
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
                </div>

                {/* Right Column: Specimen Preview & Execute Analysis (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                          Specimen Viewport
                        </span>
                        {preprocessedData && (
                          <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {preprocessedData.metrics.originalDimensions.width} × {preprocessedData.metrics.originalDimensions.height} px
                          </span>
                        )}
                      </div>

                      {/* Image Preview Container */}
                      <div className="relative aspect-4/3 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center">
                        {selectedImageSrc ? (
                          <img
                            src={selectedImageSrc}
                            alt="Leaf Specimen Preview"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="text-center p-6 text-slate-400">
                            <Leaf className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                            <p className="text-xs">No leaf specimen selected</p>
                          </div>
                        )}

                        {/* Status Overlay when analyzing */}
                        {isAnalyzing && (
                          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white">
                            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
                            <span className="text-sm font-semibold mb-1">Processing Leaf Specimen</span>
                            <span className="text-xs text-slate-300 font-mono max-w-xs">{analysisStatus}</span>
                          </div>
                        )}
                      </div>

                      {/* Pre-flight Metrics Preview */}
                      {preprocessedData && !isAnalyzing && (
                        <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono text-slate-600">
                          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="text-[10px] text-slate-400 uppercase block">Vegetation Index (ExG)</span>
                            <span className="text-slate-900 font-bold tabular-nums">
                              {preprocessedData.metrics.greenIndex > 0 ? `+${preprocessedData.metrics.greenIndex}` : preprocessedData.metrics.greenIndex}
                            </span>
                          </div>
                          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="text-[10px] text-slate-400 uppercase block">Sharpness Metric</span>
                            <span className="text-slate-900 font-bold tabular-nums">
                              {preprocessedData.metrics.blurScore} / 100
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Image Quality Pre-Flight Evaluator */}
                      {selectedImageSrc && !isAnalyzing && (
                        <div className="mt-4">
                          <ImageQualityChecker imageSrc={selectedImageSrc} />
                        </div>
                      )}
                    </div>

                    {/* Trigger Button */}
                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <button
                        onClick={handleRunAnalysis}
                        disabled={isAnalyzing || !selectedImageSrc}
                        className="w-full py-3 px-6 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:pointer-events-none rounded-lg transition-all shadow-xs flex items-center justify-center gap-2 group"
                      >
                        {isAnalyzing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-white" />
                            <span>Executing Pipeline...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-emerald-200" />
                            <span>Analyze Leaf (Species & Health)</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: HISTORY ARCHIVE */}
        {activeTab === 'history' && (
          <HistoryView
            sessions={historySessions}
            onSelectSession={handleSelectHistorySession}
            onDeleteSession={handleDeleteHistorySession}
            onClearAll={handleClearAllHistory}
            onGoToAnalyzer={() => setActiveTab('analyzer')}
          />
        )}

        {/* VIEW 3: MEDICINAL COMPENDIUM */}
        {activeTab === 'compendium' && (
          <MedicinalCompendium
            onSelectSampleToAnalyze={(plantId: PlantSpeciesId) => {
              const sampleImg = SAMPLE_IMAGES[plantId];
              handleSelectSample(plantId, sampleImg);
              setActiveTab('analyzer');
            }}
          />
        )}

        {/* VIEW 3: ACADEMIC EVALUATION & BENCHMARKS */}
        {activeTab === 'evaluation' && <EvaluationView />}

        {/* VIEW 4: ARCHITECTURE & INTEGRATION GUIDE */}
        {activeTab === 'architecture' && <ArchitectureView />}
      </main>

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleCameraCapture}
      />

      {/* Model Integration & Connect Modal */}
      <ModelConnectModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        isDemoMode={isDemoMode}
        onToggleDemoMode={(enabled) => setIsDemoMode(enabled)}
      />

      {/* Quiet Academic Project Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">LeafGuard AI</span>
            <span>·</span>
            <span>ECE Major Project · AI-Powered Medicinal Plant Identification & Leaf Health Detection System</span>
          </div>
          <div className="text-slate-400 font-mono text-[11px]">
            MobileNetV2 (224×224) · TensorFlow / Keras Pipeline
          </div>
        </div>
      </footer>
    </div>
  );
}

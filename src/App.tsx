/**
 * LeafGuard AI – Intelligent Medicinal Plant Identification & Leaf Disease Detection System
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Navbar, NavTabId } from './components/Navbar.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { LeafDiagnosticWorkspace } from './components/LeafDiagnosticWorkspace.tsx';
import { MedicinalCompendium } from './components/MedicinalCompendium.tsx';
import { AboutView } from './components/AboutView.tsx';
import { MeetOurTeamView } from './components/MeetOurTeamView.tsx';
import { CameraModal } from './components/CameraModal.tsx';
import { ModelConnectModal } from './components/ModelConnectModal.tsx';

import { preprocessLeafImage } from './services/imagePreprocessing.ts';
import { predictLeafCondition, probeFlaskBackend } from './services/predictionService.ts';
import {
  getAnalysisHistory,
  saveAnalysisSession,
  deleteAnalysisSession,
  clearAnalysisHistory,
  SavedAnalysisSession,
} from './services/historyStorage.ts';
import { SAMPLE_IMAGES } from './data/medicinalPlants.ts';
import { PredictionResult, PreprocessingMetrics, PlantSpeciesId } from './types/index.ts';

export default function App() {
  const prefersReducedMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<NavTabId>('home');
  const [dashboardInitialSubTab, setDashboardInitialSubTab] = useState<'overview' | 'compare' | 'batch' | 'metrics'>('overview');
  const [librarySelectedPlantId, setLibrarySelectedPlantId] = useState<PlantSpeciesId>('neem');

  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isModelModalOpen, setIsModelModalOpen] = useState<boolean>(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [historySessions, setHistorySessions] = useState<SavedAnalysisSession[]>(() => getAnalysisHistory());

  // Leaf Identification & Disease Detection States
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(SAMPLE_IMAGES.tulsi);
  const [selectedSampleKey, setSelectedSampleKey] = useState<string | undefined>('tulsi');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStatus, setAnalysisStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [preprocessedData, setPreprocessedData] = useState<{
    dataUrl: string;
    metrics: PreprocessingMetrics;
  } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<PredictionResult | null>(null);

  // On mount: preload default sample telemetry & automatically probe Flask Keras server
  useEffect(() => {
    if (SAMPLE_IMAGES.tulsi) {
      preprocessLeafImage(SAMPLE_IMAGES.tulsi)
        .then((res) => {
          setPreprocessedData({
            dataUrl: res.processedDataUrl,
            metrics: res.metrics,
          });
        })
        .catch(() => {});
    }

    probeFlaskBackend()
      .then((status) => {
        if (status.online && status.speciesModelLoaded) {
          setIsDemoMode(false);
        }
      })
      .catch(() => {});
  }, []);

  // Automatically select appropriate sample when switching directly into Disease Detection if nothing diseased/uploaded is active
  const handleNavigate = (tab: NavTabId) => {
    if (tab === 'dashboard') {
      setDashboardInitialSubTab('overview');
    }
    if (tab === 'disease' && selectedSampleKey === 'tulsi' && !analysisResult) {
      handleSelectSample('disease', SAMPLE_IMAGES.diseased_sample);
    } else if (tab === 'identify' && selectedSampleKey === 'disease' && !analysisResult) {
      handleSelectSample('tulsi', SAMPLE_IMAGES.tulsi);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileUpload = async (file: File) => {
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

        try {
          const preRes = await preprocessLeafImage(file);
          setPreprocessedData({
            dataUrl: preRes.processedDataUrl,
            metrics: preRes.metrics,
          });
        } catch (err: any) {
          setErrorMessage(err?.message || 'Image preprocessing failed.');
        }
      };
      reader.readAsDataURL(file);
    } catch {
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
      setErrorMessage(err?.message || 'Preprocessing camera frame failed.');
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
    } catch {
      setErrorMessage('Preprocessing sample image failed.');
    }
  };

  const executePredictionPipeline = async (
    targetImageSrc: string,
    sampleKey: string | undefined,
    existingMetrics?: PreprocessingMetrics
  ) => {
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      setAnalysisStatus('Normalizing image to 224×224 RGB tensor & validating ExG index...');
      let currentMetrics = existingMetrics;
      let normalizedDataUrl = preprocessedData?.dataUrl;

      if (!currentMetrics) {
        const preRes = await preprocessLeafImage(targetImageSrc);
        setPreprocessedData({
          dataUrl: preRes.processedDataUrl,
          metrics: preRes.metrics,
        });
        currentMetrics = preRes.metrics;
        normalizedDataUrl = preRes.processedDataUrl;
      }

      await new Promise((r) => setTimeout(r, 180));
      setAnalysisStatus('Extracting botanical features via MobileNetV2 & ResNet CNN layers...');
      await new Promise((r) => setTimeout(r, 200));
      setAnalysisStatus('Evaluating species taxonomy, foliar pathology, & medicinal dossier...');

      const result = await predictLeafCondition(
        currentMetrics,
        sampleKey,
        !isDemoMode,
        normalizedDataUrl || targetImageSrc
      );

      if (!result.isDemoMode) {
        setIsDemoMode(false);
      }

      setAnalysisResult(result);

      try {
        const savedSession = await saveAnalysisSession(result, targetImageSrc);
        setHistorySessions((prev) =>
          [savedSession, ...prev.filter((s) => s.id !== savedSession.id)].slice(0, 30)
        );
      } catch (err) {
        console.warn('Could not auto-save to history:', err);
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMessage(err?.message || 'Analysis failed. Please upload a clearer leaf image.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStatus('');
    }
  };

  const handleRunAnalysis = async () => {
    if (!selectedImageSrc) {
      setErrorMessage('Please upload or capture a leaf image first.');
      return;
    }
    await executePredictionPipeline(selectedImageSrc, selectedSampleKey, preprocessedData?.metrics);
  };

  const handleQuickInspect = async (
    sampleKey: string,
    img: string,
    target: 'identify' | 'disease'
  ) => {
    setSelectedSampleKey(sampleKey);
    setSelectedImageSrc(img);
    setAnalysisResult(null);
    setActiveTab(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    await executePredictionPipeline(img, sampleKey);
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
    setActiveTab(session.healthStatus === 'diseased' ? 'disease' : 'identify');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetResult = () => {
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  const currentDiagnosticMode: 'identify' | 'disease' =
    activeTab === 'disease' ? 'disease' : 'identify';

  return (
    <div className="min-h-screen bg-[#FAFCF8] text-[#18251E] flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavigate}
        isDemoMode={isDemoMode}
        onOpenModelModal={() => setIsModelModalOpen(true)}
        historyCount={historySessions.length}
      />

      {/* Main Content Stage with Smooth Page Transitions */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <LandingPage
                selectedSampleKey={selectedSampleKey}
                onNavigate={handleNavigate}
                onSelectSpecimen={(key, img) => {
                  handleSelectSample(key, img);
                }}
                onQuickInspect={handleQuickInspect}
                onInspectPlantLibrary={(plantId) => {
                  setLibrarySelectedPlantId(plantId);
                  setActiveTab('library');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </motion.div>
          )}

          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <DashboardView
                sessions={historySessions}
                initialResultA={analysisResult}
                initialImageA={selectedImageSrc}
                isDemoMode={isDemoMode}
                initialSubTab={dashboardInitialSubTab}
                onGoToIdentify={() => handleNavigate('identify')}
                onGoToDisease={() => handleNavigate('disease')}
                onInspectPlantLibrary={(plantId) => {
                  setLibrarySelectedPlantId(plantId);
                  setActiveTab('library');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSelectSession={handleSelectHistorySession}
                onDeleteSession={handleDeleteHistorySession}
                onClearHistory={handleClearAllHistory}
                onOpenModelModal={() => setIsModelModalOpen(true)}
                onOpenFullResult={(res, src) => {
                  setAnalysisResult(res);
                  if (src) setSelectedImageSrc(src);
                  setActiveTab(res.health.status === 'diseased' ? 'disease' : 'identify');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onHistoryUpdated={(newSessions) => {
                  setHistorySessions((prev) => {
                    const map = new Map<string, SavedAnalysisSession>();
                    [...newSessions, ...prev].forEach((s) => map.set(s.id, s));
                    return Array.from(map.values()).slice(0, 30);
                  });
                }}
              />
            </motion.div>
          )}

          {(activeTab === 'identify' || activeTab === 'disease') && (
            <motion.div
              key={activeTab}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <LeafDiagnosticWorkspace
                mode={currentDiagnosticMode}
                selectedImageSrc={selectedImageSrc}
                selectedSampleKey={selectedSampleKey}
                preprocessedData={preprocessedData}
                analysisResult={analysisResult}
                isAnalyzing={isAnalyzing}
                analysisStatus={analysisStatus}
                errorMessage={errorMessage}
                isDemoMode={isDemoMode}
                onDismissError={() => setErrorMessage(null)}
                onFileUpload={handleFileUpload}
                onSelectSample={handleSelectSample}
                onOpenCamera={() => setIsCameraModalOpen(true)}
                onRunAnalysis={handleRunAnalysis}
                onResetResult={handleResetResult}
                onOpenCompare={() => {
                  setDashboardInitialSubTab('compare');
                  setActiveTab('dashboard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSwitchDiagnosticMode={(nextMode) => handleNavigate(nextMode)}
              />
            </motion.div>
          )}

          {activeTab === 'library' && (
            <motion.div
              key="library"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <MedicinalCompendium
                initialPlantId={librarySelectedPlantId}
                onSelectSampleToAnalyze={(plantId: PlantSpeciesId, targetMode = 'identify') => {
                  const sampleImg = SAMPLE_IMAGES[plantId];
                  handleSelectSample(plantId, sampleImg);
                  setActiveTab(targetMode);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </motion.div>
          )}

          {activeTab === 'about' && (
            <motion.div
              key="about"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <AboutView />
            </motion.div>
          )}

          {activeTab === 'team' && (
            <motion.div
              key="team"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <MeetOurTeamView onBackToHome={() => handleNavigate('dashboard')} />
            </motion.div>
          )}
        </AnimatePresence>
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

      {/* Clean Brand Footer */}
      <footer className="mt-16 bg-white border-t border-[#123D2A]/10 py-8 text-xs text-[#18251E]/65">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-extrabold text-[#123D2A]">LeafGuard AI</span>
            <span aria-hidden="true">·</span>
            <span>Intelligent Medicinal Plant Identification &amp; Leaf Disease Detection Platform</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-[#123D2A]/70">
            <button
              type="button"
              onClick={() => handleNavigate('library')}
              className="hover:text-[#16A36A] transition-colors cursor-pointer"
            >
              Plant Library
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('disease')}
              className="hover:text-[#16A36A] transition-colors cursor-pointer"
            >
              Disease Detection
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('about')}
              className="hover:text-[#16A36A] transition-colors cursor-pointer"
            >
              Architecture
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('team')}
              className="hover:text-[#16A36A] transition-colors cursor-pointer"
            >
              Meet Our Team
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

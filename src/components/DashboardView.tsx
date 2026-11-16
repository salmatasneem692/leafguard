import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { SavedAnalysisSession } from '../services/historyStorage.ts';
import { MEDICINAL_PLANTS } from '../data/medicinalPlants.ts';
import { PlantSpeciesId, PredictionResult } from '../types/index.ts';
import { AnimatedCounter } from './AnimatedCounter.tsx';
import { DiseaseFrequencyTrendChart } from './DiseaseFrequencyTrendChart.tsx';
import { HistoryView } from './HistoryView.tsx';
import { CompareView } from './CompareView.tsx';
import { BatchProcessingView } from './BatchProcessingView.tsx';
import { EvaluationView } from './EvaluationView.tsx';
import {
  Leaf,
  Microscope,
  History,
  Scale,
  Files,
  BarChart3,
  ArrowRight,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface DashboardViewProps {
  sessions: SavedAnalysisSession[];
  initialResultA: PredictionResult | null;
  initialImageA: string | null;
  isDemoMode: boolean;
  onGoToIdentify: () => void;
  onGoToDisease: () => void;
  onInspectPlantLibrary: (plantId: PlantSpeciesId) => void;
  onSelectSession: (session: SavedAnalysisSession) => void;
  onDeleteSession: (id: string) => void;
  onClearHistory: () => void;
  onOpenModelModal: () => void;
  onOpenFullResult: (result: PredictionResult, imageSrc?: string) => void;
  onHistoryUpdated: (newSessions: SavedAnalysisSession[]) => void;
  initialSubTab?: 'overview' | 'compare' | 'batch' | 'metrics';
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  sessions,
  initialResultA,
  initialImageA,
  isDemoMode,
  onGoToIdentify,
  onGoToDisease,
  onInspectPlantLibrary,
  onSelectSession,
  onDeleteSession,
  onClearHistory,
  onOpenModelModal,
  onOpenFullResult,
  onHistoryUpdated,
  initialSubTab = 'overview',
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [subTab, setSubTab] = useState<'overview' | 'compare' | 'batch' | 'metrics'>(initialSubTab);

  useEffect(() => {
    setSubTab(initialSubTab);
  }, [initialSubTab]);

  const healthyCount = sessions.filter((s) => s.healthStatus === 'healthy').length;
  const diseasedCount = sessions.filter((s) => s.healthStatus === 'diseased').length;
  const healthyRate = sessions.length > 0 ? (healthyCount / sessions.length) * 100 : 100;
  const plantsList = Object.values(MEDICINAL_PLANTS);

  return (
    <div className="space-y-6">
      {/* 1. Welcome & Status Command Card */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#123D2A] via-[#175138] to-[#18251E] text-white rounded-2xl p-6 sm:p-8 border border-[#123D2A]/20 shadow-lg"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono text-[#4ade80] font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>LeafGuard AI Botanical Operations Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome to Your Plant Health Dashboard
            </h1>
            <p className="text-sm text-[#E8F5EC]/80 leading-relaxed">
              Launch real-time plant identification, screen leaves for pathology, monitor 30-session health trends, run multi-image batches, or compare specimens side-by-side.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenModelModal}
              className="px-4 py-2.5 rounded-xl glass-forest border border-[#E8F5EC]/20 hover:border-[#4ade80] text-xs font-semibold text-[#E8F5EC] flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Cpu className="w-4 h-4 text-[#4ade80]" />
              <span>{isDemoMode ? 'Inference: Demo Calibration' : 'Inference: Keras Server Live'}</span>
            </button>
          </div>
        </div>

        {/* AI-Powered Analysis Statistics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-[#E8F5EC]/15">
          <div className="glass-forest rounded-xl p-4 border border-[#E8F5EC]/15">
            <span className="text-[11px] font-mono text-[#E8F5EC]/70 uppercase block">
              Recorded Analyses
            </span>
            <div className="text-2xl font-extrabold font-mono text-white mt-1">
              <AnimatedCounter value={sessions.length} decimals={0} />
            </div>
            <span className="text-[11px] text-[#4ade80] font-mono">Saved in local session log</span>
          </div>

          <div className="glass-forest rounded-xl p-4 border border-[#E8F5EC]/15">
            <span className="text-[11px] font-mono text-[#E8F5EC]/70 uppercase block">
              Healthy vs. Diseased
            </span>
            <div className="text-2xl font-extrabold font-mono text-[#4ade80] mt-1">
              <AnimatedCounter value={healthyRate} decimals={1} suffix="% Healthy" />
            </div>
            <span className="text-[11px] text-[#E8F5EC]/70 font-mono tabular-nums">
              {healthyCount} Healthy · {diseasedCount} Diseased
            </span>
          </div>

          <div className="glass-forest rounded-xl p-4 border border-[#E8F5EC]/15">
            <span className="text-[11px] font-mono text-[#E8F5EC]/70 uppercase block">
              Species CNN Benchmark
            </span>
            <div className="text-2xl font-extrabold font-mono text-white mt-1">
              <AnimatedCounter value={94.58} decimals={2} suffix="%" />
            </div>
            <span className="text-[11px] text-[#E8F5EC]/70 font-mono">MobileNetV2 · 6 Flora Classes</span>
          </div>

          <div className="glass-forest rounded-xl p-4 border border-[#E8F5EC]/15">
            <span className="text-[11px] font-mono text-[#E8F5EC]/70 uppercase block">
              Disease Classifier AUC
            </span>
            <div className="text-2xl font-extrabold font-mono text-[#4ade80] mt-1">
              <AnimatedCounter value={0.984} decimals={3} />
            </div>
            <span className="text-[11px] text-[#E8F5EC]/70 font-mono">95.50% Diagnostic Accuracy</span>
          </div>
        </div>
      </motion.div>

      {/* 2. Dual Core AI Diagnostic Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <button
          type="button"
          onClick={onGoToIdentify}
          className="text-left bg-white hover:bg-[#FAFCF8] rounded-2xl p-6 border border-[#123D2A]/12 hover:border-[#16A36A] shadow-xs hover:shadow-md transition-all group cursor-pointer flex items-center justify-between gap-4"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F5EC] text-[#123D2A] group-hover:bg-[#16A36A] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#123D2A]">Plant Identification Module</h2>
              <p className="text-xs text-[#18251E]/75 mt-1 leading-relaxed">
                Upload a leaf specimen to predict species, scientific taxonomy, botanical traits, and active phytochemicals.
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-[#16A36A] shrink-0 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          type="button"
          onClick={onGoToDisease}
          className="text-left bg-white hover:bg-[#FAFCF8] rounded-2xl p-6 border border-[#123D2A]/12 hover:border-[#16A36A] shadow-xs hover:shadow-md transition-all group cursor-pointer flex items-center justify-between gap-4"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F5EC] text-[#123D2A] group-hover:bg-[#16A36A] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
              <Microscope className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#123D2A]">Leaf Disease Detection Module</h2>
              <p className="text-xs text-[#18251E]/75 mt-1 leading-relaxed">
                Inspect leaf surfaces for Cercospora spots, rust, and mildew with symptom breakdown and organic treatment steps.
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-[#16A36A] shrink-0 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* 3. Dashboard Workspace Switcher (History + Trends, Compare, Batch, Evaluation) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#E8F5EC]/70 rounded-xl border border-[#123D2A]/12">
          <button
            type="button"
            onClick={() => setSubTab('overview')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              subTab === 'overview'
                ? 'bg-[#123D2A] text-white shadow-xs'
                : 'text-[#123D2A] hover:bg-white/70'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History & Trends</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('compare')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              subTab === 'compare'
                ? 'bg-[#123D2A] text-white shadow-xs'
                : 'text-[#123D2A] hover:bg-white/70'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Analyze & Compare</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('batch')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              subTab === 'batch'
                ? 'bg-[#123D2A] text-white shadow-xs'
                : 'text-[#123D2A] hover:bg-white/70'
            }`}
          >
            <Files className="w-3.5 h-3.5" />
            <span>Batch Processing</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('metrics')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              subTab === 'metrics'
                ? 'bg-[#123D2A] text-white shadow-xs'
                : 'text-[#123D2A] hover:bg-white/70'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Model Metrics</span>
          </button>
        </div>

        <span className="text-xs font-mono text-[#18251E]/60">
          {subTab === 'overview' && 'Recent Prediction History & 30-Session Health Analytics'}
          {subTab === 'compare' && 'Side-by-Side Leaf A vs Leaf B Diagnostics'}
          {subTab === 'batch' && 'Multi-Specimen High-Throughput CSV Screening'}
          {subTab === 'metrics' && 'Training Curves, Confusion Matrix & ROC Evaluation'}
        </span>
      </div>

      {/* 4. Active Sub-Workspace */}
      {subTab === 'overview' && (
        <div className="space-y-6">
          {/* 30-Day Leaf Disease Type Frequency Trend Chart */}
          <DiseaseFrequencyTrendChart
            sessions={sessions}
            onGoToDisease={onGoToDisease}
          />

          {/* Quick Recent Scans Strip (when sessions exist) */}
          {sessions.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-[#123D2A]/12 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#123D2A]">Recent Prediction Activity</h3>
                <span className="text-xs font-mono text-[#16A36A] tabular-nums">
                  Latest {Math.min(4, sessions.length)} of {sessions.length} scans
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {sessions.slice(0, 4).map((session) => {
                  const healthy = session.healthStatus === 'healthy';
                  return (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => onSelectSession(session)}
                      className="text-left p-3 rounded-xl bg-[#FAFCF8] hover:bg-[#E8F5EC]/50 border border-[#123D2A]/10 hover:border-[#16A36A] transition-all flex items-center gap-3 cursor-pointer"
                    >
                      <div className="w-11 h-11 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-[#123D2A]/10">
                        {session.thumbnailUrl ? (
                          <img
                            src={session.thumbnailUrl}
                            alt={session.plantName}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#16A36A]">
                            <Leaf className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-[#123D2A] truncate">
                          {session.plantName}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-medium mt-0.5">
                          {healthy ? (
                            <CheckCircle2 className="w-3 h-3 text-[#16A36A] shrink-0" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                          )}
                          <span className={healthy ? 'text-[#16A36A]' : 'text-amber-700'}>
                            {healthy ? 'Healthy' : session.diseaseName || 'Diseased'}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-[#18251E]/55 mt-0.5 tabular-nums">
                          {session.speciesConfidence.toFixed(1)}% · {session.savedAt}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Full History View + 30-Session Recharts Health Trend Chart */}
          <HistoryView
            sessions={sessions}
            onSelectSession={onSelectSession}
            onDeleteSession={onDeleteSession}
            onClearAll={onClearHistory}
            onGoToAnalyzer={onGoToIdentify}
          />

          {/* Supported Medicinal Plants Strip */}
          <div className="bg-white rounded-2xl p-6 border border-[#123D2A]/12 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#123D2A]">Supported Medicinal Plants</h3>
                <p className="text-xs text-[#18251E]/65">
                  Select any botanical class to view medicinal properties or test in the pipeline
                </p>
              </div>
              <span className="text-xs font-mono text-[#16A36A] font-semibold">
                6 Trained Classes
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {plantsList.map((plant) => (
                <button
                  key={plant.id}
                  type="button"
                  onClick={() => onInspectPlantLibrary(plant.id)}
                  className="text-left p-2.5 rounded-xl bg-[#FAFCF8] hover:bg-[#E8F5EC]/60 border border-[#123D2A]/10 hover:border-[#16A36A] transition-all cursor-pointer group"
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 mb-2">
                    <img
                      src={plant.sampleImage}
                      alt={plant.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="text-xs font-bold text-[#123D2A] truncate">{plant.name}</div>
                  <div className="text-[10px] italic text-[#18251E]/65 truncate">
                    {plant.scientificName}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {subTab === 'compare' && (
        <CompareView
          historySessions={sessions}
          initialResultA={initialResultA}
          initialImageA={initialImageA}
          isDemoMode={isDemoMode}
          onOpenModelModal={onOpenModelModal}
          onOpenFullResult={(res) => onOpenFullResult(res)}
        />
      )}

      {subTab === 'batch' && (
        <BatchProcessingView
          isDemoMode={isDemoMode}
          onOpenModelModal={onOpenModelModal}
          onOpenSingleResult={(res, src) => onOpenFullResult(res, src)}
          onHistoryUpdated={onHistoryUpdated}
        />
      )}

      {subTab === 'metrics' && <EvaluationView />}
    </div>
  );
};

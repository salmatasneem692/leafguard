import React, { useState, useRef } from 'react';
import { 
  BatchLeafItem, 
  PredictionResult, 
  PlantSpeciesId, 
  HealthStatus 
} from '../types/index.ts';
import { preprocessLeafImage } from '../services/imagePreprocessing.ts';
import { predictLeafCondition } from '../services/predictionService.ts';
import { SAMPLE_IMAGES, MEDICINAL_PLANTS } from '../data/medicinalPlants.ts';
import { saveAnalysisSession, saveBatchAnalysisSessions, SavedAnalysisSession } from '../services/historyStorage.ts';
import { AnalysisResultView } from './AnalysisResultView.tsx';

import {
  Upload,
  Files,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  FileJson,
  BookmarkPlus,
  Search,
  Filter,
  Eye,
  Trash2,
  Sparkles,
  Layers,
  ArrowRight,
  ExternalLink,
  Scale,
  RefreshCw,
  X,
  Clock,
  ShieldCheck,
  ShieldAlert,
  SlidersHorizontal,
  FolderPlus
} from 'lucide-react';

interface BatchProcessingViewProps {
  isDemoMode: boolean;
  onOpenModelModal: () => void;
  onOpenSingleResult: (result: PredictionResult, imageSrc: string) => void;
  onHistoryUpdated: (sessions: SavedAnalysisSession[]) => void;
}

export const BatchProcessingView: React.FC<BatchProcessingViewProps> = ({
  isDemoMode,
  onOpenModelModal,
  onOpenSingleResult,
  onHistoryUpdated,
}) => {
  const [queue, setQueue] = useState<BatchLeafItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingIndex, setProcessingIndex] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [healthFilter, setHealthFilter] = useState<'all' | 'healthy' | 'diseased'>('all');
  const [speciesFilter, setSpeciesFilter] = useState<string>('all');
  const [selectedInspectionItem, setSelectedInspectionItem] = useState<BatchLeafItem | null>(null);
  const [isSavedAll, setIsSavedAll] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const shouldCancelRef = useRef<boolean>(false);

  // Helper to load curated 7-specimen benchmark batch
  const handleLoadBenchmarkBatch = () => {
    const benchmarkItems: BatchLeafItem[] = [
      {
        id: `bench_neem_${Date.now()}_1`,
        name: 'benchmark_neem_specimen_01.jpg',
        dataUrl: SAMPLE_IMAGES.neem,
        sampleKey: 'neem',
        status: 'queued',
        addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      {
        id: `bench_tulsi_${Date.now()}_2`,
        name: 'benchmark_tulsi_healthy_02.jpg',
        dataUrl: SAMPLE_IMAGES.tulsi,
        sampleKey: 'tulsi',
        status: 'queued',
        addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      {
        id: `bench_aloe_${Date.now()}_3`,
        name: 'benchmark_aloe_vera_foliage_03.jpg',
        dataUrl: SAMPLE_IMAGES.aloe_vera,
        sampleKey: 'aloe_vera',
        status: 'queued',
        addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      {
        id: `bench_ashwa_${Date.now()}_4`,
        name: 'benchmark_ashwagandha_04.jpg',
        dataUrl: SAMPLE_IMAGES.ashwagandha,
        sampleKey: 'ashwagandha',
        status: 'queued',
        addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      {
        id: `bench_mint_${Date.now()}_5`,
        name: 'benchmark_pudina_mint_05.jpg',
        dataUrl: SAMPLE_IMAGES.mint,
        sampleKey: 'mint',
        status: 'queued',
        addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      {
        id: `bench_curry_${Date.now()}_6`,
        name: 'benchmark_curry_leaf_06.jpg',
        dataUrl: SAMPLE_IMAGES.curry_leaf,
        sampleKey: 'curry_leaf',
        status: 'queued',
        addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      {
        id: `bench_disease_${Date.now()}_7`,
        name: 'benchmark_tulsi_cercospora_spot_07.jpg',
        dataUrl: SAMPLE_IMAGES.diseased_sample,
        sampleKey: 'disease',
        status: 'queued',
        addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];

    setQueue((prev) => [...prev, ...benchmarkItems]);
    setIsSavedAll(false);
    showNotice('Loaded 7 curated benchmark leaf specimens into queue.');
  };

  const handleFilesAdded = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (['image/jpeg', 'image/jpg', 'image/png'].includes(file.type.toLowerCase())) {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) {
      showNotice('No valid JPG, JPEG, or PNG images selected.');
      return;
    }

    const newItems: BatchLeafItem[] = [];

    for (const file of validFiles) {
      const lowerName = file.name.toLowerCase();
      let hintKey: string | undefined = undefined;
      if (lowerName.includes('neem')) hintKey = 'neem';
      else if (lowerName.includes('tulsi')) hintKey = 'tulsi';
      else if (lowerName.includes('aloe')) hintKey = 'aloe';
      else if (lowerName.includes('ashwa')) hintKey = 'ashwagandha';
      else if (lowerName.includes('mint')) hintKey = 'mint';
      else if (lowerName.includes('curry')) hintKey = 'curry';
      if (lowerName.includes('disease') || lowerName.includes('spot') || lowerName.includes('blight')) {
        hintKey = hintKey ? `${hintKey}_disease` : 'disease';
      }

      // Read file to Data URL
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      });

      if (dataUrl) {
        newItems.push({
          id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          file,
          dataUrl,
          sampleKey: hintKey,
          status: 'queued',
          addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    }

    setQueue((prev) => [...prev, ...newItems]);
    setIsSavedAll(false);
    showNotice(`Added ${newItems.length} leaf image${newItems.length > 1 ? 's' : ''} to batch queue.`);
  };

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => {
      setActionNotice(null);
    }, 3500);
  };

  // Execute Batch Processing
  const handleStartProcessing = async () => {
    if (isProcessing || queue.length === 0) return;

    setIsProcessing(true);
    shouldCancelRef.current = false;

    // Process each queued or error item
    for (let i = 0; i < queue.length; i++) {
      if (shouldCancelRef.current) break;

      const item = queue[i];
      if (item.status === 'completed') continue;

      setProcessingIndex(i);

      // Mark item as processing
      setQueue((prev) =>
        prev.map((it, idx) => (idx === i ? { ...it, status: 'processing' } : it))
      );

      const startTime = performance.now();

      try {
        // Step 1: Preprocess leaf image to MobileNetV2 224x224 tensor
        const preResult = await preprocessLeafImage(item.file || item.dataUrl);

        // Step 2: CNN Inference
        const predResult = await predictLeafCondition(
          preResult.metrics,
          item.sampleKey,
          !isDemoMode
        );

        const endTime = performance.now();
        const latency = Math.round(endTime - startTime);

        setQueue((prev) =>
          prev.map((it, idx) =>
            idx === i
              ? {
                  ...it,
                  status: 'completed',
                  result: predResult,
                  processingTimeMs: latency,
                }
              : it
          )
        );
      } catch (err: any) {
        setQueue((prev) =>
          prev.map((it, idx) =>
            idx === i
              ? {
                  ...it,
                  status: 'error',
                  errorMessage: err?.message || 'Processing failed.',
                }
              : it
          )
        );
      }

      // Small UI pause between items for smoother visualization
      await new Promise((r) => setTimeout(r, 120));
    }

    setIsProcessing(false);
    setProcessingIndex(-1);
    showNotice('Batch processing completed!');
  };

  const handleCancelProcessing = () => {
    shouldCancelRef.current = true;
    setIsProcessing(false);
    setProcessingIndex(-1);
    showNotice('Batch processing cancelled.');
  };

  const handleClearQueue = () => {
    if (isProcessing) return;
    setQueue([]);
    setIsSavedAll(false);
    showNotice('Batch queue cleared.');
  };

  const handleRemoveItem = (id: string) => {
    if (isProcessing) return;
    setQueue((prev) => prev.filter((it) => it.id !== id));
  };

  // Export Batch to CSV
  const handleExportCsv = () => {
    const completedItems = queue.filter((it) => it.status === 'completed' && it.result);
    if (completedItems.length === 0) {
      showNotice('No completed specimens to export.');
      return;
    }

    const headers = [
      'Specimen_ID',
      'Filename',
      'Species_Name',
      'Scientific_Name',
      'Species_Confidence_Pct',
      'Health_Status',
      'Disease_Name',
      'Health_Confidence_Pct',
      'Severity',
      'Primary_Medicinal_Use',
      'Inference_Time_Ms',
      'Blur_Score',
      'Green_Index',
      'Processed_Timestamp',
    ];

    const rows = completedItems.map((it, idx) => {
      const res = it.result!;
      return [
        idx + 1,
        `"${it.name.replace(/"/g, '""')}"`,
        `"${res.species.name}"`,
        `"${res.species.scientificName}"`,
        res.species.confidence.toFixed(1),
        res.health.status.toUpperCase(),
        `"${res.health.diseaseName || 'None (Healthy)'}"`,
        res.health.confidence.toFixed(1),
        res.health.severity || 'normal',
        `"${(res.medicinalInfo?.primaryMedicinalUses?.[0] || '').replace(/"/g, '""')}"`,
        it.processingTimeMs || res.inferenceTimeMs,
        res.preprocessing?.blurScore.toFixed(2) || 'N/A',
        res.preprocessing?.greenIndex.toFixed(1) || 'N/A',
        `"${res.timestamp}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LeafGuard_Batch_Summary_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showNotice(`Exported ${completedItems.length} records to CSV.`);
  };

  // Export Batch to JSON
  const handleExportJson = () => {
    const completedItems = queue.filter((it) => it.status === 'completed' && it.result);
    if (completedItems.length === 0) {
      showNotice('No completed specimens to export.');
      return;
    }

    const exportData = {
      project: 'LeafGuard AI - Batch Analysis Report',
      totalSpecimens: completedItems.length,
      exportedAt: new Date().toISOString(),
      items: completedItems.map((it) => ({
        id: it.id,
        name: it.name,
        result: it.result,
        processingTimeMs: it.processingTimeMs,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LeafGuard_Batch_Results_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showNotice(`Exported ${completedItems.length} records to JSON.`);
  };

  // Save All Completed Items to History
  const handleSaveAllToHistory = async () => {
    const completedItems = queue.filter((it) => it.status === 'completed' && it.result);
    if (completedItems.length === 0) {
      showNotice('No completed specimens to save.');
      return;
    }

    const itemsToSave = completedItems.map((it) => ({
      result: it.result!,
      imageSrc: it.dataUrl,
    }));

    const updated = await saveBatchAnalysisSessions(itemsToSave);
    onHistoryUpdated(updated);
    setIsSavedAll(true);
    showNotice(`Successfully saved ${completedItems.length} specimens to History!`);
  };

  const handleSaveSingleItemToHistory = async (item: BatchLeafItem) => {
    if (!item.result) return;
    const saved = await saveAnalysisSession(item.result, item.dataUrl);
    onHistoryUpdated([saved]);
    showNotice(`Saved "${item.name}" to History.`);
  };

  // Filtered Queue
  const filteredQueue = queue.filter((item) => {
    // Health status filter
    if (healthFilter === 'healthy' && item.result && item.result.health.status !== 'healthy') {
      return false;
    }
    if (healthFilter === 'diseased' && item.result && item.result.health.status !== 'diseased') {
      return false;
    }

    // Species filter
    if (speciesFilter !== 'all' && item.result && item.result.species.plantId !== speciesFilter) {
      return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchPlant = item.result?.species.name.toLowerCase().includes(q);
      const matchSci = item.result?.species.scientificName.toLowerCase().includes(q);
      const matchDisease = item.result?.health.diseaseName?.toLowerCase().includes(q);
      return Boolean(matchName || matchPlant || matchSci || matchDisease);
    }

    return true;
  });

  // Calculate Batch Metrics
  const totalCount = queue.length;
  const completedCount = queue.filter((it) => it.status === 'completed').length;
  const errorCount = queue.filter((it) => it.status === 'error').length;
  const healthyCount = queue.filter((it) => it.result?.health.status === 'healthy').length;
  const diseasedCount = queue.filter((it) => it.result?.health.status === 'diseased').length;

  const completedResults = queue.filter((it) => it.status === 'completed' && it.result);
  const avgConfidence = completedResults.length > 0
    ? (completedResults.reduce((acc, it) => acc + it.result!.species.confidence, 0) / completedResults.length).toFixed(1)
    : '0.0';
  const avgTime = completedResults.length > 0
    ? Math.round(completedResults.reduce((acc, it) => acc + (it.processingTimeMs || 0), 0) / completedResults.length)
    : 0;

  // Find dominant species
  const speciesCounts: Record<string, number> = {};
  completedResults.forEach((it) => {
    const sp = it.result!.species.name;
    speciesCounts[sp] = (speciesCounts[sp] || 0) + 1;
  });
  const dominantSpecies = Object.entries(speciesCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner Notice if triggered */}
      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center justify-between font-medium shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-700 hover:text-emerald-950 font-bold text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Hero Header & Upload Stage */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 font-semibold mb-1">
              <Files className="w-4 h-4 text-emerald-600" />
              <span>High-Throughput Computer Vision Screening</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Batch Leaf Specimen Processing
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload multiple leaf images at once to generate a comparative taxonomic & pathology summary table
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleLoadBenchmarkBatch}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
              title="Loads 7 curated benchmark leaves representing all classes"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Load Benchmark Batch (7)</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition-all shadow-xs cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Upload Multiple Leaf Images</span>
            </button>
          </div>
        </div>

        {/* Hidden Multiple File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png"
          onChange={(e) => handleFilesAdded(e.target.files)}
          className="hidden"
        />

        {/* Drag and Drop Box */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFilesAdded(e.dataTransfer.files);
          }}
          className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-emerald-50/20"
        >
          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">
            Click to browse files or drag and drop multiple leaf photos here
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            Supports selecting 2 to 50+ JPG, JPEG, or PNG images simultaneously
          </p>
        </div>
      </div>

      {/* Progress & Control Toolbar */}
      {totalCount > 0 && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-900 font-mono">
                Queue: {completedCount} / {totalCount} Processed ({progressPercent}%)
              </span>
              {isProcessing && (
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Processing specimen {processingIndex + 1}...</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {isProcessing ? (
                <button
                  onClick={handleCancelProcessing}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel Batch</span>
                </button>
              ) : (
                <button
                  onClick={handleStartProcessing}
                  disabled={completedCount === totalCount}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:pointer-events-none rounded-lg transition-all shadow-xs cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{completedCount > 0 ? 'Process Remaining' : 'Start Batch Analysis'}</span>
                </button>
              )}

              <button
                onClick={handleClearQueue}
                disabled={isProcessing}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Queue</span>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Summary KPI Scorecards (when completed items exist) */}
      {completedCount > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">
              Total Analyzed
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {completedCount}
              </span>
              <span className="text-xs text-slate-400 font-mono">/ {totalCount}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Leaf specimens screened</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">
              Healthy Foliage
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
                {healthyCount}
              </span>
              <span className="text-xs font-semibold text-emerald-600 font-mono">
                ({completedCount > 0 ? Math.round((healthyCount / completedCount) * 100) : 0}%)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Normal cellular vitality</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">
              Pathology Detected
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-amber-700 tabular-nums">
                {diseasedCount}
              </span>
              <span className="text-xs font-semibold text-amber-600 font-mono">
                ({completedCount > 0 ? Math.round((diseasedCount / completedCount) * 100) : 0}%)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Spot / lesioning symptoms</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">
              Mean Confidence
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-blue-700 tabular-nums">
                {avgConfidence}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Top-1 Softmax probability</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">
              Inference Speed
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-slate-800 tabular-nums">
                {avgTime}ms
              </span>
              <span className="text-xs text-slate-400 font-mono">/leaf</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">MobileNetV2 forward pass</p>
          </div>
        </div>
      )}

      {/* Interactive Summary Table Section */}
      {queue.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
          {/* Table Toolbar: Search, Filters & Export */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by filename, plant species, or disease..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Health status filter */}
              <select
                value={healthFilter}
                onChange={(e) => setHealthFilter(e.target.value as any)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none"
              >
                <option value="all">Health: All</option>
                <option value="healthy">Healthy Only</option>
                <option value="diseased">Diseased Only</option>
              </select>

              {/* Species filter */}
              <select
                value={speciesFilter}
                onChange={(e) => setSpeciesFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none"
              >
                <option value="all">Species: All</option>
                <option value="neem">Neem</option>
                <option value="tulsi">Tulsi</option>
                <option value="aloe_vera">Aloe Vera</option>
                <option value="ashwagandha">Ashwagandha</option>
                <option value="mint">Mint</option>
                <option value="curry_leaf">Curry Leaf</option>
              </select>
            </div>

            {/* Export & Save Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleExportCsv}
                disabled={completedCount === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
                title="Export summary to CSV spreadsheet"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handleExportJson}
                disabled={completedCount === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
                title="Export batch data to JSON"
              >
                <FileJson className="w-3.5 h-3.5 text-blue-700" />
                <span>Export JSON</span>
              </button>

              <button
                onClick={handleSaveAllToHistory}
                disabled={completedCount === 0 || isSavedAll}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer ${
                  isSavedAll
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-default'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
                title="Saves all completed items to your local History tab"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>{isSavedAll ? 'Saved to History ✓' : 'Save All to History'}</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Specimen</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Identified Species</th>
                  <th className="py-2.5 px-3">Health & Disease Condition</th>
                  <th className="py-2.5 px-3">Primary Medicinal Indication</th>
                  <th className="py-2.5 px-3">Latency</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredQueue.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No specimens match the current filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredQueue.map((item, idx) => {
                    const res = item.result;
                    const isCompleted = item.status === 'completed' && res;
                    const isHealthy = res?.health.status === 'healthy';

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-50/70 transition-colors ${
                          item.status === 'processing' ? 'bg-emerald-50/30' : ''
                        }`}
                      >
                        {/* Index */}
                        <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                          {idx + 1}
                        </td>

                        {/* Thumbnail & Filename */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              onClick={() => isCompleted && setSelectedInspectionItem(item)}
                              className={`w-11 h-11 rounded-lg overflow-hidden border shrink-0 bg-slate-100 cursor-pointer ${
                                isHealthy
                                  ? 'border-emerald-200'
                                  : res
                                  ? 'border-amber-300 ring-1 ring-amber-400'
                                  : 'border-slate-200'
                              }`}
                            >
                              <img
                                src={item.dataUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="max-w-[150px] sm:max-w-[190px]">
                              <span className="font-semibold text-slate-800 truncate block text-xs">
                                {item.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                Added {item.addedAt}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {item.status === 'completed' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Done</span>
                            </span>
                          ) : item.status === 'processing' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 animate-pulse">
                              <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
                              <span>Running...</span>
                            </span>
                          ) : item.status === 'error' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              <span>Failed</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>Queued</span>
                            </span>
                          )}
                        </td>

                        {/* Species */}
                        <td className="py-3 px-3">
                          {isCompleted ? (
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900">
                                  {res.species.name}
                                </span>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold">
                                  {res.species.confidence.toFixed(1)}%
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-500 italic block">
                                {res.species.scientificName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-mono text-[11px]">—</span>
                          )}
                        </td>

                        {/* Health Status & Disease Condition */}
                        <td className="py-3 px-3">
                          {isCompleted ? (
                            <div>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                                  isHealthy
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-900'
                                }`}
                              >
                                {isHealthy ? (
                                  <>
                                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                    <span>HEALTHY ({res.health.confidence.toFixed(0)}%)</span>
                                  </>
                                ) : (
                                  <>
                                    <ShieldAlert className="w-3 h-3 text-amber-600" />
                                    <span>DISEASED ({res.health.confidence.toFixed(0)}%)</span>
                                  </>
                                )}
                              </span>

                              {res.health.diseaseName && (
                                <span className="text-[11px] text-amber-900 font-medium block mt-0.5 max-w-[200px] truncate">
                                  {res.health.diseaseName}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 font-mono text-[11px]">—</span>
                          )}
                        </td>

                        {/* Primary Medicinal Indication */}
                        <td className="py-3 px-3">
                          {isCompleted ? (
                            <p className="text-[11px] text-slate-600 line-clamp-2 max-w-[220px]">
                              {res.medicinalInfo?.primaryMedicinalUses?.[0] || 'Traditional Ayurvedic formulation'}
                            </p>
                          ) : (
                            <span className="text-slate-400 font-mono text-[11px]">—</span>
                          )}
                        </td>

                        {/* Latency */}
                        <td className="py-3 px-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                          {item.processingTimeMs ? `${item.processingTimeMs} ms` : '—'}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            {isCompleted && (
                              <>
                                <button
                                  onClick={() => setSelectedInspectionItem(item)}
                                  className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                                  title="Inspect full diagnostic profile"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleSaveSingleItemToHistory(item)}
                                  className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                                  title="Save this result to history"
                                >
                                  <BookmarkPlus className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => onOpenSingleResult(res, item.dataUrl)}
                                  className="p-1.5 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors cursor-pointer"
                                  title="Open in Single Analyzer"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={isProcessing}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-30 cursor-pointer"
                              title="Remove from batch"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State when queue is empty */}
      {queue.length === 0 && (
        <div className="bg-white rounded-xl p-10 border border-slate-200 text-center max-w-xl mx-auto shadow-xs">
          <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-200 text-emerald-700">
            <Files className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Batch Queue is Empty
          </h3>
          <p className="text-xs text-slate-500 mb-5 leading-relaxed">
            Drag and drop multiple leaf image files or load the pre-configured 7-specimen benchmark batch to screen medicinal species and foliar health.
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleLoadBenchmarkBatch}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Load Benchmark Batch</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Browse Multiple Images</span>
            </button>
          </div>
        </div>
      )}

      {/* Specimen Detail Modal */}
      {selectedInspectionItem && selectedInspectionItem.result && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  🔬
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Batch Specimen Inspection: {selectedInspectionItem.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Full MobileNetV2 taxonomic & pathology profile
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onOpenSingleResult(selectedInspectionItem.result!, selectedInspectionItem.dataUrl);
                    setSelectedInspectionItem(null);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Analyzer</span>
                </button>
                <button
                  onClick={() => setSelectedInspectionItem(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Diagnostic Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                <img
                  src={selectedInspectionItem.dataUrl}
                  alt={selectedInspectionItem.name}
                  className="w-16 h-16 rounded-lg object-cover border border-slate-300"
                />
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Classified Species</span>
                  <strong className="text-sm text-slate-900 block">{selectedInspectionItem.result.species.name}</strong>
                  <span className="text-xs text-slate-500 italic">{selectedInspectionItem.result.species.scientificName}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Foliar Pathology</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold mt-1 ${
                  selectedInspectionItem.result.health.status === 'healthy'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-900'
                }`}>
                  {selectedInspectionItem.result.health.status.toUpperCase()} ({selectedInspectionItem.result.health.confidence.toFixed(1)}%)
                </span>
                {selectedInspectionItem.result.health.diseaseName && (
                  <p className="text-xs text-amber-900 mt-1 font-medium">{selectedInspectionItem.result.health.diseaseName}</p>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Top-1 Confidence</span>
                <strong className="text-xl font-mono text-emerald-700 block mt-1">
                  {selectedInspectionItem.result.species.confidence.toFixed(1)}%
                </strong>
                <span className="text-[11px] text-slate-500 font-mono">
                  Latency: {selectedInspectionItem.processingTimeMs || selectedInspectionItem.result.inferenceTimeMs} ms
                </span>
              </div>
            </div>

            {/* Recommendations & Phytochemicals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-2">
                <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Primary Medicinal Uses</span>
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-slate-700">
                  {selectedInspectionItem.result.medicinalInfo?.primaryMedicinalUses.slice(0, 3).map((u, i) => (
                    <li key={i}>{u}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 space-y-2">
                <h4 className="font-bold text-blue-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                  <span>Horticultural & Organic Care</span>
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-slate-700">
                  {selectedInspectionItem.result.health.recommendations?.slice(0, 3).map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedInspectionItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

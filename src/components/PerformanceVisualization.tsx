import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import {
  BASELINE_EVALUATION_METRICS,
  HEALTH_EVALUATION_METRICS,
  DATASET_DISTRIBUTIONS,
  DISEASE_ROC_CURVE,
} from '../data/evaluationBenchmarks.ts';
import {
  TrendingUp,
  BarChart2,
  CheckCircle2,
  Layers,
  Scale,
  Activity,
  AlertTriangle,
  Info,
  Download,
  FileJson,
  Database,
  PieChart,
} from 'lucide-react';


interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string | number;
  valueFormatter?: (val: number) => string;
}

const ChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, valueFormatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg border border-slate-700 text-xs font-mono">
        <p className="font-bold text-slate-300 pb-1 mb-1 border-b border-slate-800">
          Epoch {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
            <span style={{ color: entry.color }} className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-bold tabular-nums">
              {valueFormatter ? valueFormatter(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const PerformanceVisualization: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<'species' | 'disease'>('species');
  const [matrixDisplayMode, setMatrixDisplayMode] = useState<'counts' | 'normalized'>('counts');
  const [activeCellHover, setActiveCellHover] = useState<{
    row: number;
    col: number;
    val: number;
    pct: number;
  } | null>(null);

  const isSpecies = selectedModel === 'species';
  const currentMetrics = isSpecies ? BASELINE_EVALUATION_METRICS : HEALTH_EVALUATION_METRICS;

  const displayPrecision = isSpecies
    ? BASELINE_EVALUATION_METRICS.macroPrecision * 100
    : HEALTH_EVALUATION_METRICS.precision * 100;
  const displayRecall = isSpecies
    ? BASELINE_EVALUATION_METRICS.macroRecall * 100
    : HEALTH_EVALUATION_METRICS.recall * 100;
  const displayF1 = isSpecies
    ? BASELINE_EVALUATION_METRICS.macroF1 * 100
    : HEALTH_EVALUATION_METRICS.f1Score * 100;

  const historyData = currentMetrics.trainingHistory.map((item) => ({
    epoch: item.epoch,
    trainAccPct: parseFloat((item.trainAcc * 100).toFixed(2)),
    valAccPct: parseFloat((item.valAcc * 100).toFixed(2)),
    trainLoss: parseFloat(item.trainLoss.toFixed(3)),
    valLoss: parseFloat(item.valLoss.toFixed(3)),
  }));

  const cmLabels = currentMetrics.confusionMatrix.labels;
  const cmRaw = currentMetrics.confusionMatrix.matrix;

  // Compute normalized matrix
  const cmNormalized = cmRaw.map((row) => {
    const sum = row.reduce((a, b) => a + b, 0);
    return row.map((val) => (sum > 0 ? (val / sum) * 100 : 0));
  });

  // Data for the Class Diagnosis Bar Chart
  const classBreakdownData = currentMetrics.classes.map((cls, idx) => {
    const row = cmRaw[idx];
    const truePositives = row[idx];
    const totalActual = row.reduce((a, b) => a + b, 0);
    const misclassified = totalActual - truePositives;

    return {
      name: cls.name,
      precisionPct: parseFloat((cls.precision * 100).toFixed(1)),
      recallPct: parseFloat((cls.recall * 100).toFixed(1)),
      f1ScorePct: parseFloat((cls.f1Score * 100).toFixed(1)),
      truePositives,
      misclassified,
      totalActual,
    };
  });

  // Cross-Model Performance Comparison Data (Accuracy, Precision, Recall, F1)
  const comparisonData = [
    {
      metric: 'Accuracy',
      'Species Model': parseFloat((BASELINE_EVALUATION_METRICS.accuracy * 100).toFixed(2)),
      'Disease Model': parseFloat((HEALTH_EVALUATION_METRICS.accuracy * 100).toFixed(2)),
    },
    {
      metric: 'Precision',
      'Species Model': parseFloat((BASELINE_EVALUATION_METRICS.macroPrecision * 100).toFixed(2)),
      'Disease Model': parseFloat((HEALTH_EVALUATION_METRICS.precision * 100).toFixed(2)),
    },
    {
      metric: 'Recall',
      'Species Model': parseFloat((BASELINE_EVALUATION_METRICS.macroRecall * 100).toFixed(2)),
      'Disease Model': parseFloat((HEALTH_EVALUATION_METRICS.recall * 100).toFixed(2)),
    },
    {
      metric: 'F1-Score',
      'Species Model': parseFloat((BASELINE_EVALUATION_METRICS.macroF1 * 100).toFixed(2)),
      'Disease Model': parseFloat((HEALTH_EVALUATION_METRICS.f1Score * 100).toFixed(2)),
    },
  ];

  // Dataset distribution data for currently selected model
  const datasetDistributionData = isSpecies
    ? DATASET_DISTRIBUTIONS.species.map((d) => ({
        name: d.name,
        totalImages: d.count,
        testSplit: d.testCount,
        trainSplit: d.count - d.testCount,
      }))
    : DATASET_DISTRIBUTIONS.disease.map((d) => ({
        name: d.name,
        totalImages: d.count,
        testSplit: d.testCount,
        trainSplit: d.count - d.testCount,
      }));

  // ROC curve data for Disease Binary Classifier (AUC = 0.9842)
  const rocCurveData = DISEASE_ROC_CURVE.points.map((p) => ({
    fpr: parseFloat((p.fpr * 100).toFixed(1)),
    tpr: parseFloat((p.tpr * 100).toFixed(1)),
    chance: parseFloat((p.fpr * 100).toFixed(1)),
  }));

  const handleDownloadMetricsJson = () => {
    const payload = {
      species: {
        accuracy: BASELINE_EVALUATION_METRICS.accuracy,
        precision: BASELINE_EVALUATION_METRICS.macroPrecision,
        recall: BASELINE_EVALUATION_METRICS.macroRecall,
        f1_score: BASELINE_EVALUATION_METRICS.macroF1,
        averaging_method: 'weighted',
        classes: BASELINE_EVALUATION_METRICS.classes.map((c) => c.name),
      },
      disease: {
        accuracy: HEALTH_EVALUATION_METRICS.accuracy,
        precision: HEALTH_EVALUATION_METRICS.precision,
        recall: HEALTH_EVALUATION_METRICS.recall,
        f1_score: HEALTH_EVALUATION_METRICS.f1Score,
        averaging_method: 'binary/weighted',
        classes: HEALTH_EVALUATION_METRICS.classes.map((c) => c.name),
      },
      exportTimestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'results_metrics.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (

    <div className="space-y-6">
      {/* Top Controller Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 font-semibold mb-1">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Interactive Recharts Performance Dashboard</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Training Curves & Evaluation Visualization
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Rendered from MobileNetV2 Keras training history and test evaluation matrices
          </p>
        </div>

        {/* Model Switcher Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
          <button
            onClick={() => setSelectedModel('species')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              isSpecies
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>Species Model (6 Classes)</span>
          </button>
          <button
            onClick={() => setSelectedModel('disease')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              !isSpecies
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-blue-600" />
            <span>Disease Model (Binary)</span>
          </button>
        </div>
      </div>

      {/* Summary Scorecards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">
            Test Accuracy
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
              {(currentMetrics.accuracy * 100).toFixed(2)}%
            </span>
            <span className="text-xs text-slate-400 font-mono">Top-1</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Evaluated on holdout test specimens</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">
            Macro Precision
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-800 tabular-nums">
              {displayPrecision.toFixed(2)}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Unweighted class positive rate</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">
            Macro Recall
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-800 tabular-nums">
              {displayRecall.toFixed(2)}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">True positive identification rate</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">
            Macro F1-Score
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-800 tabular-nums">
              {displayF1.toFixed(2)}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Harmonic mean of precision and recall</p>
        </div>
      </div>

      {/* SECTION 1: ACCURACY & LOSS RECHARTS CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart A: Training & Validation Accuracy */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>{isSpecies ? 'Species' : 'Disease'} Training & Validation Accuracy</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Epoch convergence curve (1 to 25 epochs)</p>
              </div>
              <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Peak Val: {Math.max(...historyData.map((d) => d.valAccPct))}%
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trainAccGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="epoch"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    label={{ value: 'Epoch', position: 'insideBottomRight', offset: -5, fontSize: 10, fill: '#94a3b8' }}
                  />
                  <YAxis
                    domain={[60, 100]}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip content={<ChartTooltip valueFormatter={(v) => `${v}%`} />} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  <Area
                    type="monotone"
                    dataKey="trainAccPct"
                    name="Training Accuracy"
                    stroke="#059669"
                    strokeWidth={2.2}
                    fillOpacity={1}
                    fill="url(#trainAccGrad)"
                  />
                  <Line
                    type="monotone"
                    dataKey="valAccPct"
                    name="Validation Accuracy"
                    stroke="#0284c7"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Epochs 1-15: Feature Head</span>
            <span>Epochs 16-25: Top Backbone Fine-Tuning</span>
          </div>
        </div>

        {/* Chart B: Training & Validation Loss */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-600" />
                  <span>{isSpecies ? 'Species' : 'Disease'} Training & Validation Loss</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Cross-Entropy Loss decay across epochs</p>
              </div>
              <span className="text-[11px] font-mono text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Min Val Loss: {Math.min(...historyData.map((d) => d.valLoss))}
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="epoch"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    label={{ value: 'Epoch', position: 'insideBottomRight', offset: -5, fontSize: 10, fill: '#94a3b8' }}
                  />
                  <YAxis
                    domain={[0, 1.2]}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickFormatter={(v) => `${v.toFixed(2)}`}
                  />
                  <Tooltip content={<ChartTooltip valueFormatter={(v) => `${v.toFixed(3)}`} />} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  <Line
                    type="monotone"
                    dataKey="trainLoss"
                    name="Training Loss"
                    stroke="#e11d48"
                    strokeWidth={2.2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="valLoss"
                    name="Validation Loss"
                    stroke="#d97706"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Early Stopping: Restores Best Weights</span>
            <span>Learning Rate Decay: Adam 1e-4 → 1e-5</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: CONFUSION MATRIX SECTION */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-600" />
              <span>{isSpecies ? 'Species' : 'Disease'} Confusion Matrix Analysis</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ground truth rows vs predicted columns on test specimens
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeCellHover && (
              <div className="text-xs font-mono bg-slate-900 text-white px-3 py-1 rounded-md hidden sm:block">
                Actual: <strong>{cmLabels[activeCellHover.row]}</strong> → Pred: <strong>{cmLabels[activeCellHover.col]}</strong> (
                {activeCellHover.val} samples · {activeCellHover.pct.toFixed(1)}%)
              </div>
            )}

            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md border border-slate-200 text-xs">
              <button
                onClick={() => setMatrixDisplayMode('counts')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  matrixDisplayMode === 'counts'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sample Counts
              </button>
              <button
                onClick={() => setMatrixDisplayMode('normalized')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  matrixDisplayMode === 'normalized'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Normalized (%)
              </button>
            </div>
          </div>
        </div>

        {/* The Matrix Table & Recharts Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Matrix Heatmap */}
          <div className="lg:col-span-7 overflow-x-auto">
            <div className="min-w-[420px]">
              {/* Header column labels */}
              <div
                className="grid gap-1 text-center font-mono text-[11px] font-semibold text-slate-700 pb-1.5"
                style={{ gridTemplateColumns: `80px repeat(${cmLabels.length}, 1fr)` }}
              >
                <div className="text-slate-400 text-right pr-2 text-[10px] uppercase">Actual \ Pred</div>
                {cmLabels.map((l) => (
                  <div key={l} className="truncate px-1" title={l}>
                    {l}
                  </div>
                ))}
              </div>

              {/* Rows */}
              {cmRaw.map((row, rIdx) => (
                <div
                  key={cmLabels[rIdx]}
                  className="grid gap-1 text-center font-mono text-xs py-0.5"
                  style={{ gridTemplateColumns: `80px repeat(${cmLabels.length}, 1fr)` }}
                >
                  <div className="text-left font-semibold text-slate-800 truncate pr-2 text-[11px] flex items-center">
                    {cmLabels[rIdx]}
                  </div>

                  {row.map((val, cIdx) => {
                    const isDiagonal = rIdx === cIdx;
                    const pct = cmNormalized[rIdx][cIdx];
                    let bgClass = 'bg-slate-50 text-slate-500 border border-slate-100';

                    if (isDiagonal) {
                      bgClass = isSpecies
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'bg-blue-600 text-white font-bold shadow-xs';
                    } else if (val > 0) {
                      bgClass = 'bg-amber-100 text-amber-900 border border-amber-200 font-semibold';
                    }

                    return (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        onMouseEnter={() => setActiveCellHover({ row: rIdx, col: cIdx, val, pct })}
                        onMouseLeave={() => setActiveCellHover(null)}
                        className={`h-10 flex items-center justify-center rounded-md cursor-pointer transition-all hover:scale-105 ${bgClass}`}
                        title={`Actual: ${cmLabels[rIdx]}, Predicted: ${cmLabels[cIdx]}: ${val} (${pct.toFixed(1)}%)`}
                      >
                        <span className="tabular-nums">
                          {matrixDisplayMode === 'counts' ? val : `${pct.toFixed(0)}%`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 pt-3 font-mono">
              <span className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded-xs ${isSpecies ? 'bg-emerald-600' : 'bg-blue-600'}`} />
                <span>True Positives (Diagonal)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-amber-100 border border-amber-300" />
                <span>Misclassifications (Off-Diagonal)</span>
              </span>
            </div>
          </div>

          {/* Recharts Stacked Breakdown of Correct vs Misclassified */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-700 block mb-1">
              Sample Classification Breakdown
            </span>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classBreakdownData} layout="vertical" margin={{ top: 5, right: 10, left: 15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#334155' }} />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      `${val} specimens`,
                      String(name) === 'truePositives' ? 'Correctly Identified' : 'Misclassified',
                    ]}
                  />
                  <Bar dataKey="truePositives" name="truePositives" stackId="a" fill={isSpecies ? '#059669' : '#2563eb'} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="misclassified" name="misclassified" stackId="a" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Visualizes the proportion of specimens correctly localized on the diagonal versus distributed as false predictions.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: PER-CLASS PERFORMANCE BAR CHART (PRECISION, RECALL, F1) */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-600" />
              <span>{isSpecies ? 'Species' : 'Disease'} Model Performance by Class</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Class-wise Precision, Recall (Sensitivity), and F1-Score comparison
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Scores in % (0 - 100)</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={classBreakdownData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#334155' }} />
              <YAxis domain={[80, 100]} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                formatter={(val: any, name: any) => [`${val}%`, String(name || '')]}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="precisionPct" name="Precision" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="recallPct" name="Recall" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="f1ScorePct" name="F1-Score" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION 4: CROSS-MODEL METRIC COMPARISON (SPECIES VS DISEASE) */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-2 mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-600" />
              <span>Model Performance Comparison (Species vs Disease)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparative benchmark across Accuracy, Macro Precision, Recall, and F1-Score
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Averaging: Weighted / Macro
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="metric" tick={{ fontSize: 11, fill: '#334155' }} />
              <YAxis domain={[85, 100]} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                formatter={(val: any, name: any) => [`${val}%`, String(name || '')]}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Species Model" fill="#059669" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Disease Model" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION 5: DATASET CLASS DISTRIBUTION & DISEASE ROC CURVE (GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dataset Distribution */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>{isSpecies ? 'Species' : 'Disease'} Dataset Class Distribution</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Number of verified leaf images available per class in repository
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {isSpecies ? '6,200 Total Images' : '6,600 Total Images'}
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datasetDistributionData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#334155' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                    formatter={(val: any, name: any) => [`${val} images`, String(name || '')]}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="trainSplit" name="Training / Val Split" stackId="dist" fill="#10b981" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="testSplit" name="Holdout Test Split" stackId="dist" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Balanced test split: {isSpecies ? '200 images/class' : '600 images/class'}</span>
            <span>Input Res: 224 × 224 RGB</span>
          </div>
        </div>

        {/* ROC / AUC Curve (Disease Model) */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>Disease Model Receiver Operating Characteristic (ROC)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  True Positive Rate (Sensitivity) vs False Positive Rate
                </p>
              </div>
              <span className="text-[11px] font-mono text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded font-bold border border-blue-200">
                AUC: {DISEASE_ROC_CURVE.auc}
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={rocCurveData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="rocGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="fpr"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickFormatter={(v) => `${v}%`}
                    label={{ value: 'False Positive Rate (%)', position: 'insideBottomRight', offset: -5, fontSize: 10, fill: '#94a3b8' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickFormatter={(v) => `${v}%`}
                    label={{ value: 'True Positive Rate (%)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#94a3b8' }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                    formatter={(val: any, name: any) => [`${val}%`, String(name || '')]}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  <Area
                    type="monotone"
                    dataKey="tpr"
                    name="MobileNetV2 ROC Curve"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fill="url(#rocGrad)"
                  />
                  <Line
                    type="monotone"
                    dataKey="chance"
                    name="Random Classifier (AUC 0.50)"
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Threshold Optimality: J = 0.902</span>
            <span>AUC = 0.9842 (Near-Optimal Discrimination)</span>
          </div>
        </div>
      </div>

      {/* SECTION 6: METRICS EXPORT & PERSISTED RESULTS ARTIFACTS */}
      <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 text-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-semibold mb-1">
            <FileJson className="w-4 h-4 text-emerald-400" />
            <span>Persisted Result JSON Files Ready</span>
          </div>
          <h4 className="text-sm font-bold text-white">
            Export Model History & Academic Benchmark Artifacts
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            results/metrics.json · results/species_history.json · results/disease_history.json
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadMetricsJson}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download metrics.json</span>
          </button>
        </div>
      </div>
    </div>
  );
};


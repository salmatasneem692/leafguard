import React from 'react';
import { PreprocessingMetrics } from '../types/index.ts';
import { Layers, Activity, Sliders, CheckCircle2, AlertTriangle } from 'lucide-react';

interface PreprocessingViewerProps {
  metrics: PreprocessingMetrics;
  processedDataUrl: string;
}

export const PreprocessingViewer: React.FC<PreprocessingViewerProps> = ({
  metrics,
  processedDataUrl,
}) => {
  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl p-5 border border-slate-800 shadow-md">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            MobileNetV2 Input Pipeline Inspection
          </h4>
        </div>
        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
          Tensor: 224 × 224 × 3
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Stage 1: Resized RGB Canvas */}
        <div>
          <div className="text-[11px] text-slate-400 font-mono mb-1.5 flex items-center justify-between">
            <span>Resized Spatial ROI</span>
            <span>224×224 px</span>
          </div>
          <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-slate-700 bg-black flex items-center justify-center">
            <img
              src={processedDataUrl}
              alt="Preprocessed 224x224 leaf tensor"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-1 right-1 text-[9px] font-mono bg-black/70 text-slate-300 px-1 rounded">
              RGB Interpolation: Bicubic
            </div>
          </div>
        </div>

        {/* Stage 2: Channel Analytics */}
        <div className="space-y-3">
          <div className="text-[11px] text-slate-400 font-mono mb-1">Color Channel Distribution</div>
          
          {/* Red */}
          <div>
            <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
              <span className="text-rose-400">R Channel Mean</span>
              <span className="tabular-nums">{metrics.meanRGB[0]} / 255</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full"
                style={{ width: `${(metrics.meanRGB[0] / 255) * 100}%` }}
              />
            </div>
          </div>

          {/* Green */}
          <div>
            <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
              <span className="text-emerald-400">G Channel Mean</span>
              <span className="tabular-nums">{metrics.meanRGB[1]} / 255</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${(metrics.meanRGB[1] / 255) * 100}%` }}
              />
            </div>
          </div>

          {/* Blue */}
          <div>
            <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
              <span className="text-sky-400">B Channel Mean</span>
              <span className="tabular-nums">{metrics.meanRGB[2]} / 255</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full"
                style={{ width: `${(metrics.meanRGB[2] / 255) * 100}%` }}
              />
            </div>
          </div>

          {/* Vegetation Index */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Excess Green (ExG):</span>
              <span className="text-emerald-300 font-semibold tabular-nums">
                {metrics.greenIndex > 0 ? `+${metrics.greenIndex}` : metrics.greenIndex}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Formula: 2G - R - B (validates plant chlorophyll presence)</p>
          </div>
        </div>

        {/* Stage 3: Normalized Tensor Sample Grid */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1.5">
            <span>Normalized Tensor Slice</span>
            <span>[-1.0, 1.0]</span>
          </div>

          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
            <div className="grid grid-cols-8 gap-0.5 text-center font-mono text-[9px]">
              {metrics.tensorSample.map((row, rIdx) =>
                row.map((val, cIdx) => {
                  const normalizedColor = val >= 0 ? 'text-emerald-400 bg-emerald-950/40' : 'text-slate-400 bg-slate-900/60';
                  return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className={`p-0.5 rounded-xs tabular-nums ${normalizedColor}`}
                      title={`Cell (${rIdx},${cIdx}): ${val}`}
                    >
                      {val.toFixed(1)}
                    </div>
                  );
                })
              )}
            </div>
            <div className="mt-2 text-[9px] text-slate-400 text-center font-mono">
              f(x) = (pixel / 127.5) - 1.0
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-300">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-400" />
              Sharpness Score:
            </span>
            <span className="tabular-nums text-cyan-300">{metrics.blurScore} / 100</span>
          </div>
        </div>
      </div>
    </div>
  );
};

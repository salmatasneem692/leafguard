import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Sparkles, Sun, Eye, Leaf, ShieldAlert } from 'lucide-react';

export interface ImageQualityReport {
  sharpnessScore: number; // 0 - 100
  sharpnessStatus: 'Sharp' | 'Moderate Blur' | 'Severely Blurry';
  lightingScore: number; // 0 - 100
  lightingStatus: 'Balanced' | 'Underexposed (Dark)' | 'Overexposed (Glary)';
  exgIndex: number; // Excess Green foliage presence % (0 - 100)
  exgStatus: 'High Foliage Content' | 'Moderate Foliage' | 'Low/Non-Plant Foliage';
  overallScore: number; // 0 - 100
  passed: boolean;
  recommendations: string[];
}

interface ImageQualityCheckerProps {
  imageSrc: string;
  onQualityEvaluated?: (report: ImageQualityReport) => void;
}

export const ImageQualityChecker: React.FC<ImageQualityCheckerProps> = ({
  imageSrc,
  onQualityEvaluated,
}) => {
  const [report, setReport] = useState<ImageQualityReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(true);

  useEffect(() => {
    let isCancelled = false;

    const analyzeImage = async () => {
      setIsAnalyzing(true);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;

      img.onload = () => {
        if (isCancelled) return;

        try {
          const canvas = document.createElement('canvas');
          const size = 120; // 120x120 for rapid real-time sampling
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });

          if (!ctx) {
            setIsAnalyzing(false);
            return;
          }

          ctx.drawImage(img, 0, 0, size, size);
          const imageData = ctx.getImageData(0, 0, size, size);
          const data = imageData.data;
          const pixelCount = size * size;

          // 1. Lighting analysis (Luminance)
          let totalLuminance = 0;
          let greenExcessCount = 0;
          const grayscale = new Float32Array(pixelCount);

          for (let i = 0; i < pixelCount; i++) {
            const idx = i * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            // Standard ITU-R BT.601 luminance
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            grayscale[i] = lum;
            totalLuminance += lum;

            // Excess Green Index: ExG = 2G - R - B
            const exg = 2 * g - r - b;
            if (exg > 15 && g > 40) {
              greenExcessCount++;
            }
          }

          const avgLuminance = totalLuminance / pixelCount;
          let lightingScore = 100;
          let lightingStatus: ImageQualityReport['lightingStatus'] = 'Balanced';

          if (avgLuminance < 60) {
            lightingScore = Math.max(25, Math.round((avgLuminance / 60) * 70));
            lightingStatus = 'Underexposed (Dark)';
          } else if (avgLuminance > 200) {
            lightingScore = Math.max(30, Math.round(((255 - avgLuminance) / 55) * 70));
            lightingStatus = 'Overexposed (Glary)';
          } else {
            lightingScore = Math.round(85 + (1 - Math.abs(avgLuminance - 130) / 70) * 15);
          }

          // 2. Sharpness / High Frequency Laplacian Edge Variance
          let edgeSum = 0;
          let edgeCount = 0;
          for (let y = 1; y < size - 1; y++) {
            for (let x = 1; x < size - 1; x++) {
              const idx = y * size + x;
              const center = grayscale[idx];
              const left = grayscale[idx - 1];
              const right = grayscale[idx + 1];
              const up = grayscale[idx - size];
              const down = grayscale[idx + size];

              // Discrete 4-neighbor Laplacian approximation
              const laplacian = Math.abs(4 * center - left - right - up - down);
              edgeSum += laplacian;
              edgeCount++;
            }
          }

          const avgLaplacian = edgeCount > 0 ? edgeSum / edgeCount : 0;
          // Scale laplacian variance to 0 - 100 score
          let sharpnessScore = Math.min(100, Math.round((avgLaplacian / 22) * 100));
          let sharpnessStatus: ImageQualityReport['sharpnessStatus'] = 'Sharp';

          if (sharpnessScore < 45) {
            sharpnessStatus = 'Severely Blurry';
          } else if (sharpnessScore < 68) {
            sharpnessStatus = 'Moderate Blur';
          }

          // 3. Excess Green (ExG) Foliage Presence Percentage
          const exgPercentage = Math.round((greenExcessCount / pixelCount) * 100);
          let exgStatus: ImageQualityReport['exgStatus'] = 'High Foliage Content';

          if (exgPercentage < 18) {
            exgStatus = 'Low/Non-Plant Foliage';
          } else if (exgPercentage < 40) {
            exgStatus = 'Moderate Foliage';
          }

          // 4. Overall quality synthesis
          const overallScore = Math.round(
            sharpnessScore * 0.45 + lightingScore * 0.3 + Math.min(100, exgPercentage * 1.5) * 0.25
          );

          const recs: string[] = [];
          if (sharpnessScore < 55) {
            recs.push('Hold camera steady and refocus on leaf veins to eliminate motion blur.');
          }
          if (avgLuminance < 60) {
            recs.push('Increase illumination or photograph outdoors in bright diffused shade.');
          } else if (avgLuminance > 200) {
            recs.push('Avoid direct camera flash reflection or bright midday sun glare.');
          }
          if (exgPercentage < 20) {
            recs.push('Frame closer to fill 70%+ of the frame with the leaf surface rather than background.');
          }

          const finalReport: ImageQualityReport = {
            sharpnessScore,
            sharpnessStatus,
            lightingScore,
            lightingStatus,
            exgIndex: exgPercentage,
            exgStatus,
            overallScore,
            passed: overallScore >= 55 && sharpnessScore >= 40,
            recommendations: recs,
          };

          setReport(finalReport);
          if (onQualityEvaluated) {
            onQualityEvaluated(finalReport);
          }
        } catch (err) {
          console.error('Image quality assessment error:', err);
        } finally {
          setIsAnalyzing(false);
        }
      };

      img.onerror = () => {
        setIsAnalyzing(false);
      };
    };

    analyzeImage();

    return () => {
      isCancelled = true;
    };
  }, [imageSrc, onQualityEvaluated]);

  if (isAnalyzing) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-500 py-1.5 px-3 bg-slate-50 rounded-lg border border-slate-200">
        <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
        <span>Evaluating image quality & chlorophyll ExG index...</span>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className={`p-3.5 rounded-xl border text-xs transition-all ${
      report.passed 
        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
        : 'bg-amber-50/80 border-amber-300 text-amber-950'
    }`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 font-semibold">
          {report.passed ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          )}
          <span>
            {report.passed ? 'Image Quality Passed Pre-Flight Check' : 'Sub-Optimal Image Quality Detected'}
          </span>
        </div>
        <div className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-white/80 border border-slate-200 text-slate-800">
          Score: {report.overallScore}/100
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-black/5 text-[11px]">
        {/* Sharpness */}
        <div className="bg-white/70 p-2 rounded-lg border border-black/5">
          <div className="flex items-center gap-1 text-slate-600 font-medium mb-0.5">
            <Eye className="w-3 h-3 text-indigo-500" />
            <span>Sharpness</span>
          </div>
          <div className="font-semibold text-slate-900">{report.sharpnessStatus}</div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{report.sharpnessScore}% index</div>
        </div>

        {/* Lighting */}
        <div className="bg-white/70 p-2 rounded-lg border border-black/5">
          <div className="flex items-center gap-1 text-slate-600 font-medium mb-0.5">
            <Sun className="w-3 h-3 text-amber-500" />
            <span>Exposure</span>
          </div>
          <div className="font-semibold text-slate-900">{report.lightingStatus}</div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{report.lightingScore}% balance</div>
        </div>

        {/* ExG Foliage */}
        <div className="bg-white/70 p-2 rounded-lg border border-black/5">
          <div className="flex items-center gap-1 text-slate-600 font-medium mb-0.5">
            <Leaf className="w-3 h-3 text-emerald-600" />
            <span>ExG Foliage</span>
          </div>
          <div className="font-semibold text-slate-900">{report.exgStatus}</div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{report.exgIndex}% green ratio</div>
        </div>
      </div>

      {/* Advice if sub-optimal */}
      {report.recommendations.length > 0 && (
        <div className="mt-2.5 pt-2 border-t border-black/5">
          <div className="font-medium text-amber-900 text-[11px] mb-1">
            Tips for highest identification accuracy:
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-700">
            {report.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

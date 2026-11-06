import React from 'react';
import { AlertOctagon, HelpCircle, ShieldAlert, ArrowRight, RefreshCw, AlertTriangle } from 'lucide-react';

interface UnknownPlantBannerProps {
  confidence: number;
  speciesName: string;
  onRetake?: () => void;
}

export const UnknownPlantBanner: React.FC<UnknownPlantBannerProps> = ({
  confidence,
  speciesName,
  onRetake,
}) => {
  const isOutOfDistribution = confidence < 60 || speciesName.toLowerCase().includes('unknown');

  if (!isOutOfDistribution) return null;

  return (
    <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-5 text-rose-950 shadow-xs space-y-3">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-rose-100 rounded-lg text-rose-700 shrink-0 mt-0.5">
          <AlertOctagon className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-base text-rose-900">
              Low Confidence / Out-of-Distribution (OOD) Leaf Warning
            </h4>
            <span className="bg-rose-200 text-rose-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
              Confidence {confidence.toFixed(1)}% (&lt; 60% threshold)
            </span>
          </div>
          <p className="text-xs text-rose-800 leading-relaxed">
            The AI model cannot confidently classify this specimen into one of the 6 verified medicinal species (Tulsi, Neem, Aloe Vera, Ashwagandha, Mint, Curry Leaf). It may be a different plant, an unusual cultivar, or obscured by background artifacts.
          </p>
        </div>
      </div>

      {/* Critical Safety Notice */}
      <div className="bg-white/80 p-3.5 rounded-lg border border-rose-200 space-y-2 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-rose-900">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span>CRITICAL BOTANICAL & MEDICINAL SAFETY NOTICE:</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-slate-800 text-[11px] leading-relaxed">
          <li>
            <strong>NEVER ingest, brew, or apply</strong> any wild or unfamiliar plant based solely on automated image classification. Many toxic plants share deceptive visual mimicry with edible herbs.
          </li>
          <li>
            LeafGuard AI provides educational taxonomic support and does <strong>NOT prescribe medicinal dosages</strong> or guarantee toxicological safety.
          </li>
          <li>
            Always verify specimen identity through a qualified Ayurvedic physician, botanist, or pharmacognosy laboratory.
          </li>
        </ul>
      </div>

      {/* Actionable guidance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs">
        <div className="text-slate-600 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Tip: Capture a close-up of leaf margins, venation, and petiole against a neutral background.</span>
        </div>
        {onRetake && (
          <button
            type="button"
            onClick={onRetake}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retake / Upload New Photo</span>
          </button>
        )}
      </div>
    </div>
  );
};

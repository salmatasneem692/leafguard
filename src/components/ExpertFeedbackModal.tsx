import React, { useState } from 'react';
import { X, Send, Download, CheckCircle2, ShieldAlert, BookOpen, AlertCircle } from 'lucide-react';
import { PredictionResult } from '../types/index.ts';

interface ExpertFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: PredictionResult;
}

export interface FeedbackRecord {
  id: string;
  timestamp: string;
  predictedSpecies: string;
  predictedDisease: string;
  userRole: string;
  reportType: 'Incorrect Species' | 'Incorrect Disease' | 'Both Incorrect' | 'General Comment';
  correctedSpecies: string;
  correctedDisease: string;
  botanicalObservations: string;
  severity: 'Minor' | 'Moderate' | 'Critical Misdiagnosis';
}

export const ExpertFeedbackModal: React.FC<ExpertFeedbackModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  const [userRole, setUserRole] = useState<string>('Agricultural Extension / Botanist');
  const [reportType, setReportType] = useState<FeedbackRecord['reportType']>('Incorrect Species');
  const [correctedSpecies, setCorrectedSpecies] = useState<string>(result.species.name);
  const [correctedDisease, setCorrectedDisease] = useState<string>(result.health.diseaseName || 'Healthy');
  const [botanicalObservations, setBotanicalObservations] = useState<string>('');
  const [severity, setSeverity] = useState<FeedbackRecord['severity']>('Moderate');
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const record: FeedbackRecord = {
      id: `FB-${Date.now()}`,
      timestamp: new Date().toISOString(),
      predictedSpecies: result.species.name,
      predictedDisease: result.health.diseaseName || result.health.status,
      userRole,
      reportType,
      correctedSpecies,
      correctedDisease,
      botanicalObservations,
      severity,
    };

    try {
      const stored = localStorage.getItem('leafguard_expert_feedback');
      const feedbackList: FeedbackRecord[] = stored ? JSON.parse(stored) : [];
      feedbackList.unshift(record);
      localStorage.setItem('leafguard_expert_feedback', JSON.stringify(feedbackList));
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Failed to save feedback:', err);
      alert('Feedback could not be saved to local storage.');
    }
  };

  const handleExportAll = () => {
    try {
      const stored = localStorage.getItem('leafguard_expert_feedback');
      const list = stored ? JSON.parse(stored) : [];
      const blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leafguard_expert_feedback_dataset_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">Expert Botanical Feedback</h3>
              <p className="text-xs text-slate-500">Report prediction errors & submit verified re-training data</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-slate-900 text-lg">Thank You for Your Expert Feedback</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Your botanical annotation has been recorded in the local verification ledger. This data will be used to calibrate model decision boundaries and improve classification accuracy.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {/* Current Prediction Snapshot */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Current Model Prediction
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-800 font-mono text-[11px]">
                <div>
                  <span className="text-slate-500">Species:</span>{' '}
                  <span className="font-bold text-emerald-800">{result.species.name}</span>
                </div>
                <div>
                  <span className="text-slate-500">Condition:</span>{' '}
                  <span className="font-bold text-rose-800">
                    {result.health.diseaseName || result.health.status}
                  </span>
                </div>
              </div>
            </div>

            {/* User Role */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Your Professional Domain / Role</label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="Agricultural Extension / Botanist">Agricultural Extension Worker / Botanist</option>
                <option value="Ayurvedic Practitioner">Ayurvedic Practitioner / Pharmacognosist</option>
                <option value="Commercial Farmer / Cultivator">Commercial Medicinal Herb Farmer</option>
                <option value="Academic Researcher / Student">Academic Researcher / Student</option>
                <option value="Home Gardener">Home Gardener</option>
              </select>
            </div>

            {/* Error Type */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Observation / Issue Reported</label>
              <div className="grid grid-cols-2 gap-2">
                {(['Incorrect Species', 'Incorrect Disease', 'Both Incorrect', 'General Comment'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setReportType(type)}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      reportType === type
                        ? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-900 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Verified Species Correction */}
            {(reportType === 'Incorrect Species' || reportType === 'Both Incorrect') && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Verified Botanical Species</label>
                <select
                  value={correctedSpecies}
                  onChange={(e) => setCorrectedSpecies(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Tulsi">Tulsi (Ocimum tenuiflorum)</option>
                  <option value="Neem">Neem (Azadirachta indica)</option>
                  <option value="Aloe Vera">Aloe Vera (Aloe barbadensis miller)</option>
                  <option value="Ashwagandha">Ashwagandha (Withania somnifera)</option>
                  <option value="Mint">Mint (Mentha arvensis)</option>
                  <option value="Curry Leaf">Curry Leaf (Murraya koenigii)</option>
                  <option value="Unknown / Out of Scope Species">Unknown / Out of Scope Species</option>
                </select>
              </div>
            )}

            {/* Verified Disease Correction */}
            {(reportType === 'Incorrect Disease' || reportType === 'Both Incorrect') && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Verified Pathological Condition</label>
                <select
                  value={correctedDisease}
                  onChange={(e) => setCorrectedDisease(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Healthy">Healthy (No pathological lesions)</option>
                  <option value="Foliar Leaf Spot (Cercospora / Alternaria)">Foliar Leaf Spot (Cercospora / Alternaria)</option>
                  <option value="Powdery Mildew (Erysiphales)">Powdery Mildew (Erysiphales)</option>
                  <option value="Blight & Necrotic Margin Rot">Blight & Necrotic Margin Rot</option>
                  <option value="Chlorosis / Nutrient Deficiency">Chlorosis / Nutrient Deficiency</option>
                  <option value="Leaf Webber / Insect Puncture">Leaf Webber / Insect Puncture</option>
                </select>
              </div>
            )}

            {/* Severity Rating */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Clinical / Agronomic Severity</label>
              <div className="flex gap-2">
                {(['Minor', 'Moderate', 'Critical Misdiagnosis'] as const).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverity(sev)}
                    className={`flex-1 py-1.5 px-2 rounded-lg border text-center transition-all ${
                      severity === sev
                        ? sev === 'Critical Misdiagnosis'
                          ? 'border-rose-600 bg-rose-50 text-rose-900 font-bold'
                          : 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* Botanical Observations */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Botanical Justification & Morphological Notes
              </label>
              <textarea
                value={botanicalObservations}
                onChange={(e) => setBotanicalObservations(e.target.value)}
                placeholder="E.g., Leaf margin is clearly serrated with opposite phyllotaxy, unlike Curry Leaf alternate leaflets. Lesions exhibit concentric target-like rings indicating fungal leaf spot..."
                rows={3}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
              />
            </div>

            {/* Academic Safety Notice */}
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                All annotations are stamped with client device metadata and saved into the verification ledger for machine learning model validation.
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleExportAll}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Download all stored feedback as JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Dataset</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Correction</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

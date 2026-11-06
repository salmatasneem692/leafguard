import React, { useState, useMemo } from 'react';
import { SavedAnalysisSession } from '../services/historyStorage.ts';
import { generateAcademicPdfReport } from '../services/pdfReportGenerator.ts';
import { 
  History, 
  Trash2, 
  FileDown, 
  Search, 
  AlertCircle, 
  CheckCircle, 
  Leaf, 
  Clock, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface HistoryViewProps {
  sessions: SavedAnalysisSession[];
  onSelectSession: (session: SavedAnalysisSession) => void;
  onDeleteSession: (id: string) => void;
  onClearAll: () => void;
  onGoToAnalyzer: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  sessions,
  onSelectSession,
  onDeleteSession,
  onClearAll,
  onGoToAnalyzer,
}) => {
  const [viewMode, setViewMode] = useState<'archive' | 'longitudinal'>('archive');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterHealth, setFilterHealth] = useState<'all' | 'healthy' | 'diseased'>('all');
  const [exportingId, setExportingId] = useState<string | null>(null);

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.plantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (session.diseaseName && session.diseaseName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesHealth =
      filterHealth === 'all' || session.healthStatus === filterHealth;

    return matchesSearch && matchesHealth;
  });

  const healthyCount = sessions.filter((s) => s.healthStatus === 'healthy').length;
  const diseasedCount = sessions.filter((s) => s.healthStatus === 'diseased').length;

  // Longitudinal grouping by plant species
  const longitudinalGroups = useMemo(() => {
    const map = new Map<string, SavedAnalysisSession[]>();
    for (const session of sessions) {
      const key = session.plantName;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(session);
    }

    // Sort each group chronologically (oldest to newest for trajectory)
    const result: Array<{
      plantName: string;
      scientificName: string;
      sessions: SavedAnalysisSession[];
      statusTrend: 'Improving' | 'Deteriorating' | 'Stable Healthy' | 'Persistently Diseased';
    }> = [];

    map.forEach((list, plantName) => {
      // sort by timestamp
      const sorted = [...list].sort(
        (a, b) => new Date(a.result?.timestamp || a.savedAt).getTime() - new Date(b.result?.timestamp || b.savedAt).getTime()
      );
      const first = sorted[0];
      const last = sorted[sorted.length - 1];

      let statusTrend: 'Improving' | 'Deteriorating' | 'Stable Healthy' | 'Persistently Diseased' = 'Stable Healthy';
      if (first.healthStatus === 'diseased' && last.healthStatus === 'healthy') {
        statusTrend = 'Improving';
      } else if (first.healthStatus === 'healthy' && last.healthStatus === 'diseased') {
        statusTrend = 'Deteriorating';
      } else if (last.healthStatus === 'diseased') {
        statusTrend = 'Persistently Diseased';
      } else {
        statusTrend = 'Stable Healthy';
      }

      result.push({
        plantName,
        scientificName: sorted[0].scientificName,
        sessions: sorted,
        statusTrend,
      });
    });

    return result;
  }, [sessions]);

  const handleExportPdf = async (e: React.MouseEvent, session: SavedAnalysisSession) => {
    e.stopPropagation();
    try {
      setExportingId(session.id);
      await generateAcademicPdfReport(session.result);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Unable to generate PDF report.');
    } finally {
      setExportingId(null);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeleteSession(id);
  };

  return (
    <div className="space-y-6">
      {/* Header and Summary Metrics */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 font-semibold mb-1">
              <History className="w-4 h-4 text-emerald-600" />
              <span>Academic Log & Longitudinal Tracking</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Plant History & Longitudinal Health Monitor
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Track foliar health changes over time (Day 1 vs Day 7 vs Day 14) and review diagnostic archives
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setViewMode('archive')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'archive'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Archive Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode('longitudinal')}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                  viewMode === 'longitudinal'
                    ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Health Timeline ({longitudinalGroups.length} Plants)</span>
              </button>
            </div>

            {sessions.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all analysis history records?')) {
                    onClearAll();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors whitespace-nowrap"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear History</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100 font-mono text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase block">Total Scans Recorded</span>
            <span className="text-lg font-bold text-slate-900 tabular-nums">{sessions.length}</span>
          </div>
          <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100">
            <span className="text-[10px] text-emerald-700 uppercase block">Healthy Folia</span>
            <span className="text-lg font-bold text-emerald-800 tabular-nums">{healthyCount}</span>
          </div>
          <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-100">
            <span className="text-[10px] text-amber-700 uppercase block">Diseased / Spots</span>
            <span className="text-lg font-bold text-amber-800 tabular-nums">{diseasedCount}</span>
          </div>
        </div>
      </div>

      {/* Longitudinal Health Tracking View */}
      {viewMode === 'longitudinal' && (
        <div className="space-y-6">
          {longitudinalGroups.length === 0 ? (
            <div className="bg-white rounded-xl p-12 border border-slate-200 text-center max-w-lg mx-auto shadow-xs">
              <Leaf className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h3 className="font-bold text-slate-900 text-sm">No Plant Series Available</h3>
              <p className="text-xs text-slate-500 mt-1">
                Scan multiple leaves of a plant over time to track recovery or disease progression.
              </p>
            </div>
          ) : (
            longitudinalGroups.map((group) => {
              const trendBadge = (() => {
                switch (group.statusTrend) {
                  case 'Improving':
                    return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: TrendingUp, text: 'Health Improving (Remission)' };
                  case 'Deteriorating':
                    return { bg: 'bg-rose-100 text-rose-800 border-rose-300', icon: TrendingDown, text: 'Pathogen Progression Detected' };
                  case 'Persistently Diseased':
                    return { bg: 'bg-amber-100 text-amber-800 border-amber-300', icon: AlertTriangle, text: 'Requires Active Treatment' };
                  default:
                    return { bg: 'bg-blue-100 text-blue-800 border-blue-300', icon: ShieldCheck, text: 'Optimal Health Maintained' };
                }
              })();
              const IconComp = trendBadge.icon;

              return (
                <div key={group.plantName} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-emerald-600" />
                        <h3 className="text-base font-bold text-slate-900">{group.plantName}</h3>
                        <span className="text-xs italic text-slate-500 font-serif">({group.scientificName})</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {group.sessions.length} sequential scan{group.sessions.length > 1 ? 's' : ''} logged in study
                      </p>
                    </div>

                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${trendBadge.bg}`}>
                      <IconComp className="w-3.5 h-3.5" />
                      <span>{trendBadge.text}</span>
                    </div>
                  </div>

                  {/* Horizontal Chronological Progression Cards */}
                  <div className="relative">
                    <div className="flex items-stretch gap-4 overflow-x-auto pb-2 pt-1">
                      {group.sessions.map((item, idx) => {
                        const isHealthy = item.healthStatus === 'healthy';
                        return (
                          <div
                            key={item.id}
                            onClick={() => onSelectSession(item)}
                            className="w-64 shrink-0 bg-slate-50 hover:bg-emerald-50/40 rounded-xl border border-slate-200 hover:border-emerald-400 p-3.5 cursor-pointer transition-all flex flex-col justify-between group"
                          >
                            <div className="space-y-2.5">
                              {/* Step indicator */}
                              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                                <span className="font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                                  Scan #{idx + 1}
                                </span>
                                <span>{item.dateStr}</span>
                              </div>

                              {/* Thumbnail preview */}
                              <div className="w-full h-32 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 relative">
                                {item.thumbnailUrl ? (
                                  <img
                                    src={item.thumbnailUrl}
                                    alt={item.plantName}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <Leaf className="w-8 h-8" />
                                  </div>
                                )}
                                <span className={`absolute bottom-2 left-2 text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-xs ${
                                  isHealthy ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                                }`}>
                                  {isHealthy ? 'Healthy' : (item.diseaseName || 'Diseased')}
                                </span>
                              </div>

                              {/* Metrics */}
                              <div className="text-xs space-y-1 font-mono pt-1">
                                <div className="flex justify-between text-slate-600">
                                  <span>Health Confidence:</span>
                                  <span className="font-bold text-slate-900">{item.healthConfidence.toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                  <span>Time:</span>
                                  <span>{item.savedAt}</span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-emerald-700 font-semibold group-hover:translate-x-0.5 transition-transform">
                              <span>View Diagnostic</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Archive Grid View */}
      {viewMode === 'archive' && (
        <>
          {/* Filter and Search Bar */}
          {sessions.length > 0 && (
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Segmented Filter Control */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-full sm:w-auto">
                <button
                  onClick={() => setFilterHealth('all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    filterHealth === 'all'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({sessions.length})
                </button>
                <button
                  onClick={() => setFilterHealth('healthy')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    filterHealth === 'healthy'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Healthy ({healthyCount})
                </button>
                <button
                  onClick={() => setFilterHealth('diseased')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    filterHealth === 'diseased'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Diseased ({diseasedCount})
                </button>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search history records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
                />
              </div>
            </div>
          )}

          {/* Sessions Grid */}
          {sessions.length === 0 ? (
            <div className="bg-white rounded-xl p-12 border border-slate-200 text-center max-w-lg mx-auto shadow-xs">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Leaf className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">No Analysis History Yet</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                When you analyze leaf specimens with the MobileNetV2 diagnostic pipeline, your results and medicinal profiles will be automatically saved here for academic record-keeping.
              </p>
              <button
                onClick={onGoToAnalyzer}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Analyze First Leaf Specimen
              </button>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-xs text-slate-500">
              No analysis sessions matched your filter criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSessions.map((session) => {
                const isHealthy = session.healthStatus === 'healthy';

                return (
                  <div
                    key={session.id}
                    onClick={() => onSelectSession(session)}
                    className="bg-white rounded-xl p-4 border border-slate-200 hover:border-emerald-500 transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Bar: Thumbnail + Names */}
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                          {session.thumbnailUrl ? (
                            <img
                              src={session.thumbnailUrl}
                              alt={session.plantName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Leaf className="w-6 h-6 text-emerald-600" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                              {session.plantName}
                            </h4>
                            <span className="text-[10px] font-mono text-slate-400">
                              {session.savedAt}
                            </span>
                          </div>
                          <p className="text-xs italic text-slate-500 font-serif truncate">
                            {session.scientificName}
                          </p>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {session.dateStr}
                          </div>
                        </div>
                      </div>

                      {/* Confidence & Health Summary */}
                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-500">Species Confidence:</span>
                          <span className="font-bold text-emerald-700 tabular-nums">
                            {session.speciesConfidence.toFixed(1)}%
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-500">Foliar Condition:</span>
                          <span className="flex items-center gap-1 font-semibold">
                            {isHealthy ? (
                              <span className="text-emerald-700 flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                Healthy ({session.healthConfidence.toFixed(1)}%)
                              </span>
                            ) : (
                              <span className="text-amber-700 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                Diseased ({session.healthConfidence.toFixed(1)}%)
                              </span>
                            )}
                          </span>
                        </div>

                        {!isHealthy && session.diseaseName && (
                          <p className="text-[11px] font-medium text-rose-700 truncate bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                            {session.diseaseName}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-xs text-emerald-700 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        <span>Inspect Report</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>

                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleExportPdf(e, session)}
                          disabled={exportingId === session.id}
                          className="p-1.5 rounded-md text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="Download PDF Report"
                        >
                          <FileDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, session.id)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Session"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

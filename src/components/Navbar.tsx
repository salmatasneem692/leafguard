import React from 'react';
import { Leaf, Cpu, BookOpen, BarChart3, Info, History } from 'lucide-react';

interface NavbarProps {
  activeTab: 'analyzer' | 'history' | 'compendium' | 'evaluation' | 'architecture';
  setActiveTab: (tab: 'analyzer' | 'history' | 'compendium' | 'evaluation' | 'architecture') => void;
  isDemoMode: boolean;
  onOpenModelModal: () => void;
  historyCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDemoMode,
  onOpenModelModal,
  historyCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark with icon */}
          <button
            onClick={() => setActiveTab('analyzer')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:bg-emerald-700 transition-colors">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                LeafGuard AI
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-slate-400 font-mono">
                ECE-MP·2026
              </span>
            </div>
          </button>

          {/* Zone 2: Clean text navigation links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('analyzer')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'analyzer'
                  ? 'text-emerald-700 bg-emerald-50/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              Analyzer
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'text-emerald-700 bg-emerald-50/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <span>History</span>
              {historyCount > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  {historyCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('compendium')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'compendium'
                  ? 'text-emerald-700 bg-emerald-50/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              Medicinal Plants
            </button>
            <button
              onClick={() => setActiveTab('evaluation')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'evaluation'
                  ? 'text-emerald-700 bg-emerald-50/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              Evaluation & Metrics
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'architecture'
                  ? 'text-emerald-700 bg-emerald-50/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              Architecture & Guide
            </button>
          </nav>

          {/* Zone 3: Primary action / Model Connection indicator */}
          <div className="flex items-center gap-2">
            {/* Offline Edge Mode Badge */}
            <div 
              title="Runs on-device client-side inference without cloud dependency"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Offline Edge Mode Ready</span>
            </div>

            <button
              onClick={onOpenModelModal}
              title="Click to view model loading status and integration guide"
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium border rounded-md transition-all whitespace-nowrap bg-amber-50/80 border-amber-300 text-amber-900 hover:bg-amber-100"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>{isDemoMode ? 'Demo Mode' : 'Keras Model Loaded'}</span>
              <Info className="w-3.5 h-3.5 text-amber-700" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`py-1 px-2 rounded font-medium ${
              activeTab === 'analyzer' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600'
            }`}
          >
            Analyzer
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-1 px-2 rounded font-medium ${
              activeTab === 'history' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600'
            }`}
          >
            History {historyCount > 0 ? `(${historyCount})` : ''}
          </button>
          <button
            onClick={() => setActiveTab('compendium')}
            className={`py-1 px-2 rounded font-medium ${
              activeTab === 'compendium' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600'
            }`}
          >
            Plants
          </button>
          <button
            onClick={() => setActiveTab('evaluation')}
            className={`py-1 px-2 rounded font-medium ${
              activeTab === 'evaluation' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600'
            }`}
          >
            Metrics
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-1 px-2 rounded font-medium ${
              activeTab === 'architecture' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600'
            }`}
          >
            Docs
          </button>
        </div>
      </div>
    </header>
  );
};


import React, { useState } from 'react';
import { Cpu, Menu, X } from 'lucide-react';

export type NavTabId = 'home' | 'dashboard' | 'identify' | 'disease' | 'library' | 'about' | 'team';

interface NavbarProps {
  activeTab: NavTabId;
  setActiveTab: (tab: NavTabId) => void;
  isDemoMode: boolean;
  onOpenModelModal: () => void;
  historyCount?: number;
}

const NAV_ITEMS: Array<{ id: NavTabId; label: string }> = [
  { id: 'home', label: 'Home' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'identify', label: 'Plant Identification' },
  { id: 'disease', label: 'Disease Detection' },
  { id: 'library', label: 'Plant Library' },
  { id: 'about', label: 'About' },
  { id: 'team', label: 'Meet Our Team' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDemoMode,
  onOpenModelModal,
  historyCount = 0,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSelectTab = (tab: NavTabId) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 glass-surface border-b border-[#123D2A]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Bespoke Leaf + AI Neural Logo & Clean Single-Line Wordmark */}
          <button
            type="button"
            onClick={() => handleSelectTab('home')}
            className="flex items-center gap-2.5 text-left group cursor-pointer shrink-0 whitespace-nowrap"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#123D2A] to-[#16A36A] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              {/* Custom Botanical Leaf + AI Neural Circuit SVG */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="text-white"
              >
                <path
                  d="M19 4C12 4 6.5 7.5 5 14C4.5 16.2 5.3 18.5 7 19.8C8.3 20.8 10.2 21 12 20.5C17.5 19 20 13.5 20 6.5V4H19Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 19C9 15.5 12.5 12 17 8.5"
                  stroke="#E8F5EC"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <circle cx="13" cy="11.5" r="1.5" fill="#E8F5EC" />
                <circle cx="16.5" cy="8.5" r="1.3" fill="#E8F5EC" />
                <circle cx="9.5" cy="14.8" r="1.3" fill="#E8F5EC" />
              </svg>
            </div>
            <span className="text-lg font-extrabold tracking-tight text-[#123D2A] group-hover:text-[#16A36A] transition-colors whitespace-nowrap">
              LeafGuard AI
            </span>
          </button>

          {/* Zone 2: Responsive Single-Line Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectTab(item.id)}
                  className={`px-2.5 py-2 text-xs xl:text-sm font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1 ${
                    isActive
                      ? 'bg-[#E8F5EC] text-[#123D2A] font-semibold'
                      : 'text-[#18251E]/75 hover:text-[#123D2A] hover:bg-[#E8F5EC]/50'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.id === 'dashboard' && historyCount > 0 && (
                    <span className="text-[10px] font-mono font-bold text-[#16A36A] tabular-nums">
                      ({historyCount})
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Model Status Action + Mobile Hamburger */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenModelModal}
              title="Inspect ML backend connection status (Flask Keras vs Simulation)"
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                isDemoMode
                  ? 'bg-[#E8F5EC] border-[#16A36A]/30 text-[#123D2A] hover:bg-[#d8efe0]'
                  : 'bg-[#123D2A] border-[#123D2A] text-white hover:bg-[#175138]'
              }`}
            >
              <Cpu className={`w-3.5 h-3.5 ${isDemoMode ? 'text-[#16A36A]' : 'text-[#E8F5EC]'}`} />
              <span>{isDemoMode ? 'Model Status · Demo' : 'Keras Live Connected'}</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="lg:hidden p-2 rounded-xl border border-[#123D2A]/15 bg-white text-[#123D2A] hover:bg-[#E8F5EC] transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Tablet & Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-3 border-t border-[#123D2A]/10 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectTab(item.id)}
                  className={`px-3 py-2.5 text-xs font-semibold rounded-lg text-left transition-colors cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'bg-[#123D2A] text-white'
                      : 'bg-white text-[#18251E] border border-[#123D2A]/10 hover:bg-[#E8F5EC]'
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  {item.id === 'dashboard' && historyCount > 0 && (
                    <span className="font-mono text-[10px] opacity-80 tabular-nums">
                      {historyCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
};

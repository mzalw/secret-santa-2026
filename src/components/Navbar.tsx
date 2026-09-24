import React from 'react';
import { ActiveTab } from '../types';
import { Gift, DollarSign, Shuffle, Heart, ShieldCheck, Type, Eye } from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isDrawn: boolean;
  officialBudget: number | null;
  largeFont: boolean;
  setLargeFont: React.Dispatch<React.SetStateAction<boolean>>;
  highContrast: boolean;
  setHighContrast: React.Dispatch<React.SetStateAction<boolean>>;
  onOpenHelp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDrawn,
  officialBudget,
  largeFont,
  setLargeFont,
  highContrast,
  setHighContrast,
  onOpenHelp,
}) => {
  const navItems = [
    {
      id: 'reveal' as ActiveTab,
      label: 'Tajny podgląd (PIN)',
      desc: 'Dla każdego',
      icon: Gift,
      highlight: true,
    },
    {
      id: 'budget' as ActiveTab,
      label: 'Budżet prezentu',
      desc: officialBudget ? `${officialBudget} zł` : 'Głosowanie',
      icon: DollarSign,
    },
    {
      id: 'draw' as ActiveTab,
      label: 'Pary i losowanie',
      desc: isDrawn ? 'Wylosowano' : '6 par',
      icon: Shuffle,
    },
    {
      id: 'wishlist' as ActiveTab,
      label: 'Lista życzeń',
      desc: 'Pomysły na prezent',
      icon: Heart,
    },
    {
      id: 'admin' as ActiveTab,
      label: 'Panel organizatora',
      desc: 'Tabela i SMS',
      icon: ShieldCheck,
    },
  ];

  return (
    <header className={`sticky top-0 z-40 border-b shadow-xs transition-colors ${
      highContrast 
        ? 'bg-black text-white border-yellow-400' 
        : 'bg-white text-slate-900 border-slate-200'
    }`}>
      {/* Top bar contract: Brand, Accessibility Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Zone: single text element */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-700 flex items-center justify-center text-white shadow-sm font-bold text-xl">
            🎅
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-red-800 dark:text-red-400">
              Losowanie prezentów u Zalewskich 2026
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
              Rodzinne losowanie prezentów · 6 par małżeńskich
            </p>
          </div>
        </div>

        {/* Accessibility & Help Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Large font toggle */}
          <button
            onClick={() => setLargeFont(prev => !prev)}
            type="button"
            aria-pressed={largeFont}
            className={`min-h-[44px] px-3.5 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 border transition-all cursor-pointer ${
              largeFont
                ? 'bg-amber-100 text-amber-950 border-amber-400 font-bold'
                : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
            }`}
            title="Powiększ czcionkę dla lepszej czytelności"
          >
            <Type className="w-4 h-4" />
            <span>{largeFont ? 'Duża czcionka: WŁ' : 'Powiększ tekst'}</span>
          </button>

          {/* High contrast toggle */}
          <button
            onClick={() => setHighContrast(prev => !prev)}
            type="button"
            aria-pressed={highContrast}
            className={`min-h-[44px] px-3.5 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 border transition-all cursor-pointer ${
              highContrast
                ? 'bg-yellow-300 text-black border-yellow-500 font-black'
                : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
            }`}
            title="Włącz wysoki kontrast (dla osób słabowidzących)"
          >
            <Eye className="w-4 h-4" />
            <span>{highContrast ? 'Kontrast: WŁ' : 'Wysoki kontrast'}</span>
          </button>

          {/* How to run info */}
          <button
            onClick={onOpenHelp}
            type="button"
            className="min-h-[44px] px-3.5 py-2 rounded-lg font-semibold text-sm bg-emerald-700 text-white hover:bg-emerald-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <span>Instrukcja i Kod</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation - Large senior-friendly touch buttons */}
      <nav className={`border-t px-2 sm:px-6 py-2 overflow-x-auto ${
        highContrast ? 'bg-slate-900 border-yellow-400/50' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center gap-2 min-w-max pb-1 sm:pb-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                type="button"
                className={`min-h-[50px] px-4 py-2.5 rounded-xl font-bold flex items-center gap-2.5 transition-all cursor-pointer text-left ${
                  isActive
                    ? highContrast
                      ? 'bg-yellow-400 text-black ring-2 ring-white font-black'
                      : 'bg-red-700 text-white shadow-md'
                    : highContrast
                      ? 'text-white hover:bg-slate-800 border border-slate-700'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? (highContrast ? 'text-black' : 'text-white') : 'text-red-700'}`} />
                <div className="whitespace-nowrap">
                  <div className={`${largeFont ? 'text-base sm:text-lg' : 'text-sm sm:text-base'} font-bold leading-tight`}>
                    {item.label}
                  </div>
                  <div className={`text-xs ${isActive ? (highContrast ? 'text-slate-900' : 'text-rose-100') : 'text-slate-500'}`}>
                    {item.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};

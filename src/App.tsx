import React, { useState, useEffect } from 'react';
import { SecretSantaState, ActiveTab, Participant } from './types';
import { INITIAL_STATE } from './data/initialData';
import { loadSavedState, saveCurrentState } from './utils/storage';
import { Navbar } from './components/Navbar';
import { BudgetVotingStep } from './components/BudgetVotingStep';
import { ParticipantsAndDrawStep } from './components/ParticipantsAndDrawStep';
import { SecretRevealStep } from './components/SecretRevealStep';
import { WishlistStep } from './components/WishlistStep';
import { AdminTableStep } from './components/AdminTableStep';
import { HowToRunModal } from './components/HowToRunModal';
import { Gift, Sparkles, Users, Coins, Heart, Lock } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<SecretSantaState>(() => loadSavedState());
  const [activeTab, setActiveTab] = useState<ActiveTab>('reveal');
  const [largeFont, setLargeFont] = useState<boolean>(() => appState.largeFont || false);
  const [highContrast, setHighContrast] = useState<boolean>(() => appState.highContrast || false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // Sync state to localStorage
  useEffect(() => {
    saveCurrentState({
      ...appState,
      largeFont,
      highContrast,
    });
  }, [appState, largeFont, highContrast]);

  // Handler for updating a single participant's budget vote
  const handleUpdateVote = (participantId: string, vote: number) => {
    setAppState(prev => ({
      ...prev,
      participants: prev.participants.map(p =>
        p.id === participantId ? { ...p, budgetVote: vote } : p
      ),
    }));
  };

  // Handler for setting official budget
  const handleSetOfficialBudget = (amount: number) => {
    setAppState(prev => ({
      ...prev,
      officialBudget: amount,
    }));
  };

  // Handler for saving draw results
  const handleSaveDraw = (assignments: Record<string, string>) => {
    const now = new Date().toLocaleString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    setAppState(prev => ({
      ...prev,
      assignments,
      isDrawn: true,
      drawnAt: now,
      // reset secret viewed status on new draw
      participants: prev.participants.map(p => ({
        ...p,
        hasViewedSecret: false,
      })),
    }));
  };

  // Handler for marking secret as viewed
  const handleMarkAsViewed = (participantId: string) => {
    setAppState(prev => ({
      ...prev,
      participants: prev.participants.map(p =>
        p.id === participantId ? { ...p, hasViewedSecret: true } : p
      ),
    }));
  };

  // Handler for updating wishlist
  const handleUpdateWishes = (participantId: string, wishes: string[]) => {
    setAppState(prev => ({
      ...prev,
      participants: prev.participants.map(p =>
        p.id === participantId ? { ...p, wishes } : p
      ),
    }));
  };

  // Handler for restoring full state from JSON
  const handleRestoreState = (restored: SecretSantaState) => {
    setAppState(restored);
  };

  // Count participants who viewed their secret
  const viewedCount = appState.participants.filter(p => p.hasViewedSecret).length;

  return (
    <div className={`min-h-screen transition-colors ${
      highContrast
        ? 'bg-black text-white font-sans'
        : 'bg-[#faf7f5] text-slate-900 font-sans'
    } ${largeFont ? 'text-lg' : 'text-base'}`}>
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDrawn={appState.isDrawn}
        officialBudget={appState.officialBudget}
        largeFont={largeFont}
        setLargeFont={setLargeFont}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Festive Hero Banner */}
        <div className={`relative overflow-hidden rounded-3xl mb-8 border-2 transition-all ${
          highContrast
            ? 'bg-slate-950 border-yellow-400 text-white'
            : 'bg-gradient-to-r from-red-900 via-rose-900 to-emerald-950 text-white border-red-800 shadow-md'
        }`}>
          {/* Background image overlay */}
          <div className="absolute inset-0 opacity-25 mix-blend-overlay pointer-events-none">
            <img
              src="/src/assets/images/secret_santa_header_1790243844654.jpg"
              alt="Świąteczny nastrój i prezenty"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback graceful hide if missing
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 text-xs sm:text-sm font-semibold tracking-wide">
                <span>🎄 Rodzinny Secret Santa 2026</span>
                <span aria-hidden="true">·</span>
                <span>Prosty & Dyskretny</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-serif text-white">
                Magiczne Losowanie Prezentów
              </h2>
              <p className="text-slate-200 text-base sm:text-lg max-w-xl">
                Aplikacja przygotowana specjalnie dla naszej rodziny (12 osób w 6 parach).
                Wysoki kontrast, duże przyciski, wykluczenie małżonków i pełna dyskrecja!
              </p>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-2 gap-3 w-full md:w-auto shrink-0">
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
                <div className="text-xs uppercase font-bold tracking-wider text-rose-200">
                  Uczestnicy
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                  12 osób
                </div>
                <div className="text-xs text-slate-300">
                  6 par małżeńskich
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
                <div className="text-xs uppercase font-bold tracking-wider text-rose-200">
                  Budżet
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-300 tabular-nums">
                  {appState.officialBudget ? `${appState.officialBudget} zł` : 'Do ustalenia'}
                </div>
                <div className="text-xs text-slate-300">
                  {appState.isDrawn ? 'Wylosowano pary' : 'Oczekuje'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content Rendering */}
        {activeTab === 'reveal' && (
          <SecretRevealStep
            participants={appState.participants}
            assignments={appState.assignments}
            isDrawn={appState.isDrawn}
            officialBudget={appState.officialBudget}
            onMarkAsViewed={handleMarkAsViewed}
            onGoToDraw={() => setActiveTab('draw')}
            largeFont={largeFont}
            highContrast={highContrast}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetVotingStep
            participants={appState.participants}
            officialBudget={appState.officialBudget}
            onUpdateVote={handleUpdateVote}
            onSetOfficialBudget={handleSetOfficialBudget}
            onNextStep={() => setActiveTab('draw')}
            largeFont={largeFont}
            highContrast={highContrast}
          />
        )}

        {activeTab === 'draw' && (
          <ParticipantsAndDrawStep
            participants={appState.participants}
            assignments={appState.assignments}
            isDrawn={appState.isDrawn}
            drawnAt={appState.drawnAt}
            onSaveDraw={handleSaveDraw}
            onGoToSecretReveal={() => setActiveTab('reveal')}
            largeFont={largeFont}
            highContrast={highContrast}
          />
        )}

        {activeTab === 'wishlist' && (
          <WishlistStep
            participants={appState.participants}
            onUpdateWishes={handleUpdateWishes}
            largeFont={largeFont}
            highContrast={highContrast}
          />
        )}

        {activeTab === 'admin' && (
          <AdminTableStep
            appState={appState}
            onRestoreState={handleRestoreState}
            largeFont={largeFont}
            highContrast={highContrast}
          />
        )}
      </main>

      {/* Footer */}
      <footer className={`mt-16 border-t py-8 text-center transition-colors ${
        highContrast
          ? 'bg-black text-slate-400 border-yellow-400/40'
          : 'bg-white text-slate-600 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 text-sm space-y-2">
          <p className="font-bold text-slate-800 dark:text-slate-200">
            Świąteczne Losowanie Prezentów (Secret Santa) dla Rodziny
          </p>
          <p className="text-xs text-slate-500">
            Michał & Dominika · Rafał & Izabela · Ula & Przemek · Stanisław & Janina · Paweł & Dorota · Joanna & Tomek
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsHelpOpen(true)}
              className="text-xs font-semibold text-red-700 dark:text-red-400 hover:underline cursor-pointer"
            >
              Jak uruchomić aplikację? Instrukcja instalacji i obsługi
            </button>
          </div>
        </div>
      </footer>

      {/* How to run modal */}
      <HowToRunModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        largeFont={largeFont}
        highContrast={highContrast}
      />
    </div>
  );
}

import React, { useState } from 'react';
import { Participant } from '../types';
import { Coins, Check, Calculator, UserCheck, ArrowRight, Sparkles } from 'lucide-react';

interface BudgetVotingStepProps {
  participants: Participant[];
  officialBudget: number | null;
  onUpdateVote: (participantId: string, vote: number) => void;
  onSetOfficialBudget: (amount: number) => void;
  onNextStep: () => void;
  largeFont: boolean;
  highContrast: boolean;
}

export const BudgetVotingStep: React.FC<BudgetVotingStepProps> = ({
  participants,
  officialBudget,
  onUpdateVote,
  onSetOfficialBudget,
  onNextStep,
  largeFont,
  highContrast,
}) => {
  const [selectedVoterId, setSelectedVoterId] = useState<string>(participants[0]?.id || '');
  const [customAmount, setCustomAmount] = useState<number>(150);
  const [adminCustomBudget, setAdminCustomBudget] = useState<number>(officialBudget || 150);
  const [showSavedFeedback, setShowSavedFeedback] = useState<boolean>(false);

  const selectedVoter = participants.find(p => p.id === selectedVoterId);

  // Quick preset buttons
  const presets = [50, 100, 120, 150, 200, 250];

  // Calculate statistics
  const votedParticipants = participants.filter(p => p.budgetVote !== null && p.budgetVote > 0);
  const totalVotes = votedParticipants.length;
  const sum = votedParticipants.reduce((acc, p) => acc + (p.budgetVote || 0), 0);
  const average = totalVotes > 0 ? Math.round(sum / totalVotes) : 150;

  // Sorted values for median
  const sortedVotes = [...votedParticipants.map(p => p.budgetVote || 0)].sort((a, b) => a - b);
  const median = sortedVotes.length > 0
    ? sortedVotes[Math.floor(sortedVotes.length / 2)]
    : 150;

  const handleVoteSubmit = (amount: number) => {
    if (!selectedVoterId) return;
    onUpdateVote(selectedVoterId, amount);
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className={`p-6 rounded-2xl border ${
        highContrast
          ? 'bg-slate-900 border-yellow-400 text-white'
          : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-950'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Coins className="w-8 h-8" />
            </div>
            <div>
              <h2 className={`${largeFont ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} font-bold`}>
                Krok 1: Głosowanie nad budżetem prezentu
              </h2>
              <p className={`${largeFont ? 'text-lg' : 'text-base'} text-slate-700 dark:text-slate-300 mt-1`}>
                Każdy z 12 członków rodziny podaje swoją propozycję. Aplikacja natychmiast wylicza średnią, aby ustalić uczciwy limit dla każdego!
              </p>
            </div>
          </div>

          {officialBudget && (
            <div className={`px-6 py-3 rounded-xl border text-center shrink-0 ${
              highContrast
                ? 'bg-yellow-400 text-black border-white font-black'
                : 'bg-emerald-700 text-white border-emerald-800 shadow-md'
            }`}>
              <div className="text-xs uppercase tracking-wider font-semibold opacity-90">
                Obowiązujący limit
              </div>
              <div className="text-3xl font-black tabular-nums">
                {officialBudget} zł
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Voting Box */}
        <div className={`lg:col-span-7 p-6 rounded-2xl border ${
          highContrast
            ? 'bg-black border-yellow-400 text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}>
          <h3 className={`${largeFont ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'} font-bold mb-4 flex items-center gap-2 text-red-700 dark:text-red-400`}>
            <UserCheck className="w-6 h-6" />
            Oddaj swój głos na kwotę prezentu
          </h3>

          {/* Voter selector */}
          <div className="mb-6">
            <label className={`block font-bold mb-2 ${largeFont ? 'text-lg' : 'text-base'}`}>
              Wybierz swoje imię z listy:
            </label>
            <select
              value={selectedVoterId}
              onChange={(e) => {
                setSelectedVoterId(e.target.value);
                const p = participants.find(item => item.id === e.target.value);
                if (p?.budgetVote) setCustomAmount(p.budgetVote);
              }}
              className={`w-full min-h-[54px] px-4 py-3 rounded-xl font-bold border-2 transition-all cursor-pointer ${
                largeFont ? 'text-xl' : 'text-lg'
              } ${
                highContrast
                  ? 'bg-slate-900 text-white border-yellow-400'
                  : 'bg-slate-50 text-slate-900 border-slate-300 focus:border-red-600 focus:bg-white'
              }`}
            >
              {participants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.pairTitle}) — {p.budgetVote ? `Obecny głos: ${p.budgetVote} zł` : 'Jeszcze nie głosował(a)'}
                </option>
              ))}
            </select>
          </div>

          {/* Quick preset amount buttons */}
          <div className="mb-6">
            <label className={`block font-bold mb-3 ${largeFont ? 'text-lg' : 'text-base'}`}>
              Wybierz kwotę jednym kliknięciem:
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {presets.map((amount) => {
                const isCurrentVote = selectedVoter?.budgetVote === amount;
                return (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => {
                      setCustomAmount(amount);
                      handleVoteSubmit(amount);
                    }}
                    className={`min-h-[56px] px-3 py-3 rounded-xl font-black text-lg sm:text-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isCurrentVote
                        ? highContrast
                          ? 'bg-yellow-400 text-black border-white ring-2 ring-yellow-400'
                          : 'bg-emerald-600 text-white border-emerald-700 shadow-md'
                        : highContrast
                          ? 'bg-slate-900 text-white border-slate-600 hover:border-yellow-400'
                          : 'bg-slate-100 text-slate-900 border-slate-300 hover:bg-red-50 hover:border-red-500'
                    }`}
                  >
                    <span>{amount}</span>
                    <span className="text-xs font-semibold">zł</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom amount input with +/- steppers */}
          <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <label className={`block font-bold mb-2 ${largeFont ? 'text-lg' : 'text-base'}`}>
              Lub wpisz inną własną kwotę (zł):
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCustomAmount(prev => Math.max(10, prev - 10))}
                className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-900 dark:text-white font-black text-2xl flex items-center justify-center cursor-pointer"
              >
                -
              </button>
              <input
                type="number"
                min="10"
                step="5"
                value={customAmount}
                onChange={(e) => setCustomAmount(Number(e.target.value) || 0)}
                className={`flex-1 min-h-[56px] text-center font-black rounded-xl border-2 px-4 py-2 ${
                  largeFont ? 'text-2xl' : 'text-xl'
                } ${
                  highContrast
                    ? 'bg-black text-yellow-300 border-yellow-400'
                    : 'bg-white text-slate-900 border-slate-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setCustomAmount(prev => prev + 10)}
                className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-900 dark:text-white font-black text-2xl flex items-center justify-center cursor-pointer"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => handleVoteSubmit(customAmount)}
                className="min-h-[56px] px-6 rounded-xl font-bold bg-red-700 hover:bg-red-800 text-white cursor-pointer shadow-sm"
              >
                Zapisz
              </button>
            </div>
          </div>

          {showSavedFeedback && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-100 text-emerald-950 font-bold border border-emerald-300 flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-700" />
              <span>Głos dla osoby {selectedVoter?.name} ({customAmount} zł) został zapisany!</span>
            </div>
          )}

          {/* Quick instructions for seniors */}
          <div className="text-sm text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-slate-800 p-3.5 rounded-xl border border-blue-200 dark:border-slate-700">
            💡 <strong>Wskazówka:</strong> Wystarczy wybrać swoje imię i nacisnąć jeden z dużych kafelków z kwotą (np. 150 zł). Głos zapisuje się automatycznie!
          </div>
        </div>

        {/* Right Column: Statistics & Official Budget Decider */}
        <div className="lg:col-span-5 space-y-6">
          {/* Summary Box */}
          <div className={`p-6 rounded-2xl border ${
            highContrast
              ? 'bg-black border-yellow-400 text-white'
              : 'bg-white border-slate-200 text-slate-900 shadow-sm'
          }`}>
            <h3 className={`${largeFont ? 'text-xl' : 'text-lg'} font-bold mb-4 flex items-center gap-2 text-emerald-700 dark:text-emerald-400`}>
              <Calculator className="w-6 h-6" />
              Podsumowanie propozycji rodziny
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Średnia głosów
                </div>
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {average} zł
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Mediana (środek)
                </div>
                <div className="text-3xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
                  {median} zł
                </div>
              </div>
            </div>

            <div className="mb-5 text-sm font-medium text-slate-600 dark:text-slate-300">
              Oddano głosów: <strong className="text-slate-900 dark:text-white">{totalVotes} z {participants.length} osób</strong>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(totalVotes / participants.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Admin Decider Box */}
            <div className="p-4 rounded-xl border-2 border-dashed border-red-300 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20">
              <h4 className="font-bold text-red-900 dark:text-red-300 mb-2 flex items-center gap-2 text-base">
                <Sparkles className="w-5 h-5 text-red-600" />
                Zatwierdź oficjalny wspólny limit
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                Wspólnie ustalona kwota będzie widoczna przy losowaniu i na liście życzeń każdego uczestnika.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={adminCustomBudget}
                  onChange={(e) => setAdminCustomBudget(Number(e.target.value) || 0)}
                  className="w-28 min-h-[48px] px-3 py-2 rounded-lg font-black text-xl text-center border-2 border-slate-300 bg-white dark:bg-slate-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => onSetOfficialBudget(adminCustomBudget)}
                  className="flex-1 min-h-[48px] px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg cursor-pointer transition-colors shadow-xs"
                >
                  Ustaw jako Oficjalny ({adminCustomBudget} zł)
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAdminCustomBudget(average);
                  onSetOfficialBudget(average);
                }}
                className="w-full mt-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:underline text-center cursor-pointer"
              >
                Użyj dokładnie wyliczonej średniej ({average} zł)
              </button>
            </div>
          </div>

          {/* List of current votes */}
          <div className={`p-4 rounded-2xl border ${
            highContrast
              ? 'bg-black border-yellow-400 text-white'
              : 'bg-white border-slate-200 text-slate-900 shadow-sm'
          }`}>
            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-3">
              Kto ile zaproponował:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-between"
                >
                  <span className="font-semibold truncate mr-1">{p.name}:</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                    {p.budgetVote ? `${p.budgetVote} zł` : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Next step button */}
          <button
            type="button"
            onClick={onNextStep}
            className="w-full min-h-[56px] px-6 py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white font-black text-lg flex items-center justify-center gap-3 shadow-md cursor-pointer transition-all"
          >
            <span>Przejdź do losowania par</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

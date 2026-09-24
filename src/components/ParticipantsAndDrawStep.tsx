import React, { useState } from 'react';
import { Participant } from '../types';
import { generateSecretSantaDraw, verifyDrawAssignments } from '../utils/drawAlgorithm';
import { Shuffle, Users, CheckCircle2, AlertTriangle, ArrowRight, Sparkles, Lock, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ParticipantsAndDrawStepProps {
  participants: Participant[];
  assignments: Record<string, string>;
  isDrawn: boolean;
  drawnAt: string | null;
  onSaveDraw: (newAssignments: Record<string, string>) => void;
  onGoToSecretReveal: () => void;
  largeFont: boolean;
  highContrast: boolean;
}

export const ParticipantsAndDrawStep: React.FC<ParticipantsAndDrawStepProps> = ({
  participants,
  assignments,
  isDrawn,
  drawnAt,
  onSaveDraw,
  onGoToSecretReveal,
  largeFont,
  highContrast,
}) => {
  const [isRolling, setIsRolling] = useState(false);
  const [showConfirmRedraw, setShowConfirmRedraw] = useState(false);
  const [validationStatus, setValidationStatus] = useState<{ valid: boolean; errors: string[] } | null>(null);

  // Group participants by pair
  const pairsMap: Record<number, { title: string; members: Participant[] }> = {};
  for (const p of participants) {
    if (!pairsMap[p.pairId]) {
      pairsMap[p.pairId] = { title: p.pairTitle, members: [] };
    }
    pairsMap[p.pairId].members.push(p);
  }

  const handleStartDraw = () => {
    setIsRolling(true);

    setTimeout(() => {
      const result = generateSecretSantaDraw(participants, true);

      if (result) {
        const verify = verifyDrawAssignments(participants, result);
        setValidationStatus(verify);
        onSaveDraw(result);

        // Fire celebratory holiday confetti
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#b91c1c', '#15803d', '#eab308', '#ffffff'],
          });
        } catch {
          // ignore if canvas not supported
        }
      } else {
        alert('Nie udało się znaleźć poprawnego losowania z zachowaniem reguł. Spróbuj ponownie.');
      }

      setIsRolling(false);
      setShowConfirmRedraw(false);
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className={`p-6 rounded-2xl border ${
        highContrast
          ? 'bg-slate-900 border-yellow-400 text-white'
          : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-950'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-700 text-white flex items-center justify-center shrink-0 shadow-md">
              <Shuffle className="w-8 h-8" />
            </div>
            <div>
              <h2 className={`${largeFont ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} font-bold`}>
                Krok 2: Baza uczestników i losowanie z wykluczeniami
              </h2>
              <p className={`${largeFont ? 'text-lg' : 'text-base'} text-slate-700 dark:text-slate-300 mt-1`}>
                W losowaniu bierze udział 12 osób podzielonych na 6 małżeństw/par. Algorytm bezwzględnie pilnuje, aby mąż i żona nie kupowali sobie nawzajem prezentu!
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {isDrawn ? (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-xs">
                <CheckCircle2 className="w-5 h-5" />
                <span>Losowanie aktywne!</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-sm shadow-xs">
                <Sparkles className="w-5 h-5" />
                <span>Oczekuje na start</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rules Notice Box */}
      <div className={`p-5 rounded-2xl border-2 ${
        highContrast
          ? 'bg-black border-yellow-400 text-white'
          : 'bg-white border-slate-300 text-slate-900'
      }`}>
        <h3 className={`${largeFont ? 'text-xl' : 'text-lg'} font-black mb-3 text-red-800 dark:text-red-400 flex items-center gap-2`}>
          <Lock className="w-5 h-5 text-red-600" />
          Ścisłe reguły losowania rodzinnego (Gwarancja matematyczna):
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
            <span className="text-xl">🚫</span>
            <div>
              <strong className="block font-bold">1. Brak losowania siebie</strong>
              <span className="text-xs text-slate-600 dark:text-slate-400">Nikt nie może wylosować własnej osoby.</span>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
            <span className="text-xl">💍</span>
            <div>
              <strong className="block font-bold">2. Wykluczenie partnera</strong>
              <span className="text-xs text-slate-600 dark:text-slate-400">Mąż nigdy nie wylosuje żony, a żona męża.</span>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
            <span className="text-xl">🎁</span>
            <div>
              <strong className="block font-bold">3. Dokładnie 1 prezent</strong>
              <span className="text-xs text-slate-600 dark:text-slate-400">Każdy kupuje 1 prezent i każdy dostaje 1 prezent.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of the 6 Pairs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`${largeFont ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'} font-bold flex items-center gap-2`}>
            <Users className="w-6 h-6 text-red-700" />
            Zdefiniowane pary w rodzinie (12 osób):
          </h3>
          <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold">
            6 par małżeńskich
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(pairsMap).map(([pairId, pairData]) => (
            <div
              key={pairId}
              className={`p-5 rounded-2xl border-2 transition-all ${
                highContrast
                  ? 'bg-black border-yellow-400 text-white'
                  : 'bg-white border-slate-200 hover:border-red-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
                <span className="font-bold text-sm text-red-700 dark:text-red-400 uppercase tracking-wide">
                  {pairData.title}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  Wykluczeni wzajemnie
                </span>
              </div>

              <div className="flex items-center justify-around gap-2 py-2">
                {pairData.members.map((member, idx) => (
                  <React.Fragment key={member.id}>
                    <div className="text-center flex-1">
                      <div className={`w-12 h-12 mx-auto rounded-full ${member.avatarBg || 'bg-slate-600'} text-white font-black text-lg flex items-center justify-center shadow-xs mb-1.5`}>
                        {member.name.charAt(0)}
                      </div>
                      <div className={`font-black ${largeFont ? 'text-lg' : 'text-base'}`}>
                        {member.name}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        PIN: {member.pin}
                      </div>
                    </div>

                    {idx === 0 && (
                      <div className="text-rose-500 font-bold text-lg px-1" title="Para / Małżeństwo">
                        ❤️
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Draw Action Box */}
      <div className={`p-8 rounded-3xl text-center border-3 ${
        highContrast
          ? 'bg-black border-yellow-400 text-white'
          : isDrawn
            ? 'bg-gradient-to-b from-emerald-50 to-teal-50 border-emerald-300 text-emerald-950'
            : 'bg-gradient-to-b from-red-50 to-orange-50 border-red-300 text-red-950'
      } shadow-md`}>
        {!isDrawn ? (
          <div className="max-w-xl mx-auto space-y-4">
            <h3 className={`${largeFont ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} font-black`}>
              Wszystko gotowe do losowania!
            </h3>
            <p className={`${largeFont ? 'text-lg' : 'text-base'} text-slate-700 dark:text-slate-300`}>
              Kliknij poniższy przycisk, aby natychmiast przypisać w tajemnicy pary prezentowe z wykluczeniem partnerów.
            </p>

            <button
              type="button"
              disabled={isRolling}
              onClick={handleStartDraw}
              className={`w-full min-h-[64px] px-8 py-4 rounded-2xl bg-red-700 hover:bg-red-800 active:scale-[0.99] text-white font-black text-xl sm:text-2xl shadow-xl flex items-center justify-center gap-3 cursor-pointer transition-all ${
                isRolling ? 'opacity-80 cursor-wait' : ''
              }`}
            >
              {isRolling ? (
                <>
                  <RefreshCw className="w-7 h-7 animate-spin" />
                  <span>Trwa losowanie świąteczne...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-7 h-7" />
                  <span>Rozpocznij Świąteczne Losowanie!</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className={`${largeFont ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} font-black text-emerald-800 dark:text-emerald-400`}>
              Losowanie zakończone sukcesem!
            </h3>
            <p className={`${largeFont ? 'text-lg' : 'text-base'} text-slate-700 dark:text-slate-300`}>
              Każdy z 12 uczestników ma już wylosowaną osobę. Nikt nie wylosował siebie ani swojego partnera.
              {drawnAt && <span className="block text-xs text-slate-500 mt-1">Data losowania: {drawnAt}</span>}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onGoToSecretReveal}
                className="w-full sm:w-auto min-h-[56px] px-8 py-3.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-black text-lg flex items-center justify-center gap-2 shadow-md cursor-pointer transition-transform"
              >
                <span>Przejdź do Tajnego Podglądu (PIN)</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setShowConfirmRedraw(true)}
                className="w-full sm:w-auto min-h-[56px] px-5 py-3.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-white font-bold text-sm cursor-pointer transition-colors"
              >
                Losuj ponownie
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Re-draw confirmation modal */}
      {showConfirmRedraw && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-red-500 p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-8 h-8 shrink-0" />
              <h4 className="text-xl font-black">Czy na pewno wylosować ponownie?</h4>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Obecne wyniki losowania zostaną zastąpione nowymi parami. Jeśli ktoś już sprawdził swój los, pary ulegną zmianie!
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmRedraw(false)}
                className="min-h-[48px] px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold cursor-pointer"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={handleStartDraw}
                className="min-h-[48px] px-6 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-black cursor-pointer shadow-md"
              >
                Tak, losuj od nowa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

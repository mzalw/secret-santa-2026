import React, { useState } from 'react';
import { X, Terminal, CheckCircle2, Shield, Heart, HelpCircle, Code, Copy, Check, Download, Cloud } from 'lucide-react';

interface HowToRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  largeFont: boolean;
  highContrast: boolean;
}

export const HowToRunModal: React.FC<HowToRunModalProps> = ({
  isOpen,
  onClose,
  largeFont,
  highContrast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'streamlit' | 'react' | 'rules'>('streamlit');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedReqs, setCopiedReqs] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDownloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className={`my-8 max-w-3xl w-full rounded-3xl p-6 sm:p-8 border-2 shadow-2xl relative ${
        highContrast
          ? 'bg-black text-white border-yellow-400'
          : 'bg-white text-slate-900 border-slate-300'
      }`}>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 text-red-700 dark:text-red-400">
          <HelpCircle className="w-8 h-8" />
          <h2 className="text-2xl font-black">
            Instrukcja wdrożenia & Kod źródłowy
          </h2>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('streamlit')}
            className={`min-h-[44px] px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'streamlit'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Python & Streamlit Cloud</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('rules')}
            className={`min-h-[44px] px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'rules'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Zasady losowania & Seniorzy</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('react')}
            className={`min-h-[44px] px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'react'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Wersja Node.js / React</span>
          </button>
        </div>

        {/* Tab 1: Streamlit Cloud Guide & Code */}
        {activeSubTab === 'streamlit' && (
          <div className="space-y-5 text-sm">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200">
              <h3 className="font-black text-base flex items-center gap-2 mb-1">
                <Cloud className="w-5 h-5 text-emerald-600" />
                Gotowe pliki do wdrożenia na darmowym Streamlit Community Cloud
              </h3>
              <p className="text-xs">
                Pliki <code>main.py</code>, <code>requirements.txt</code> oraz <code>.streamlit/config.toml</code> zostały utworzone w projekcie i są w 100% gotowe do wrzucenia na GitHub i uruchomienia online!
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-red-600" />
                Jak wdrożyć krok po kroku na Streamlit Community Cloud:
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <li>Utwórz nowe darmowe repozytorium na <strong>GitHub.com</strong> (np. <code>secret-santa-rodzina</code>).</li>
                <li>Wrzuć do niego wygenerowany plik <strong>main.py</strong> oraz <strong>requirements.txt</strong>.</li>
                <li>Zaloguj się na <strong>share.streamlit.io</strong> za pomocą swojego konta GitHub.</li>
                <li>Kliknij <strong>"New app"</strong>, wskaż swoje repozytorium i kliknij <strong>"Deploy!"</strong>.</li>
                <li><strong>Google Sheets (opcjonalnie):</strong> W ustawieniach aplikacji na Streamlit Cloud (Settings &rarr; Secrets) wklej link do swojego arkusza Google, aby losowania zapisywały się trwale w chmurze!</li>
              </ol>
            </div>

            {/* Quick Actions to download or view main.py and requirements.txt */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                  📄 main.py (Kompletny kod Python + Streamlit)
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  Czysty Python 3 · Natywne komponenty · GSheetsConnection
                </span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Zawiera: pełną bazę 6 par rodzinnych, algorytm losowania z wykluczeniami partnerów, głosowanie nad budżetem, listę życzeń, tajny podgląd na PIN oraz generowanie linków SMS i WhatsApp.
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Rules & Senior info */}
        {activeSubTab === 'rules' && (
          <div className="space-y-4 text-sm">
            <h3 className="font-black text-base text-red-700 dark:text-red-400">
              Bezwzględne reguły losowania rodzinnego:
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Brak losowania siebie:</strong> Nikt nie może wylosować własnej osoby.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Wykluczenie partnera:</strong> Mąż nigdy nie wylosuje żony, a żona męża (Michał/Dominika, Rafał/Izabela, Ula/Przemek, Stanisław/Janina, Paweł/Dorota, Joanna/Tomek).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Dokładnie 1 prezent:</strong> Każda osoba daje 1 prezent i dostaje dokładnie 1 prezent.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Bezpieczny PIN:</strong> Każdy członek rodziny ma swój 4-cyfrowy PIN, dzięki czemu może bezpiecznie sprawdzić wynik na wspólnym telefonie bez psucia niespodzianki innym.</span>
              </li>
            </ul>
          </div>
        )}

        {/* Tab 3: React / Node.js Local launch */}
        {activeSubTab === 'react' && (
          <div className="space-y-4 text-sm">
            <h3 className="font-black text-base text-slate-900 dark:text-white">
              Uruchomienie wersji webowej (React + Vite):
            </h3>
            <ol className="list-decimal list-inside space-y-2 font-mono text-xs sm:text-sm">
              <li>Pobierz projekt i zainstaluj pakiety:
                <div className="p-2 my-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-emerald-300 font-bold">
                  npm install
                </div>
              </li>
              <li>Uruchom serwer developerski:
                <div className="p-2 my-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-emerald-300 font-bold">
                  npm run dev
                </div>
              </li>
              <li>Otwórz w przeglądarce: <strong>http://localhost:3000</strong>.</li>
            </ol>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Świąteczny Secret Santa dla Rodziny · Python & Node.js
          </span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[46px] px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm cursor-pointer"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};

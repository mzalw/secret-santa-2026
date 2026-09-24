import React, { useState, useRef } from 'react';
import { Participant, SecretSantaState } from '../types';
import { exportStateToJsonFile } from '../utils/storage';
import { ShieldAlert, Download, Upload, Printer, MessageCircle, Phone, Mail, Copy, Check, Eye, EyeOff, Lock } from 'lucide-react';

interface AdminTableStepProps {
  appState: SecretSantaState;
  onRestoreState: (state: SecretSantaState) => void;
  largeFont: boolean;
  highContrast: boolean;
}

export const AdminTableStep: React.FC<AdminTableStepProps> = ({
  appState,
  onRestoreState,
  largeFont,
  highContrast,
}) => {
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { participants, assignments, isDrawn, officialBudget } = appState;
  const pMap = new Map(participants.map(p => [p.id, p]));

  // Create personalized notification message for each giver
  const getPersonalMessage = (giver: Participant, receiver: Participant | undefined) => {
    if (!receiver) return '';
    const wishesText = receiver.wishes.length > 0
      ? receiver.wishes.map((w, i) => `${i + 1}. ${w}`).join('\n')
      : 'Brak wpisanych życzeń';

    return `🎁 Cześć ${giver.name}!\n\nW rodzinnym Secret Santa wylosowałeś(aś): ${receiver.name} (${receiver.pairTitle})!\n💰 Uzgodniony budżet: ${officialBudget || 150} zł.\n\n📝 Pomysły na prezent od ${receiver.name}:\n${wishesText}\n\nTwój kod PIN do tajnego podglądu w aplikacji to: ${giver.pin}\n🎄 Wesołych Świąt!`;
  };

  const handleCopyPersonalMessage = (giver: Participant, receiver: Participant | undefined) => {
    const text = getPersonalMessage(giver, receiver);
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(giver.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.participants)) {
          onRestoreState(parsed);
          alert('Pomyślnie wczytano dane losowania z pliku JSON!');
        } else {
          alert('Nieprawidłowy format pliku JSON.');
        }
      } catch (err) {
        alert('Błąd odczytu pliku JSON: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-2xl border ${
        highContrast
          ? 'bg-slate-900 border-yellow-400 text-white'
          : 'bg-gradient-to-r from-slate-900 to-slate-800 text-white border-slate-700'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h2 className={`${largeFont ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} font-bold`}>
                Krok 5: Panel Organizatora & Powiadomienia
              </h2>
              <p className={`${largeFont ? 'text-lg' : 'text-base'} text-slate-300 mt-1`}>
                Pojedyncze wysyłanie wiadomości SMS/WhatsApp, pełna tabela wyników oraz eksport/import bazy do pliku JSON.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => exportStateToJsonFile(appState)}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm flex items-center gap-1.5 cursor-pointer"
              title="Pobierz stan losowania jako plik JSON"
            >
              <Download className="w-4 h-4" />
              <span>Pobierz JSON</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm flex items-center gap-1.5 cursor-pointer"
              title="Wczytaj stan losowania z pliku JSON"
            >
              <Upload className="w-4 h-4" />
              <span>Wgraj JSON</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleJsonUpload}
              accept=".json,application/json"
              className="hidden"
            />

            <button
              type="button"
              onClick={handlePrint}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Drukuj</span>
            </button>
          </div>
        </div>
      </div>

      {/* Organizer Warning & Reveal Toggle */}
      {!isRevealed ? (
        <div className={`p-8 rounded-3xl text-center border-2 ${
          highContrast
            ? 'bg-black border-yellow-400 text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}>
          <div className="max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className={`${largeFont ? 'text-2xl' : 'text-xl'} font-black`}>
              Tabela z pełnymi wynikami jest ukryta
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Aby nie popsuć sobie niespodzianki świątecznej, tabela z przypisaniami jest domyślnie zasłonięta.
              Kliknij poniższy przycisk tylko wtedy, gdy chcesz zarządzać losowaniem lub wysłać powiadomienia rodzinie.
            </p>
            <button
              type="button"
              onClick={() => setIsRevealed(true)}
              className="min-h-[54px] px-8 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-base flex items-center justify-center gap-2 mx-auto cursor-pointer shadow-md"
            >
              <Eye className="w-5 h-5" />
              <span>Odsłoń pełną tabelę wyników</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              ⚠️ Tryb podglądu organizatora włączony
            </span>
            <button
              type="button"
              onClick={() => setIsRevealed(false)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Zasłoń tabelę</span>
            </button>
          </div>

          {!isDrawn ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <p className="text-slate-600 font-bold">
                Losowanie nie zostało jeszcze przeprowadzone. Przejdź do zakładki "Pary i losowanie" i kliknij start!
              </p>
            </div>
          ) : (
            <div className={`rounded-2xl border overflow-x-auto shadow-sm ${
              highContrast
                ? 'bg-black border-yellow-400 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className={`border-b text-xs uppercase tracking-wider font-black ${
                    highContrast ? 'bg-slate-900 text-yellow-300 border-yellow-400' : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    <th className="py-3 px-4">Dający prezent</th>
                    <th className="py-3 px-4">PIN</th>
                    <th className="py-3 px-4">Wylosowany obdarowywany</th>
                    <th className="py-3 px-4">Życzenia na prezent</th>
                    <th className="py-3 px-4">Status PIN</th>
                    <th className="py-3 px-4 text-right">Powiadomienie</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                  {participants.map((giver) => {
                    const receiverId = assignments[giver.id];
                    const receiver = pMap.get(receiverId);
                    const msg = getPersonalMessage(giver, receiver);

                    return (
                      <tr key={giver.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        {/* Giver */}
                        <td className="py-3 px-4">
                          <div className="font-black text-base">{giver.name}</div>
                          <div className="text-xs text-slate-500">{giver.pairTitle}</div>
                        </td>

                        {/* PIN */}
                        <td className="py-3 px-4 font-mono font-bold text-xs text-slate-600 dark:text-slate-400">
                          {giver.pin}
                        </td>

                        {/* Receiver */}
                        <td className="py-3 px-4">
                          {receiver ? (
                            <div>
                              <div className="font-black text-base text-red-700 dark:text-red-400">
                                🎁 {receiver.name}
                              </div>
                              <div className="text-xs text-slate-500">
                                {receiver.pairTitle}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Brak</span>
                          )}
                        </td>

                        {/* Wishes */}
                        <td className="py-3 px-4 max-w-xs">
                          {receiver && receiver.wishes.length > 0 ? (
                            <ul className="text-xs list-disc list-inside space-y-0.5 text-slate-700 dark:text-slate-300">
                              {receiver.wishes.slice(0, 3).map((w, i) => (
                                <li key={i} className="truncate">{w}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Brak życzeń</span>
                          )}
                        </td>

                        {/* Viewed Status */}
                        <td className="py-3 px-4">
                          {giver.hasViewedSecret ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                              <Check className="w-3 h-3" /> Podejrzano
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                              Nie sprawdzono
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* WhatsApp */}
                            <a
                              href={`https://wa.me/?text=${encodeURIComponent(msg)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                              title="Wyślij wiadomość przez WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>

                            {/* SMS */}
                            <a
                              href={`sms:?&body=${encodeURIComponent(msg)}`}
                              className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                              title="Wyślij wiadomość SMS"
                            >
                              <Phone className="w-4 h-4" />
                            </a>

                            {/* Mail */}
                            <a
                              href={`mailto:?subject=${encodeURIComponent('Twój wylosowany prezent świąteczny Secret Santa')}&body=${encodeURIComponent(msg)}`}
                              className="p-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white"
                              title="Wyślij e-mail"
                            >
                              <Mail className="w-4 h-4" />
                            </a>

                            {/* Copy button */}
                            <button
                              type="button"
                              onClick={() => handleCopyPersonalMessage(giver, receiver)}
                              className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-white cursor-pointer"
                              title="Kopiuj treść powiadomienia do schowka"
                            >
                              {copiedId === giver.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Participant } from '../types';
import { Lock, Eye, EyeOff, Check, AlertCircle, Share2, Copy, MessageCircle, Phone, ArrowLeft, RefreshCw, Sparkles, Heart } from 'lucide-react';

interface SecretRevealStepProps {
  participants: Participant[];
  assignments: Record<string, string>;
  isDrawn: boolean;
  officialBudget: number | null;
  onMarkAsViewed: (participantId: string) => void;
  onGoToDraw: () => void;
  largeFont: boolean;
  highContrast: boolean;
}

export const SecretRevealStep: React.FC<SecretRevealStepProps> = ({
  participants,
  assignments,
  isDrawn,
  officialBudget,
  onMarkAsViewed,
  onGoToDraw,
  largeFont,
  highContrast,
}) => {
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [showPinHint, setShowPinHint] = useState<boolean>(false);
  const [autoHideSeconds, setAutoHideSeconds] = useState<number>(30);

  const selectedPerson = participants.find(p => p.id === selectedPersonId);
  const receiverId = selectedPerson ? assignments[selectedPerson.id] : null;
  const receiver = participants.find(p => p.id === receiverId);

  // Auto-hide timer for privacy when unlocked
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isUnlocked && autoHideSeconds > 0) {
      timer = setInterval(() => {
        setAutoHideSeconds(prev => {
          if (prev <= 1) {
            handleLockAndClear();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isUnlocked, autoHideSeconds]);

  const handleSelectPerson = (id: string) => {
    setSelectedPersonId(id);
    setEnteredPin('');
    setIsUnlocked(false);
    setPinError(null);
    setShowPinHint(false);
    setAutoHideSeconds(30);
  };

  const handleNumpadPress = (digit: string) => {
    if (enteredPin.length < 6) {
      const newPin = enteredPin + digit;
      setEnteredPin(newPin);
      setPinError(null);

      // Auto-verify if 4 digits
      if (selectedPerson && newPin === selectedPerson.pin) {
        unlockSecret(selectedPerson.id);
      } else if (newPin.length >= 4) {
        if (selectedPerson && newPin !== selectedPerson.pin) {
          setPinError('Nieprawidłowy kod PIN. Spróbuj ponownie lub użyj podpowiedzi.');
        }
      }
    }
  };

  const handleBackspace = () => {
    setEnteredPin(prev => prev.slice(0, -1));
    setPinError(null);
  };

  const handleClearPin = () => {
    setEnteredPin('');
    setPinError(null);
  };

  const unlockSecret = (personId: string) => {
    setIsUnlocked(true);
    setPinError(null);
    setAutoHideSeconds(30);
    onMarkAsViewed(personId);
  };

  const handleLockAndClear = () => {
    setIsUnlocked(false);
    setEnteredPin('');
    setSelectedPersonId(null);
    setPinError(null);
    setShowPinHint(false);
    setAutoHideSeconds(30);
  };

  // Generate share message for SMS / WhatsApp
  const shareMessage = selectedPerson && receiver
    ? `🎁 Cześć ${selectedPerson.name}! W rodzinnym Secret Santa wylosowałeś(aś): ${receiver.name}!\n` +
      `💰 Limit kwotowy: ${officialBudget || 150} zł.\n` +
      `📝 Pomysły na prezent od ${receiver.name}:\n` +
      (receiver.wishes.length > 0 ? receiver.wishes.map((w, i) => `${i + 1}. ${w}`).join('\n') : 'Brak wpisanych życzeń') +
      `\n🎄 Wesołych Świąt!`
    : '';

  const handleCopyMessage = () => {
    if (!shareMessage) return;
    navigator.clipboard.writeText(shareMessage);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  // If draw not conducted yet
  if (!isDrawn) {
    return (
      <div className={`p-8 rounded-3xl text-center border-2 ${
        highContrast
          ? 'bg-black border-yellow-400 text-white'
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className={`${largeFont ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} font-black`}>
            Losowanie nie zostało jeszcze przeprowadzone!
          </h2>
          <p className={`${largeFont ? 'text-lg' : 'text-base'} text-slate-600 dark:text-slate-400`}>
            Aby każdy mógł sprawdzić w tajemnicy swoją wylosowaną osobę, najpierw należy uruchomić losowanie par.
          </p>
          <button
            type="button"
            onClick={onGoToDraw}
            className="min-h-[56px] px-8 py-3.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-black text-lg shadow-md cursor-pointer transition-all"
          >
            Przejdź do losowania
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className={`p-6 rounded-2xl border ${
        highContrast
          ? 'bg-slate-900 border-yellow-400 text-white'
          : 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-950'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-md">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h2 className={`${largeFont ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} font-bold`}>
                Krok 3: Tajny podgląd wyników z kodem PIN
              </h2>
              <p className={`${largeFont ? 'text-lg' : 'text-base'} text-slate-700 dark:text-slate-300 mt-1`}>
                Wybierz swoje imię, wpisz prosty kod PIN i zobacz tylko swój wynik. Po przeczytaniu kliknij czerwony przycisk, aby zasłonić ekran dla kolejnej osoby!
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border">
              🛡️ Dyskrecja 100%
            </span>
          </div>
        </div>
      </div>

      {/* Screen 1: Pick your name */}
      {!selectedPersonId && (
        <div className={`p-6 rounded-2xl border ${
          highContrast
            ? 'bg-black border-yellow-400 text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}>
          <h3 className={`${largeFont ? 'text-2xl' : 'text-xl'} font-black text-center mb-2`}>
            Kim jesteś? Kliknij swoje imię:
          </h3>
          <p className="text-center text-slate-600 dark:text-slate-400 text-sm mb-6">
            Każdy ma swój własny kod PIN, dzięki czemu nikt nie zobaczy Twojego wyniku.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {participants.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPerson(p.id)}
                className={`min-h-[76px] p-4 rounded-2xl border-2 transition-all cursor-pointer text-left flex items-center gap-3.5 group ${
                  highContrast
                    ? 'bg-slate-900 text-white border-yellow-400 hover:bg-yellow-400 hover:text-black'
                    : 'bg-slate-50 hover:bg-red-50 text-slate-900 border-slate-300 hover:border-red-500 shadow-xs'
                }`}
              >
                <div className={`w-12 h-12 rounded-full ${p.avatarBg || 'bg-slate-700'} text-white font-black text-lg flex items-center justify-center shrink-0 shadow-xs`}>
                  {p.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className={`font-black truncate ${largeFont ? 'text-xl' : 'text-lg'}`}>
                    {p.name}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {p.pairTitle}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Screen 2: Enter PIN */}
      {selectedPersonId && !isUnlocked && (
        <div className={`max-w-md mx-auto p-6 sm:p-8 rounded-3xl border-2 shadow-xl ${
          highContrast
            ? 'bg-black border-yellow-400 text-white'
            : 'bg-white border-slate-300 text-slate-900'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handleLockAndClear}
              className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Wróć</span>
            </button>
            <span className="text-xs font-bold text-red-700 dark:text-red-400">
              Weryfikacja tożsamości
            </span>
          </div>

          <div className="text-center mb-6">
            <div className={`w-16 h-16 mx-auto rounded-full ${selectedPerson?.avatarBg || 'bg-slate-700'} text-white font-black text-2xl flex items-center justify-center shadow-md mb-2`}>
              {selectedPerson?.name.charAt(0)}
            </div>
            <h3 className={`${largeFont ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} font-black`}>
              {selectedPerson?.name}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Wpisz 4-cyfrowy kod PIN, aby odblokować swój los:
            </p>
          </div>

          {/* PIN Display Circles */}
          <div className="flex justify-center items-center gap-3 mb-6">
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = enteredPin.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-black transition-all ${
                    isFilled
                      ? highContrast
                        ? 'bg-yellow-400 text-black border-white'
                        : 'bg-red-700 text-white border-red-800 shadow-xs'
                      : highContrast
                        ? 'bg-slate-900 border-slate-700 text-slate-500'
                        : 'bg-slate-100 border-slate-300 text-slate-400'
                  }`}
                >
                  {isFilled ? '●' : ''}
                </div>
              );
            })}
          </div>

          {pinError && (
            <div className="mb-4 p-3 rounded-xl bg-red-100 text-red-900 text-sm font-bold flex items-center gap-2 border border-red-300">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
              <span>{pinError}</span>
            </div>
          )}

          {/* Large senior-friendly Numpad */}
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleNumpadPress(digit)}
                className={`min-h-[58px] rounded-2xl font-black text-2xl transition-all cursor-pointer flex items-center justify-center border-2 ${
                  highContrast
                    ? 'bg-slate-900 text-white border-slate-700 hover:border-yellow-400 active:bg-yellow-400 active:text-black'
                    : 'bg-slate-100 hover:bg-slate-200 active:bg-red-100 text-slate-900 border-slate-200 active:border-red-500'
                }`}
              >
                {digit}
              </button>
            ))}

            <button
              type="button"
              onClick={handleClearPin}
              className="min-h-[58px] rounded-2xl font-bold text-sm bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 flex items-center justify-center cursor-pointer"
            >
              Wyczyść
            </button>

            <button
              type="button"
              onClick={() => handleNumpadPress('0')}
              className={`min-h-[58px] rounded-2xl font-black text-2xl transition-all cursor-pointer flex items-center justify-center border-2 ${
                highContrast
                  ? 'bg-slate-900 text-white border-slate-700 hover:border-yellow-400 active:bg-yellow-400 active:text-black'
                  : 'bg-slate-100 hover:bg-slate-200 active:bg-red-100 text-slate-900 border-slate-200 active:border-red-500'
              }`}
            >
              0
            </button>

            <button
              type="button"
              onClick={handleBackspace}
              className="min-h-[58px] rounded-2xl font-bold text-sm bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 flex items-center justify-center cursor-pointer"
            >
              Cofnij ⌫
            </button>
          </div>

          {/* Senior PIN Hint Toggle */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-center">
            <button
              type="button"
              onClick={() => setShowPinHint(prev => !prev)}
              className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-red-700 underline cursor-pointer"
            >
              {showPinHint ? 'Ukryj podpowiedź PIN' : '💡 Zapomniałeś PIN? Kliknij tutaj'}
            </button>

            {showPinHint && selectedPerson && (
              <div className="mt-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 text-sm font-semibold">
                Domyślny kod PIN dla <strong>{selectedPerson.name}</strong> to: <span className="font-mono text-lg font-black text-red-700 dark:text-red-400">{selectedPerson.pin}</span>
                <div className="mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEnteredPin(selectedPerson.pin);
                      unlockSecret(selectedPerson.id);
                    }}
                    className="mt-1 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-xs cursor-pointer"
                  >
                    Wpisz automatycznie i odblokuj
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Screen 3: Secret Unlocked! */}
      {selectedPerson && isUnlocked && receiver && (
        <div className={`max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl border-3 shadow-2xl relative transition-all ${
          highContrast
            ? 'bg-black border-yellow-400 text-white'
            : 'bg-white border-red-500 text-slate-900'
        }`}>
          {/* Top auto-hide bar */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold">
            <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Twój tajny los
            </span>
            <span className="text-slate-500 font-mono">
              Auto-zasłonięcie za: <strong className="text-red-600">{autoHideSeconds}s</strong>
            </span>
          </div>

          <div className="text-center space-y-3 mb-6">
            <div className="inline-block px-4 py-1 rounded-full bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 font-bold text-sm">
              🎅 Witaj, {selectedPerson.name}!
            </div>

            <p className={`${largeFont ? 'text-xl' : 'text-lg'} text-slate-600 dark:text-slate-400 font-medium`}>
              W tym roku robisz świąteczną niespodziankę dla:
            </p>

            {/* Giant Gift Receiver Reveal */}
            <div className={`p-6 sm:p-8 rounded-3xl border-3 my-4 shadow-lg ${
              highContrast
                ? 'bg-yellow-400 text-black border-white'
                : 'bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white border-red-800'
            }`}>
              <div className="text-xs uppercase font-bold tracking-widest opacity-90 mb-1">
                Wylosowana osoba:
              </div>
              <div className="text-4xl sm:text-6xl font-black tracking-tight drop-shadow-sm">
                🎁 {receiver.name} 🎁
              </div>
              <div className="text-xs sm:text-sm font-semibold opacity-90 mt-2">
                Należy do: {receiver.pairTitle} (Partner: {receiver.partnerName})
              </div>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              ✅ Zgodnie z zasadami: {receiver.name} to nie Ty ani Twój partner/ka ({selectedPerson.partnerName})!
            </div>
          </div>

          {/* Budget Info */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-slate-900 border border-amber-300 dark:border-slate-800 flex items-center justify-between mb-6">
            <span className="font-bold text-amber-950 dark:text-amber-200">
              💰 Uzgodniony budżet na prezent:
            </span>
            <span className="text-2xl font-black text-amber-700 dark:text-amber-400 tabular-nums">
              {officialBudget || 150} zł
            </span>
          </div>

          {/* Wishlist of Receiver */}
          <div className="mb-6">
            <h4 className={`${largeFont ? 'text-xl' : 'text-lg'} font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2`}>
              <Heart className="w-5 h-5 text-rose-500" />
              Lista życzeń {receiver.name} (pomysły na prezent):
            </h4>

            {receiver.wishes && receiver.wishes.length > 0 ? (
              <div className="space-y-2">
                {receiver.wishes.map((wish, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-800 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className={`font-semibold ${largeFont ? 'text-lg' : 'text-base'}`}>
                      {wish}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 text-sm italic">
                {receiver.name} jeszcze nie wpisał(a) pomysłów na prezent. Możesz podpytać dyskretnie lub kupić coś uniwersalnego w budżecie!
              </div>
            )}
          </div>

          {/* Direct Share Buttons: WhatsApp, SMS, Copy */}
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-6 space-y-3">
            <div className="text-xs uppercase tracking-wider font-bold text-slate-500">
              Zapisz sobie na telefonie (tylko dla Ciebie):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[46px] px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>

              <a
                href={`sms:?&body=${encodeURIComponent(shareMessage)}`}
                className="min-h-[46px] px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Wyślij SMS</span>
              </a>

              <button
                type="button"
                onClick={handleCopyMessage}
                className="min-h-[46px] px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>{copiedToast ? 'Skopiowano!' : 'Kopiuj treść'}</span>
              </button>
            </div>
          </div>

          {/* Clear & Hide Big Button */}
          <button
            type="button"
            onClick={handleLockAndClear}
            className="w-full min-h-[64px] px-6 py-4 rounded-2xl bg-red-700 hover:bg-red-800 text-white font-black text-xl flex items-center justify-center gap-3 shadow-xl cursor-pointer"
          >
            <EyeOff className="w-6 h-6" />
            <span>Zasłoń i wyczyść ekran (dla następnej osoby)</span>
          </button>
        </div>
      )}
    </div>
  );
};

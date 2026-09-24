import React, { useState } from 'react';
import { Participant } from '../types';
import { Heart, Plus, Trash2, Check, Sparkles, Gift } from 'lucide-react';

interface WishlistStepProps {
  participants: Participant[];
  onUpdateWishes: (participantId: string, wishes: string[]) => void;
  largeFont: boolean;
  highContrast: boolean;
}

export const WishlistStep: React.FC<WishlistStepProps> = ({
  participants,
  onUpdateWishes,
  largeFont,
  highContrast,
}) => {
  const [selectedPersonId, setSelectedPersonId] = useState<string>(participants[0]?.id || '');
  const [currentWishes, setCurrentWishes] = useState<string[]>(
    participants[0]?.wishes || ['', '', '']
  );
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const selectedPerson = participants.find(p => p.id === selectedPersonId);

  // When changing selected participant
  const handleSelectPerson = (id: string) => {
    setSelectedPersonId(id);
    const p = participants.find(item => item.id === id);
    if (p) {
      const w = [...p.wishes];
      while (w.length < 3) w.push('');
      setCurrentWishes(w);
    }
    setSaveSuccess(false);
  };

  const handleWishChange = (index: number, text: string) => {
    const updated = [...currentWishes];
    updated[index] = text;
    setCurrentWishes(updated);
  };

  const handleAddWishField = () => {
    if (currentWishes.length < 5) {
      setCurrentWishes([...currentWishes, '']);
    }
  };

  const handleRemoveWishField = (index: number) => {
    const updated = currentWishes.filter((_, i) => i !== index);
    setCurrentWishes(updated.length === 0 ? [''] : updated);
  };

  const handleSave = () => {
    if (!selectedPersonId) return;
    const cleanWishes = currentWishes.map(w => w.trim()).filter(Boolean);
    onUpdateWishes(selectedPersonId, cleanWishes);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Popular inspirations especially loved by family and seniors
  const popularGiftIdeas = [
    'Ciepły szal lub wełniana czapka',
    'Dobra kawa ziarnista lub zestaw herbat',
    'Książka (kryminał, biografia lub reportaż)',
    'Naturalny miód z pasieki i syrop malinowy',
    'Świeca sojowa o zapachu cynamonu',
    'Ciepły miękki koc lub pled',
    'Kubek termiczny lub mały termos',
    'Kalendarz ścienny z dużymi cyframi',
    'Zestaw do domowego grzańca z goździkami',
    'Dobre skarpetki z wełny merynosa',
  ];

  const handleApplyInspiration = (idea: string) => {
    // Find first empty slot or append
    const emptyIndex = currentWishes.findIndex(w => !w.trim());
    if (emptyIndex !== -1) {
      handleWishChange(emptyIndex, idea);
    } else if (currentWishes.length < 4) {
      setCurrentWishes([...currentWishes, idea]);
    } else {
      // replace last
      handleWishChange(currentWishes.length - 1, idea);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-2xl border ${
        highContrast
          ? 'bg-slate-900 border-yellow-400 text-white'
          : 'bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200 text-rose-950'
      }`}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Heart className="w-8 h-8" />
          </div>
          <div>
            <h2 className={`${largeFont ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} font-bold`}>
              Krok 4: Moja lista życzeń na prezent
            </h2>
            <p className={`${largeFont ? 'text-lg' : 'text-base'} text-slate-700 dark:text-slate-300 mt-1`}>
              Wpisz 2-3 pomysły na to, co sprawiłoby Ci radość. Osoba, która Cię wylosuje, zobaczy Twoje podpowiedzi przy swoim losie!
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form */}
        <div className={`lg:col-span-7 p-6 rounded-2xl border ${
          highContrast
            ? 'bg-black border-yellow-400 text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}>
          {/* Pick Person */}
          <div className="mb-6">
            <label className={`block font-bold mb-2 ${largeFont ? 'text-lg' : 'text-base'}`}>
              Dla kogo edytujesz listę życzeń?
            </label>
            <select
              value={selectedPersonId}
              onChange={(e) => handleSelectPerson(e.target.value)}
              className={`w-full min-h-[54px] px-4 py-3 rounded-xl font-bold border-2 transition-all cursor-pointer ${
                largeFont ? 'text-xl' : 'text-lg'
              } ${
                highContrast
                  ? 'bg-slate-900 text-white border-yellow-400'
                  : 'bg-slate-50 text-slate-900 border-slate-300 focus:border-rose-600 focus:bg-white'
              }`}
            >
              {participants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.pairTitle}) — {p.wishes.length > 0 ? `${p.wishes.length} życzenia wpisane` : 'Brak życzeń'}
                </option>
              ))}
            </select>
          </div>

          {/* Wishes inputs */}
          <div className="space-y-4 mb-6">
            <label className={`block font-bold ${largeFont ? 'text-lg' : 'text-base'}`}>
              Twoje 2-3 pomysły na prezent świąteczny:
            </label>

            {currentWishes.map((wish, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 font-bold text-sm flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <input
                  type="text"
                  placeholder={`Pomysł ${index + 1}, np. Ciepły szalik lub książka...`}
                  value={wish}
                  onChange={(e) => handleWishChange(index, e.target.value)}
                  className={`flex-1 min-h-[54px] px-4 py-2.5 rounded-xl border-2 font-medium ${
                    largeFont ? 'text-xl' : 'text-base sm:text-lg'
                  } ${
                    highContrast
                      ? 'bg-slate-900 text-white border-slate-700 focus:border-yellow-400'
                      : 'bg-white text-slate-900 border-slate-300 focus:border-rose-600'
                  }`}
                />
                {currentWishes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveWishField(index)}
                    className="w-12 h-12 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center cursor-pointer shrink-0"
                    title="Usuń to pole"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}

            {currentWishes.length < 5 && (
              <button
                type="button"
                onClick={handleAddWishField}
                className="text-sm font-bold text-rose-700 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer pt-1"
              >
                <Plus className="w-4 h-4" />
                <span>Dodaj jeszcze jedno pole na życzenie</span>
              </button>
            )}
          </div>

          {saveSuccess && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-100 text-emerald-950 font-bold border border-emerald-300 flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-700" />
              <span>Lista życzeń dla {selectedPerson?.name} została pomyślnie zapisana!</span>
            </div>
          )}

          {/* Save button */}
          <button
            type="button"
            onClick={handleSave}
            className="w-full min-h-[56px] px-6 py-3 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-black text-lg flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
          >
            <Check className="w-6 h-6" />
            <span>Zapisz pomysły na prezent dla {selectedPerson?.name}</span>
          </button>
        </div>

        {/* Right Column: Inspirations */}
        <div className="lg:col-span-5 space-y-6">
          <div className={`p-6 rounded-2xl border ${
            highContrast
              ? 'bg-black border-yellow-400 text-white'
              : 'bg-white border-slate-200 text-slate-900 shadow-sm'
          }`}>
            <h3 className={`${largeFont ? 'text-xl' : 'text-lg'} font-black text-slate-900 dark:text-white mb-2 flex items-center gap-2`}>
              <Sparkles className="w-5 h-5 text-amber-500" />
              Podpowiedzi i inspiracje dla seniorów i rodziny:
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              Kliknij dowolny pomysł, aby automatycznie wstawić go do swojej listy:
            </p>

            <div className="flex flex-wrap gap-2">
              {popularGiftIdeas.map((idea, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyInspiration(idea)}
                  className={`px-3 py-2 rounded-xl text-left text-xs sm:text-sm font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    highContrast
                      ? 'bg-slate-900 text-yellow-300 border-yellow-400 hover:bg-yellow-400 hover:text-black'
                      : 'bg-slate-50 hover:bg-rose-50 text-slate-800 border-slate-200 hover:border-rose-400'
                  }`}
                >
                  <Gift className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{idea}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Current wishes preview of all */}
          <div className={`p-5 rounded-2xl border ${
            highContrast
              ? 'bg-black border-yellow-400 text-white'
              : 'bg-white border-slate-200 text-slate-900 shadow-sm'
          }`}>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">
              Podgląd wpisanych życzeń uczestników:
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 text-xs">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                >
                  <div className="font-bold text-slate-900 dark:text-white">
                    {p.name} ({p.wishes.length} {p.wishes.length === 1 ? 'życzenie' : 'życzenia'}):
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 mt-0.5 truncate">
                    {p.wishes.length > 0 ? p.wishes.join(' · ') : 'Brak wpisanych życzeń'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

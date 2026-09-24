import { SecretSantaState } from '../types';
import { INITIAL_STATE } from '../data/initialData';

const STORAGE_KEY = 'family_secret_santa_2026_state';

export function loadSavedState(): SecretSantaState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_STATE,
      ...parsed,
      participants: Array.isArray(parsed.participants) && parsed.participants.length > 0
        ? parsed.participants
        : INITIAL_STATE.participants,
    };
  } catch (err) {
    console.warn('Nie udało się odczytać zapisanych danych z localStorage:', err);
    return INITIAL_STATE;
  }
}

export function saveCurrentState(state: SecretSantaState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Błąd zapisu w localStorage:', err);
  }
}

export function exportStateToJsonFile(state: SecretSantaState): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `secret_santa_rodzina_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

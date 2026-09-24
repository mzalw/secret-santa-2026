import { Participant } from '../types';

/**
 * Validates whether a proposed assignment meets all rules:
 * 1. Exactly one gift given per person, one received.
 * 2. Nobody draws themselves.
 * 3. Nobody draws their partner.
 */
export function verifyDrawAssignments(
  participants: Participant[],
  assignments: Record<string, string>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const givers = Object.keys(assignments);
  const receivers = Object.values(assignments);

  if (givers.length !== participants.length) {
    errors.push(`Nie wszyscy uczestnicy mają przypisany prezent (${givers.length}/${participants.length}).`);
  }

  // Check unique receivers (bijective)
  const uniqueReceivers = new Set(receivers);
  if (uniqueReceivers.size !== participants.length) {
    errors.push('Niektóre osoby dostałyby więcej niż jeden prezent lub wcale.');
  }

  const pMap = new Map(participants.map(p => [p.id, p]));

  for (const giver of participants) {
    const receiverId = assignments[giver.id];
    if (!receiverId) {
      errors.push(`Brak wylosowanej osoby dla ${giver.name}.`);
      continue;
    }
    const receiver = pMap.get(receiverId);
    if (!receiver) {
      errors.push(`Nieznany odbiorca dla ${giver.name}.`);
      continue;
    }

    // Rule 1: No self-draw
    if (giver.id === receiver.id) {
      errors.push(`${giver.name} wylosował(a) samego siebie!`);
    }

    // Rule 2: No partner-draw
    if (giver.partnerId && giver.partnerId === receiver.id) {
      errors.push(`${giver.name} wylosował(a) swojego partnera/partnerkę (${receiver.name})!`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Generates Secret Santa assignments meeting all constraints using randomized backtracking.
 * Guarantees zero self-draw and zero partner-draw.
 */
export function generateSecretSantaDraw(
  participants: Participant[],
  preventTwoCycles: boolean = true
): Record<string, string> | null {
  if (participants.length < 3) {
    return null;
  }

  // Shuffle helper (Fisher-Yates)
  const shuffle = <T>(array: T[]): T[] => {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const givers = shuffle(participants);
  const receiverPool = participants.map(p => p.id);
  const assignments: Record<string, string> = {};
  const usedReceivers = new Set<string>();

  // Backtracking function
  function solve(index: number): boolean {
    if (index === givers.length) {
      // Final sanity check
      const verification = verifyDrawAssignments(participants, assignments);
      return verification.valid;
    }

    const giver = givers[index];
    // Candidate receivers: not self, not partner, not yet used
    const candidates = shuffle(
      receiverPool.filter(id => {
        if (usedReceivers.has(id)) return false;
        if (id === giver.id) return false;
        if (giver.partnerId && id === giver.partnerId) return false;
        // Optionally avoid 2-person loops (A->B and B->A) if more than 3 participants
        if (preventTwoCycles && participants.length > 4) {
          if (assignments[id] === giver.id) return false;
        }
        return true;
      })
    );

    for (const candId of candidates) {
      assignments[giver.id] = candId;
      usedReceivers.add(candId);

      if (solve(index + 1)) {
        return true;
      }

      // Backtrack
      delete assignments[giver.id];
      usedReceivers.delete(candId);
    }

    return false;
  }

  // Try with preventTwoCycles first; if impossible (very rare), fallback without preventTwoCycles
  if (solve(0)) {
    return assignments;
  }

  // Fallback without 2-cycle restriction
  usedReceivers.clear();
  Object.keys(assignments).forEach(k => delete assignments[k]);

  function solveRelaxed(index: number): boolean {
    if (index === givers.length) {
      const verification = verifyDrawAssignments(participants, assignments);
      return verification.valid;
    }

    const giver = givers[index];
    const candidates = shuffle(
      receiverPool.filter(id => {
        if (usedReceivers.has(id)) return false;
        if (id === giver.id) return false;
        if (giver.partnerId && id === giver.partnerId) return false;
        return true;
      })
    );

    for (const candId of candidates) {
      assignments[giver.id] = candId;
      usedReceivers.add(candId);

      if (solveRelaxed(index + 1)) {
        return true;
      }

      delete assignments[giver.id];
      usedReceivers.delete(candId);
    }

    return false;
  }

  if (solveRelaxed(0)) {
    return assignments;
  }

  return null;
}

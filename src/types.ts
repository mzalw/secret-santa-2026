export interface Participant {
  id: string;
  name: string;
  pairId: number;
  pairTitle: string;
  partnerId: string;
  partnerName: string;
  pin: string;
  wishes: string[];
  budgetVote: number | null;
  phone?: string;
  hasViewedSecret: boolean;
  avatarBg?: string;
}

export interface SecretSantaState {
  participants: Participant[];
  officialBudget: number | null;
  budgetNotes: string;
  assignments: Record<string, string>; // giverId -> receiverId
  isDrawn: boolean;
  drawnAt: string | null;
  largeFont: boolean;
  highContrast: boolean;
}

export type ActiveTab = 'reveal' | 'budget' | 'draw' | 'wishlist' | 'admin';

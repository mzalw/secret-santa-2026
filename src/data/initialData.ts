import { Participant, SecretSantaState } from '../types';

export const INITIAL_PARTICIPANTS: Participant[] = [
  // Para 1
  {
    id: 'p1',
    name: 'Michał',
    pairId: 1,
    pairTitle: 'Para 1',
    partnerId: 'p2',
    partnerName: 'Dominika',
    pin: '1001',
    wishes: [
      'Ciepła czapka zimowa lub rękawiczki',
      'Dobra kawa ziarnista 100% Arabica',
      'Książka historyczna lub reportaż'
    ],
    budgetVote: 150,
    hasViewedSecret: false,
    avatarBg: 'bg-emerald-600',
  },
  {
    id: 'p2',
    name: 'Dominika',
    pairId: 1,
    pairTitle: 'Para 1',
    partnerId: 'p1',
    partnerName: 'Michał',
    pin: '1002',
    wishes: [
      'Świeca sojowa o zapachu cynamonu i pomarańczy',
      'Elegancki kubek ceramiczny lub termos',
      'Zestaw herbat zimowych z miodem'
    ],
    budgetVote: 150,
    hasViewedSecret: false,
    avatarBg: 'bg-rose-600',
  },

  // Para 2
  {
    id: 'p3',
    name: 'Rafał',
    pairId: 2,
    pairTitle: 'Para 2',
    partnerId: 'p4',
    partnerName: 'Izabela',
    pin: '2001',
    wishes: [
      'Zestaw ostrych sosów lub przypraw BBQ',
      'Brelok wielofunkcyjny (multitool)',
      'Ciepłe skarpetki z motywem świątecznym'
    ],
    budgetVote: 150,
    hasViewedSecret: false,
    avatarBg: 'bg-blue-600',
  },
  {
    id: 'p4',
    name: 'Izabela',
    pairId: 2,
    pairTitle: 'Para 2',
    partnerId: 'p3',
    partnerName: 'Rafał',
    pin: '2002',
    wishes: [
      'Krem nawilżający do rąk na zimę',
      'Książka kryminalna / thriller',
      'Koc z miękkiego polaru'
    ],
    budgetVote: 120,
    hasViewedSecret: false,
    avatarBg: 'bg-teal-600',
  },

  // Para 3
  {
    id: 'p5',
    name: 'Ula',
    pairId: 3,
    pairTitle: 'Para 3',
    partnerId: 'p6',
    partnerName: 'Przemek',
    pin: '3001',
    wishes: [
      'Pachnące kule do kąpieli lub olejek',
      'Planer na Nowy Rok',
      'Czekolada rzemieślnicza z bakaliami'
    ],
    budgetVote: 150,
    hasViewedSecret: false,
    avatarBg: 'bg-amber-600',
  },
  {
    id: 'p6',
    name: 'Przemek',
    pairId: 3,
    pairTitle: 'Para 3',
    partnerId: 'p5',
    partnerName: 'Ula',
    pin: '3002',
    wishes: [
      'Latarka czołowa na spacery',
      'Książka o podróżach lub atlas',
      'Termos obiadowy lub kubek termiczny'
    ],
    budgetVote: 150,
    hasViewedSecret: false,
    avatarBg: 'bg-indigo-600',
  },

  // Para 4: Stanisław i Janina (Seniorzy)
  {
    id: 'p7',
    name: 'Stanisław',
    pairId: 4,
    pairTitle: 'Para 4 (Seniorzy)',
    partnerId: 'p8',
    partnerName: 'Janina',
    pin: '4001',
    wishes: [
      'Tradycyjny sok malinowy do herbaty z pasieki',
      'Wygodny, miękki szal zimowy',
      'Płyn lub maść z kasztanowca na stawy'
    ],
    budgetVote: 100,
    hasViewedSecret: false,
    avatarBg: 'bg-cyan-700',
  },
  {
    id: 'p8',
    name: 'Janina',
    pairId: 4,
    pairTitle: 'Para 4 (Seniorzy)',
    partnerId: 'p7',
    partnerName: 'Stanisław',
    pin: '4002',
    wishes: [
      'Duży, ciepły pled wełniany na fotel',
      'Kalendarz ścienny z dużymi cyframi na Nowy Rok',
      'Herbata ziołowa z melisą i dziką różą'
    ],
    budgetVote: 100,
    hasViewedSecret: false,
    avatarBg: 'bg-pink-600',
  },

  // Para 5
  {
    id: 'p9',
    name: 'Paweł',
    pairId: 5,
    pairTitle: 'Para 5',
    partnerId: 'p10',
    partnerName: 'Dorota',
    pin: '5001',
    wishes: [
      'Powerbank do telefonu',
      'Dobre skarpetki trekkingowe',
      'Kawa ziarnista ciemno palona'
    ],
    budgetVote: 150,
    hasViewedSecret: false,
    avatarBg: 'bg-violet-600',
  },
  {
    id: 'p10',
    name: 'Dorota',
    pairId: 5,
    pairTitle: 'Para 5',
    partnerId: 'p9',
    partnerName: 'Paweł',
    pin: '5002',
    wishes: [
      'Foremki do pieczenia pierniczków',
      'Naturalne mydełka zapachowe',
      'Olejki eteryczne (sosnowy, eukaliptus)'
    ],
    budgetVote: 150,
    hasViewedSecret: false,
    avatarBg: 'bg-emerald-700',
  },

  // Para 6
  {
    id: 'p11',
    name: 'Joanna',
    pairId: 6,
    pairTitle: 'Para 6',
    partnerId: 'p12',
    partnerName: 'Tomek',
    pin: '6001',
    wishes: [
      'Zestaw do domowego grzańca (przyprawy, goździki)',
      'Książka kulinarna ze świątecznymi przepisami',
      'Elegancki notes w twardej oprawie'
    ],
    budgetVote: 150,
    hasViewedSecret: false,
    avatarBg: 'bg-red-600',
  },
  {
    id: 'p12',
    name: 'Tomek',
    pairId: 6,
    pairTitle: 'Para 6',
    partnerId: 'p11',
    partnerName: 'Joanna',
    pin: '6002',
    wishes: [
      'Gra planszowa towarzyska dla rodziny',
      'Ciepła bluza lub bezrękawnik',
      'Słuchawki bezprzewodowe'
    ],
    budgetVote: 150,
    hasViewedSecret: false,
    avatarBg: 'bg-slate-700',
  },
];

export const INITIAL_STATE: SecretSantaState = {
  participants: INITIAL_PARTICIPANTS,
  officialBudget: 150,
  budgetNotes: 'Wspólnie ustalony limit kwotowy na prezent świąteczny',
  assignments: {},
  isDrawn: false,
  drawnAt: null,
  largeFont: false,
  highContrast: false,
};

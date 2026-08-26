import { Stadia } from '@domainTypes/index';

// Urutan stadia larva N1..PL10+ (dipakai sbg opsi field `stadia` di schema).
export const STAGES: Stadia[] = [
  'N1', 'N2', 'N3', 'N4', 'N5',
  'Z1', 'Z2', 'Z3',
  'M1', 'M2', 'M3',
  'MPL',
  'PL1', 'PL2', 'PL3', 'PL4', 'PL5', 'PL6', 'PL7', 'PL8', 'PL9', 'PL10',
  'PL10+'
];

export const PCR_OPTIONS = ['negatif', 'positif', 'tidak diuji'];

import { FieldDef } from '@domainTypes/index';

// Panel PCR: satu field select (negatif/positif/tidak diuji) per patogen.
// Hasil 'positif' → threshold bahaya (memicu alert & memblokir input Lab).
export function pcrPanel(pathogens: string[]): FieldDef[] {
  return pathogens.map((p) => ({
    key: 'pcr_' + p.toLowerCase().replace(/[^a-z0-9]/g, ''),
    label: 'PCR ' + p,
    type: 'pcr' as const,
    threshold: { badValues: ['positif'] },
    group: 'Panel PCR'
  }));
}

// Patogen udang standar (urutan sesuai dokumen klien).
export const PATOGEN_INDUK = ['WSSV', 'IMNV', 'EHP', 'AHPND', 'IHHNV'];
export const PATOGEN_PL = ['EHP', 'AHPND', 'WSSV', 'IMNV', 'IHHNV'];

// Field titik mikrobiologi (TBC/TVC) reusable.
export function mikroTbcTvc(): FieldDef[] {
  return [
    { key: 'TBC', label: 'TBC', type: 'number', hint: 'TBC', group: 'Mikrobiologi' },
    { key: 'TVC', label: 'TVC', type: 'number', hint: 'TVC', group: 'Mikrobiologi' }
  ];
}

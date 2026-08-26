import { Category } from '@domainTypes/index';
import { STAGES } from '../stages';

// Domain Lab — analisis/mutu per area (maturasi/algae/pl).
export const LAB_CATEGORIES: Category[] = [
  // Domain: Larvae -> Lab Micro (§05 Mikrobiologi TCBS/Vibrio)
  {
    id: 'labMikro',
    division: 'lab',
    area: 'pl',
    section: '05',
    collection: 'records',
    title: 'Mikrobiologi Air Tank (Vibrio/TCBS)',
    frekuensi: 'harian',
    fields: [
      { key: 'tanggal', label: 'Tanggal Uji', type: 'date', required: true },
      { key: 'tankId', label: 'Tank / Bak', type: 'ref', ref: 'tank', required: true },
      { key: 'siklusId', label: 'Siklus', type: 'ref', ref: 'siklus', required: true },
      { key: 'stadia', label: 'Stadia Larva', type: 'select', options: STAGES, required: true },
      { key: 'TBC', label: 'Total Bacteria Count (TBC)', type: 'number', unit: 'cfu/ml', hint: 'TBC' },
      { key: 'TVC', label: 'Total Vibrio Count (TVC)', type: 'number', unit: 'cfu/ml', hint: 'TVC' },
      { key: 'koloniHijau', label: 'Koloni Hijau (Vibrio Patogen)', type: 'number', unit: 'cfu/ml' },
      { key: 'koloniKuning', label: 'Koloni Kuning (Vibrio Non-Sucrose)', type: 'number', unit: 'cfu/ml' },
      { key: 'koloniLuminescent', label: 'Koloni Luminescent (Bioluminesensi)', type: 'number', unit: 'cfu/ml', threshold: { badValues: ['>0'] } },
      { key: 'pemeriksa', label: 'Pemeriksa Lab', type: 'text' }
    ]
  },

  // Domain: PL -> Lab PL (§08 Ukuran & Keseragaman PL)
  {
    id: 'labUkuranPl',
    division: 'lab',
    area: 'pl',
    section: '08',
    collection: 'records',
    title: 'Ukuran & Keseragaman PL',
    frekuensi: 'harian (PL3→panen)',
    fields: [
      { key: 'tanggal', label: 'Tanggal Pengukuran', type: 'date', required: true },
      { key: 'tankId', label: 'Bak PL', type: 'ref', ref: 'tank', required: true },
      { key: 'siklusId', label: 'Siklus', type: 'ref', ref: 'siklus' },
      { key: 'stadia', label: 'Stadia', type: 'select', options: STAGES },
      { key: 'panjangRata', label: 'Panjang Rata-Rata (TL)', type: 'number', unit: 'mm', precision: 2 },
      { key: 'ekorPerGram', label: 'Jumlah Ekor / gram', type: 'number', unit: 'ekor/g' },
      { key: 'cv', label: 'Keseragaman Ukuran (CV)', type: 'number', unit: '%', hint: 'CV', threshold: { default: { safeMax: 10, dangerMax: 15 } } },
      { key: 'mgr', label: 'Rasio Otot:Usus (MGR)', type: 'number', unit: '%', hint: 'MGR' },
      { key: 'pemeriksa', label: 'Pemeriksa Lab', type: 'text' }
    ]
  },

  // Domain: PL -> Lab PL (§09 Kualitas PL Sebelum Kirim / QC Pra-Panen)
  {
    id: 'labKualitasPlPrePanen',
    division: 'lab',
    area: 'pl',
    section: '09',
    collection: 'records',
    title: 'Kualitas PL Sebelum Kirim (QC Pra-Panen)',
    frekuensi: 'setiap batch sebelum dikirim',
    fields: [
      { key: 'tanggal', label: 'Tanggal Uji', type: 'date', required: true },
      { key: 'tankId', label: 'Tank / Bak Sumber', type: 'ref', ref: 'tank', required: true },
      { key: 'siklusId', label: 'Siklus', type: 'ref', ref: 'siklus', required: true },
      { key: 'stressFormalin', label: 'Formalin Stress Test (100 ppm/30 min)', type: 'number', unit: '%', group: 'Stress Test', threshold: { default: { safeMin: 95 } } },
      { key: 'stressSalinitas', label: 'Salinity Stress Test (Drop Salinitas)', type: 'number', unit: '%', group: 'Stress Test', threshold: { default: { safeMin: 95 } } },
      { key: 'pcrWssv', label: 'PCR: WSSV', type: 'select', options: ['negatif', 'positif'], group: 'Skrining PCR' },
      { key: 'pcrImnv', label: 'PCR: IMNV', type: 'select', options: ['negatif', 'positif'], group: 'Skrining PCR' },
      { key: 'pcrEhp', label: 'PCR: EHP', type: 'select', options: ['negatif', 'positif'], group: 'Skrining PCR' },
      { key: 'pcrAhpnd', label: 'PCR: AHPND', type: 'select', options: ['negatif', 'positif'], group: 'Skrining PCR' },
      { key: 'pcrIhhnv', label: 'PCR: IHHNV', type: 'select', options: ['negatif', 'positif'], group: 'Skrining PCR' },
      { key: 'deformitas', label: 'Tingkat Deformitas Fisik', type: 'number', unit: '%', group: 'Kualitas Fisik' },
      { key: 'keaktifan', label: 'Keaktifan Berenang Melawan Arus', type: 'select', options: ['aktif / prima', 'sedang', 'lemah'], group: 'Kualitas Fisik' },
      { key: 'responFototaksis', label: 'Respon Fototaksis', type: 'select', options: ['positif (kuat)', 'lemah', 'negatif'], group: 'Kualitas Fisik' },
      { key: 'pemeriksa', label: 'Pemeriksa Lab', type: 'text' }
    ]
  }
];


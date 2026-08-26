import { Category } from '@domainTypes/index';
import { STAGES } from '../stages';

// §06 Perkembangan Stadia & Kelangsungan Hidup — rekap populasi, survival antar
// stadia, dan bak PL. Dipisah dari produksiRearing.ts agar tiap file tetap ringkas.
export const PRODUKSI_POPULASI: Category[] = [
  {
    id: 'prodEstimasiSr',
    code: '06',
    division: 'produksi',
    section: '06',
    collection: 'records',
    title: 'Estimasi Populasi & SR',
    frekuensi: 'per-transisi',
    fields: [
      { key: 'tankId', label: 'Tank', type: 'ref', ref: 'tank', required: true },
      { key: 'siklusId', label: 'Siklus', type: 'ref', ref: 'siklus', required: true },
      { key: 'tanggal', label: 'Tanggal', type: 'date', required: true },
      { key: 'totalStocking', label: 'Total Stocking', type: 'number', unit: 'ekor' },
      { key: 'estZ2', label: 'Est. Z2', type: 'number', unit: 'ekor', group: 'Estimasi & SR' },
      { key: 'srZ2', label: 'SR Z2', type: 'computed', compute: 'srZ2', unit: '%', precision: 2, group: 'Estimasi & SR' },
      { key: 'estZ3', label: 'Est. Z3', type: 'number', unit: 'ekor', group: 'Estimasi & SR' },
      { key: 'srZ3', label: 'SR Z3', type: 'computed', compute: 'srZ3', unit: '%', precision: 2, group: 'Estimasi & SR' },
      { key: 'estM2', label: 'Est. M2', type: 'number', unit: 'ekor', group: 'Estimasi & SR' },
      { key: 'srM2', label: 'SR M2', type: 'computed', compute: 'srM2', unit: '%', precision: 2, group: 'Estimasi & SR' },
      { key: 'estPL4', label: 'Est. PL4', type: 'number', unit: 'ekor', group: 'Estimasi & SR' },
      { key: 'srPL4', label: 'SR PL4', type: 'computed', compute: 'srPL4', unit: '%', precision: 2, group: 'Estimasi & SR' },
      { key: 'estPL10', label: 'Est. PL10', type: 'number', unit: 'ekor', group: 'Estimasi & SR' },
      { key: 'srPL10', label: 'SR PL10', type: 'computed', compute: 'srPL10', unit: '%', precision: 2, group: 'Estimasi & SR' },

      // PDF §06 — rekap survival ANTAR stadia, diisi di setiap pergantian stadia.
      { key: 'estAkhirZ', label: 'Est. Akhir Zoea', type: 'number', unit: 'ekor', group: 'Survival Antar Stadia' },
      { key: 'estAkhirM', label: 'Est. Akhir Mysis', type: 'number', unit: 'ekor', group: 'Survival Antar Stadia' },
      { key: 'estAkhirPl', label: 'Est. Akhir PL', type: 'number', unit: 'ekor', group: 'Survival Antar Stadia' },
      { key: 'srNZ', label: 'Survival N→Z', type: 'computed', compute: 'srNZ', unit: '%', precision: 2, group: 'Survival Antar Stadia' },
      { key: 'srZM', label: 'Survival Z→M', type: 'computed', compute: 'srZM', unit: '%', precision: 2, group: 'Survival Antar Stadia' },
      { key: 'srMPL', label: 'Survival M→PL', type: 'computed', compute: 'srMPL', unit: '%', precision: 2, group: 'Survival Antar Stadia' },
      { key: 'srNPL', label: 'Survival Total N→PL', type: 'computed', compute: 'srNPL', unit: '%', precision: 2, group: 'Survival Antar Stadia', hint: 'Nilai rapor utama siklus (PDF §06).' }
    ]
  },

  // Domain: PL (Transfer & Stocking Bak Post Larvae = Produksi)
  {
    id: 'prodPostLarvae',
    code: '16',
    division: 'produksi',
    section: '06',
    collection: 'records',
    title: 'Transfer & Penempatan Bak PL',
    frekuensi: 'per-transfer bak',
    fields: [
      { key: 'tanggal', label: 'Tanggal Transfer', type: 'date', required: true },
      { key: 'siklusId', label: 'Siklus', type: 'ref', ref: 'siklus', required: true },
      { key: 'bakLarvae', label: 'Bak Asal (Larvae)', type: 'ref', ref: 'tank', required: true },
      { key: 'bakPl', label: 'Bak Tujuan (PL)', type: 'ref', ref: 'tank', required: true },
      { key: 'stadia', label: 'Stadia Saat Transfer', type: 'select', options: STAGES },
      { key: 'jumlahStok', label: 'Jumlah Ekor Ditransfer', type: 'number', unit: 'ekor', required: true },
      { key: 'srTransfer', label: 'SR Saat Transfer', type: 'number', unit: '%' },
      { key: 'estimasiPanen', label: 'Estimasi Tanggal Panen', type: 'date' },
      { key: 'petugas', label: 'Petugas Pelaksana', type: 'text' }
    ]
  }
];


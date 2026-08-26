import { Category } from '@domainTypes/index';
import { mikroTbcTvc } from './_shared';

// §02 Air Baku & Sistem Treatment (UV/Ozon) — benteng utama hatchery.
// Peran Teknisi/Utilitas difold ke divisi 'produksi'; mikrobiologi = 'lab'.
export const SECTION_AIR_TREATMENT: Category[] = [
  {
    id: 'airBaku',
    division: 'produksi',
    section: '02',
    collection: 'records',
    title: 'Air Sumber (Tandon)',
    frekuensi: 'setiap pengisian tandon',
    fields: [
      { key: 'tanggal', label: 'Tanggal', type: 'date', required: true },
      { key: 'tandon', label: 'Tandon', type: 'text', required: true },
      { key: 'salinitas', label: 'Salinitas', type: 'number', unit: 'g/l', threshold: { default: { safeMin: 25, safeMax: 34 } } },
      { key: 'suhu', label: 'Suhu', type: 'number', unit: '°C' },
      { key: 'petugas', label: 'Petugas', type: 'text' }
    ]
  },
  {
    id: 'treatmentOzon',
    division: 'produksi',
    section: '02',
    collection: 'records',
    title: 'Sistem Ozon (ORP & Resirkulasi)',
    frekuensi: 'harian, minimal 2x',
    fields: [
      { key: 'tanggal', label: 'Tanggal', type: 'date', required: true },
      { key: 'waktu', label: 'Waktu', type: 'select', options: ['pagi', 'sore'], required: true },
      { key: 'orp', label: 'ORP', type: 'number', unit: 'mV', hint: 'ORP' },
      { key: 'waktuResirkulasi', label: 'Waktu Resirkulasi', type: 'number', unit: 'menit', hint: 'Memastikan ozon hilang sebelum kontak larva' },
      { key: 'batchAir', label: 'Batch Air', type: 'text' },
      { key: 'petugas', label: 'Petugas', type: 'text' }
    ]
  },
  {
    id: 'perawatanTreatment',
    division: 'produksi',
    section: '02',
    collection: 'records',
    title: 'Perawatan Treatment (UV/Karbon/Ozon)',
    frekuensi: 'setiap tindakan perawatan',
    fields: [
      { key: 'tanggal', label: 'Tanggal', type: 'date', required: true },
      { key: 'jenisTindakan', label: 'Jenis Tindakan', type: 'select', options: ['ganti lampu UV', 'ganti karbon', 'servis generator ozon'], required: true },
      { key: 'detail', label: 'Detail', type: 'text' },
      { key: 'pelaksana', label: 'Pelaksana', type: 'text' }
    ]
  },


  // --- Sisi Lab (mikrobiologi treatment) ---
  {
    id: 'labAirTreatment',
    division: 'lab',
    area: 'pl',
    section: '02',
    collection: 'records',
    title: 'Mikrobiologi Air Treatment (per Titik)',
    frekuensi: 'harian',
    fields: [
      { key: 'tanggal', label: 'Tanggal', type: 'date', required: true },
      { key: 'titik', label: 'Titik Sampling', type: 'select', options: ['sebelum treatment', 'setelah UV 1', 'setelah UV 2', 'setelah ozon'], required: true },
      { key: 'TBC', label: 'TBC', type: 'number', hint: 'TBC' },
      { key: 'TVC', label: 'TVC', type: 'number', hint: 'TVC (naik pasca-ozon = treatment gagal)' },
      { key: 'pemeriksa', label: 'Pemeriksa', type: 'text' }
    ]
  },
  {
    id: 'labCarbonTest',
    division: 'lab',
    area: 'pl',
    section: '02',
    collection: 'records',
    title: 'Carbon Test (Kualitas Karbon Filter)',
    frekuensi: 'berkala',
    fields: [
      { key: 'tanggal', label: 'Tanggal', type: 'date', required: true },
      { key: 'unitFilter', label: 'Unit Filter', type: 'text' },
      { key: 'hasil', label: 'Hasil', type: 'select', options: ['baik', 'perlu ganti'], threshold: { badValues: ['perlu ganti'] } },
      { key: 'catatan', label: 'Catatan', type: 'textarea' },
      ...mikroTbcTvc(),
      { key: 'pemeriksa', label: 'Pemeriksa', type: 'text' }
    ]
  },
];

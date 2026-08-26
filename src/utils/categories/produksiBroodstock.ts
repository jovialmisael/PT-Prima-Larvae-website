import { Category } from '@domainTypes/index';

// Domain Produksi — sisi Induk & Pemijahan (PDF §01).
// `induk` & `spawn` adalah master (createInduk/createSpawn); sisanya `records`.
export const PRODUKSI_BROODSTOCK: Category[] = [
  // 1. Kedatangan Induk (PDF §01: Kode batch induk, umur, dan berat)
  {
    id: 'induk',
    code: '27',
    division: 'produksi',
    section: '01',
    collection: 'induk',
    title: 'Kedatangan Induk',
    frekuensi: 'setiap batch induk baru',
    fields: [
      { key: 'tglKedatangan', label: 'Tanggal Kedatangan', type: 'date', required: true },
      { key: 'kodeBatch', label: 'Kode Batch Induk', type: 'text', required: true },
      { key: 'umur', label: 'Umur', type: 'number', unit: 'hari', required: true },
      { key: 'berat', label: 'Berat', type: 'number', unit: 'g', required: true }
    ]
  },
  // 8. Mortalitas, culling, dan molting induk (PDF §01: Harian / Setiap kejadian)
  {
    id: 'spawnerKontrol',
    code: '03',
    division: 'produksi',
    section: '01',
    collection: 'records',
    title: 'Mortalitas, Culling & Molting Induk',
    frekuensi: 'harian / setiap kejadian',
    fields: [
      { key: 'tanggal', label: 'Tanggal', type: 'date', required: true },
      { key: 'bakInduk', label: 'Bak', type: 'text', required: true },
      { key: 'mortalitas', label: 'Mortalitas', type: 'number' },
      { key: 'culling', label: 'Culling', type: 'number' },
      { key: 'molting', label: 'Molting', type: 'number' }
    ]
  },
  // 3. Kualitas air maturasi: suhu, salinitas, DO, pH (PDF §01: Harian)
  {
    id: 'prodInduk',
    code: '06',
    division: 'produksi',
    section: '01',
    collection: 'records',
    title: 'Kualitas Air Maturasi',
    frekuensi: 'harian',
    fields: [
      { key: 'tanggal', label: 'Tanggal', type: 'date', required: true },
      { key: 'bakInduk', label: 'Bak', type: 'text', required: true },
      { key: 'suhu', label: 'Suhu', type: 'number', unit: '°C' },
      { key: 'salinitas', label: 'Salinitas', type: 'number', unit: 'g/l', threshold: { default: { safeMin: 25, safeMax: 34 } } },
      { key: 'DO', label: 'DO', type: 'number', unit: 'mg/l', threshold: { default: { dangerMin: 4 } }, hint: 'DO' },
      { key: 'pH', label: 'pH', type: 'number', threshold: { default: { safeMin: 7, safeMax: 8.5 } } }
    ]
  },

  // 6. Performa Pemijahan & Mutu Nauplii (PDF §01: Fekunditas, Fertilization Rate, Hatching Rate, Jumlah Nauplii, Keaktifan, Respon Fototaksis, Keseragaman)
  {
    id: 'spawn',
    code: '04',
    division: 'produksi',
    section: '01',
    collection: 'spawn',
    title: 'Performa Pemijahan & Kualitas Nauplii',
    frekuensi: 'setiap pemijahan',
    fields: [
      { key: 'indukId', label: 'Induk / Bak Maturasi', type: 'ref', ref: 'induk', required: true },
      { key: 'tanggal', label: 'Tanggal', type: 'date', required: true },
      { key: 'fekunditas', label: 'Fekunditas', type: 'number' },
      { key: 'fertilizationRate', label: 'Fertilization Rate (%)', type: 'number', unit: '%' },
      { key: 'hatchingRate', label: 'Hatching Rate (%)', type: 'number', unit: '%' },
      { key: 'jumlahNauplii', label: 'Jumlah Nauplii per Spawn', type: 'number' },
      { key: 'keaktifan', label: 'Keaktifan Nauplii', type: 'select', options: ['aktif', 'sedang', 'lemah'], threshold: { badValues: ['lemah'], warnValues: ['sedang'] } },
      { key: 'responFototaksis', label: 'Respon Fototaksis', type: 'select', options: ['positif', 'lemah', 'negatif'], threshold: { badValues: ['negatif'], warnValues: ['lemah'] } },
      { key: 'keseragaman', label: 'Keseragaman', type: 'text' }
    ]
  }
];




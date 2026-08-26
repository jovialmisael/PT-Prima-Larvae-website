import { Category } from '@domainTypes/index';
import { mikroTbcTvc } from './_shared';

// §03 Pakan Hidup & Probiotik — Kultur Algae, Penetasan Artemia, Probiotik, & Lab Mikro.
export const SECTION_PAKAN_HIDUP: Category[] = [
  {
    id: 'prodAlgaeKondisi',
    division: 'produksi',
    section: '03',
    collection: 'records',
    title: 'Kultur Algae Massal',
    frekuensi: 'harian, per tank massal',
    fields: [
      { key: 'tanggal', label: 'Tanggal', type: 'date', required: true },
      { key: 'bakAlgae', label: 'Bak Algae', type: 'text', required: true },
      { key: 'jenis', label: 'Spesies Algae', type: 'select', options: ['Chaetoceros calcitrans', 'Thalassiosira weissflogii', 'Amphora sp.', 'Tetraselmis sp.'], required: true },
      { key: 'jumlah', label: 'Kepadatan Sel (Density)', type: 'number', unit: 'sel/ml' },
      { key: 'kemurnian', label: 'Kemurnian Kultur', type: 'select', options: ['murni', 'kontaminasi-ringan', 'kontaminasi-berat'], threshold: { badValues: ['kontaminasi-berat'], warnValues: ['kontaminasi-ringan'] } },
      { key: 'warna', label: 'Warna / Kondisi Visual', type: 'text' },
      { key: 'petugas', label: 'Petugas', type: 'text' }
    ]
  },
  {
    id: 'artemia',
    division: 'produksi',
    section: '03',
    collection: 'records',
    title: 'Penetasan Artemia',
    frekuensi: 'per-penetasan',
    fields: [
      { key: 'tanggal', label: 'Tanggal', type: 'date', required: true },
      { key: 'noBatchKista', label: 'No. Batch Kista', type: 'text', required: true },
      { key: 'jamStart', label: 'Jam Inkubasi / Start', type: 'text' },
      { key: 'jamPanen', label: 'Jam Panen', type: 'text' },
      { key: 'hatchingRate', label: 'Hatching Rate (Daya Tetas)', type: 'number', unit: '%', threshold: { default: { safeMin: 80 } } },
      { key: 'kepadatan', label: 'Kepadatan Instar', type: 'number', unit: 'ind/ml' },
      { key: 'catatan', label: 'Catatan Kualitas', type: 'textarea' },
      { key: 'petugas', label: 'Petugas', type: 'text' }
    ]
  },
  {
    id: 'prodProbiotik',
    division: 'produksi',
    section: '03',
    collection: 'records',
    title: 'Penerimaan & Pemakaian Probiotik',
    frekuensi: 'per-batch baru',
    fields: [
      { key: 'tanggal', label: 'Tanggal Masuk / Pakai', type: 'date', required: true },
      { key: 'kodeProduk', label: 'Nama / Kode Produk', type: 'text', required: true },
      { key: 'noBatch', label: 'No. Batch / Lot', type: 'text', required: true },
      { key: 'dosis', label: 'Dosis / Konsentrasi', type: 'text' },
      { key: 'sumber', label: 'Sumber / Pabrikan', type: 'text' },
      { key: 'petugas', label: 'Petugas', type: 'text' }
    ]
  },
  {
    id: 'labAlgaeMikro',
    division: 'lab',
    area: 'algae',
    section: '03',
    collection: 'records',
    title: 'Mikrobiologi Kultur Algae',
    frekuensi: 'harian',
    fields: [
      { key: 'tanggal', label: 'Tanggal', type: 'date', required: true },
      { key: 'bakAlgae', label: 'Bak Algae', type: 'text', required: true },
      ...mikroTbcTvc(),
      { key: 'koloniHijau', label: 'Koloni Hijau (TCBS)', type: 'number', unit: 'cfu/ml' },
      { key: 'koloniKuning', label: 'Koloni Kuning (TCBS)', type: 'number', unit: 'cfu/ml' },
      { key: 'pemeriksa', label: 'Pemeriksa', type: 'text' }
    ]
  },
  {
    id: 'labArtemiaMikro',
    division: 'lab',
    area: 'algae',
    section: '03',
    collection: 'records',
    title: 'Mikrobiologi Artemia (Hidup/Beku)',
    frekuensi: 'harian selama dipakai',
    fields: [
      { key: 'tanggal', label: 'Tanggal', type: 'date', required: true },
      { key: 'jenis', label: 'Bentuk Artemia', type: 'select', options: ['hidup (nauplii)', 'beku', 'dekapsulasi'], required: true },
      ...mikroTbcTvc(),
      { key: 'koloniHijau', label: 'Koloni Hijau (TCBS)', type: 'number', unit: 'cfu/ml' },
      { key: 'koloniKuning', label: 'Koloni Kuning (TCBS)', type: 'number', unit: 'cfu/ml' },
      { key: 'pemeriksa', label: 'Pemeriksa', type: 'text' }
    ]
  },
  {
    id: 'labProbiotikMutu',
    division: 'lab',
    area: 'pl',
    section: '03',
    collection: 'records',
    title: 'Uji Mutu & Kemurnian Probiotik',
    frekuensi: 'per-batch produk baru',
    fields: [
      { key: 'tanggal', label: 'Tanggal Uji', type: 'date', required: true },
      { key: 'kodeProduk', label: 'Kode Produk', type: 'text', required: true },
      { key: 'noBatch', label: 'No. Batch', type: 'text' },
      { key: 'cfu', label: 'Kepadatan Bakteri (CFU)', type: 'number', unit: 'cfu/ml' },
      { key: 'kontaminasi', label: 'Kontaminasi Patogen', type: 'select', options: ['negatif / bebas', 'terkontaminasi'] },
      ...mikroTbcTvc(),
      { key: 'hasil', label: 'Kesimpulan Mutu', type: 'select', options: ['layak', 'tidak layak'], threshold: { badValues: ['tidak layak'] } },
      { key: 'pemeriksa', label: 'Pemeriksa', type: 'text' }
    ]
  }
];


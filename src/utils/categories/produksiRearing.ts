import { Category } from '@domainTypes/index';
import { STAGES } from '../stages';

// Domain Produksi — sisi Rearing (algae, air, larva, post-larva).
export const PRODUKSI_REARING: Category[] = [
  // Domain: Algae (distribusi = Produksi)
  {
    id: 'prodAlgae',
    code: '14',
    division: 'produksi',
    section: '03',
    collection: 'records',
    title: 'Distribusi Algae ke Bak Larvae',
    frekuensi: 'harian',
    fields: [
      { key: 'tanggal', label: 'Tanggal', type: 'date', required: true },
      { key: 'bakTujuan', label: 'Bak Tujuan (Larvae)', type: 'ref', ref: 'tank' },
      { key: 'stadia', label: 'Stadia', type: 'select', options: STAGES },
      { key: 'volumeLarvae', label: 'Volume (Larvae)', type: 'number' },
      { key: 'jmlAlgae', label: 'Jumlah Algae', type: 'number' },
      { key: 'stdKebAlgae', label: 'Std. Keb. Algae', type: 'number' },
      { key: 'perhitunganKebutuhan', label: 'Perhitungan Kebutuhan', type: 'number' },
      { key: 'volBakAlgae', label: 'Vol. Bak Algae', type: 'number' },
      { key: 'terpompa', label: 'Terpompa', type: 'number' }
    ]
  },

  // Domain: Water (fisik = Produksi)
  {
    id: 'prodAirRutin',
    code: '24.A',
    division: 'produksi',
    section: '04',
    collection: 'records',
    title: 'Kualitas Air Rutin (Fisik)',
    // PDF §04: Suhu/DO/pH minimal 2x sehari (pagi & sore); alkalinitas 3x per
    // minggu. Struktur kolom Pagi/Sore sudah menampung yang pertama.
    frekuensi: '2x sehari (pagi & sore)',
    fields: [
      { key: 'tankId', label: 'Tank', type: 'ref', ref: 'tank', required: true },
      { key: 'siklusId', label: 'Siklus', type: 'ref', ref: 'siklus', required: true },
      { key: 'tanggal', label: 'Tanggal', type: 'date', required: true },
      { key: 'suhuPagi', label: 'Suhu Pagi', type: 'number', unit: '°C', group: 'Pagi' },
      { key: 'doPagi', label: 'DO Pagi', type: 'number', unit: 'ppm', threshold: { default: { dangerMin: 4 } }, hint: 'DO', group: 'Pagi' },
      { key: 'phPagi', label: 'pH Pagi', type: 'number', threshold: { default: { safeMin: 7, safeMax: 8.5 } }, group: 'Pagi' },
      { key: 'suhuSore', label: 'Suhu Sore', type: 'number', unit: '°C', group: 'Sore' },
      { key: 'doSore', label: 'DO Sore', type: 'number', unit: 'ppm', threshold: { default: { dangerMin: 4 } }, hint: 'DO', group: 'Sore' },
      { key: 'phSore', label: 'pH Sore', type: 'number', threshold: { default: { safeMin: 7, safeMax: 8.5 } }, group: 'Sore' },
      { key: 'deltaSuhu', label: 'Selisih Suhu', type: 'computed', compute: 'deltaSuhu', unit: '°C', group: 'Selisih Pagi-Sore' },
      { key: 'deltaPh', label: 'Selisih pH', type: 'computed', compute: 'deltaPh', group: 'Selisih Pagi-Sore' },
      { key: 'salinitas', label: 'Salinitas', type: 'number', unit: 'g/l', threshold: { default: { safeMin: 25, safeMax: 34 } }, group: 'Harian' },
      { key: 'amonium', label: 'Amonium (TAN)', type: 'number', unit: 'mg/l', threshold: { default: { dangerMax: 0.3 } }, hint: 'TAN', group: 'Harian' },
      { key: 'NH3pagi', label: 'NH3 Pagi', type: 'computed', compute: 'NH3pagi', unit: 'mg/l', hint: 'NH3', group: 'Harian' },
      { key: 'NH3sore', label: 'NH3 Sore', type: 'computed', compute: 'NH3sore', unit: 'mg/l', hint: 'NH3', group: 'Harian' },
      { key: 'nitrit', label: 'Nitrit', type: 'number', unit: 'mg/l', threshold: { default: { dangerMax: 0.06 } }, group: 'Harian' },
      { key: 'alkalinitas', label: 'Alkalinitas', type: 'number', unit: 'mg/l', threshold: { default: { safeMin: 100, safeMax: 150 } }, hint: 'PDF §04: diukur 3x per minggu, bukan harian.', group: 'Harian', kadens: { tipe: 'mingguan', perMinggu: 3 } },
      // Dilebur dari kategori 'pergantianAirLarvae' agar §04 tetap SATU formulir:
      // konteks (bak/siklus/tanggal) tidak ditanyakan dua kali ke petugas.
      { key: 'levelAir', label: 'Level Air', type: 'number', unit: 'cm', group: 'Pergantian Air' },
      { key: 'debit', label: 'Debit', type: 'number', unit: 'L/min', group: 'Pergantian Air' },
      { key: 'volumeAir', label: 'Volume Air Bak', type: 'number', unit: 'L', group: 'Pergantian Air' },
      { key: 'volumeGanti', label: 'Volume Diganti', type: 'number', unit: 'L', group: 'Pergantian Air' },
      // Persentase dihitung, bukan ditulis ulang oleh petugas.
      { key: 'persenGantiAir', label: 'Pergantian Air', type: 'computed', compute: 'persenGantiAir', unit: '%', group: 'Pergantian Air' }
    ]
  },

  // Domain: Tindakan & Perlakuan (Log Tindakan)
  {
    id: 'prodLogTindakan',
    division: 'produksi',
    section: '12',
    collection: 'records',
    title: 'Log Tindakan & Perlakuan',
    frekuensi: 'setiap tindakan',
    fields: [
      { key: 'tankId', label: 'Tank / Bak', type: 'text', required: true },
      { key: 'siklusId', label: 'Siklus', type: 'ref', ref: 'siklus' },
      { key: 'tanggal', label: 'Tanggal', type: 'date', required: true },
      { key: 'jam', label: 'Jam', type: 'text', required: true },
      { key: 'jenisTindakan', label: 'Jenis Tindakan', type: 'select', options: ['pergantian air', 'pemberian probiotik', 'bahan kimia/desinfektan', 'penyesuaian suhu/salinitas', 'penyiponan', 'tindakan lain'], required: true },
      { key: 'dosis', label: 'Dosis / Volume', type: 'text' },
      { key: 'alasan', label: 'Alasan Tindakan', type: 'textarea' },
      { key: 'petugas', label: 'Petugas', type: 'text' }
    ]
  },

  // Domain: Larvae (observasi harian, pakan, probiotik = Produksi)
  {
    id: 'prodLarvae',
    code: '13',
    division: 'produksi',
    section: '06',
    collection: 'records',
    title: 'Observasi Bak Larvae',
    // PDF §06: "Distribusi stadia ... 2x sehari (pagi dan sore), per tank".
    frekuensi: '2x sehari (pagi & sore)',
    fields: [
      { key: 'tankId', label: 'Bak Larvae', type: 'ref', ref: 'tank', required: true },
      { key: 'siklusId', label: 'Siklus', type: 'ref', ref: 'siklus', required: true },
      { key: 'tanggal', label: 'Tanggal', type: 'date', required: true },
      { key: 'waktu', label: 'Waktu Pengamatan', type: 'select', options: ['pagi', 'sore'], required: true },
      { key: 'stadia', label: 'Stadia Dominan', type: 'select', options: STAGES, required: true },
      { key: 'sinkronMolting', label: 'Sinkronisasi Molting', type: 'select', options: ['seragam', 'tidak-seragam'], threshold: { badValues: ['tidak-seragam'] }, hint: 'Stadia tak seragam memicu kanibalisme' },
      // §06 PDF: "Distribusi stadia (% larva di tiap stadia)", 2x sehari per tank.
      // Sebaran melebar = perkembangan tidak serempak, peringatan dini sebelum defect muncul.
      { key: 'distN', label: 'Nauplius', type: 'number', unit: '%', group: 'Distribusi Stadia' },
      { key: 'distZ1', label: 'Zoea 1', type: 'number', unit: '%', group: 'Distribusi Stadia' },
      { key: 'distZ2', label: 'Zoea 2', type: 'number', unit: '%', group: 'Distribusi Stadia' },
      { key: 'distZ3', label: 'Zoea 3', type: 'number', unit: '%', group: 'Distribusi Stadia' },
      { key: 'distM1', label: 'Mysis 1', type: 'number', unit: '%', group: 'Distribusi Stadia' },
      { key: 'distM2', label: 'Mysis 2', type: 'number', unit: '%', group: 'Distribusi Stadia' },
      { key: 'distM3', label: 'Mysis 3', type: 'number', unit: '%', group: 'Distribusi Stadia' },
      { key: 'distPl', label: 'Post Larvae', type: 'number', unit: '%', group: 'Distribusi Stadia' },
      { key: 'totalDistribusiStadia', label: 'Total Distribusi', type: 'computed', compute: 'totalDistribusiStadia', unit: '%', group: 'Distribusi Stadia' },

      // PDF §06: "Kepadatan dan estimasi jumlah populasi larva" serta
      // "Survival rate harian" — keduanya harian & per tank.
      { key: 'kepadatan', label: 'Kepadatan Larva', type: 'number', unit: 'ekor/l', group: 'Populasi' },
      { key: 'populasiTebar', label: 'Populasi Tebar Awal Bak', type: 'number', unit: 'ekor', group: 'Populasi' },
      { key: 'estimasiPopulasi', label: 'Estimasi Populasi Saat Ini', type: 'number', unit: 'ekor', group: 'Populasi' },
      { key: 'srHarian', label: 'Survival Rate Harian', type: 'computed', compute: 'srHarian', unit: '%', precision: 2, group: 'Populasi' },
      { key: 'pengamatan', label: 'Pengamatan', type: 'textarea', owner: 'lab' }
    ]
  },
  {
    id: 'prodPakan',
    division: 'produksi',
    section: '03',
    collection: 'records',
    title: 'Asupan Pakan Larva (Feeding Table)',
    frekuensi: 'harian',
    fields: [
      { key: 'tankId', label: 'Tank', type: 'ref', ref: 'tank', required: true },
      { key: 'siklusId', label: 'Siklus', type: 'ref', ref: 'siklus', required: true },
      { key: 'tanggal', label: 'Tanggal', type: 'date', required: true },
      { key: 'stadia', label: 'Stadia', type: 'select', options: STAGES, required: true },
      { key: 'jenisPakan', label: 'Jenis Pakan', type: 'select', options: ['artemia', 'algae', 'buatan'], required: true },
      { key: 'jumlahDiberikan', label: 'Jumlah Diberikan', type: 'number', required: true },
      { key: 'polaKonsumsi', label: 'Pola Konsumsi', type: 'select', options: ['habis', 'sisa'] },
      { key: 'sisa', label: 'Sisa Pakan', type: 'number' },
      { key: 'waktu', label: 'Waktu', type: 'text' }
    ]
  },

  // Domain: Larvae — Estimasi Populasi & SR (sumber: file observasi "ALL").
];

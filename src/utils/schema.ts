import { SectionId } from '@domainTypes/index';

// Konstanta stadia & opsi PCR ada di modul sendiri; di-re-export agar API
// `@utils/schema` tetap sama seperti sebelum dipecah.
export { STAGES, PCR_OPTIONS } from './stages';

// Definisi kategori data-entry dipecah ke `utils/categories/*` agar tiap file
// tetap ringkas; agregatnya di-re-export di sini.
export { CATEGORIES } from './categories';

// Judul bagian dokumen parameter (dipakai sebagai judul sidebar, picker, & toolbar).
// §13 Hasil di Tambak dihapus — di luar scope hatchery (keputusan 2026-08-20).
export const SECTION_LABELS: Record<SectionId, string> = {
  '01': 'Induk & Pemijahan',
  '02': 'Air Baku & Treatment',
  '03': 'Pakan Hidup & Probiotik',
  '04': 'Kualitas Air Tank',
  '05': 'Mikrobiologi Tank',
  '06': 'Perkembangan & Survival',
  '07': 'Defect & Abnormalitas',
  '08': 'Ukuran & Keseragaman PL',
  '09': 'Kualitas PL Sebelum Kirim',
  '10': 'Panen, Packing, Kirim',
  '11': 'Traceability Siklus',
  '12': 'Log Tindakan & Perlakuan'
};


// Urutan tampil 12 seksi resmi dokumen parameter PDF di sidebar & formulir.
export const SECTION_ORDER: SectionId[] = [
  '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'
];


export const GLOSSARY: Record<string, string> = {
  'NH3': 'Ammonia bebas (beracun), dihitung dari TAN, suhu, dan pH.',
  'TAN': 'Total Ammonia Nitrogen.',
  'DO': 'Dissolved Oxygen (Oksigen Terlarut).',
  'TVC': 'Total Vibrio Count.',
  'TBC': 'Total Bacteria Count.',
  'TCBS': 'Thiosulfate-citrate-bile salts-sucrose agar (media selektif Vibrio).',
  'ORP': 'Oxidation-Reduction Potential.',
  'DOC': 'Day of Culture (Hari Pemeliharaan).',
  'SR': 'Survival Rate (Persentase Hidup).',
  'CV': 'Coefficient of Variation (Keseragaman ukuran).',
  'MGR': 'Muscle-Gut Ratio (rasio otot:usus PL).',
  'MB': 'Microbiology.'
};

export const DEFAULT_ACTIONS: Record<string, { tindakan: string; kontakRole: string }> = {
  'nh3_bahaya': { tindakan: 'Ganti air, kurangi pakan, periksa biofilter.', kontakRole: 'kepala' },
  'vibrio_luminescent': { tindakan: 'Periksa sumber air, terapkan desinfeksi tambahan.', kontakRole: 'kepala' },
  'do_rendah': { tindakan: 'Cek aerasi, tingkatkan blower.', kontakRole: 'pj' },
  // PCR positif (patogen apa pun) → biosecurity kritis.
  'pcr_positif': { tindakan: 'Karantina/hentikan batch, telusuri sumber penularan, laporkan biosecurity.', kontakRole: 'kepala' },
  // TVC naik pasca-ozon = sistem treatment mulai gagal.
  'tvc_bahaya': { tindakan: 'Cek generator ozon & lampu UV, hentikan alir air ke bak larva.', kontakRole: 'kepala' },
  // Stress test survival rendah = PL rapuh, jangan dikirim.
  'stresssurvival_bahaya': { tindakan: 'Tunda pengiriman batch, evaluasi kesehatan PL & riwayat siklus.', kontakRole: 'kepala' },

  // Tingkat waspada wajib punya tindakannya sendiri: PDF meminta tindakan pada
  // ambang waspada, bukan hanya saat sudah terlanjur bahaya.
  'nh3_waspada': { tindakan: 'Kurangi pakan, siapkan pergantian air, ukur ulang sore ini.', kontakRole: 'pj' },
  'do_waspada': { tindakan: 'Periksa aerasi dan sebaran batu aerasi di bak.', kontakRole: 'pj' },
  'tvc_waspada': { tindakan: 'Ulangi plating, periksa titik sebelum & sesudah treatment.', kontakRole: 'pj' },
  'suhu_waspada': { tindakan: 'Periksa heater/chiller dan naungan bak; ukur ulang 2 jam lagi.', kontakRole: 'pj' }
};

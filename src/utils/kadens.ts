/**
 * Kadens = bentuk frekuensi yang bisa dibaca mesin.
 *
 * `Category.frekuensi` tetap dipertahankan sebagai label manusia dan dikunci
 * test terhadap PDF klien; kadens di sini adalah pasangannya yang menggerakkan
 * daftar tugas. Keduanya sengaja dipisah supaya perbaikan logika tidak pernah
 * diam-diam mengubah kalimat yang berasal dari dokumen parameter.
 */
import type { Kadens } from '@domainTypes/index';
export type { Kadens, SlotWaktu } from '@domainTypes/index';

/**
 * Kadens per kategori, diturunkan langsung dari kolom FREKUENSI di PDF klien.
 * Sengaja dikumpulkan di satu tabel, bukan disebar ke 35 definisi kategori,
 * supaya kesesuaian dengan PDF bisa dibaca sekali pandang.
 */
export const KADENS: Record<string, Kadens> = {
  // §01 Induk dan Pemijahan
  induk: { tipe: 'peristiwa', peristiwa: 'kedatangan batch induk' },
  spawnerKontrol: { tipe: 'harian', perHari: 1 },
  prodInduk: { tipe: 'harian', perHari: 1 },
  spawn: { tipe: 'peristiwa', peristiwa: 'pemijahan' },
  prodPakanSegar: { tipe: 'peristiwa', peristiwa: 'kedatangan pakan segar' },
  labPcrInduk: { tipe: 'peristiwa', peristiwa: 'kedatangan induk / gejala' },
  labPcrPakanSegar: { tipe: 'peristiwa', peristiwa: 'kedatangan pakan segar' },


  // §02 Air Baku dan Sistem Treatment
  airBaku: { tipe: 'peristiwa', peristiwa: 'pengisian tandon' },
  treatmentOzon: { tipe: 'harian', perHari: 2, slotTerpisah: true },
  labAirTreatment: { tipe: 'harian', perHari: 1 },
  labCarbonTest: { tipe: 'berkala', catatan: 'interval belum ditetapkan klien' },
  perawatanTreatment: { tipe: 'peristiwa', peristiwa: 'tindakan perawatan' },

  // §03 Pakan Hidup dan Probiotik
  prodAlgaeKondisi: { tipe: 'harian', perHari: 1 },
  prodAlgae: { tipe: 'harian', perHari: 1 },
  prodPakan: { tipe: 'harian', perHari: 1 },
  artemia: { tipe: 'peristiwa', peristiwa: 'penetasan artemia' },
  prodProbiotik: { tipe: 'peristiwa', peristiwa: 'batch probiotik baru' },
  labAlgaeMikro: { tipe: 'harian', perHari: 1 },
  labArtemiaMikro: { tipe: 'harian', perHari: 1 },
  labProbiotikMutu: { tipe: 'peristiwa', peristiwa: 'batch probiotik baru' },

  // §04 Kualitas Air Tank Larva dan PL
  // Dua kali sehari tetapi SATU baris: pagi & sore jadi kolom terpisah
  // (suhuPagi/suhuSore), supaya selisihnya bisa dihitung tanpa antar-record.
  prodAirRutin: { tipe: 'harian', perHari: 2, slotTerpisah: false },

  // §05 Mikrobiologi Tank Larva dan PL
  labMikro: { tipe: 'harian', perHari: 1 },
  labMikroBody: { tipe: 'harian', perHari: 1 },

  // §06 Perkembangan Stadia dan Kelangsungan Hidup
  prodLarvae: { tipe: 'harian', perHari: 2, slotTerpisah: true },
  prodPostLarvae: { tipe: 'harian', perHari: 1 },
  prodEstimasiSr: { tipe: 'peristiwa', peristiwa: 'pergantian stadia' },

  // §07 Defect dan Abnormalitas
  labDefectNZ: { tipe: 'harian', perHari: 1 },
  labDefectMysis: { tipe: 'harian', perHari: 1 },
  labDefectPl: { tipe: 'harian', perHari: 1 },

  // §08 Ukuran dan Keseragaman PL
  labUkuranPl: { tipe: 'harian', perHari: 1 },

  // §09 Kualitas PL Sebelum Panen
  labKualitasPlPrePanen: { tipe: 'peristiwa', peristiwa: 'batch sebelum dikirim' },

  // §10 Panen, Packing, dan Pengiriman
  panenPl: { tipe: 'peristiwa', peristiwa: 'pengiriman' },

  // §12 Log Tindakan dan Perlakuan
  prodLogTindakan: { tipe: 'peristiwa', peristiwa: 'tindakan' },
};

export function kadensOf(categoryId: string): Kadens | undefined {
  return KADENS[categoryId];
}

/** Hanya kadens kalender yang bisa jadi tugas terjadwal. */
export function terjadwal(k: Kadens | undefined): boolean {
  return k?.tipe === 'harian' || k?.tipe === 'mingguan';
}

/**
 * Pemeriksaan yang PDF sebut "berkala" tanpa menyebut intervalnya. Karena PDF
 * sendiri menyerahkan keputusan itu ("Interval pengujian perlu ditetapkan"),
 * jadwalnya ditetapkan Kepala Divisi lewat halaman Jadwal Berkala — bukan
 * ditebak di sini.
 *
 * `labPcrInduk` ikut masuk walau kadensnya peristiwa: PDF memintanya "saat
 * kedatangan, lalu BERKALA, dan setiap ada gejala" — jadi ia butuh dua lapis.
 */
export const PERLU_JADWAL_KEPALA = ['labCarbonTest', 'labPcrInduk'];

/** Perkakas tanggal untuk penjadwalan tugas. Dipisah agar tugas.ts tetap ringkas. */

/**
 * Tanggal kalender menurut jam dinding setempat. toISOString() memakai UTC,
 * sehingga di WITA (UTC+8) seluruh entri sebelum pukul 08:00 akan terbaca
 * sebagai hari kemarin dan tugas hari ini salah dinyatakan terlambat.
 */
export function tanggalLokal(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Senin sebagai awal minggu. */
export function awalMinggu(tanggal: string): string {
  const d = new Date(tanggal + 'T00:00:00Z');
  const hari = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - hari);
  return d.toISOString().slice(0, 10);
}

export function majuHari(tanggal: string, maju: number): string {
  return geserHari(tanggal, -maju);
}

export function geserHari(tanggal: string, mundur: number): string {
  const d = new Date(tanggal + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - mundur);
  return d.toISOString().slice(0, 10);
}

/** Sisa hari sampai akhir minggu, termasuk hari ini. */
export function hariTersisaMinggu(tanggal: string): number {
  return 7 - Math.round((Date.parse(tanggal) - Date.parse(awalMinggu(tanggal))) / 86_400_000);
}

export function lewatBatas(tanggal: string, sekarang: Date, batasJam: number): boolean {
  const hariIni = tanggalLokal(sekarang);
  if (tanggal < hariIni) return true;
  if (tanggal > hariIni) return false;
  return sekarang.getHours() >= batasJam;
}

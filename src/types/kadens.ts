/**
 * Bentuk frekuensi yang bisa dibaca mesin. Pasangan dari label `frekuensi`
 * yang tetap memakai kalimat PDF klien apa adanya.
 */
export type Kadens =
  /** Terjadwal tiap hari. `slotTerpisah` = pagi & sore jadi dua baris data. */
  | { tipe: 'harian'; perHari: number; slotTerpisah?: boolean }
  /** Terjadwal beberapa kali per minggu, harinya bebas (mis. alkalinitas). */
  | { tipe: 'mingguan'; perMinggu: number }
  /** Dipicu peristiwa, bukan kalender — tidak pernah jadi tugas harian. */
  | { tipe: 'peristiwa'; peristiwa: string }
  /** PDF menyebut "berkala" tanpa interval; belum bisa dijadwalkan. */
  | { tipe: 'berkala'; catatan: string };

export type SlotWaktu = 'pagi' | 'sore';

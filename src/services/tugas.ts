import type { Category } from '@domainTypes/index';
import { kadensOf, type SlotWaktu } from '@utils/kadens';
import { tugasHarian, tugasMingguan, tugasField, tugasBerkala, perBak, type RecordLike, type BakRingkas } from './tugasPembangun';
import type { PetaJadwal } from './jadwalBerkala';

export { BATAS_JAM, perBak } from './tugasPembangun';
export type { BakRingkas, RecordLike } from './tugasPembangun';

export { tanggalLokal, awalMinggu } from '@utils/waktuJadwal';

/**
 * Penurunan daftar tugas dari kadens. Murni: tanggal & jam disuntikkan, tanpa
 * akses penyimpanan, sehingga bisa diuji langsung.
 *
 * Inti aturannya: tugas lahir dari jadwal, bukan dari data yang sudah ada.
 * Dengan begitu pengukuran yang TIDAK dilakukan tetap terlihat — kebalikan dari
 * alert nilai, yang secara konstruksi hanya bisa melihat data yang tercatat.
 */

export type StatusTugas = 'terisi' | 'belum' | 'terlambat';

export type Tugas = {
  id: string;
  categoryId: string;
  judul: string;
  /** Terisi bila parameter ini diukur per bak (PDF menandainya "per tank"). */
  tankId?: string;
  slot?: SlotWaktu;
  status: StatusTugas;
  /** Label frekuensi manusia, apa adanya dari PDF klien. */
  frekuensiLabel?: string;
  /** Terisi untuk kadens mingguan: sisa pengukuran minggu berjalan. */
  sisaMingguIni?: number;
};

/**
 * Tugas terjadwal untuk satu tanggal. Kategori berkadens peristiwa/berkala
 * sengaja tidak muncul: memaksanya jadi tugas harian hanya melatih petugas
 * mengabaikan daftar.
 */
export function turunkanTugas(opts: {
  categories: Category[];
  records: RecordLike[];
  tanggal: string;
  sekarang?: Date;
  /**
   * Bak yang sedang berisi. Bila diisi, parameter ber-"per tank" melahirkan satu
   * tugas per bak — mengisi satu bak tidak lagi menandai seluruh kategori tuntas.
   * Bila kosong, penurunan jatuh ke satu tugas per kategori.
   */
  bak?: BakRingkas[];
  /** Jadwal berkala yang ditetapkan Kepala, per categoryId. */
  jadwal?: PetaJadwal;
}): Tugas[] {
  const { categories, records, tanggal } = opts;
  const sekarang = opts.sekarang ?? new Date();
  const bak = opts.bak ?? [];
  const jadwal = opts.jadwal ?? {};
  const hasil: Tugas[] = [];

  for (const c of categories) {
    const k = kadensOf(c.id);
    if (!k) continue;

    if (k.tipe === 'harian') {
      const perBakIni = perBak(c) && bak.length > 0;
      if (perBakIni) {
        for (const b of bak) hasil.push(...tugasHarian(c, k, records, tanggal, sekarang, b));
      } else {
        hasil.push(...tugasHarian(c, k, records, tanggal, sekarang));
      }
    } else if (k.tipe === 'mingguan') {
      hasil.push(...tugasMingguan(c, k, records, tanggal, sekarang));
    }

    // Field berkadens sendiri menghasilkan tugasnya sendiri, terlepas dari
    // apakah kategorinya terjadwal.
    hasil.push(...tugasField(c, records, tanggal, sekarang));

    // Jadwal Kepala berlaku di atas kadens apa pun, termasuk 'peristiwa'.
    const j = jadwal[c.id];
    if (j) hasil.push(...tugasBerkala(c, j, records, tanggal, sekarang));
  }

  return hasil;
}

export function ringkasTugas(tugas: Tugas[]) {
  return {
    total: tugas.length,
    terisi: tugas.filter(t => t.status === 'terisi').length,
    terlambat: tugas.filter(t => t.status === 'terlambat').length,
    belum: tugas.filter(t => t.status === 'belum').length,
  };
}

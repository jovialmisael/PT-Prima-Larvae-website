import type { JadwalBerkala } from '@domainTypes/index';
import { list, get, create, update } from './api';
import { majuHari } from '@utils/waktuJadwal';

/** Jadwal pemeriksaan berkala yang ditetapkan Kepala Divisi. */

export type PetaJadwal = Record<string, JadwalBerkala>;

export async function muatJadwal(): Promise<PetaJadwal> {
  const rows = await list('jadwalBerkala');
  return Object.fromEntries((rows as JadwalBerkala[]).map(j => [j.categoryId, j]));
}

export async function simpanJadwal(j: JadwalBerkala) {
  const ada = await get('jadwalBerkala', j.id);
  return ada ? update('jadwalBerkala', j.id, j) : create('jadwalBerkala', j);
}

/** Selisih hari antara dua tanggal kalender. */
function selisihHari(dari: string, sampai: string): number {
  return Math.round((Date.parse(sampai) - Date.parse(dari)) / 86_400_000);
}

/**
 * Tanggal pemeriksaan terakhir yang sudah jatuh tempo pada `tanggal`.
 * Null bila jadwalnya belum mulai atau sudah selesai (sekali jalan).
 */
export function jatuhTempoTerakhir(j: JadwalBerkala, tanggal: string): string | null {
  if (!j.aktif || tanggal < j.mulai) return null;

  const lewat = selisihHari(j.mulai, tanggal);
  if (j.intervalHari <= 0) return j.mulai; // sekali saja
  const ke = Math.floor(lewat / j.intervalHari);
  return majuHari(j.mulai, ke * j.intervalHari);
}

/** Pemeriksaan berikutnya setelah `tanggal` — untuk ditampilkan ke Kepala. */
export function jatuhTempoBerikut(j: JadwalBerkala, tanggal: string): string | null {
  if (!j.aktif) return null;
  if (tanggal < j.mulai) return j.mulai;
  if (j.intervalHari <= 0) return null;

  const terakhir = jatuhTempoTerakhir(j, tanggal);
  return terakhir ? majuHari(terakhir, j.intervalHari) : null;
}

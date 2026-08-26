import { list } from './api';
import type { Penempatan, Siklus, Tank } from '@domainTypes/index';

/** Bak yang sedang berisi larva pada siklus berjalan. */
export type BakRingkas = { id: string; nama: string };

const SIKLUS_JALAN = new Set(['setup', 'aktif', 'panen']);

/**
 * Bak aktif = punya penempatan yang belum ditutup pada siklus yang belum
 * selesai. Dipakai penurunan tugas agar "per tank" di PDF benar-benar berarti
 * satu tugas per bak, bukan satu tugas per formulir.
 */
export async function muatBakAktif(): Promise<BakRingkas[]> {
  const [penempatan, siklus, tank] = await Promise.all([
    list('penempatan'), list('siklus'), list('tank'),
  ]);

  const siklusJalan = new Set(
    (siklus as Siklus[]).filter(s => SIKLUS_JALAN.has(s.status)).map(s => s.id),
  );
  const namaTank = new Map((tank as Tank[]).map(t => [t.id, t.namaTank]));

  const idBak = new Set(
    (penempatan as Penempatan[])
      .filter(p => !p.tglKeluar && siklusJalan.has(p.siklusId))
      .map(p => p.tankId),
  );

  return [...idBak].map(id => ({ id, nama: namaTank.get(id) ?? id }));
}

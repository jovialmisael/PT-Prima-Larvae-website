import { list } from '@services/api';
import { CATEGORIES } from '@utils/schema';

const LABEL_DIVISI: Record<string, string> = {
  produksi: 'Produksi',
  lab: 'Laboratorium',
  mpm: 'MPM',
  manager: 'Manager',
};

export type RekapKategori = {
  categoryId: string;
  judul: string;
  divisi: string;
  total: number;
  draft: number;
  qc: number;
  disahkan: number;
  ditolak: number;
};

/**
 * Rekap jumlah record per kategori beserta sebaran statusnya.
 * Kategori tanpa satu pun record sengaja tidak ditampilkan, supaya tabel
 * memuat fakta saja — bukan daftar panjang berisi nol.
 */
export async function rekapKategori(): Promise<RekapKategori[]> {
  const records = await list('records');
  const hasil: RekapKategori[] = [];

  for (const c of CATEGORIES) {
    const milik = records.filter((r: any) => r.categoryId === c.id);
    if (milik.length === 0) continue;

    const berstatus = (s: string) => milik.filter((r: any) => r.status === s).length;
    hasil.push({
      categoryId: c.id,
      judul: c.title,
      divisi: LABEL_DIVISI[c.division] ?? c.division,
      total: milik.length,
      draft: berstatus('draft'),
      qc: berstatus('qc'),
      disahkan: berstatus('disahkan'),
      ditolak: berstatus('ditolak'),
    });
  }

  return hasil.sort((a, b) => b.total - a.total);
}

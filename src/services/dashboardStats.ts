import { list } from './api';
import { scanAlerts } from './alerts';
import { CATEGORIES } from '@utils/schema';

/**
 * Angka ringkasan untuk dashboard — SELURUHNYA diturunkan dari data tersimpan.
 * Tidak ada nilai karangan di sini: kalau datanya belum ada, angkanya nol dan
 * layar wajib menampilkan state kosong, bukan contoh (kontrak Product DNA).
 */
export type RingkasanOperasi = {
  tankAktif: number;
  siklusAktif: number;
  indukAktif: number;
  recordHariIni: number;
  menungguQc: number;
  menungguPengesahan: number;
  disahkan: number;
  ditolak: number;
  alertAktif: number;
  alertBahaya: number;
  /** true bila belum ada satu pun record — pemicu state kosong di UI. */
  kosong: boolean;
};

export function tanggalHariIni(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function ringkasanOperasi(): Promise<RingkasanOperasi> {
  const [tank, siklus, induk, records, alerts] = await Promise.all([
    list('tank'),
    list('siklus'),
    list('induk'),
    list('records'),
    scanAlerts(),
  ]);

  const hariIni = tanggalHariIni();
  const berstatus = (s: string) => records.filter((r: any) => r.status === s).length;

  return {
    tankAktif: tank.filter((t: any) => t.status !== 'nonaktif').length,
    siklusAktif: siklus.filter((s: any) => s.status === 'aktif' || s.status === 'setup').length,
    indukAktif: induk.filter((i: any) => i.status === 'aktif').length,
    recordHariIni: records.filter((r: any) => r.tanggal === hariIni).length,
    menungguQc: berstatus('draft'),
    menungguPengesahan: berstatus('qc'),
    disahkan: berstatus('disahkan'),
    ditolak: berstatus('ditolak'),
    alertAktif: alerts.length,
    alertBahaya: alerts.filter(a => a.tingkat === 'bahaya').length,
    kosong: records.length === 0,
  };
}

/** Satu bak yang menjadi tanggung jawab petugas hari ini. */
export type TugasBak = {
  tankId: string;
  namaTank: string;
  siklusId: string;
  sudahDicatat: boolean;
  status: 'belum' | 'draft' | 'qc' | 'disahkan' | 'ditolak';
};

/**
 * Daftar bak pada siklus yang sedang berjalan, beserta apakah observasi
 * hariannya sudah dicatat. Diturunkan dari `penempatan` (tank dalam siklus)
 * dan record `prodLarvae` bertanggal hari ini.
 */
export async function tugasBakHariIni(tanggal = tanggalHariIni()): Promise<TugasBak[]> {
  const [siklus, penempatan, tank, records] = await Promise.all([
    list('siklus'),
    list('penempatan'),
    list('tank'),
    list('records', (r: any) => r.categoryId === 'prodLarvae' && r.tanggal === tanggal),
  ]);

  const siklusBerjalan = new Set(
    siklus.filter((s: any) => s.status === 'aktif' || s.status === 'setup' || s.status === 'panen').map((s: any) => s.id),
  );

  const tugas: TugasBak[] = [];
  for (const p of penempatan) {
    if (!siklusBerjalan.has(p.siklusId)) continue;
    if (p.tglKeluar) continue; // tank sudah keluar dari siklus ini

    const t = tank.find((x: any) => x.id === p.tankId);
    const rec = records.find((r: any) => r.tankId === p.tankId && r.siklusId === p.siklusId);

    tugas.push({
      tankId: p.tankId,
      namaTank: t?.namaTank ?? p.tankId,
      siklusId: p.siklusId,
      sudahDicatat: !!rec,
      status: rec ? (rec.status ?? 'draft') : 'belum',
    });
  }

  return tugas.sort((a, b) => a.namaTank.localeCompare(b.namaTank));
}

/** Ringkasan pengisian per kategori untuk satu divisi (dipakai dashboard Lab). */
export type IsianKategori = {
  categoryId: string;
  judul: string;
  jumlahHariIni: number;
};

export async function isianKategoriHariIni(
  division: string,
  area?: string,
  tanggal = tanggalHariIni(),
): Promise<IsianKategori[]> {
  const records = await list('records', (r: any) => r.tanggal === tanggal);

  return CATEGORIES
    .filter(c => c.division === division && (!area || !c.area || c.area === area))
    .map(c => ({
      categoryId: c.id,
      judul: c.title,
      jumlahHariIni: records.filter((r: any) => r.categoryId === c.id).length,
    }));
}

import { list } from '@services/api';

export type CatatanPanen = {
  id: string;
  tanggal: string;
  tankId: string;
  siklusId: string;
  stadia: string;
  umurDoc?: number;
  jumlahPl: number;
  jumlahKantong?: number;
  status: string;
};

const LABEL_STATUS: Record<string, string> = {
  draft: 'Menunggu QC',
  qc: 'Menunggu pengesahan',
  disahkan: 'Disahkan',
  ditolak: 'Ditolak',
};

/**
 * Riwayat panen dari record kategori `panenPl` (bagian 10 PDF klien).
 * Basis satuan adalah EKOR — bukan biomassa jual (batas cakupan hatchery).
 */
export async function riwayatPanen(): Promise<CatatanPanen[]> {
  const records = await list('records', (r: any) => r.categoryId === 'panenPl');

  return records
    .map((r: any) => ({
      id: r.id,
      tanggal: r.tanggal ?? '-',
      tankId: r.tankId ?? '-',
      siklusId: r.siklusId ?? '-',
      stadia: r.stadiaPanen ?? '-',
      umurDoc: r.umurDoc,
      jumlahPl: Number(r.jumlahPlTotal) || 0,
      jumlahKantong: r.jumlahKantong,
      status: LABEL_STATUS[r.status] ?? (r.status ?? '-'),
    }))
    .sort((a: CatatanPanen, b: CatatanPanen) => b.tanggal.localeCompare(a.tanggal));
}

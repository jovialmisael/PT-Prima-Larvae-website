import { list, verify, tolak } from '@services/api';
import { CATEGORIES } from '@utils/schema';
import { canQcMpm, canSahkan, type RoleDef } from '@services/rolesConfig';
import type { Category } from '@domainTypes/index';

/** Satu baris antrean pengesahan, diturunkan dari record nyata. */
export type AntreanItem = {
  id: string;
  divisi: string;
  objek: string;
  parameter: string;
  nilai: string;
  petugas: string;
  waktu: string;
  status: string;
  /** Langkah yang boleh dijalankan role saat ini; null bila tidak berwenang. */
  langkah: 'qc' | 'sahkan' | null;
  alasanTolak?: string;
  record: any;
};

const LABEL_DIVISI: Record<string, string> = {
  produksi: 'Produksi',
  lab: 'Laboratorium',
  mpm: 'MPM',
  manager: 'Manager',
};

/** Ringkasan isi record: beberapa field berambang yang paling menjelaskan. */
function ringkasNilai(record: any, category: Category): string {
  const bagian: string[] = [];
  for (const f of category.fields) {
    if (bagian.length >= 2) break;
    const v = record[f.key];
    if (v === undefined || v === null || v === '') continue;
    if (f.type === 'ref' || f.key === 'tanggal' || f.key === 'siklusId') continue;
    bagian.push(`${f.label}: ${v}${f.unit ? ' ' + f.unit : ''}`);
  }
  return bagian.length ? bagian.join(' • ') : '(tanpa nilai terisi)';
}

/**
 * Langkah berikutnya dalam rantai Draft → QC → Disahkan, sesuai kewenangan role.
 * `draft` menunggu QC (MPM); `qc` menunggu pengesahan Kepala divisi kategori.
 */
function langkahUntuk(record: any, category: Category, role: RoleDef | null): 'qc' | 'sahkan' | null {
  if (!role) return null;
  if (record.status === 'draft' && canQcMpm(role)) return 'qc';
  if (record.status === 'qc' && canSahkan(role, category)) return 'sahkan';
  return null;
}

/** Antrean pengesahan dari koleksi `records`. */
export async function muatAntrean(role: RoleDef | null): Promise<AntreanItem[]> {
  const records = await list('records');
  const items: AntreanItem[] = [];

  for (const r of records) {
    const category = CATEGORIES.find(c => c.id === r.categoryId);
    if (!category) continue;

    const waktu = r.dibuatPada
      ? new Date(r.dibuatPada).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      : '-';

    items.push({
      id: r.id,
      divisi: LABEL_DIVISI[category.division] ?? category.division,
      objek: r.tankId || r.siklusId || '-',
      parameter: category.title,
      nilai: ringkasNilai(r, category),
      petugas: r.dibuatOleh || '-',
      waktu,
      status: r.status || 'draft',
      langkah: langkahUntuk(r, category, role),
      alasanTolak: r.ditolakOleh?.alasan,
      record: r,
    });
  }

  return items.sort((a, b) => (b.record.dibuatPada || 0) - (a.record.dibuatPada || 0));
}

/** Jalankan langkah pengesahan; TTD wajib. Mengembalikan pesan galat, atau null bila sukses. */
export async function sahkanItem(
  item: AntreanItem,
  oleh: string,
  ttd: string,
): Promise<string | null> {
  if (!item.langkah) return 'Anda tidak berwenang pada langkah ini.';
  if (!ttd) return 'Tanda tangan wajib diisi.';

  const hasil = await verify('records', item.id, item.langkah, { oleh, pada: Date.now(), ttd });
  return hasil ? null : 'Gagal menyimpan pengesahan. Silakan coba lagi.';
}

/** Tolak record dengan alasan wajib. Mengembalikan pesan galat, atau null bila sukses. */
export async function tolakItem(
  item: AntreanItem,
  oleh: string,
  alasan: string,
): Promise<string | null> {
  if (!item.langkah) return 'Anda tidak berwenang pada langkah ini.';
  if (!alasan.trim()) return 'Alasan penolakan wajib diisi.';

  const hasil = await tolak('records', item.id, {
    step: item.langkah,
    alasan,
    stamp: { oleh, pada: Date.now(), alasan },
  });
  return hasil ? null : 'Gagal menyimpan penolakan. Silakan coba lagi.';
}

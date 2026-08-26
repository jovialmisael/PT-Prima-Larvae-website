import type { Category } from '@domainTypes/index';
import type { Kadens, SlotWaktu } from '@utils/kadens';
import { awalMinggu, hariTersisaMinggu, lewatBatas } from '@utils/waktuJadwal';
import { jatuhTempoTerakhir } from './jadwalBerkala';
import type { JadwalBerkala } from '@domainTypes/index';
import type { StatusTugas, Tugas } from './tugas';

// Pembangun tugas per jenis kadens. Dipisah dari tugas.ts supaya file itu
// tinggal memuat kontrak publiknya saja.

/** Batas jam sebuah tugas dianggap terlambat, bukan sekadar belum. */
export const BATAS_JAM: Record<'pagi' | 'sore' | 'harian', number> = {
  pagi: 12,
  sore: 20,
  harian: 20,
};

export type RecordLike = { categoryId?: string; tanggal?: string; waktu?: string; tankId?: string };

export type BakRingkas = { id: string; nama: string };

/** Kategori yang meminta konteks bak diukur per bak, bukan sekali per formulir. */
export const perBak = (c: Category) => c.fields.some(f => f.key === 'tankId');

function statusDari(terisi: boolean, tanggal: string, sekarang: Date, batas: number): StatusTugas {
  if (terisi) return 'terisi';
  return lewatBatas(tanggal, sekarang, batas) ? 'terlambat' : 'belum';
}

export function tugasHarian(
  c: Category,
  k: Extract<Kadens, { tipe: 'harian' }>,
  recs: RecordLike[],
  tanggal: string,
  sekarang: Date,
  bak?: BakRingkas,
): Tugas[] {
  const hariIni = recs.filter(r =>
    r.categoryId === c.id && r.tanggal === tanggal && (!bak || r.tankId === bak.id));

  const sufiks = bak ? `@${bak.id}` : '';
  const judul = bak ? `${c.title} — ${bak.nama}` : c.title;

  // Dua kali sehari dalam baris terpisah -> dua tugas, satu per slot.
  if (k.perHari >= 2 && k.slotTerpisah) {
    const slots: SlotWaktu[] = ['pagi', 'sore'];
    return slots.map(slot => ({
      id: `${c.id}${sufiks}:${slot}`,
      categoryId: c.id,
      tankId: bak?.id,
      judul,
      slot,
      frekuensiLabel: c.frekuensi,
      status: statusDari(hariIni.some(r => r.waktu === slot), tanggal, sekarang, BATAS_JAM[slot]),
    }));
  }

  // Sisanya satu tugas per hari — termasuk §04 yang memuat pagi & sore dalam
  // satu baris, sehingga slotnya urusan formulir, bukan urusan daftar tugas.
  return [{
    id: `${c.id}${sufiks}`,
    categoryId: c.id,
    tankId: bak?.id,
    judul,
    frekuensiLabel: c.frekuensi,
    status: statusDari(hariIni.length > 0, tanggal, sekarang, BATAS_JAM.harian),
  }];
}

export function tugasMingguan(c: Category, k: Extract<Kadens, { tipe: 'mingguan' }>, recs: RecordLike[], tanggal: string, sekarang: Date): Tugas[] {
  const awal = awalMinggu(tanggal);
  const sudah = recs.filter(r => r.categoryId === c.id && r.tanggal && r.tanggal >= awal && r.tanggal <= tanggal).length;
  const sisa = Math.max(0, k.perMinggu - sudah);

  // Terlambat bila sisa pengukuran sudah tidak muat lagi di sisa hari minggu ini.
  const hariTersisa = hariTersisaMinggu(tanggal);
  const status: StatusTugas = sisa === 0 ? 'terisi' : sisa > hariTersisa ? 'terlambat' : 'belum';

  return [{
    id: c.id,
    categoryId: c.id,
    judul: c.title,
    frekuensiLabel: c.frekuensi,
    sisaMingguIni: sisa,
    status: lewatBatas(tanggal, sekarang, BATAS_JAM.harian) && sisa > 0 && hariTersisa <= 1 ? 'terlambat' : status,
  }];
}

/**
 * Tugas untuk field yang kadensnya berbeda dari kategorinya. Contoh: alkalinitas
 * diukur 3x/minggu padahal formulir airnya harian, sehingga kalau ikut kadens
 * kategori ia akan tampak terlambat empat hari tiap minggu.
 */
export function tugasField(c: Category, recs: RecordLike[], tanggal: string, sekarang: Date): Tugas[] {
  const hasil: Tugas[] = [];

  for (const f of c.fields) {
    const k = f.kadens;
    if (!k) continue;

    if (k.tipe === 'mingguan') {
      const awal = awalMinggu(tanggal);
      const sudah = recs.filter(r =>
        r.categoryId === c.id && r.tanggal && r.tanggal >= awal && r.tanggal <= tanggal
        && (r as any)[f.key] !== undefined && (r as any)[f.key] !== null && (r as any)[f.key] !== ''
      ).length;
      const sisa = Math.max(0, k.perMinggu - sudah);
      const hariTersisa = hariTersisaMinggu(tanggal);

      hasil.push({
        id: `${c.id}#${f.key}`,
        categoryId: c.id,
        judul: `${f.label} — ${c.title}`,
        frekuensiLabel: `${k.perMinggu}x per minggu`,
        sisaMingguIni: sisa,
        status: sisa === 0 ? 'terisi' : sisa > hariTersisa ? 'terlambat' : 'belum',
      });
    }

    if (k.tipe === 'harian') {
      const terisi = recs.some(r =>
        r.categoryId === c.id && r.tanggal === tanggal
        && (r as any)[f.key] !== undefined && (r as any)[f.key] !== null && (r as any)[f.key] !== ''
      );
      hasil.push({
        id: `${c.id}#${f.key}`,
        categoryId: c.id,
        judul: `${f.label} — ${c.title}`,
        frekuensiLabel: `${k.perHari}x sehari`,
        status: statusDari(terisi, tanggal, sekarang, BATAS_JAM.harian),
      });
    }
  }

  return hasil;
}

/**
 * Pemeriksaan berkala yang jadwalnya ditetapkan Kepala Divisi.
 *
 * Berdiri terpisah dari kadens kategori, sehingga satu kategori bisa punya dua
 * lapis sekaligus — PCR induk misalnya dipicu kedatangan DAN dijadwalkan
 * berkala, persis seperti bunyi PDF.
 */
export function tugasBerkala(
  c: Category,
  jadwal: JadwalBerkala,
  recs: RecordLike[],
  tanggal: string,
  sekarang: Date,
): Tugas[] {
  const jatuhTempo = jatuhTempoTerakhir(jadwal, tanggal);
  if (!jatuhTempo) return [];

  // Terisi bila sudah ada pemeriksaan sejak tanggal jatuh temponya.
  const terisi = recs.some(r =>
    r.categoryId === c.id && r.tanggal && r.tanggal >= jatuhTempo && r.tanggal <= tanggal);

  const label = jadwal.intervalHari > 0
    ? `tiap ${jadwal.intervalHari} hari (jadwal Kepala)`
    : 'sekali, dijadwalkan Kepala';

  return [{
    id: `${c.id}~jadwal`,
    categoryId: c.id,
    judul: c.title,
    frekuensiLabel: label,
    status: terisi
      ? 'terisi'
      : (tanggal > jatuhTempo || lewatBatas(tanggal, sekarang, BATAS_JAM.harian)) ? 'terlambat' : 'belum',
  }];
}

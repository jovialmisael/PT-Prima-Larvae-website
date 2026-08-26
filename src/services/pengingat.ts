import type { Siklus, UmurPakai } from '@domainTypes/index';
import type { PetaJadwal } from './jadwalBerkala';
import { tanggalLokal } from '@utils/waktuJadwal';
import type { Tugas } from './tugas';
import {
  fasesSiklus, kondisiTreatment, umurPakaiKonsumabel, jadwalMendekat, ringkasKeterlambatan,
} from './pengingatAturan';

/**
 * Pengingat kontekstual untuk workspace.
 *
 * Tiga pelajaran yang membentuk modul ini:
 *
 * 1. Pemicu perawatan ada tiga jenis (praktik CMMS), bukan satu: WAKTU
 *    (kalender), UMUR PAKAI (seberapa lama sudah dipakai), dan KONDISI (hasil
 *    pemeriksaan bilang begitu). Karbon aktif contohnya jenuh menurut
 *    breakthrough, bukan menurut tanggal — dan breakthrough bisa terjadi jauh
 *    sebelum ada tanda fisik. Maka kondisi selalu menang atas kalender.
 *
 * 2. Pengingat harus datang SEBELUM tenggat, bukan hanya sesudah (pola
 *    "upcoming tasks" farmOS). Diberi tahu setelah terlambat bukan pengingat,
 *    itu laporan.
 *
 * 3. Setiap pengingat wajib bisa ditindaklanjuti. Yang tidak menuntut tindakan
 *    apa pun tidak boleh ada — ia hanya melatih orang mengabaikan sisanya.
 */

export type JenisPemicu = 'fase' | 'waktu' | 'umurPakai' | 'kondisi' | 'kepatuhan';
export type TingkatPengingat = 'info' | 'segera' | 'terlambat';

export type Pengingat = {
  id: string;
  jenis: JenisPemicu;
  tingkat: TingkatPengingat;
  judul: string;
  detail: string;
  /** Wajib. Pengingat tanpa tindakan tidak boleh diterbitkan. */
  tindakan: string;
  /** Rute atau kategori yang dituju bila pengingat diklik. */
  tujuan?: string;
  jatuhTempo?: string;
  /** Negatif berarti sudah lewat. */
  hariLagi?: number;
};

const URUTAN: Record<TingkatPengingat, number> = { terlambat: 0, segera: 1, info: 2 };

export function susunPengingat(opts: {
  siklus?: Siklus[];
  records?: any[];
  umurPakai?: UmurPakai[];
  jadwal?: PetaJadwal;
  judulKategori?: Record<string, string>;
  tugas?: Tugas[];
  tanggal?: string;
  /** Berapa hari ke depan yang ditengok. */
  lookaheadHari?: number;
}): Pengingat[] {
  const hariIni = opts.tanggal ?? tanggalLokal();
  const records = opts.records ?? [];
  const lookahead = opts.lookaheadHari ?? 7;

  const semua = [
    ...fasesSiklus(opts.siklus ?? []),
    ...kondisiTreatment(records),
    ...umurPakaiKonsumabel(opts.umurPakai ?? [], records, hariIni),
    ...jadwalMendekat(opts.jadwal ?? {}, opts.judulKategori ?? {}, records, hariIni, lookahead),
    ...ringkasKeterlambatan(opts.tugas ?? []),
  ];

  return semua.sort((a, b) =>
    URUTAN[a.tingkat] - URUTAN[b.tingkat] || (a.hariLagi ?? 99) - (b.hariLagi ?? 99));
}

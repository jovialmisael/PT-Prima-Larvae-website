import type { JadwalBerkala, Siklus, UmurPakai } from '@domainTypes/index';
import { jatuhTempoTerakhir, jatuhTempoBerikut, type PetaJadwal } from './jadwalBerkala';
import { majuHari } from '@utils/waktuJadwal';
import type { Tugas } from './tugas';
import type { Pengingat } from './pengingat';

// Satu fungsi per aturan pengingat. Semuanya murni: tanggal disuntikkan dan
// tidak ada akses penyimpanan, sehingga tiap aturan bisa diuji sendiri-sendiri.

const selisihHari = (dari: string, sampai: string) =>
  Math.round((Date.parse(sampai) - Date.parse(dari)) / 86_400_000);

/** R1 — Siklus yang sudah dibuat tetapi belum berjalan. */
export function fasesSiklus(siklus: Siklus[]): Pengingat[] {
  return siklus
    .filter(s => s.status === 'setup')
    .map(s => ({
      id: `fase:${s.id}`,
      jenis: 'fase' as const,
      tingkat: 'info' as const,
      judul: `Anda akan memulai siklus ${s.kodeBatch}`,
      detail: 'Siklus sudah dibuat tetapi belum berstatus aktif, sehingga baknya belum masuk daftar tugas harian.',
      tindakan: 'Pastikan bak sudah disiapkan dan air baku sudah ditreatment, lalu aktifkan siklusnya.',
      tujuan: '/master-siklus',
    }));
}

/**
 * R2 — Konsumabel treatment yang mendekati atau melewati umur pakainya.
 * Umur pakainya ditetapkan Kepala; tanpa itu tidak ada pengingat sama sekali.
 */
export function umurPakaiKonsumabel(konfig: UmurPakai[], records: any[], hariIni: string): Pengingat[] {
  const hasil: Pengingat[] = [];

  for (const k of konfig) {
    if (!k.aktif || k.hari <= 0) continue;

    const riwayat = records
      .filter(r => r.categoryId === 'perawatanTreatment' && r.jenisTindakan === k.jenisTindakan && r.tanggal)
      .map(r => r.tanggal as string)
      .sort();
    const terakhir = riwayat[riwayat.length - 1];

    if (!terakhir) {
      hasil.push({
        id: `umurPakai:${k.jenisTindakan}:belum`,
        jenis: 'umurPakai',
        tingkat: 'info',
        judul: `Belum ada catatan "${k.jenisTindakan}"`,
        detail: `Umur pakai ditetapkan ${k.hari} hari, tetapi belum ada satu pun tindakan tercatat sehingga sisa umurnya tak bisa dihitung.`,
        tindakan: 'Catat tindakan terakhir yang pernah dilakukan agar hitungan umur pakai punya titik mulai.',
        tujuan: 'perawatanTreatment',
      });
      continue;
    }

    const habis = majuHari(terakhir, k.hari);
    const sisa = selisihHari(hariIni, habis);
    if (sisa > k.peringatanHari) continue;

    hasil.push({
      id: `umurPakai:${k.jenisTindakan}`,
      jenis: 'umurPakai',
      tingkat: sisa < 0 ? 'terlambat' : 'segera',
      judul: sisa < 0
        ? `Umur pakai ${k.jenisTindakan} sudah habis`
        : `Umur pakai ${k.jenisTindakan} tinggal ${sisa} hari`,
      detail: `Tindakan terakhir ${terakhir}, umur pakai ${k.hari} hari, jatuh pada ${habis}.`,
      tindakan: sisa < 0
        ? `Lakukan ${k.jenisTindakan} sekarang, lalu catat tindakannya.`
        : `Siapkan penggantian sebelum ${habis} supaya tidak menunggu sampai lewat.`,
      tujuan: 'perawatanTreatment',
      jatuhTempo: habis,
      hariLagi: sisa,
    });
  }

  return hasil;
}

/**
 * R3 — Kondisi mengalahkan kalender.
 *
 * Karbon jenuh lewat breakthrough, dan hasil carbon test yang berkata "perlu
 * ganti" adalah bukti langsung — jauh lebih kuat daripada hitungan hari. TVC
 * yang naik setelah ozon dipakai PDF sebagai tanda treatment mulai gagal, dan
 * itu terlihat sebelum larva terkena dampaknya.
 */
export function kondisiTreatment(records: any[]): Pengingat[] {
  const hasil: Pengingat[] = [];

  const carbon = records
    .filter(r => r.categoryId === 'labCarbonTest' && r.tanggal)
    .sort((a, b) => String(a.tanggal).localeCompare(String(b.tanggal)));
  const terbaru = carbon[carbon.length - 1];

  if (terbaru && terbaru.hasil === 'perlu ganti') {
    hasil.push({
      id: 'kondisi:karbon',
      jenis: 'kondisi',
      tingkat: 'terlambat',
      judul: 'Carbon test menyatakan karbon perlu diganti',
      detail: `Hasil pemeriksaan ${terbaru.tanggal}${terbaru.unitFilter ? ` pada ${terbaru.unitFilter}` : ''} sudah menyatakan "perlu ganti". Kondisi mengalahkan jadwal: karbon jenuh tidak menunggu tanggal.`,
      tindakan: 'Ganti karbon filter sekarang dan catat penggantiannya, jangan menunggu jatuh tempo kalender.',
      tujuan: 'perawatanTreatment',
    });
  }

  const setelahOzon = records
    .filter(r => r.categoryId === 'labAirTreatment' && r.titik === 'setelah ozon' && r.TVC != null && r.tanggal)
    .sort((a, b) => String(a.tanggal).localeCompare(String(b.tanggal)));

  if (setelahOzon.length >= 2) {
    const kini = Number(setelahOzon[setelahOzon.length - 1].TVC);
    const lalu = Number(setelahOzon[setelahOzon.length - 2].TVC);
    if (!Number.isNaN(kini) && !Number.isNaN(lalu) && kini > lalu) {
      hasil.push({
        id: 'kondisi:tvcOzon',
        jenis: 'kondisi',
        tingkat: 'segera',
        judul: 'TVC setelah ozon naik',
        detail: `TVC di titik setelah ozon naik dari ${lalu} ke ${kini}. Ini tanda sistem treatment mulai gagal, dan terlihat sebelum larva terkena dampaknya.`,
        tindakan: 'Periksa generator ozon dan lampu UV; pertimbangkan menahan alir air ke bak larva sampai bersih.',
        tujuan: 'treatmentOzon',
      });
    }
  }

  return hasil;
}

/** R4 — Pemeriksaan berjadwal yang mendekati jatuh tempo (lookahead). */
export function jadwalMendekat(jadwal: PetaJadwal, judulKategori: Record<string, string>, records: any[], hariIni: string, ambangHari: number): Pengingat[] {
  const hasil: Pengingat[] = [];

  for (const j of Object.values(jadwal) as JadwalBerkala[]) {
    if (!j.aktif) continue;

    const jatuh = jatuhTempoTerakhir(j, hariIni);
    const sudah = jatuh && records.some(r =>
      r.categoryId === j.categoryId && r.tanggal && r.tanggal >= jatuh && r.tanggal <= hariIni);
    const target = sudah ? jatuhTempoBerikut(j, hariIni) : jatuh ?? jatuhTempoBerikut(j, hariIni);
    if (!target) continue;

    const sisa = selisihHari(hariIni, target);
    if (sisa > ambangHari) continue;

    const nama = judulKategori[j.categoryId] ?? j.categoryId;
    hasil.push({
      id: `jadwal:${j.categoryId}`,
      jenis: 'waktu',
      tingkat: sisa < 0 ? 'terlambat' : 'segera',
      judul: sisa < 0 ? `${nama} lewat jatuh tempo` : `${nama} jatuh tempo ${sisa === 0 ? 'hari ini' : `${sisa} hari lagi`}`,
      detail: `Jadwal ditetapkan Kepala: mulai ${j.mulai}${j.intervalHari > 0 ? `, tiap ${j.intervalHari} hari` : ', sekali jalan'}.`,
      tindakan: sisa < 0 ? 'Lakukan pemeriksaan sekarang dan catat hasilnya.' : 'Siapkan pemeriksaan sebelum jatuh tempo.',
      tujuan: j.categoryId,
      jatuhTempo: target,
      hariLagi: sisa,
    });
  }

  return hasil;
}

/**
 * R5 — Keterlambatan pengukuran diringkas jadi SATU pengingat, bukan satu per
 * bak. Puluhan baris sejenis hanya melatih orang menggulir tanpa membaca;
 * rinciannya tetap tersedia di daftar tugas dan Alert Center.
 */
export function ringkasKeterlambatan(tugas: Tugas[]): Pengingat[] {
  const telat = tugas.filter(t => t.status === 'terlambat');
  if (telat.length === 0) return [];

  const contoh = [...new Set(telat.map(t => t.judul))].slice(0, 3).join(', ');
  return [{
    id: 'kepatuhan:ringkas',
    jenis: 'kepatuhan',
    tingkat: 'terlambat',
    judul: `${telat.length} pengukuran lewat jadwal hari ini`,
    detail: `Antara lain: ${contoh}${telat.length > 3 ? ', dan lainnya' : ''}.`,
    tindakan: 'Kerjakan yang tertunda sekarang, atau catat alasan keterlambatannya bila memang tidak bisa.',
    tujuan: '/alert-center',
  }];
}

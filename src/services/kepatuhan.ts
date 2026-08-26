import type { Alert, Category, RoleLevel } from '@domainTypes/index';
import { turunkanTugas, type Tugas, type BakRingkas } from './tugas';
import type { PetaJadwal } from './jadwalBerkala';
import { tanggalLokal, geserHari } from '@utils/waktuJadwal';

/**
 * Alert kepatuhan jadwal: pengukuran yang SEHARUSNYA ada tetapi tidak pernah
 * masuk (PRD §5.B.3).
 *
 * Alert nilai secara konstruksi hanya bisa melihat data yang tercatat, sehingga
 * cara termudah menghindari alarm adalah tidak mengukur sama sekali. Alert di
 * sini menutup celah itu: sumbernya jadwal, bukan record.
 */

/** Berapa hari ke belakang ditinjau saat menghitung keterlambatan. */
export const HARI_TINJAU = 3;

const AWALAN = 'kepatuhan';

function pesanUntuk(t: Tugas, hariTerlewat: number, tanggalTerakhir: string): string {
  const slot = t.slot ? ` slot ${t.slot}` : '';
  if (hariTerlewat > 1) {
    return `${t.judul}${slot} tidak tercatat ${hariTerlewat} hari berturut-turut, terakhir ${tanggalTerakhir}.`;
  }
  return `${t.judul}${slot} tidak tercatat pada ${tanggalTerakhir} padahal dijadwalkan ${t.frekuensiLabel ?? 'rutin'}.`;
}

/**
 * Satu alert per tugas yang terlewat, bukan per hari — keterlambatan berulang
 * menaikkan `hitungan` dan tingkatnya, mengikuti pola anti alert-fatigue yang
 * sudah dipakai alert nilai.
 */
export function bangunAlertKepatuhan(opts: {
  categories: Category[];
  records: any[];
  sampai?: string;
  hari?: number;
  sekarang?: Date;
  bak?: BakRingkas[];
  jadwal?: PetaJadwal;
}): Alert[] {
  const sekarang = opts.sekarang ?? new Date();
  const sampai = opts.sampai ?? tanggalLokal(sekarang);
  const hari = opts.hari ?? HARI_TINJAU;

  const terkumpul = new Map<string, { t: Tugas; hitungan: number; terakhir: string }>();

  for (let i = 0; i < hari; i++) {
    const tanggal = geserHari(sampai, i);
    const tugas = turunkanTugas({ categories: opts.categories, records: opts.records, tanggal, sekarang, bak: opts.bak, jadwal: opts.jadwal });

    for (const t of tugas) {
      if (t.status !== 'terlambat') continue;
      const ada = terkumpul.get(t.id);
      if (ada) {
        ada.hitungan += 1;
        if (tanggal > ada.terakhir) ada.terakhir = tanggal;
      } else {
        terkumpul.set(t.id, { t, hitungan: 1, terakhir: tanggal });
      }
    }
  }

  return [...terkumpul.values()].map(({ t, hitungan, terakhir }) => {
    // Sekali terlewat masih bisa dikejar; berulang berarti jadwalnya yang jebol.
    const tingkat: Alert['tingkat'] = hitungan > 1 ? 'bahaya' : 'waspada';
    const kontakRole: RoleLevel = hitungan > 1 ? 'kepala' : 'pj';

    return {
      id: `${AWALAN}:${t.id}`,
      status: 'aktif',
      tingkat,
      parameter: t.slot ? `${t.judul} (${t.slot})` : t.judul,
      tankId: t.tankId,
      tanggal: terakhir,
      pesan: pesanUntuk(t, hitungan, terakhir),
      tindakan:
        hitungan > 1
          ? 'Ukur sekarang, telusuri mengapa jadwal terlewat berulang, dan catat alasannya.'
          : 'Lakukan pengukuran sekarang dan catat alasan keterlambatan.',
      kontakRole,
      hitungan,
      terakhirDiperbarui: Date.parse(terakhir + 'T00:00:00Z'),
    } satisfies Alert;
  });
}

export const idAlertKepatuhan = (tugasId: string) => `${AWALAN}:${tugasId}`;

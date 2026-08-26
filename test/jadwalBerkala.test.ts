import { describe, it, expect } from 'vitest';
import { jatuhTempoTerakhir, jatuhTempoBerikut } from '../src/services/jadwalBerkala';
import { turunkanTugas } from '../src/services/tugas';
import { bangunAlertKepatuhan } from '../src/services/kepatuhan';
import { PERLU_JADWAL_KEPALA } from '../src/utils/kadens';
import { CATEGORIES } from '../src/utils/schema';
import type { JadwalBerkala } from '../src/types/index';

const kategori = (id: string) => {
  const c = CATEGORIES.find(x => x.id === id);
  if (!c) throw new Error(`Kategori ${id} tidak ada`);
  return c;
};

const jadwal = (p: Partial<JadwalBerkala> = {}): JadwalBerkala => ({
  id: 'labCarbonTest', categoryId: 'labCarbonTest',
  mulai: '2026-08-01', intervalHari: 30, aktif: true,
  ditetapkanOleh: 'u-kepala', diperbaruiPada: 0, ...p,
});

const pagi = new Date('2026-08-20T09:00:00');
const malam = new Date('2026-08-20T22:00:00');

describe('kategori yang menunggu jadwal Kepala', () => {
  it('hanya yang PDF sebut berkala tanpa interval', () => {
    expect(PERLU_JADWAL_KEPALA).toEqual(['labCarbonTest', 'labPcrInduk']);
  });

  it('semuanya benar-benar ada di skema', () => {
    for (const id of PERLU_JADWAL_KEPALA) expect(() => kategori(id)).not.toThrow();
  });
});

describe('perhitungan jatuh tempo', () => {
  it('belum jatuh tempo sebelum tanggal mulai', () => {
    expect(jatuhTempoTerakhir(jadwal(), '2026-07-15')).toBeNull();
  });

  it('jatuh tempo pertama tepat pada tanggal mulai', () => {
    expect(jatuhTempoTerakhir(jadwal(), '2026-08-01')).toBe('2026-08-01');
  });

  it('berulang sesuai interval', () => {
    expect(jatuhTempoTerakhir(jadwal(), '2026-08-30')).toBe('2026-08-01');
    expect(jatuhTempoTerakhir(jadwal(), '2026-08-31')).toBe('2026-08-31');
    expect(jatuhTempoTerakhir(jadwal(), '2026-09-29')).toBe('2026-08-31');
  });

  it('interval 0 berarti sekali saja, tanpa jatuh tempo berikutnya', () => {
    const sekali = jadwal({ intervalHari: 0 });
    expect(jatuhTempoTerakhir(sekali, '2026-09-01')).toBe('2026-08-01');
    expect(jatuhTempoBerikut(sekali, '2026-09-01')).toBeNull();
  });

  it('jadwal nonaktif tidak pernah jatuh tempo', () => {
    expect(jatuhTempoTerakhir(jadwal({ aktif: false }), '2026-09-01')).toBeNull();
  });

  it('menunjukkan pemeriksaan berikutnya kepada Kepala', () => {
    expect(jatuhTempoBerikut(jadwal(), '2026-08-20')).toBe('2026-08-31');
  });
});

describe('jadwal Kepala melahirkan tugas', () => {
  const peta = { labCarbonTest: jadwal() };
  const tugasCarbon = (records: any[] = [], tanggal = '2026-08-20', sekarang = pagi) =>
    turunkanTugas({ categories: [kategori('labCarbonTest')], records, tanggal, sekarang, jadwal: peta });

  it('tanpa jadwal, pemeriksaan berkala tidak pernah jadi tugas', () => {
    const t = turunkanTugas({ categories: [kategori('labCarbonTest')], records: [], tanggal: '2026-08-20', sekarang: pagi });
    expect(t).toEqual([]);
  });

  it('setelah dijadwalkan, muncul sebagai tugas yang terlambat bila lewat jatuh tempo', () => {
    const t = tugasCarbon();
    expect(t).toHaveLength(1);
    expect(t[0].status).toBe('terlambat');
    expect(t[0].frekuensiLabel).toBe('tiap 30 hari (jadwal Kepala)');
  });

  it('pemeriksaan sejak jatuh tempo menuntaskannya', () => {
    const t = tugasCarbon([{ categoryId: 'labCarbonTest', tanggal: '2026-08-05' }]);
    expect(t[0].status).toBe('terisi');
  });

  it('pemeriksaan sebelum jatuh tempo tidak ikut menuntaskan siklus berjalan', () => {
    const t = tugasCarbon([{ categoryId: 'labCarbonTest', tanggal: '2026-07-20' }]);
    expect(t[0].status).toBe('terlambat');
  });

  it('pada hari jatuh temponya sendiri masih berstatus belum sampai jam kerja habis', () => {
    expect(tugasCarbon([], '2026-08-01', new Date('2026-08-01T09:00:00'))[0].status).toBe('belum');
    expect(tugasCarbon([], '2026-08-01', new Date('2026-08-01T22:00:00'))[0].status).toBe('terlambat');
  });
});

describe('PCR induk dapat dua lapis sekaligus', () => {
  // PDF §01: "Saat kedatangan, lalu berkala, dan setiap ada gejala."
  const peta = { labPcrInduk: jadwal({ id: 'labPcrInduk', categoryId: 'labPcrInduk' }) };

  it('kadensnya tetap peristiwa, tetapi jadwal Kepala menambah lapisan berkala', () => {
    const tanpa = turunkanTugas({ categories: [kategori('labPcrInduk')], records: [], tanggal: '2026-08-20', sekarang: pagi });
    expect(tanpa).toEqual([]);

    const dengan = turunkanTugas({ categories: [kategori('labPcrInduk')], records: [], tanggal: '2026-08-20', sekarang: pagi, jadwal: peta });
    expect(dengan).toHaveLength(1);
    expect(dengan[0].id).toBe('labPcrInduk~jadwal');
  });
});

describe('pemeriksaan berjadwal yang terlewat masuk Alert Center', () => {
  it('memunculkan alert kepatuhan seperti pengukuran harian', () => {
    const a = bangunAlertKepatuhan({
      categories: [kategori('labCarbonTest')],
      records: [],
      sampai: '2026-08-20',
      hari: 1,
      sekarang: malam,
      jadwal: { labCarbonTest: jadwal() },
    });
    expect(a).toHaveLength(1);
    expect(a[0].id).toBe('kepatuhan:labCarbonTest~jadwal');
    expect(a[0].tindakan).toBeTruthy();
  });

  it('tidak ada alert bila belum dijadwalkan — bukan kelalaian, memang belum ditetapkan', () => {
    const a = bangunAlertKepatuhan({
      categories: [kategori('labCarbonTest')], records: [], sampai: '2026-08-20', hari: 1, sekarang: malam,
    });
    expect(a).toEqual([]);
  });
});

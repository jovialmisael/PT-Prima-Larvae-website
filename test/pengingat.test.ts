import { describe, it, expect } from 'vitest';
import { susunPengingat } from '../src/services/pengingat';
import type { Siklus, UmurPakai, JadwalBerkala } from '../src/types/index';

const HARI_INI = '2026-08-20';

const siklus = (p: Partial<Siklus> = {}): Siklus => ({
  id: 'S1', kodeBatch: 'SIK-2608-01', indukId: 'I1', tglMulai: HARI_INI,
  parameterBaseline: {}, status: 'setup', ...p,
});

const umurPakai = (p: Partial<UmurPakai> = {}): UmurPakai => ({
  id: 'ganti karbon', jenisTindakan: 'ganti karbon', hari: 180, peringatanHari: 14,
  ditetapkanOleh: 'u-kepala', diperbaruiPada: 0, aktif: true, ...p,
});

const perawatan = (tanggal: string, jenisTindakan = 'ganti karbon') =>
  ({ categoryId: 'perawatanTreatment', jenisTindakan, tanggal });

const susun = (opts: Parameters<typeof susunPengingat>[0] = {}) =>
  susunPengingat({ tanggal: HARI_INI, ...opts });

describe('setiap pengingat wajib bisa ditindaklanjuti', () => {
  it('tak ada pengingat tanpa kalimat tindakan', () => {
    const semua = susun({
      siklus: [siklus()],
      umurPakai: [umurPakai()],
      records: [perawatan('2026-01-01'), { categoryId: 'labCarbonTest', tanggal: '2026-08-19', hasil: 'perlu ganti' }],
      tugas: [{ id: 'x', categoryId: 'labMikro', judul: 'Mikrobiologi', status: 'terlambat' }],
    });
    expect(semua.length).toBeGreaterThan(0);
    for (const p of semua) expect(p.tindakan.trim(), p.judul).not.toBe('');
  });

  it('keadaan yang sehat tidak memunculkan apa pun', () => {
    expect(susun({ siklus: [siklus({ status: 'aktif' })], records: [], tugas: [] })).toEqual([]);
  });

  it('yang terlambat naik ke urutan atas', () => {
    const semua = susun({
      siklus: [siklus()],
      umurPakai: [umurPakai()],
      records: [perawatan('2026-01-01')],
    });
    expect(semua[0].tingkat).toBe('terlambat');
    expect(semua[semua.length - 1].tingkat).toBe('info');
  });
});

describe('fase siklus — "Anda akan memulai siklus"', () => {
  it('mengingatkan siklus yang dibuat tetapi belum aktif', () => {
    const p = susun({ siklus: [siklus()] });
    expect(p).toHaveLength(1);
    expect(p[0].judul).toContain('SIK-2608-01');
    expect(p[0].jenis).toBe('fase');
  });

  it('siklus yang sudah berjalan tidak diingatkan lagi', () => {
    for (const status of ['aktif', 'panen', 'selesai'] as const) {
      expect(susun({ siklus: [siklus({ status })] })).toEqual([]);
    }
  });
});

describe('umur pakai konsumabel', () => {
  it('diam bila Kepala belum menetapkan umur pakainya', () => {
    expect(susun({ records: [perawatan('2020-01-01')] })).toEqual([]);
  });

  it('memperingatkan sebelum habis, bukan hanya sesudah', () => {
    // 180 hari sejak 1 Mar 2026 jatuh pada 28 Agu — 8 hari lagi, di bawah ambang 14.
    const p = susun({ umurPakai: [umurPakai()], records: [perawatan('2026-03-01')] });
    expect(p).toHaveLength(1);
    expect(p[0].tingkat).toBe('segera');
    expect(p[0].hariLagi).toBe(8);
    expect(p[0].judul).toContain('tinggal 8 hari');
  });

  it('belum berbunyi selama masih jauh dari habis', () => {
    expect(susun({ umurPakai: [umurPakai()], records: [perawatan('2026-08-01')] })).toEqual([]);
  });

  it('menjadi terlambat setelah umur pakainya lewat', () => {
    const p = susun({ umurPakai: [umurPakai()], records: [perawatan('2026-01-01')] });
    expect(p[0].tingkat).toBe('terlambat');
    expect(p[0].hariLagi).toBeLessThan(0);
    expect(p[0].judul).toContain('sudah habis');
  });

  it('meminta titik mulai bila belum ada satu pun tindakan tercatat', () => {
    const p = susun({ umurPakai: [umurPakai()], records: [] });
    expect(p[0].judul).toContain('Belum ada catatan');
    expect(p[0].tingkat).toBe('info');
  });

  it('konfigurasi nonaktif diabaikan', () => {
    expect(susun({ umurPakai: [umurPakai({ aktif: false })], records: [perawatan('2020-01-01')] })).toEqual([]);
  });
});

describe('kondisi mengalahkan kalender', () => {
  it('carbon test "perlu ganti" langsung berbunyi walau umur pakai masih panjang', () => {
    const p = susun({
      umurPakai: [umurPakai()],
      records: [perawatan('2026-08-01'), { categoryId: 'labCarbonTest', tanggal: '2026-08-19', hasil: 'perlu ganti' }],
    });
    expect(p).toHaveLength(1);
    expect(p[0].jenis).toBe('kondisi');
    expect(p[0].tingkat).toBe('terlambat');
  });

  it('hasil "baik" tidak memunculkan apa-apa', () => {
    const p = susun({ records: [{ categoryId: 'labCarbonTest', tanggal: '2026-08-19', hasil: 'baik' }] });
    expect(p).toEqual([]);
  });

  it('hanya hasil terbaru yang menentukan', () => {
    const p = susun({ records: [
      { categoryId: 'labCarbonTest', tanggal: '2026-08-10', hasil: 'perlu ganti' },
      { categoryId: 'labCarbonTest', tanggal: '2026-08-19', hasil: 'baik' },
    ] });
    expect(p).toEqual([]);
  });

  it('TVC yang naik setelah ozon jadi peringatan treatment mulai gagal', () => {
    const p = susun({ records: [
      { categoryId: 'labAirTreatment', titik: 'setelah ozon', TVC: 10, tanggal: '2026-08-18' },
      { categoryId: 'labAirTreatment', titik: 'setelah ozon', TVC: 40, tanggal: '2026-08-19' },
    ] });
    expect(p).toHaveLength(1);
    expect(p[0].judul).toContain('TVC setelah ozon naik');
  });

  it('TVC yang turun tidak memicu apa pun', () => {
    const p = susun({ records: [
      { categoryId: 'labAirTreatment', titik: 'setelah ozon', TVC: 40, tanggal: '2026-08-18' },
      { categoryId: 'labAirTreatment', titik: 'setelah ozon', TVC: 10, tanggal: '2026-08-19' },
    ] });
    expect(p).toEqual([]);
  });
});

describe('lookahead jadwal berkala', () => {
  const jadwal: Record<string, JadwalBerkala> = {
    labCarbonTest: {
      id: 'labCarbonTest', categoryId: 'labCarbonTest', mulai: '2026-08-25',
      intervalHari: 30, aktif: true, ditetapkanOleh: 'u-kepala', diperbaruiPada: 0,
    },
  };
  const judul = { labCarbonTest: 'Carbon Test' };

  it('mengabarkan jatuh tempo yang masih di depan', () => {
    const p = susun({ jadwal, judulKategori: judul, lookaheadHari: 7 });
    expect(p).toHaveLength(1);
    expect(p[0].hariLagi).toBe(5);
    expect(p[0].judul).toContain('5 hari lagi');
  });

  it('diam bila masih di luar jendela lookahead', () => {
    expect(susun({ jadwal, judulKategori: judul, lookaheadHari: 3 })).toEqual([]);
  });
});

describe('keterlambatan diringkas, bukan dibanjirkan', () => {
  const banyak = Array.from({ length: 12 }, (_, i) => ({
    id: `t${i}`, categoryId: 'labMikro', judul: `Formulir ${i}`, status: 'terlambat' as const,
  }));

  it('dua belas keterlambatan jadi satu pengingat, bukan dua belas', () => {
    const p = susun({ tugas: banyak });
    expect(p).toHaveLength(1);
    expect(p[0].judul).toContain('12 pengukuran');
  });

  it('menyebut sebagian contohnya supaya tetap berguna', () => {
    expect(susun({ tugas: banyak })[0].detail).toContain('Formulir 0');
  });
});

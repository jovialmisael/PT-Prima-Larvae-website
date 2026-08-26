import { describe, it, expect } from 'vitest';
import { turunkanTugas, ringkasTugas, awalMinggu } from '../src/services/tugas';
import { KADENS, kadensOf } from '../src/utils/kadens';
import { CATEGORIES } from '../src/utils/schema';

const kategori = (id: string) => {
  const c = CATEGORIES.find(x => x.id === id);
  if (!c) throw new Error(`Kategori ${id} tidak ada di schema`);
  return c;
};

const TGL = '2026-08-20'; // Kamis
const pagi = new Date('2026-08-20T09:00:00');
const siang = new Date('2026-08-20T13:00:00');
const malam = new Date('2026-08-20T22:00:00');

describe('kadens menutup seluruh kategori', () => {
  it('setiap kategori punya kadens — tak ada yang lolos tanpa jadwal', () => {
    const tanpaKadens = CATEGORIES.filter(c => !kadensOf(c.id)).map(c => c.id);
    expect(tanpaKadens).toEqual([]);
  });

  it('tidak ada kadens yatim yang kategorinya sudah tak ada', () => {
    const yatim = Object.keys(KADENS).filter(id => !CATEGORIES.some(c => c.id === id));
    expect(yatim).toEqual([]);
  });

  // §07 PDF menetapkan tiga set defect per stadia, bukan satu formulir gabungan.
  it('§07 terdiri dari tiga formulir defect per stadia', () => {
    const s07 = CATEGORIES.filter(c => c.section === '07').map(c => c.id).sort();
    expect(s07).toEqual(['labDefectMysis', 'labDefectNZ', 'labDefectPl']);
  });

  it('§05 mencakup mikrobiologi air dan mikrobiologi tubuh', () => {
    const s05 = CATEGORIES.filter(c => c.section === '05').map(c => c.id).sort();
    expect(s05).toEqual(['labMikro', 'labMikroBody']);
  });
});

describe('tugas lahir dari jadwal, bukan dari data', () => {
  it('kategori harian tetap muncul walau belum ada satu pun record', () => {
    const t = turunkanTugas({ categories: [kategori('labMikro')], records: [], tanggal: TGL, sekarang: pagi });
    expect(t).toHaveLength(1);
    expect(t[0].status).toBe('belum');
  });

  it('kategori berkadens peristiwa tidak pernah jadi tugas harian', () => {
    for (const id of ['panenPl', 'spawn', 'prodLogTindakan', 'labCarbonTest']) {
      const t = turunkanTugas({ categories: [kategori(id)], records: [], tanggal: TGL, sekarang: pagi });
      expect(t, `${id} tidak boleh terjadwal`).toEqual([]);
    }
  });
});

describe('dua kali sehari', () => {
  it('§06 observasi larvae jadi dua tugas terpisah pagi & sore', () => {
    const t = turunkanTugas({ categories: [kategori('prodLarvae')], records: [], tanggal: TGL, sekarang: pagi });
    expect(t.map(x => x.slot)).toEqual(['pagi', 'sore']);
  });

  it('mengisi slot pagi tidak ikut menuntaskan slot sore', () => {
    const recs = [{ categoryId: 'prodLarvae', tanggal: TGL, waktu: 'pagi' }];
    const t = turunkanTugas({ categories: [kategori('prodLarvae')], records: recs, tanggal: TGL, sekarang: pagi });
    expect(t.find(x => x.slot === 'pagi')!.status).toBe('terisi');
    expect(t.find(x => x.slot === 'sore')!.status).toBe('belum');
  });

  it('§04 tetap satu tugas kategori karena pagi & sore berada di satu baris', () => {
    const t = turunkanTugas({ categories: [kategori('prodAirRutin')], records: [], tanggal: TGL, sekarang: pagi });
    const tingkatKategori = t.filter(x => !x.id.includes('#'));
    expect(tingkatKategori).toHaveLength(1);
    expect(tingkatKategori[0].slot).toBeUndefined();
  });
});

describe('kadens per-field', () => {
  const alkalinitas = (t: ReturnType<typeof turunkanTugas>) =>
    t.find(x => x.id === 'prodAirRutin#alkalinitas');

  it('alkalinitas punya tugas sendiri, tidak ikut kadens harian kategorinya', () => {
    const t = turunkanTugas({ categories: [kategori('prodAirRutin')], records: [], tanggal: TGL, sekarang: pagi });
    expect(alkalinitas(t)).toBeDefined();
    expect(alkalinitas(t)!.frekuensiLabel).toBe('3x per minggu');
  });

  it('tiga pengukuran dalam satu minggu menuntaskan kuotanya', () => {
    const recs = ['2026-08-17', '2026-08-18', '2026-08-19'].map(tanggal => ({
      categoryId: 'prodAirRutin', tanggal, alkalinitas: 120,
    }));
    const t = turunkanTugas({ categories: [kategori('prodAirRutin')], records: recs, tanggal: TGL, sekarang: pagi });
    expect(alkalinitas(t)!.status).toBe('terisi');
    expect(alkalinitas(t)!.sisaMingguIni).toBe(0);
  });

  it('baris air yang terisi tanpa alkalinitas tidak menghitung kuota', () => {
    const recs = [{ categoryId: 'prodAirRutin', tanggal: '2026-08-17', suhuPagi: 29 }];
    const t = turunkanTugas({ categories: [kategori('prodAirRutin')], records: recs, tanggal: TGL, sekarang: pagi });
    expect(alkalinitas(t)!.sisaMingguIni).toBe(3);
  });

  it('terlambat bila sisa kuota tidak lagi muat di sisa hari minggu ini', () => {
    // Minggu 17-23 Agu; pada Sabtu 22 Agu tersisa 2 hari untuk 3 pengukuran.
    const t = turunkanTugas({ categories: [kategori('prodAirRutin')], records: [], tanggal: '2026-08-22', sekarang: pagi });
    expect(alkalinitas(t)!.status).toBe('terlambat');
  });
});

describe('terlambat, bukan sekadar belum', () => {
  it('slot pagi yang kosong jadi terlambat setelah lewat siang', () => {
    const t = turunkanTugas({ categories: [kategori('prodLarvae')], records: [], tanggal: TGL, sekarang: siang });
    expect(t.find(x => x.slot === 'pagi')!.status).toBe('terlambat');
    expect(t.find(x => x.slot === 'sore')!.status).toBe('belum');
  });

  it('tugas harian yang kosong jadi terlambat setelah jam kerja berakhir', () => {
    const t = turunkanTugas({ categories: [kategori('labMikro')], records: [], tanggal: TGL, sekarang: malam });
    expect(t[0].status).toBe('terlambat');
  });

  it('hari yang sudah lewat: apa pun yang kosong selalu terlambat', () => {
    const t = turunkanTugas({ categories: [kategori('labMikro')], records: [], tanggal: '2026-08-18', sekarang: pagi });
    expect(t[0].status).toBe('terlambat');
  });

  it('record kemarin tidak menuntaskan tugas hari ini', () => {
    const recs = [{ categoryId: 'labMikro', tanggal: '2026-08-19' }];
    const t = turunkanTugas({ categories: [kategori('labMikro')], records: recs, tanggal: TGL, sekarang: malam });
    expect(t[0].status).toBe('terlambat');
  });
});

describe('ringkasan & minggu', () => {
  const duaKategori = [kategori('prodLarvae'), kategori('labMikro')];
  const recPagi = [{ categoryId: 'prodLarvae', tanggal: TGL, waktu: 'pagi' }];

  it('siang hari: slot pagi terisi, sisanya masih berjalan', () => {
    const t = turunkanTugas({ categories: duaKategori, records: recPagi, tanggal: TGL, sekarang: siang });
    expect(ringkasTugas(t)).toEqual({ total: 3, terisi: 1, terlambat: 0, belum: 2 });
  });

  it('lewat jam kerja: yang belum terisi berpindah ke terlambat', () => {
    const t = turunkanTugas({ categories: duaKategori, records: recPagi, tanggal: TGL, sekarang: malam });
    expect(ringkasTugas(t)).toEqual({ total: 3, terisi: 1, terlambat: 2, belum: 0 });
  });

  it('awal minggu jatuh pada Senin', () => {
    expect(awalMinggu('2026-08-20')).toBe('2026-08-17');
    expect(awalMinggu('2026-08-17')).toBe('2026-08-17');
    expect(awalMinggu('2026-08-23')).toBe('2026-08-17');
  });
});

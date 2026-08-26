import { describe, it, expect } from 'vitest';
import { bangunAlertKepatuhan } from '../src/services/kepatuhan';
import { CATEGORIES } from '../src/utils/schema';

const kategori = (id: string) => {
  const c = CATEGORIES.find(x => x.id === id);
  if (!c) throw new Error(`Kategori ${id} tidak ada`);
  return c;
};

const SAMPAI = '2026-08-20';
const malam = new Date('2026-08-20T22:00:00');

const bangun = (categories: any[], records: any[] = [], hari = 3) =>
  bangunAlertKepatuhan({ categories, records, sampai: SAMPAI, hari, sekarang: malam });

describe('alert kepatuhan menutup celah "tidak mengukur = tidak ada alarm"', () => {
  it('pengukuran harian yang tak pernah masuk memunculkan alert', () => {
    const a = bangun([kategori('labMikro')]);
    expect(a).toHaveLength(1);
    expect(a[0].id).toBe('kepatuhan:labMikro');
  });

  it('sekali terlewat masih waspada; berulang naik jadi bahaya', () => {
    const seharian = [{ categoryId: 'labMikro', tanggal: '2026-08-19' }, { categoryId: 'labMikro', tanggal: '2026-08-18' }];
    const sekali = bangun([kategori('labMikro')], seharian);
    expect(sekali[0].tingkat).toBe('waspada');
    expect(sekali[0].hitungan).toBe(1);

    const berulang = bangun([kategori('labMikro')]);
    expect(berulang[0].tingkat).toBe('bahaya');
    expect(berulang[0].hitungan).toBe(3);
  });

  it('membawa tindakan dan PIC, bukan sekadar pemberitahuan', () => {
    const a = bangun([kategori('labMikro')]);
    expect(a[0].tindakan).toBeTruthy();
    expect(a[0].kontakRole).toBe('kepala');
  });

  it('jadwal yang dipenuhi tidak memunculkan alert apa pun', () => {
    const lengkap = ['2026-08-18', '2026-08-19', '2026-08-20'].map(tanggal => ({ categoryId: 'labMikro', tanggal }));
    expect(bangun([kategori('labMikro')], lengkap)).toEqual([]);
  });

  it('kategori berkadens peristiwa tak pernah dianggap terlambat', () => {
    expect(bangun([kategori('panenPl'), kategori('spawn')])).toEqual([]);
  });

  it('slot pagi dan sore dihitung sebagai keterlambatan terpisah', () => {
    const a = bangun([kategori('prodLarvae')], [], 1);
    expect(a.map(x => x.id).sort()).toEqual(['kepatuhan:prodLarvae:pagi', 'kepatuhan:prodLarvae:sore']);
  });
});

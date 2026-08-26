import { describe, it, expect } from 'vitest';
import { computeNH3, computeField } from '../src/utils/compute';
import { turunkanTugas } from '../src/services/tugas';
import { CATEGORIES } from '../src/utils/schema';

const kategori = (id: string) => {
  const c = CATEGORIES.find(x => x.id === id);
  if (!c) throw new Error(`Kategori ${id} tidak ada`);
  return c;
};
const punyaKunci = (id: string, key: string) => kategori(id).fields.some(f => f.key === key);

// PDF §04: "Dihitung dari TAN, pH, suhu, dan salinitas — empat angka."
describe('§04 NH3 memakai empat angka, bukan tiga', () => {
  const dasar = { tan: 1, ph: 8.2, suhu: 30 };

  it('salinitas menurunkan NH3 pada TAN, pH, dan suhu yang sama', () => {
    const tawar = computeNH3(dasar);
    const laut = computeNH3({ ...dasar, salinitas: 30 });
    expect(laut).toBeLessThan(tawar);
  });

  it('salinitas 0 tidak melompat jauh dari perhitungan air tawar', () => {
    const tawar = computeNH3(dasar);
    const nol = computeNH3({ ...dasar, salinitas: 0 });
    expect(Math.abs(nol - tawar) / tawar).toBeLessThan(0.05);
  });

  it('NH3 pagi & sore ikut memakai salinitas dari baris yang sama', () => {
    const baris = { amonium: 0.5, phPagi: 7.9, suhuPagi: 29, phSore: 8.3, suhuSore: 31, salinitas: 30 };
    const tanpaSal = computeField('NH3pagi', { ...baris, salinitas: undefined }) as number;
    const denganSal = computeField('NH3pagi', baris) as number;
    expect(denganSal).toBeLessThan(tanpaSal);
  });

  it('tetap menghitung walau salinitas belum diisi', () => {
    expect(computeField('NH3pagi', { amonium: 0.5, phPagi: 7.9, suhuPagi: 29 })).toBeGreaterThan(0);
  });
});

// PDF §06: "Survival antar stadia: N→Z, Z→M, M→PL, dan total N→PL."
describe('§06 survival antar stadia — nilai rapor utama siklus', () => {
  const r = { totalStocking: 1_000_000, estAkhirZ: 800_000, estAkhirM: 600_000, estAkhirPl: 450_000 };

  it('menghitung tiap transisi terhadap stadia sebelumnya', () => {
    expect(computeField('srNZ', r)).toBeCloseTo(80, 5);
    expect(computeField('srZM', r)).toBeCloseTo(75, 5);
    expect(computeField('srMPL', r)).toBeCloseTo(75, 5);
  });

  it('total N→PL memakai stocking sebagai penyebut, bukan stadia sebelumnya', () => {
    expect(computeField('srNPL', r)).toBeCloseTo(45, 5);
  });

  it('tidak menebak bila stadia sebelumnya belum diisi', () => {
    expect(computeField('srZM', { estAkhirM: 600_000 })).toBeNull();
  });

  it('keempatnya tersedia sebagai field di formulir rekap', () => {
    for (const k of ['srNZ', 'srZM', 'srMPL', 'srNPL']) {
      expect(punyaKunci('prodEstimasiSr', k), `${k} harus ada`).toBe(true);
    }
  });
});

// PDF §06: "Kepadatan dan estimasi jumlah populasi larva" + "Survival rate harian".
describe('§06 kepadatan, populasi, dan SR harian', () => {
  it('ketiganya tercatat di observasi bak harian', () => {
    for (const k of ['kepadatan', 'estimasiPopulasi', 'srHarian']) {
      expect(punyaKunci('prodLarvae', k), `${k} harus ada`).toBe(true);
    }
  });

  it('SR harian dihitung dari populasi saat ini terhadap tebar awal', () => {
    expect(computeField('srHarian', { estimasiPopulasi: 750_000, populasiTebar: 1_000_000 })).toBeCloseTo(75, 5);
  });
});

// PDF §10: data kedatangan memisahkan kematian perjalanan dari kualitas PL.
describe('§10 kondisi saat tiba dan aklimatisasi', () => {
  it('mencatat suhu kantong saat tiba, DOA, dan survival', () => {
    for (const k of ['suhuKantongTiba', 'doaPersen', 'survivalTiba']) {
      expect(punyaKunci('panenPl', k), `${k} harus ada`).toBe(true);
    }
  });

  it('mencatat keempat kondisi aklimatisasi', () => {
    for (const k of ['aklimSuhu', 'aklimSalinitas', 'aklimLama', 'jamTebar']) {
      expect(punyaKunci('panenPl', k), `${k} harus ada`).toBe(true);
    }
  });
});

// PDF §05: hijau, kuning, luminescent dicatat terpisah di SETIAP plating.
describe('§05 komposisi TCBS terpisah di kedua plating', () => {
  for (const id of ['labMikro', 'labMikroBody']) {
    it(`${id} mencatat ketiga jenis koloni`, () => {
      for (const k of ['koloniHijau', 'koloniKuning', 'koloniLuminescent']) {
        expect(punyaKunci(id, k), `${k} harus ada di ${id}`).toBe(true);
      }
    });
  }
});

// PDF menandai banyak parameter "per tank".
describe('tugas berdimensi bak', () => {
  const BAK = [{ id: 'T1', nama: 'Bak 1' }, { id: 'T2', nama: 'Bak 2' }];
  const TGL = '2026-08-20';
  const pagi = new Date('2026-08-20T09:00:00');

  it('satu tugas per bak untuk parameter per-tank', () => {
    const t = turunkanTugas({ categories: [kategori('labMikro')], records: [], tanggal: TGL, sekarang: pagi, bak: BAK });
    expect(t.map(x => x.tankId).sort()).toEqual(['T1', 'T2']);
  });

  it('mengisi satu bak tidak menandai bak lain tuntas', () => {
    const recs = [{ categoryId: 'labMikro', tanggal: TGL, tankId: 'T1' }];
    const t = turunkanTugas({ categories: [kategori('labMikro')], records: recs, tanggal: TGL, sekarang: pagi, bak: BAK });
    expect(t.find(x => x.tankId === 'T1')!.status).toBe('terisi');
    expect(t.find(x => x.tankId === 'T2')!.status).toBe('belum');
  });

  it('bak dikalikan slot waktu untuk parameter 2x sehari', () => {
    const t = turunkanTugas({ categories: [kategori('prodLarvae')], records: [], tanggal: TGL, sekarang: pagi, bak: BAK });
    expect(t.filter(x => !x.id.includes('#'))).toHaveLength(4);
  });

  it('tanpa daftar bak, jatuh ke satu tugas per kategori', () => {
    const t = turunkanTugas({ categories: [kategori('labMikro')], records: [], tanggal: TGL, sekarang: pagi });
    expect(t).toHaveLength(1);
    expect(t[0].tankId).toBeUndefined();
  });
});

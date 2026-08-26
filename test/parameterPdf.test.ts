import { describe, it, expect } from 'vitest';
import { computeField, DIST_STADIA_KEYS } from '../src/utils/compute';
import { validateRecord } from '../src/utils/validate';
import { CATEGORIES } from '../src/utils/schema';
import type { FieldDef } from '../src/types';

const kategori = (id: string) => {
  const c = CATEGORIES.find(x => x.id === id);
  if (!c) throw new Error(`Kategori ${id} tidak ada di schema`);
  return c;
};
const punyaKunci = (id: string, key: string) => kategori(id).fields.some((f: FieldDef) => f.key === key);


describe('§04 — selisih pagi-sore', () => {
  it('menghitung selisih suhu dan pH dari satu baris yang sama', () => {
    expect(computeField('deltaSuhu', { suhuPagi: 28.4, suhuSore: 30.1 })).toBeCloseTo(1.7, 5);
    expect(computeField('deltaPh', { phPagi: 7.9, phSore: 8.3 })).toBeCloseTo(0.4, 5);
  });

  it('menolak menebak bila salah satu sisi belum diisi', () => {
    expect(computeField('deltaSuhu', { suhuPagi: 28.4 })).toBeNull();
    expect(computeField('deltaPh', { phSore: 8.3 })).toBeNull();
  });

  it('NH3 sore lebih tinggi daripada pagi pada TAN yang sama saat pH naik', () => {
    const r = { amonium: 0.25, phPagi: 7.8, suhuPagi: 28, phSore: 8.4, suhuSore: 30 };
    const pagi = computeField('NH3pagi', r) as number;
    const sore = computeField('NH3sore', r) as number;
    expect(pagi).toBeGreaterThan(0);
    expect(sore).toBeGreaterThan(pagi);
  });

  it('satu baris memuat pagi dan sore sekaligus, tanpa field waktu', () => {
    for (const k of ['suhuPagi', 'suhuSore', 'phPagi', 'phSore', 'doPagi', 'doSore', 'deltaSuhu', 'deltaPh']) {
      expect(punyaKunci('prodAirRutin', k)).toBe(true);
    }
    expect(punyaKunci('prodAirRutin', 'waktu')).toBe(false);
  });
});

describe('§04 — volume & persentase pergantian air', () => {
  it('menghitung persentase dari volume bak dan volume yang diganti', () => {
    expect(computeField('persenGantiAir', { volumeAir: 20000, volumeGanti: 6000 })).toBeCloseTo(30, 5);
  });

  it('tidak menghasilkan angka bila volume bak belum diketahui', () => {
    expect(computeField('persenGantiAir', { volumeGanti: 6000 })).toBeNull();
  });

  // Sejak §04 dilebur jadi satu matriks, volume & pergantian air ikut jadi
  // baris per-bak di 'prodAirRutin' — bukan formulir terpisah lagi.
  it('field volumenya tersedia sebagai baris per-bak di matriks air rutin', () => {
    expect(punyaKunci('prodAirRutin', 'volumeAir')).toBe(true);
    expect(punyaKunci('prodAirRutin', 'volumeGanti')).toBe(true);
    expect(punyaKunci('prodAirRutin', 'persenGantiAir')).toBe(true);
  });

  it('seluruh field pergantian air ada di formulir yang sama', () => {
    const kunci = ['levelAir', 'debit', 'volumeAir', 'volumeGanti', 'persenGantiAir'];
    const fields = kategori('prodAirRutin').fields;
    for (const k of kunci) {
      expect(fields.some((f: FieldDef) => f.key === k), `${k} harus ada`).toBe(true);
    }
  });

  // §04 memakai data entry biasa seperti seksi lain; konteks bak ditanya di formulir.
  it('dicatat lewat form biasa dengan konteks bak', () => {
    expect(kategori('prodAirRutin').fields.some((f: FieldDef) => f.key === 'tankId')).toBe(true);
  });


  it('§04 hanya punya satu formulir supaya konteks tak ditanya dua kali', () => {
    expect(CATEGORIES.filter(c => c.section === '04').map(c => c.id)).toEqual(['prodAirRutin']);
  });
});

describe('§06 — distribusi stadia', () => {
  it('menyediakan satu field persen untuk tiap stadia', () => {
    for (const k of DIST_STADIA_KEYS) expect(punyaKunci('prodLarvae', k)).toBe(true);
  });

  it('menjumlahkan hanya stadia yang benar-benar diisi', () => {
    expect(computeField('totalDistribusiStadia', { distZ3: 20, distM1: 70, distM2: 10 })).toBe(100);
  });

  it('kosong bila belum ada satu pun stadia diisi', () => {
    expect(computeField('totalDistribusiStadia', { stadia: 'M1' })).toBeNull();
  });
});

describe('§01 — Induk dan Pemijahan (8 Parameter PDF)', () => {
  it('1. Kedatangan Induk mencatat kode batch, umur, dan berat', () => {
    for (const k of ['kodeBatch', 'umur', 'berat', 'tglKedatangan']) {
      expect(punyaKunci('induk', k), `field ${k} harus ada di induk`).toBe(true);
    }
  });

  it('2 & 5. PCR Induk & Pakan Segar mencatat 5 patogen utama', () => {
    for (const id of ['labPcrInduk', 'labPcrPakanSegar']) {
      for (const p of ['pcr_wssv', 'pcr_imnv', 'pcr_ehp', 'pcr_ahpnd', 'pcr_ihhnv']) {
        expect(punyaKunci(id, p), `field ${p} harus ada di ${id}`).toBe(true);
      }
    }
  });

  it('3. Kualitas air maturasi mencatat suhu, salinitas, DO, dan pH', () => {
    for (const k of ['suhu', 'salinitas', 'DO', 'pH']) {
      expect(punyaKunci('prodInduk', k), `field ${k} harus ada di prodInduk`).toBe(true);
    }
  });

  it('4. Pakan segar induk mencatat tanggal masuk dan sumber', () => {
    for (const k of ['tanggal', 'jenisPakan', 'sumber']) {
      expect(punyaKunci('prodPakanSegar', k), `field ${k} harus ada di prodPakanSegar`).toBe(true);
    }
  });

  it('6 & 7. Performa pemijahan & mutu nauplii mencatat fekunditas, fertilisasi, hatching, jumlah, keaktifan, fototaksis, keseragaman', () => {
    for (const k of ['fekunditas', 'fertilizationRate', 'hatchingRate', 'jumlahNauplii', 'keaktifan', 'responFototaksis', 'keseragaman']) {
      expect(punyaKunci('spawn', k), `field ${k} harus ada di spawn`).toBe(true);
    }
  });

  it('8. Kontrol induk harian mencatat mortalitas, culling, dan molting', () => {
    for (const k of ['mortalitas', 'culling', 'molting']) {
      expect(punyaKunci('spawnerKontrol', k), `field ${k} harus ada di spawnerKontrol`).toBe(true);
    }
  });

});


describe('kunci duplikat menghormati slot waktu', () => {
  const cat = kategori('prodLarvae');
  const baris = (waktu: string) => ({
    tankId: 'T1', siklusId: 'S1', tanggal: '2026-08-01', waktu, stadia: 'M1', status: 'draft', categoryId: cat.id,
  });

  it('pagi dan sore pada tank & tanggal yang sama bukan duplikat', () => {
    const hasil = validateRecord(baris('sore'), cat, { existing: [baris('pagi')] });
    expect(hasil.errors.some(e => e.includes('Sudah ada data'))).toBe(false);
  });

  it('slot waktu yang sama tetap ditolak sebagai duplikat', () => {
    const hasil = validateRecord(baris('pagi'), cat, { existing: [baris('pagi')] });
    expect(hasil.errors.some(e => e.includes('Sudah ada data'))).toBe(true);
  });
});

// PDF klien = otoritas mutlak atas frekuensi pengukuran. Test ini mengunci
// kategori yang frekuensinya PERNAH salah ditulis 'harian' padahal PDF
// menuntut lebih sering (atau lebih jarang).
describe('frekuensi wajib mengikuti PDF', () => {
  const kasus: Array<[string, string, string]> = [
    ['induk', 'setiap batch induk baru', '§01 Kedatangan induk setiap batch induk baru'],
    ['prodAirRutin', '2x sehari (pagi & sore)', '§04 Suhu/DO/pH minimal 2x sehari'],
    ['prodLarvae', '2x sehari (pagi & sore)', '§06 distribusi stadia 2x sehari'],
    ['spawn', 'setiap pemijahan', '§01 performa pemijahan & mutu nauplii setiap pemijahan'],
  ];



  for (const [id, harusnya, alasan] of kasus) {
    it(`${id}: ${alasan}`, () => {
      expect(kategori(id).frekuensi).toBe(harusnya);
    });
  }

  it('alkalinitas menyimpan kadensinya sendiri (3x/minggu), bukan ikut harian', () => {
    const f = kategori('prodAirRutin').fields.find((x: FieldDef) => x.key === 'alkalinitas');
    expect(f?.hint).toMatch(/3x per minggu/);
  });

});

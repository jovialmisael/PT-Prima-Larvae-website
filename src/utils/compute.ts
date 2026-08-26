export function num(v: any): { nilai: number | null; flag?: string } {
  if (v === undefined || v === null || v === '') return { nilai: null };
  if (typeof v === 'number') return { nilai: v };
  if (typeof v === 'string') {
    if (v.toUpperCase() === 'TNTC') {
      return { nilai: 999999, flag: 'tntc' }; // Or some high sentinel value
    }
    if (v.startsWith('>')) {
      const parsed = parseFloat(v.substring(1).replace(',', '.'));
      if (!isNaN(parsed)) return { nilai: parsed, flag: '>' };
    }
    if (v.startsWith('<')) {
      const parsed = parseFloat(v.substring(1).replace(',', '.'));
      if (!isNaN(parsed)) return { nilai: parsed, flag: '<' };
    }
    const parsed = parseFloat(v.replace(',', '.'));
    if (!isNaN(parsed)) return { nilai: parsed };
  }
  return { nilai: null };
}

/**
 * NH3 (amonia tidak terionisasi) dari TAN, pH, suhu, dan salinitas.
 *
 * PDF §04 menuntut EMPAT angka, bukan tiga: "Dihitung dari TAN, pH, suhu, dan
 * salinitas — empat angka yang sudah ada di lembar harian." Salinitas menaikkan
 * kekuatan ionik, yang menaikkan pKa dan karenanya menurunkan proporsi NH3;
 * mengabaikannya membuat perkiraan racun di air laut terlalu tinggi.
 *
 * Air tawar memakai Emerson dkk. (1975); begitu salinitas diketahui dipakai
 * Bower & Bidwell (1978) yang menyertakan suku salinitas. Keduanya menyatu di
 * salinitas 0 (selisih < 0,02 satuan pH), sehingga peralihannya tidak melonjak.
 */
export function computeNH3(params: { tan: number; ph: number; suhu: number; salinitas?: number }): number {
  const { tan, ph, suhu, salinitas } = params;
  const tKelvin = 273.15 + suhu;

  const pKa = salinitas != null && salinitas > 0
    ? 9.245 + 0.002949 * salinitas + 0.0324 * (298 - tKelvin)
    : 0.09018 + 2729.92 / tKelvin;

  const f = 1 / (1 + Math.pow(10, pKa - ph));
  return tan * f;
}

/** Kunci field distribusi stadia (§06) — dipakai schema dan penjumlahannya. */
export const DIST_STADIA_KEYS = ['distN', 'distZ1', 'distZ2', 'distZ3', 'distM1', 'distM2', 'distM3', 'distPl'];

export function stats(values: number[]): { n: number; mean: number; sd: number; cv: number; min: number; max: number } | null {
  if (!values || values.length === 0) return null;
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1 || 1);
  const sd = Math.sqrt(variance);
  const cv = mean === 0 ? 0 : (sd / mean) * 100;
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  return { n, mean, sd, cv, min, max };
}

export function suggestBounds(values: number[]): { safeMin: number; safeMax: number; dangerMin: number; dangerMax: number } | null {
  const s = stats(values);
  if (!s) return null;
  // Heuristic based bounds
  return {
    safeMin: s.mean - s.sd,
    safeMax: s.mean + s.sd,
    dangerMin: s.mean - 2 * s.sd,
    dangerMax: s.mean + 2 * s.sd
  };
}

// Tabel field turunan tinggal di computedFields.ts; konsumen lama tetap
// mengimpor dari sini.
export { COMPUTED, computeField } from './computedFields';

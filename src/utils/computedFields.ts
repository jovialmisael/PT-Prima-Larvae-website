import { computeNH3, DIST_STADIA_KEYS } from './compute';

/**
 * Tabel parameter turunan (PRD §6). Semuanya dihitung mesin dan tidak boleh
 * diketik manual, supaya angka yang sama tidak pernah ditulis dua kali dengan
 * hasil berbeda.
 */
function selisih(a: any, b: any): number | null {
  const x = Number(a);
  const y = Number(b);
  if (a === undefined || a === null || a === '' || b === undefined || b === null || b === '') return null;
  if (Number.isNaN(x) || Number.isNaN(y)) return null;
  return x - y;
}

function nh3Dari(tan: any, ph: any, suhu: any, salinitas?: any): number | null {
  if (tan == null || tan === '' || ph == null || ph === '' || suhu == null || suhu === '') return null;
  const t = Number(tan), p = Number(ph), s = Number(suhu);
  if (Number.isNaN(t) || Number.isNaN(p) || Number.isNaN(s)) return null;
  const sal = salinitas == null || salinitas === '' ? undefined : Number(salinitas);
  return computeNH3({ tan: t, ph: p, suhu: s, salinitas: Number.isNaN(sal as number) ? undefined : sal });
}

export const COMPUTED: Record<string, (record: any) => any> = {
  NH3: (r) => nh3Dari(r.amonium, r.pH, r.suhu, r.salinitas),
  // §04 PDF: "Catat juga selisih pagi-sore. Fluktuasi sama pentingnya dengan
  // nilainya." Karena satu baris kini memuat pagi & sore sekaligus, selisihnya
  // bisa dihitung tanpa membandingkan antar-record.
  deltaSuhu: (r) => selisih(r.suhuSore, r.suhuPagi),
  deltaPh: (r) => selisih(r.phSore, r.phPagi),

  // NH3 dihitung dua kali: pH bergeser dari pagi ke sore, dan hanya NH3 yang
  // beracun. TAN yang sama bisa aman pagi dan berbahaya sore.
  NH3pagi: (r) => nh3Dari(r.amonium, r.phPagi, r.suhuPagi, r.salinitas),
  NH3sore: (r) => nh3Dari(r.amonium, r.phSore, r.suhuSore, r.salinitas),

  // §04 PDF: "Volume air dan persentase pergantian air".
  persenGantiAir: (r) => {
    const vol = Number(r.volumeAir);
    const ganti = Number(r.volumeGanti);
    if (!vol || r.volumeGanti == null || r.volumeGanti === '' || Number.isNaN(ganti)) return null;
    return (ganti / vol) * 100;
  },

  // §06 PDF: distribusi stadia dicatat sebagai persen; totalnya harus mendekati 100.
  totalDistribusiStadia: (r) => {
    let ada = false;
    let total = 0;
    for (const k of DIST_STADIA_KEYS) {
      const v = Number(r[k]);
      if (r[k] === undefined || r[k] === null || r[k] === '' || Number.isNaN(v)) continue;
      ada = true;
      total += v;
    }
    return ada ? total : null;
  },
  umurInduk: (r) => {
    if (r.umurAwal != null && r.tglKedatangan) {
      const diffTime = Math.abs(new Date().getTime() - new Date(r.tglKedatangan).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      return r.umurAwal + diffDays;
    }
    return null;
  },
  estimasiAfkir: (r) => {
    if (r.tglKedatangan && r.masaProduktifHari != null) {
      const date = new Date(r.tglKedatangan);
      date.setDate(date.getDate() + r.masaProduktifHari);
      return date.toISOString().split('T')[0];
    }
    return null;
  },
  totalMatiInduk: (r) => {
    const b = Number(r.betinaMati) || 0;
    const j = Number(r.jantanMati) || 0;
    if (r.betinaMati == null && r.jantanMati == null) return null;
    return b + j;
  },
  persenKematianKedatangan: (r) => {
    const totalKirim = (Number(r.jumlahBetina) || 0) + (Number(r.jumlahJantan) || 0);
    const totalMati = (Number(r.betinaMati) || 0) + (Number(r.jantanMati) || 0);
    if (totalKirim === 0) return null;
    return (totalMati / totalKirim) * 100;
  },
  fekunditas: (r) => {
    const telur = Number(r.jumlahTelur);
    const betina = Number(r.jumlahBetinaPijah);
    if (!r.jumlahTelur || !r.jumlahBetinaPijah || betina === 0 || Number.isNaN(telur)) return null;
    return telur / betina;
  },
  fertilPct: (r) => {
    if (r.jumlahTelur == null || r.jumlahFertil == null || Number(r.jumlahTelur) === 0) return null;
    return (Number(r.jumlahFertil) / Number(r.jumlahTelur)) * 100;
  },
  hatchingPct: (r) => {
    // Hatching relatif terhadap telur fertil bila ada, jika tidak ke total telur.
    const denom = Number(r.jumlahFertil) || Number(r.jumlahTelur) || 0;
    if (r.jumlahNaupli == null || denom === 0) return null;
    return (Number(r.jumlahNaupli) / denom) * 100;
  },
  totalNaupli: (r) => {
    if (r.jmlNaupli == null || r.sampleSize == null || Number(r.sampleSize) === 0) return null;
    const perVol = Number(r.jmlNaupli) / Number(r.sampleSize);
    return r.volEmber != null ? perVol * Number(r.volEmber) : perVol;
  },
  persenAbnormal: (r) => {
    const total = (Number(r.naupliiBagus) || 0) + (Number(r.naupliiAbnormal) || 0);
    if (total === 0) return null;
    return ((Number(r.naupliiAbnormal) || 0) / total) * 100;
  },

  // SR kumulatif dari stocking (sumber: file observasi "ALL"): SR_x = EST_x / TOTAL_STOCKING × 100.
  // Denominator selalu TOTAL_STOCKING (bukan antar-stadia). Est adalah input lapangan.
  srZ2: (r) => srDariStocking(r.estZ2, r.totalStocking),
  srZ3: (r) => srDariStocking(r.estZ3, r.totalStocking),
  srM2: (r) => srDariStocking(r.estM2, r.totalStocking),
  srPL4: (r) => srDariStocking(r.estPL4, r.totalStocking),
  srPL10: (r) => srDariStocking(r.estPL10, r.totalStocking),

  // PDF §06: "Survival antar stadia: N->Z, Z->M, M->PL, dan total N->PL.
  // Ini adalah nilai rapor utama sebuah siklus." Berbeda dari SR kumulatif di
  // atas: penyebutnya stadia SEBELUMNYA, bukan total stocking. Keduanya
  // disajikan karena menjawab pertanyaan yang berbeda — SR kumulatif untuk
  // memantau siklus berjalan, survival antar stadia untuk rapor akhir.
  srNZ: (r) => rasioPersen(r.estAkhirZ, r.totalStocking),
  srZM: (r) => rasioPersen(r.estAkhirM, r.estAkhirZ),
  srMPL: (r) => rasioPersen(r.estAkhirPl, r.estAkhirM),
  srNPL: (r) => rasioPersen(r.estAkhirPl, r.totalStocking),

  // PDF §06: "Survival rate harian - Harian, per tank."
  srHarian: (r) => rasioPersen(r.estimasiPopulasi, r.populasiTebar)
};

/** Persentase pembilang terhadap penyebut; kosong bila salah satunya belum ada. */
function rasioPersen(pembilang: any, penyebut: any): number | null {
  const a = Number(pembilang);
  const b = Number(penyebut);
  if (pembilang == null || pembilang === '' || !b || Number.isNaN(a) || Number.isNaN(b)) return null;
  return (a / b) * 100;
}

function srDariStocking(est: any, totalStocking: any): number | null {
  const e = Number(est);
  const t = Number(totalStocking);
  if (est === undefined || est === null || est === '' || !t || Number.isNaN(e)) return null;
  return (e / t) * 100;
}

export function computeField(key: string, record: any): any {
  if (COMPUTED[key]) {
    return COMPUTED[key](record);
  }
  return null;
}

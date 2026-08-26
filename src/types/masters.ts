import type { Stadia, RoleLevel, NumericThreshold } from './index';

// Tipe master entity & sinyal (dipisah dari index.ts agar tiap file ringkas).
// Traceability: Induk -> Spawn -> Siklus -> Penempatan(multi-tank)/Transfer.

export type Tank = {
  id: string;
  namaTank: string;
  ruangStadia: 'naupli' | 'zoea' | 'mysis' | 'pl';
  lokasi: string;
  kapasitas: number;
  status: 'aktif' | 'nonaktif';
};

export type Induk = {
  id: string;
  kodeBatch: string;
  tglKedatangan: string; // ISO date
  umur: number; // hari (PDF §01: umur)
  berat: number; // gram (PDF §01: berat)
  pcr?: Record<string, string>;
  status?: 'aktif' | 'selesai';
};

export type Spawn = {
  id: string;
  indukId: string;
  tanggal: string;
  fekunditas?: number;
  fertilizationRate?: number; // % (PDF §01: fertilization rate)
  hatchingRate?: number; // % (PDF §01: hatching rate)
  jumlahNauplii?: number; // per spawn (PDF §01: jumlah nauplii per spawn)
  keaktifan?: 'aktif' | 'sedang' | 'lemah';
  responFototaksis?: 'positif' | 'lemah' | 'negatif';
  keseragaman?: string;
};



export type Siklus = {
  id: string;
  kodeBatch: string;
  indukId: string;
  tglMulai: string;
  parameterBaseline: Record<string, any>;
  status: 'setup' | 'aktif' | 'panen' | 'selesai' | 'terminasi';
  srFinal?: number;
  tambakTujuan?: string;
};

export type Penempatan = {
  id: string;
  siklusId: string;
  tankId: string;
  ruangStadia: 'naupli' | 'zoea' | 'mysis' | 'pl';
  tglMasuk: string;
  tglKeluar?: string;
  jumlahAwal: number;
  komposisi: { spawnId: string; jumlah: number }[];
  srTank?: number; // computed
};

export type Transfer = {
  id: string;
  tanggal: string;
  jenis: 'stok-awal' | 'pindah' | 'split' | 'merge' | 'panen-sebagian';
  siklusId: string;
  tankSumber?: string;
  tankTujuan: string;
  jumlah: number;
  alasan?: string;
};

export type RearingPlan = {
  id: string;
  stadia: Stadia;
  doc: number;
  targetSuhu: number;
  algaeTH: number;
  algaeCH: number;
  waterLevel: number;
  mesh: number;
  waterSource: string;
  exchange: number;
  dosing: {
    treflan: number;
    vAlgen: number;
    bzt: number;
    vitC: number;
    chlor: number;
  };
  probiotikSchedule: string;
};

export type AlertStatus = 'aktif' | 'diakui' | 'selesai';

export type AlertMitigasi = {
  buktiTindakanId?: string;
  jenisTindakan: string;
  jam: string;
  dosis?: string;
  catatanMitigasi?: string;
};

export type Alert = {
  id: string;
  status: AlertStatus;
  tingkat: 'waspada' | 'bahaya';
  parameter: string;
  tankId?: string;
  siklusId?: string;
  tanggal: string;
  pesan: string;
  tindakan: string;
  kontakRole: RoleLevel;
  hitungan: number;
  terakhirDiperbarui: number;
  diakuiOleh?: string;
  diselesaikanOleh?: string;
  mitigasi?: AlertMitigasi;
};


export type Recommendation = {
  kondisi: string;
  rekomendasi: string;
  sumber: string;
  keyakinan: 'tinggi' | 'sedang';
  tindakanRujukan?: string;
};

/** Tindakan + siapa yang dihubungi saat sebuah ambang terlampaui. */
export type Aksi = { tindakan: string; kontakRole: RoleLevel };

/**
 * Baku Mutu satu parameter, dimiliki MPM (PRD §3.C). Menyimpan ambang yang
 * disetujui beserta protokol tindakannya, dan menang atas nilai bawaan skema.
 * Kuncinya `${categoryId}:${fieldKey}`.
 */
export type BakuMutu = {
  id: string;
  categoryId: string;
  fieldKey: string;
  ambang?: NumericThreshold;
  protokol?: { waspada?: Aksi; bahaya?: Aksi };
  /** literatur = seed awal; usulan-data = dihitung dari riwayat; mpm = disunting manual. */
  sumber: 'literatur' | 'usulan-data' | 'mpm';
  disetujuiOleh?: string;
  diperbaruiPada: number;
  /** Banyak pengukuran yang mendasari usulan — dasar menilai kepercayaannya. */
  nSampel?: number;
};

/**
 * Jadwal pemeriksaan berkala yang ditetapkan Kepala Divisi.
 *
 * PDF menandai sebagian pemeriksaan sebagai "berkala" tanpa menyebut interval,
 * dan menulis sendiri bahwa intervalnya perlu ditetapkan. Keputusan itu ada di
 * tangan orang, bukan di angka bawaan — maka jadwalnya disimpan sebagai data,
 * bukan dikeraskan di skema.
 */
export type JadwalBerkala = {
  id: string;
  categoryId: string;
  /** Tanggal pemeriksaan pertama (YYYY-MM-DD). */
  mulai: string;
  /** Jarak antar pemeriksaan dalam hari; 0 berarti sekali saja. */
  intervalHari: number;
  ditetapkanOleh: string;
  diperbaruiPada: number;
  catatan?: string;
  aktif: boolean;
};

/**
 * Umur pakai konsumabel treatment (§02: lampu UV, karbon, generator ozon).
 *
 * Riset pengolahan air: masa pakai karbon aktif berkisar bulan sampai tahun
 * tergantung karakter airnya, dan kejenuhan terdeteksi lewat breakthrough —
 * bisa terjadi jauh sebelum ada perubahan tekanan. Karena itu angkanya tidak
 * dibawakan sistem, melainkan ditetapkan Kepala Divisi sesuai kondisi setempat.
 */
export type UmurPakai = {
  id: string;
  /** Sama dengan pilihan `jenisTindakan` di formulir perawatan treatment. */
  jenisTindakan: string;
  hari: number;
  /** Berapa hari sebelum habis pengingat mulai muncul. */
  peringatanHari: number;
  ditetapkanOleh: string;
  diperbaruiPada: number;
  aktif: boolean;
};

// ===========================================================================
// §11 PASPOR SIKLUS & TRACEABILITY END-TO-END
// ===========================================================================

export type PasporStageInduk = {
  kodeBatch: string;
  tglKedatangan: string;
  umur?: number;
  berat?: number;
  pcr: Record<string, string>;
  pcrStatus: 'lolos' | 'waspada' | 'bahaya';
};

export type PasporStageSpawn = {
  id: string;
  tanggal: string;
  fekunditas?: number;
  fertilizationRate?: number;
  hatchingRate?: number;
  jumlahNauplii?: number;
  keaktifan?: string;
  responFototaksis?: string;
  keseragaman?: string;
};

export type PasporStageAirTank = {
  totalLog: number;
  avgSuhu?: number;
  avgDO?: number;
  avgPh?: number;
  avgSalinitas?: number;
  anomaliCount: number;
  logTindakan: Array<{
    tanggal: string;
    jam: string;
    jenisTindakan: string;
    dosis?: string;
    alasan?: string;
    petugas?: string;
  }>;
};

export type PasporStageStadia = {
  srNZ?: number;
  srZM?: number;
  srMPL?: number;
  srNPL?: number;
  defectSummary: {
    totalPemeriksaan: number;
    rataanSkor: number;
    statusDefect: 'bersih' | 'waspada' | 'tinggi';
  };
};

export type PasporStageQCPanen = {
  formalinSR?: number;
  salinitySR?: number;
  pcrPraPanen?: Record<string, string>;
  statusKesehatan: 'prima' | 'perlu-reviu' | 'belum-uji';
  realisasiPanen?: {
    jumlahPL?: number;
    srFinal?: number;
    kepadatanBox?: number;
    suhuBox?: number;
    tambakTujuan?: string;
  };
};

export type PasporSiklus = {
  siklusId: string;
  kodeBatch: string;
  tglMulai: string;
  status: 'setup' | 'aktif' | 'panen' | 'selesai' | 'terminasi';
  gradeMutu: 'LULUS STANDAR PRIMA' | 'WASPADA ANOMALI' | 'BELUM LENGKAP';
  stageInduk?: PasporStageInduk;
  stageSpawn?: PasporStageSpawn;
  stageAir: PasporStageAirTank;
  stageStadia: PasporStageStadia;
  stageQC: PasporStageQCPanen;
  penempatanTanks: string[];
};


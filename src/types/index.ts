export type Division = 'produksi' | 'lab' | 'mpm' | 'manager';
export type RoleLevel = 'petugas' | 'pj' | 'kepala' | 'mpm' | 'manager' | 'owner';
export type Area = 'maturasi' | 'algae' | 'pl';

// Section = bagian dokumen parameter klien (sumber kebenaran), §01–§12.
// Menjadi "judul" pengelompokan di sidebar "Input Data Harian".
// '11' (Traceability) = metadata lintas-baris, bukan judul menu.
// '13' (Hasil di Tambak) dihapus — grow-out di luar scope hatchery.
export type SectionId =
  | '01' | '02' | '03' | '04' | '05' | '06' | '07'
  | '08' | '09' | '10' | '11' | '12';

export type RecordStatus = 'draft' | 'qc' | 'disahkan' | 'ditolak' | 'revisi';
export type FieldType = 'text' | 'number' | 'date' | 'select' | 'segmented' | 'pcr' | 'textarea' | 'ref' | 'computed';

export type Stadia =
  | 'N1' | 'N2' | 'N3' | 'N4' | 'N5'
  | 'Z1' | 'Z2' | 'Z3'
  | 'M1' | 'M2' | 'M3'
  | 'MPL'
  | 'PL1' | 'PL2' | 'PL3' | 'PL4' | 'PL5' | 'PL6' | 'PL7' | 'PL8' | 'PL9' | 'PL10'
  | 'PL10+';

// Tipe master entity (Tank/Induk/Spawn/Siklus/Penempatan/Transfer/RearingPlan)
// + Alert/Recommendation dipisah ke ./masters agar file ini tetap ringkas.
export * from './masters';
export * from './kadens';
import type { Kadens } from './kadens';

export type NumericThreshold = {
  safeMin?: number;
  safeMax?: number;
  dangerMin?: number;
  dangerMax?: number;
};

export type CategoricalThreshold = {
  badValues: string[];
  warnValues?: string[];
};

export type StageAwareThreshold = {
  default: NumericThreshold | CategoricalThreshold;
  byStage?: Partial<Record<Stadia, NumericThreshold | CategoricalThreshold>>;
};

export type Threshold = NumericThreshold | CategoricalThreshold | StageAwareThreshold;

export type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  unit?: string;
  group?: string;
  required?: boolean;
  options?: string[];
  ref?: string;
  precision?: number;
  threshold?: Threshold;
  compute?: string;
  hint?: string;
  perTank?: boolean; // mode matrix: field ini menjadi BARIS (diukur per tank)
  /**
   * Kadens khusus field, bila berbeda dari kadens kategorinya. Contoh:
   * alkalinitas diukur 3x/minggu di dalam formulir air yang harian.
   */
  kadens?: Kadens;
  owner?: Division; // kepemilikan field lintas-divisi (mis. 'lab'); disembunyikan dari divisi lain
};

export type Category = {
  id: string;
  code?: string;
  division: Division;
  area?: Area;
  section?: SectionId; // bagian PDF klien (judul sidebar)
  collection: string;
  title: string;
  frekuensi?: string;
  fields: FieldDef[];
};

export type ApprovalStamp = {
  oleh: string;
  pada: number;
  ttd: string;
};

export type RejectStamp = {
  oleh: string;
  pada: number;
  alasan: string;
};

export type RecordBase<TFields = Record<string, any>> = TFields & {
  id: string;
  categoryId: string;
  status: RecordStatus;
  dibuatOleh: string;
  dibuatPada: number;

  diparafArea?: ApprovalStamp;
  diperiksaMpm?: ApprovalStamp;
  disahkanKepala?: ApprovalStamp;
  ditolakOleh?: RejectStamp;
  koreksiDari?: string;
  riwayatEdit?: { waktu: number; oleh: string; field: string; prev: any; next: any }[];
};

export type ApiResult<T> = T | null;

export type Collection =
  | 'tank'
  | 'induk'
  | 'spawn'
  | 'siklus'
  | 'penempatan'
  | 'transfer'
  | 'rearingPlan'
  | 'alerts'
  | 'bakuMutu'
  | 'jadwalBerkala'
  | 'umurPakai'
  | 'records';

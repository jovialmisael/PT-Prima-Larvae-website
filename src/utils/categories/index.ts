import { Category } from '@domainTypes/index';
import { PRODUKSI_BROODSTOCK } from './produksiBroodstock';
import { PRODUKSI_REARING } from './produksiRearing';
import { PRODUKSI_POPULASI } from './produksiPopulasi';
import { LAB_CATEGORIES } from './lab';
import { SECTION_INDUK } from './sectionInduk';
import { SECTION_AIR_TREATMENT } from './sectionAirTreatment';
import { SECTION_PAKAN_HIDUP } from './sectionPakanHidup';
import { SECTION_PANEN } from './sectionPanen';
import { SECTION_MIKRO_DEFECT } from './sectionMikroDefect';

// Gabungan seluruh kategori data-entry (Produksi + Lab + 12 bagian aktif PDF klien).
// §13 Hasil di Tambak dicoret dari target (2026-08-20) — lihat scope doctrine.
// §07 memakai tiga set defect per-stadia (SECTION_MIKRO_DEFECT) sesuai PDF;
// kategori generik 'labDefectAbnormalitas' dipensiunkan 2026-08-22 karena
// menampilkan field N-Z3 dan Mysis&PL sekaligus tanpa memandang stadia.
export const CATEGORIES: Category[] = [
  ...PRODUKSI_BROODSTOCK,
  ...PRODUKSI_REARING,
  ...PRODUKSI_POPULASI,
  ...LAB_CATEGORIES,
  ...SECTION_INDUK,
  ...SECTION_AIR_TREATMENT,
  ...SECTION_PAKAN_HIDUP,
  ...SECTION_PANEN,
  ...SECTION_MIKRO_DEFECT
];

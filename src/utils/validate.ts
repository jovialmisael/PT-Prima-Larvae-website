import { Category } from '@domainTypes/index';
import { evaluate } from '@services/alerts';

export interface ValidateResult {
  errors: string[];
  warnings: string[];
  abnormal: string[]; // pelanggaran ambang "bahaya" (data operasional penting)
  ok: boolean;
}

/** Kategori harian per tank: punya field `tankId` sekaligus `tanggal`. */
function isDailyTankCategory(category: Category): boolean {
  let tank = false;
  let tanggal = false;
  for (const f of category.fields) {
    if (f.key === 'tankId') tank = true;
    else if (f.key === 'tanggal') tanggal = true;
  }
  return tank && tanggal;
}

/**
 * Sebagian formulir memang diisi lebih dari sekali sehari (PDF: "2x sehari,
 * pagi dan sore"). Kalau schema-nya menyediakan field `waktu`, slot itu ikut
 * jadi bagian kunci logisnya — kalau tidak, kuncinya tetap (tank, tanggal).
 */
function punyaSlotWaktu(category: Category): boolean {
  return category.fields.some(f => f.key === 'waktu');
}

/** Angka dari input bisa berupa string ("29,5") — samakan dulu sebelum dibandingkan. */
function toNumber(value: any): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const n = parseFloat(String(value).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/**
 * Validasi record terhadap schema kategori.
 *
 * `opts.abnormalBlocks` (default true, perilaku lama): nilai "bahaya" masuk `errors`
 * sehingga memblokir submit. Untuk alur PRODUKSI kita panggil dengan `false`
 * agar abnormal TIDAK memblokir (tetap tercatat di `abnormal` untuk konfirmasi).
 *
 * `opts.existing`: record sejenis yang sudah tersimpan, dipakai menegakkan prinsip
 * domain "satu baris = satu tank, satu hari". Pemanggil yang mengambilnya (lewat
 * `api.list`), supaya modul ini tetap murni dan bisa diuji tanpa persistensi.
 */
export function validateRecord(
  record: any,
  category: Category,
  opts?: { abnormalBlocks?: boolean; existing?: any[] },
): ValidateResult {
  const abnormalBlocks = opts?.abnormalBlocks ?? true;
  const errors: string[] = [];
  const warnings: string[] = [];
  const abnormal: string[] = [];

  for (const field of category.fields) {
    const value = record[field.key];

    if (field.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field.label} wajib diisi.`);
    }

    if (value !== undefined && value !== null && value !== '') {
      // Persentase dikenali dari satuannya di schema, bukan dari tebakan nama kunci.
      if (field.unit === '%') {
        const n = toNumber(value);
        if (n !== null && (n < 0 || n > 100)) {
          const msg = `${field.label} harus berada di antara 0 dan 100.`;
          // Field computed di luar rentang menandakan input/rumusnya keliru, tapi
          // petugas tidak mengetiknya sendiri — jadi diperingatkan, bukan diblokir.
          if (field.type === 'computed') warnings.push(msg);
          else errors.push(msg);
        }
      }

      if (field.type === 'date') {
        const d = new Date(value);
        if (d > new Date()) {
          errors.push(`${field.label} tidak boleh di masa depan.`);
        }
      }
    }
  }

  // Prinsip domain #1: satu baris = satu tank, satu hari. Kunci logisnya
  // (tankId, tanggal) — bukan siklusId, sebab satu siklus mencakup ~20 tank/hari.
  // Untuk formulir berslot waktu, kuncinya (tankId, tanggal, waktu).
  if (opts?.existing && isDailyTankCategory(category) && record.tankId && record.tanggal) {
    const pakaiSlot = punyaSlotWaktu(category);
    const bentrok = opts.existing.some(r =>
      r.categoryId === category.id &&
      r.tankId === record.tankId &&
      r.tanggal === record.tanggal &&
      (!pakaiSlot || r.waktu === record.waktu) &&
      r.status !== 'ditolak' &&
      (!record.id || r.id !== record.id),
    );
    if (bentrok) {
      const kapan = pakaiSlot && record.waktu ? `tank, tanggal & waktu (${record.waktu})` : 'tank & tanggal ini';
      errors.push(`Sudah ada data "${category.title}" untuk ${kapan}.`);
    }
  }

  const evaluations = evaluate(record, category);
  for (const [key, status] of Object.entries(evaluations)) {
    const field = category.fields.find(f => f.key === key);
    if (status === 'waspada') {
      warnings.push(`Nilai ${field?.label} berada di zona waspada.`);
    } else if (status === 'bahaya') {
      const msg = `Nilai ${field?.label} berada di zona bahaya.`;
      abnormal.push(msg);
      if (abnormalBlocks) errors.push(msg);
    }
  }

  return { errors, warnings, abnormal, ok: errors.length === 0 };
}

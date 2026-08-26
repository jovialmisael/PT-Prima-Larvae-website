import { Category, FieldDef } from '@domainTypes/index';
import type { FormSection } from '@components/ui/SchemaFormSection';

/**
 * Field yang ditanyakan sekali saja untuk seluruh formulir dalam satu bagian.
 * Tanpa dedup ini petugas akan ditanya tanggal/bak/petugas berulang kali.
 */
export const COMMON_FIELDS = ['tanggal', 'waktu', 'tankId', 'siklusId', 'petugas', 'pemeriksa', 'pelaksana'];

/**
 * Susun blok tampilan untuk halaman gabungan: satu blok "Informasi Umum" berisi
 * field bersama, lalu satu blok per formulir asal.
 *
 * Field khusus diberi awalan `${cat.id}__` supaya dua kategori yang kebetulan
 * memakai kunci sama (mis. `bakInduk` di spawnerKontrol dan prodInduk) tidak
 * saling menimpa — dan karena kini berada di blok berbeda, keduanya tidak lagi
 * tampak sebagai label kembar di layar.
 */
export function bangunSections(categories: Category[]): FormSection[] {
  const umum: FieldDef[] = [];
  const seenCommon = new Set<string>();
  const perKategori: FormSection[] = [];

  categories.forEach(cat => {
    const milikKategori: FieldDef[] = [];

    cat.fields.forEach(f => {
      if (COMMON_FIELDS.includes(f.key)) {
        if (!seenCommon.has(f.key)) {
          umum.push(f);
          seenCommon.add(f.key);
        }
      } else {
        milikKategori.push({ ...f, key: `${cat.id}__${f.key}` });
      }
    });

    if (milikKategori.length > 0) {
      perKategori.push({
        key: cat.id,
        // Kode form kertas klien (cat.code) sengaja TIDAK ditempel ke judul —
        // operator tidak memakainya, dan itu cuma memanjangkan judul.
        title: cat.title,
        meta: cat.frekuensi,
        fields: milikKategori,
      });
    }
  });

  const hasil: FormSection[] = [];
  if (umum.length > 0) {
    hasil.push({
      key: '_umum',
      title: 'Informasi Umum',
      meta: 'berlaku untuk semua formulir di bawah',
      fields: umum,
      alwaysActive: true,
    });
  }
  return [...hasil, ...perKategori];
}

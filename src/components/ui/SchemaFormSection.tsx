import { useMemo } from 'react';
import { FieldDef } from '@domainTypes/index';
import { computeField } from '@utils/compute';
import { FieldControl, RefOption } from './FieldControl';

/** Satu formulir asal di dalam halaman gabungan. */
export type FormSection = {
  key: string;
  title: string;
  /** Keterangan kecil di samping judul, mis. frekuensi pengisian. */
  meta?: string;
  fields: FieldDef[];
  /** Blok yang selalu dianggap aktif (mis. Informasi Umum bersama). */
  alwaysActive?: boolean;
};

interface Props {
  section: FormSection;
  values: Record<string, any>;
  refOptions: Record<string, RefOption[]>;
  onChange: (key: string, val: any) => void;
}

const WIDE_TYPES = ['textarea'];

const terisi = (v: any) => v !== undefined && v !== null && v !== '';

/**
 * Merender satu formulir sebagai blok tersendiri: judul, penghitung kelengkapan
 * khusus formulir itu, lalu grid field-nya. Sub-kelompok (`field.group`) dirender
 * sebagai baris label tipis di dalamnya.
 *
 * Tanda wajib (*) baru dinyalakan setelah blok ini disentuh — mencerminkan aturan
 * penyimpanan yang hanya memproses kategori dengan minimal satu field terisi.
 */
export function SchemaFormSection({ section, values, refOptions, onChange }: Props) {
  const jumlahTerisi = useMemo(
    () => section.fields.filter(f => terisi(values[f.key])).length,
    [section.fields, values],
  );

  const aktif = section.alwaysActive || jumlahTerisi > 0;

  // Kelompokkan per `group` sambil mempertahankan urutan kemunculan.
  const subKelompok = useMemo(() => {
    const peta = new Map<string, FieldDef[]>();
    for (const f of section.fields) {
      const kunci = f.group || '';
      if (!peta.has(kunci)) peta.set(kunci, []);
      peta.get(kunci)!.push(f);
    }
    return [...peta.entries()];
  }, [section.fields]);

  return (
    <section className={`sf-section ${aktif ? 'is-active' : 'is-idle'}`}>
      <header className="sf-section-head">
        <div className="sf-section-titles">
          <h3 className="sf-section-title">{section.title}</h3>
          {section.meta && <span className="sf-section-meta">{section.meta}</span>}
        </div>
        <span className="sf-section-count font-mono">
          {jumlahTerisi}/{section.fields.length} terisi
        </span>
      </header>

      <div className="sf-section-body">
        {subKelompok.map(([namaGrup, fields]) => (
          <div key={namaGrup || '_'} className="sf-subgroup">
            {namaGrup && <div className="sf-subgroup-label">{namaGrup}</div>}
            <div className="sf-grid">
              {fields.map(field => (
                <div
                  key={field.key}
                  className={`sf-cell ${WIDE_TYPES.includes(field.type) ? 'is-wide' : ''}`}
                >
                  <FieldControl
                    field={aktif ? field : { ...field, required: false }}
                    value={values[field.key]}
                    allValues={values}
                    computedValue={
                      field.type === 'computed'
                        ? computeField(field.compute || field.key, values)
                        : undefined
                    }
                    refOptions={refOptions[field.key]}
                    onChange={val => onChange(field.key, val)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

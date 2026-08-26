import { useEffect, useMemo, useState } from 'react';
import { FieldDef, Division } from '@domainTypes/index';
import { computeField } from '@utils/compute';
import { list, refLabel } from '@services/api';
import { FieldControl, RefOption } from './FieldControl';
import { SchemaFormSection, type FormSection } from './SchemaFormSection';
import { useDraftAutosave } from './useDraftAutosave';
import { FormStatusBar, FormActionsBar } from './FormChrome';
import { RotateCcw, Save } from 'lucide-react';
import './ui.css';
interface SchemaFormProps {
  fields: FieldDef[];
  onSubmitData: (data: Record<string, any>) => void;
  submitLabel?: string;
  submitting?: boolean;
  draftKey?: string; // bila di-set: autosave draft aktif
  division?: Division; // bila di-set: sembunyikan field milik divisi lain (owner)
  /**
   * Bila diisi: field dirender per formulir asal (blok bertumpuk) alih-alih satu
   * grid datar. Dipakai halaman gabungan 13 bagian; kategori tunggal tetap datar.
   */
  sections?: FormSection[];
}

/**
 * Form data-entry schema-driven. Merender daftar FieldControl dari `fields`,
 * memuat opsi field `ref` dari master storage, menghitung field computed,
 * dan menampilkan progress kelengkapan isian.
 */
export function SchemaForm({
  fields: allFields,
  onSubmitData,
  submitLabel = 'Simpan sebagai Draft',
  submitting = false,
  draftKey,
  division,
  sections
}: SchemaFormProps) {
  // Sembunyikan field milik divisi lain (ownership); jika owner tak di-set, selalu tampil.
  const fields = useMemo(
    () => (division ? allFields.filter(f => !f.owner || f.owner === division) : allFields),
    [allFields, division],
  );
  const { values, setValues, lastSaved } = useDraftAutosave(draftKey);
  const [refOptions, setRefOptions] = useState<Record<string, RefOption[]>>({});

  // Muat opsi untuk semua field bertipe `ref` dari Master Storage
  useEffect(() => {
    let active = true;
    const refFields = fields.filter(f => f.type === 'ref' && f.ref);
    Promise.all(
      refFields.map(async f => {
        const items = await list(f.ref as any);
        const opts = await Promise.all(
          items.map(async (it: any) => ({ value: it.id, label: await refLabel(f.ref as string, it.id) }))
        );
        return [f.key, opts] as const;
      })
    ).then(entries => {
      if (active) setRefOptions(Object.fromEntries(entries));
    });
    return () => {
      active = false;
    };
  }, [fields]);

  const setValue = (key: string, val: any) => setValues(prev => ({ ...prev, [key]: val }));

  const handleReset = () => {
    if (window.confirm('Apakah Anda yakin ingin mengosongkan seluruh isian formulir ini?')) {
      setValues({});
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
      const form = e.currentTarget;
      const focusable = Array.from(
        form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
          'input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled])'
        )
      );
      const index = focusable.indexOf(e.target as any);
      if (index > -1 && index < focusable.length - 1) {
        e.preventDefault();
        focusable[index + 1]?.focus();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Hitung seluruh field computed sebelum diteruskan ke handler parent
    const payload = { ...values };
    fields.forEach(f => {
      if (f.type === 'computed') payload[f.key] = computeField(f.compute || f.key, payload);
    });
    onSubmitData(payload);
  };


  const formulirAktif = useMemo(() => {
    if (!sections) return 0;
    return sections.filter(
      sec => !sec.alwaysActive && sec.fields.some(f => {
        const v = values[f.key];
        return v !== undefined && v !== null && v !== '';
      }),
    ).length;
  }, [sections, values]);

  const filledCount = useMemo(
    () => fields.filter(f => {
      const v = values[f.key];
      return v !== undefined && v !== null && v !== '';
    }).length,
    [fields, values]
  );



  return (
    <form className="schema-form-shell" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
      <FormStatusBar

        badge={
          sections
            ? `${formulirAktif} dari ${sections.filter(x => !x.alwaysActive).length} formulir disentuh`
            : `${filledCount} dari ${fields.length} parameter terisi`
        }
        percent={fields.length > 0 ? (filledCount / fields.length) * 100 : 0}
        lastSaved={lastSaved}
        autosave={Boolean(draftKey)}
      />

      {sections ? (
        <div className="sf-sections">
          {sections.map(sec => (
            <SchemaFormSection
              key={sec.key}
              section={sec}
              values={values}
              refOptions={refOptions}
              onChange={setValue}
            />
          ))}
        </div>
      ) : (
        <div className="sf-sections">
          <div className="sf-section-body">
            <div className="sf-grid">
              {fields.map(field => (
                <div key={field.key} className="sf-cell">
                  <FieldControl
                    field={field}
                    value={values[field.key]}
                    allValues={values}
                    computedValue={
                      field.type === 'computed' ? computeField(field.compute || field.key, values) : undefined
                    }
                    refOptions={refOptions[field.key]}
                    onChange={val => setValue(field.key, val)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <FormActionsBar>
        <button
          type="button"
          className="ui-btn ui-btn-ghost ui-btn-md schema-btn-reset"
          onClick={handleReset}
          disabled={submitting}
        >
          <RotateCcw size={16} />
          <span>Reset</span>
        </button>

        <button type="submit" className="ui-btn ui-btn-primary ui-btn-md schema-btn-submit" disabled={submitting}>
          <Save size={16} />
          <span>
            {submitting
              ? 'Menyimpan ke Sistem…'
              : sections && formulirAktif > 0
                ? `Simpan ${formulirAktif} Formulir sebagai Draft`
                : submitLabel}
          </span>
        </button>
      </FormActionsBar>
    </form>
  );
}

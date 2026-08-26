import { useState, useMemo } from 'react';
import { Category, Division, SectionId } from '@domainTypes/index';
import { currentUser } from '@services/session';
import { FormPanel } from './FormPanel';
import type { FormSection } from '@components/ui/SchemaFormSection';
import { DataEntryModals } from './DataEntryModals';
import { DRAFT_PREFIX } from './formStatus';
import { create, createInduk, createSpawn, clearDraft, list } from '@services/api';
import { validateRecord } from '@utils/validate';
import { bangunSections, COMMON_FIELDS } from './bangunSections';

interface Props {
  categories: Category[];
  division: Division;
  section: SectionId;
}

/**
 * Menyatukan beberapa formulir satu bagian menjadi satu halaman isian: field
 * bersama ditanya sekali, sisanya dikelompokkan per formulir asal. Saat disimpan,
 * isian dipecah kembali menjadi satu record per kategori — hanya kategori yang
 * benar-benar disentuh yang ikut tersimpan.
 */
export function UnifiedFormWrapper({ categories, division, section }: Props) {
  const user = currentUser();
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [pendingSave, setPendingSave] = useState<{ abnormal: string[]; commit: () => void } | null>(null);

  const sections: FormSection[] = useMemo(() => bangunSections(categories), [categories]);

  const unifiedCategory = useMemo(() => ({
    id: `unified_${section}`,
    title: 'Formulir Terpadu',
    division,
    section,
    collection: 'records',
    fields: sections.flatMap(sec => sec.fields),
  } as Category), [sections, section, division]);

  const handleSubmit = async (data: Record<string, any>) => {
    setSubmitting(true);
    setErrorMsg('');

    try {
      const payloads: { cat: Category, data: any }[] = [];
      const validationErrors: string[] = [];
      const allAbnormal: string[] = [];

      for (const cat of categories) {
        const catData: Record<string, any> = {};
        let hasSpecificFields = false;

        cat.fields.forEach(f => {
          if (COMMON_FIELDS.includes(f.key)) {
            catData[f.key] = data[f.key];
          } else {
            const val = data[`${cat.id}__${f.key}`];
            if (val !== undefined && val !== null && val !== '') {
              catData[f.key] = val;
              hasSpecificFields = true;
            }
          }
        });

        if (hasSpecificFields) {
          payloads.push({ cat, data: catData });
        }
      }

      if (payloads.length === 0) {
        setErrorMsg('Harap isi minimal satu parameter operasional (selain Informasi Umum).');
        setSubmitting(false);
        return;
      }

      for (const { cat, data } of payloads) {
        const existing = cat.collection === 'records' ? await list('records', (r: any) => r.categoryId === cat.id) : [];
        const { ok, errors, abnormal } = validateRecord(data, cat, { abnormalBlocks: division !== 'produksi', existing });
        if (!ok) errors.forEach(e => validationErrors.push(`[${cat.title}] ${e}`));
        abnormal.forEach(a => allAbnormal.push(`[${cat.title}] ${a}`));
      }

      if (validationErrors.length > 0) {
        setErrorMsg(validationErrors.join(' • '));
        setSubmitting(false);
        return;
      }

      const commit = async () => {
        setSubmitting(true);
        try {
          for (const { cat, data } of payloads) {
            const persistData = { ...data, categoryId: cat.id, status: 'draft', dibuatOleh: user?.userId };
            if (cat.collection === 'induk') await createInduk(persistData);
            else if (cat.collection === 'spawn') await createSpawn(persistData as any);
            else await create(cat.collection as any, persistData);
          }
          await clearDraft(DRAFT_PREFIX + unifiedCategory.id);
          setFormKey(k => k + 1);
          setSuccessMsg('Formulir berhasil disimpan sebagai draft.');
        } catch (err) {
          setErrorMsg('Gagal menyimpan data ke sistem. Silakan coba lagi.');
        } finally {
          setSubmitting(false);
        }
      };

      if (division === 'produksi' && allAbnormal.length > 0) {
        setPendingSave({ abnormal: allAbnormal, commit });
      } else {
        await commit();
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan saat memproses data.');
      setSubmitting(false);
    }
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <FormPanel
        active={unifiedCategory}
        errorMsg={errorMsg || null}
        submitting={submitting}
        formKey={formKey}
        draftKey={DRAFT_PREFIX + unifiedCategory.id}
        onBack={() => {}}
        onSubmit={handleSubmit}
        standalone={false}
        sections={sections}
      />
      
      <DataEntryModals
        successMsg={successMsg}
        onSuccessConfirm={() => setSuccessMsg(null)}
        onSuccessCancel={() => setSuccessMsg(null)}
        pending={pendingSave}
        onAbnormalConfirm={() => { pendingSave?.commit(); setPendingSave(null); }}
        onAbnormalCancel={() => setPendingSave(null)}
      />
    </div>
  );
}

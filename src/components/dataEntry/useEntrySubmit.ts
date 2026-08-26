import { useState } from 'react';
import type { Category, Division } from '@domainTypes/index';
import { create, createInduk, createSpawn, clearDraft, list } from '@services/api';
import { validateRecord } from '@utils/validate';
import { DRAFT_PREFIX } from './formStatus';

interface Params {
  active: Category | null;
  userId: string;
  division: Division;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
  onSaved: () => void; // refresh status + reset form
}

/**
 * Logika submit data-entry: single (1 record) & matrix (N record/tank).
 * PRODUKSI: abnormal TIDAK memblokir (konfirmasi via pendingSave). Lab: memblokir.
 */
export function useEntrySubmit({ active, userId, division, onSuccess, onError, onSaved }: Params) {
  const [submitting, setSubmitting] = useState(false);
  const [pendingSave, setPendingSave] = useState<{ abnormal: string[]; commit: () => void } | null>(null);

  const persist = (data: Record<string, any>) => {
    if (!active) return Promise.resolve(null);
    if (active.collection === 'induk') return createInduk(data);
    if (active.collection === 'spawn') return createSpawn(data as any);
    return create(active.collection as any, { ...data, categoryId: active.id, status: 'draft', dibuatOleh: userId });
  };

  const doSave = async (data: Record<string, any>, warnings: string[]) => {
    if (!active) return;
    setSubmitting(true);
    try {
      const saved = await persist(data);
      if (saved) {
        await clearDraft(DRAFT_PREFIX + active.id);
        onSaved();
        const note = warnings.length ? ` (Catatan: ${warnings.join(' • ')})` : '';
        onSuccess(`Form "${active.title}" berhasil disimpan sebagai draft.${note}`);
      } else onError('Gagal menyimpan data ke sistem. Silakan coba lagi.');
    } finally { setSubmitting(false); }
  };

  /** Record sejenis yang sudah tersimpan — bahan cek duplikat (tank, tanggal). */
  const fetchExisting = async () => {
    if (!active || active.collection !== 'records') return [];
    return list('records', (r: any) => r.categoryId === active.id);
  };

  const handleSubmit = async (data: Record<string, any>) => {
    if (!active) return;
    onError('');
    const existing = await fetchExisting();
    const { ok, errors, warnings, abnormal } = validateRecord(data, active, {
      abnormalBlocks: division !== 'produksi',
      existing,
    });
    if (!ok) { onError(errors.join(' • ')); return; }
    if (division === 'produksi' && abnormal.length) { setPendingSave({ abnormal, commit: () => doSave(data, warnings) }); return; }
    doSave(data, warnings);
  };

  return { submitting, pendingSave, setPendingSave, handleSubmit };
}

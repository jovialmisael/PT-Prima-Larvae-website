import type { Category } from '@domainTypes/index';
import { list, loadDraft } from '@services/api';

export type FormStatus =
  | 'belum' | 'draft' | 'sebagian' | 'lengkap' | 'revisi' | 'qc' | 'disahkan';

export const STATUS_META: Record<FormStatus, { label: string; tone: 'netral' | 'normal' | 'waspada' | 'bahaya' }> = {
  belum: { label: 'Belum Diisi', tone: 'netral' },
  draft: { label: 'Draft', tone: 'netral' },
  sebagian: { label: 'Sebagian', tone: 'waspada' },
  lengkap: { label: 'Lengkap', tone: 'normal' },
  revisi: { label: 'Perlu Diperbaiki', tone: 'bahaya' },
  qc: { label: 'Menunggu QC', tone: 'waspada' },
  disahkan: { label: 'Disahkan', tone: 'normal' },
};

export const DRAFT_PREFIX = 'entry_';

const notEmpty = (v: any) => v !== undefined && v !== null && v !== '';

async function deriveOne(c: Category): Promise<FormStatus> {
  let hasDraftRecord = false;

  if (c.collection === 'records') {
    const recs = await list('records', (r: any) => r.categoryId === c.id);
    if (recs.length) {
      const latest = [...recs].sort((a, b) => (b.dibuatPada || 0) - (a.dibuatPada || 0))[0];
      if (latest.status === 'disahkan') return 'disahkan';
      if (latest.status === 'qc') return 'qc';
      if (latest.status === 'ditolak' || latest.status === 'revisi') return 'revisi';
      if (latest.status === 'draft') hasDraftRecord = true;
    }
  }

  const draft = await loadDraft(DRAFT_PREFIX + c.id);
  if (draft && typeof draft === 'object') {
    const required = c.fields.filter(f => f.required);
    const filledReq = required.filter(f => notEmpty(draft[f.key]));
    if (required.length > 0 && filledReq.length === required.length) return 'lengkap';
    if (c.fields.some(f => notEmpty(draft[f.key]))) return 'sebagian';
  }

  return hasDraftRecord ? 'draft' : 'belum';
}

/** Hitung status pengisian untuk tiap kategori (dari record + draft lokal). */
export async function deriveStatuses(categories: Category[]): Promise<Record<string, FormStatus>> {
  const entries = await Promise.all(categories.map(async c => [c.id, await deriveOne(c)] as const));
  return Object.fromEntries(entries);
}

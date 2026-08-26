import type { Aksi, BakuMutu, Threshold, NumericThreshold } from '@domainTypes/index';
import { list, get, create, update } from './api';
import { DEFAULT_ACTIONS } from '@utils/schema';
import { num, suggestBounds } from '@utils/compute';

/**
 * Baku Mutu: ambang + protokol tindakan yang dimiliki MPM (PRD §3.C).
 *
 * PDF klien menuntut lima hal per parameter — nilai normal, ambang waspada,
 * ambang bahaya, tindakan, dan siapa yang dihubungi. Ambang bawaan di skema
 * hanya seed literatur; yang disetujui MPM di sinilah yang berlaku.
 */

export type PetaBakuMutu = Record<string, BakuMutu>;
export type Tingkat = 'waspada' | 'bahaya';

export const kunciBakuMutu = (categoryId: string, fieldKey: string) => `${categoryId}:${fieldKey}`;

export async function muatBakuMutu(): Promise<PetaBakuMutu> {
  const rows = await list('bakuMutu');
  return Object.fromEntries(rows.map((r: BakuMutu) => [r.id, r]));
}

export async function simpanBakuMutu(bm: BakuMutu) {
  const ada = await get('bakuMutu', bm.id);
  return ada ? update('bakuMutu', bm.id, bm) : create('bakuMutu', bm);
}

/** Ambang yang disetujui MPM menang atas ambang bawaan skema. */
export function ambangEfektif(bawaan?: Threshold, override?: BakuMutu): Threshold | undefined {
  return override?.ambang ?? bawaan;
}

const AKSI_WASPADA: Aksi = {
  tindakan: 'Perketat pengamatan pada pengukuran berikutnya dan catat perubahannya.',
  kontakRole: 'pj',
};
const AKSI_BAHAYA: Aksi = { tindakan: 'Periksa standar SOP dan laporkan.', kontakRole: 'kepala' };

/**
 * Protokol yang berlaku untuk satu parameter pada satu tingkat.
 * Urutan: persetujuan MPM -> aksi spesifik bawaan -> fallback PCR -> aksi umum.
 */
export function protokolEfektif(fieldKey: string, tingkat: Tingkat, override?: BakuMutu): Aksi {
  const disetujui = override?.protokol?.[tingkat];
  if (disetujui) return disetujui;

  const k = fieldKey.toLowerCase();
  const spesifik = DEFAULT_ACTIONS[`${k}_${tingkat}`];
  if (spesifik) return spesifik as Aksi;

  // Patogen apa pun yang terdeteksi = biosecurity, bukan sekadar angka lewat batas.
  if (k.startsWith('pcr_') && tingkat === 'bahaya') return DEFAULT_ACTIONS['pcr_positif'] as Aksi;

  return tingkat === 'waspada' ? AKSI_WASPADA : AKSI_BAHAYA;
}

export type Usulan = {
  cukup: boolean;
  n: number;
  minSampel: number;
  usulan?: NumericThreshold;
};

/**
 * Usulan ambang dari data siklus sendiri, bukan dari buku — persis yang diminta
 * penutup dokumen parameter. Sengaja tidak diterapkan otomatis: MPM yang memutus.
 */
export function usulkanDariRiwayat(
  records: any[],
  categoryId: string,
  fieldKey: string,
  minSampel = 20,
): Usulan {
  const nilai = records
    .filter(r => r.categoryId === categoryId)
    .map(r => num(r[fieldKey]).nilai)
    .filter((v): v is number => v !== null);

  if (nilai.length < minSampel) return { cukup: false, n: nilai.length, minSampel };

  const b = suggestBounds(nilai);
  if (!b) return { cukup: false, n: nilai.length, minSampel };

  return { cukup: true, n: nilai.length, minSampel, usulan: b };
}

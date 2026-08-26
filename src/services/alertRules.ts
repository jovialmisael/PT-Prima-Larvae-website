import type { Threshold, Stadia, Category, Alert, AlertStatus, AlertMitigasi, NumericThreshold, CategoricalThreshold, RoleLevel } from '@domainTypes/index';

import { CATEGORIES } from '@utils/schema';
import { ambangEfektif, protokolEfektif, kunciBakuMutu, type PetaBakuMutu } from './bakuMutu';
import { num } from '@utils/compute';

export function evalField(value: any, threshold?: Threshold, stadia?: Stadia): 'normal' | 'waspada' | 'bahaya' {
  if (!threshold) return 'normal';
  if (value === undefined || value === null) return 'normal';

  let activeThreshold: NumericThreshold | CategoricalThreshold | undefined;
  
  if ('byStage' in threshold && threshold.byStage && stadia) {
    activeThreshold = threshold.byStage[stadia] || threshold.default;
  } else if ('default' in threshold) {
    activeThreshold = threshold.default;
  } else {
    activeThreshold = threshold as NumericThreshold | CategoricalThreshold;
  }

  if (!activeThreshold) return 'normal';

  if ('badValues' in activeThreshold) {
    const valStr = String(value).toLowerCase();
    if (activeThreshold.badValues?.some(v => valStr.includes(v.toLowerCase()))) return 'bahaya';
    if (activeThreshold.warnValues?.some(v => valStr.includes(v.toLowerCase()))) return 'waspada';
    return 'normal';
  }

  const numeric = num(value);
  if (numeric.flag === 'tntc' || numeric.flag === '>') return 'bahaya';
  const val = numeric.nilai;
  if (val === null) return 'normal';

  const t = activeThreshold as NumericThreshold;
  if (t.dangerMin !== undefined && val <= t.dangerMin) return 'bahaya';
  if (t.dangerMax !== undefined && val >= t.dangerMax) return 'bahaya';
  
  if (t.safeMin !== undefined && val < t.safeMin) return 'waspada';
  if (t.safeMax !== undefined && val > t.safeMax) return 'waspada';

  return 'normal';
}

export function evaluate(
  record: any,
  category: Category,
  bakuMutu: PetaBakuMutu = {},
): Record<string, 'normal' | 'waspada' | 'bahaya'> {
  const result: Record<string, 'normal' | 'waspada' | 'bahaya'> = {};
  for (const field of category.fields) {
    const ambang = ambangEfektif(field.threshold, bakuMutu[kunciBakuMutu(category.id, field.key)]);
    if (ambang && record[field.key] !== undefined) {
      result[field.key] = evalField(record[field.key], ambang, record.stadia);
    }
  }
  return result;
}

/**
 * Standar berlaku untuk satu parameter: ambang + protokol pada tingkat tertentu.
 * Baku Mutu yang disetujui MPM menang atas nilai bawaan skema.
 */
export function resolveStandard(
  categoryId: string,
  fieldKey: string,
  tingkat: 'waspada' | 'bahaya' = 'bahaya',
  bakuMutu: PetaBakuMutu = {},
) {
  const category = CATEGORIES.find(c => c.id === categoryId);
  const field = category?.fields.find(f => f.key === fieldKey);
  const override = bakuMutu[kunciBakuMutu(categoryId, fieldKey)];
  const aksi = protokolEfektif(fieldKey, tingkat, override);

  return {
    threshold: ambangEfektif(field?.threshold, override),
    tindakan: aksi.tindakan,
    kontakRole: aksi.kontakRole,
    sumber: override ? `Baku Mutu MPM (${override.sumber})` : 'SOP Default',
  };
}

// ===========================================================================
// SIKLUS HIDUP ALERT
// Alert tidak disimpan sebagai data tersendiri — ia DITURUNKAN dari record nyata
// setiap kali dibaca. Yang dipersistensi hanya status siklus hidupnya
// (diakui/selesai) di koleksi `alerts`, ditautkan lewat kunci stabil.
// ===========================================================================

/** Satu alert aktif per (parameter, tank, siklus) — dasar dedup (celah 17/18). */
function alertKey(categoryId: string, fieldKey: string, tankId?: string, siklusId?: string): string {
  return `${categoryId}:${fieldKey}:${tankId ?? '-'}:${siklusId ?? '-'}`;
}

/** Status siklus hidup yang disimpan; selebihnya dihitung ulang dari record. */
export type AlertOverlay = {
  id: string;
  status: AlertStatus;
  diakuiOleh?: string;
  diselesaikanOleh?: string;
  terakhirDiperbarui: number;
  mitigasi?: AlertMitigasi;
};

function pesanUntuk(label: string, unit: string | undefined, nilai: any, status: 'waspada' | 'bahaya'): string {
  const satuan = unit ? ` ${unit}` : '';
  const zona = status === 'bahaya' ? 'zona bahaya' : 'zona waspada';
  return `${label} terbaca ${nilai}${satuan} — berada di ${zona}.`;
}

/**
 * Turunkan daftar alert dari record nyata. Murni: tanpa persistensi dan tanpa
 * waktu-sekarang, sehingga bisa diuji langsung. Kejadian berulang pada kombinasi
 * (parameter, tank, siklus) yang sama menaikkan `hitungan`, bukan menerbitkan
 * alert baru — inilah pencegah alert-fatigue.
 */
export function buildAlerts(records: any[], overlay: AlertOverlay[] = [], bakuMutu: PetaBakuMutu = {}): Alert[] {
  const byKey = new Map<string, Alert>();

  for (const rec of records) {
    const category = CATEGORIES.find(c => c.id === rec.categoryId);
    if (!category) continue;

    for (const [fieldKey, status] of Object.entries(evaluate(rec, category, bakuMutu))) {
      if (status === 'normal') continue;

      const key = alertKey(category.id, fieldKey, rec.tankId, rec.siklusId);
      const field = category.fields.find(f => f.key === fieldKey);
      const label = field?.label ?? fieldKey;
      const waktu = rec.tanggal ? new Date(rec.tanggal).getTime() : (rec.dibuatPada ?? 0);
      const sudahAda = byKey.get(key);

      if (sudahAda) {
        sudahAda.hitungan += 1;
        if (status === 'bahaya') sudahAda.tingkat = 'bahaya';
        if (waktu > sudahAda.terakhirDiperbarui) {
          sudahAda.terakhirDiperbarui = waktu;
          sudahAda.tanggal = rec.tanggal ?? sudahAda.tanggal;
          sudahAda.pesan = pesanUntuk(label, field?.unit, rec[fieldKey], status);
        }
        continue;
      }

      const std = resolveStandard(category.id, fieldKey, status, bakuMutu);
      byKey.set(key, {
        id: key,
        status: 'aktif',
        tingkat: status,
        parameter: label,
        tankId: rec.tankId,
        siklusId: rec.siklusId,
        tanggal: rec.tanggal ?? new Date(waktu).toISOString(),
        pesan: pesanUntuk(label, field?.unit, rec[fieldKey], status),
        tindakan: std.tindakan,
        kontakRole: std.kontakRole as RoleLevel,
        hitungan: 1,
        terakhirDiperbarui: waktu,
      });
    }
  }

  for (const o of overlay) {
    const alert = byKey.get(o.id);
    if (!alert) continue; // status yatim: recordnya sudah tak lagi melanggar ambang
    alert.status = o.status;
    alert.diakuiOleh = o.diakuiOleh;
    alert.diselesaikanOleh = o.diselesaikanOleh;
    alert.mitigasi = o.mitigasi;
  }

  return [...byKey.values()].sort((a, b) => b.terakhirDiperbarui - a.terakhirDiperbarui);
}


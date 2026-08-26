import type { Alert } from '@domainTypes/index';
import { list, get, create, update } from './api';
import { CATEGORIES } from '@utils/schema';
import { muatBakuMutu } from './bakuMutu';
import { bangunAlertKepatuhan } from './kepatuhan';
import { muatBakAktif } from './bakAktif';
import { muatJadwal } from './jadwalBerkala';
import { buildAlerts, type AlertOverlay } from './alertRules';

// Aturan penilaian ambang tinggal di alertRules.ts; file ini hanya memuat,
// menggabung, dan menyimpan status. Konsumen lama tetap mengimpor dari sini.
export { evalField, evaluate, resolveStandard, buildAlerts } from './alertRules';
export type { AlertOverlay } from './alertRules';

/**
 * Semua alert termasuk yang sudah selesai. Dua sumber digabung: alert NILAI
 * (angka melewati ambang) dan alert KEPATUHAN (pengukuran tak pernah masuk).
 * Keduanya berbobot setara — lihat PRD §5.B.3.
 */
export async function getAllAlerts(): Promise<Alert[]> {
  const [records, overlay, bakuMutu, bak, jadwal] = await Promise.all([
    list('records'),
    list('alerts'),
    muatBakuMutu(),
    muatBakAktif(),
    muatJadwal(),
  ]);

  const nilai = buildAlerts(records, overlay as AlertOverlay[], bakuMutu);
  const kepatuhan = terapkanOverlay(
    bangunAlertKepatuhan({ categories: CATEGORIES, records, bak, jadwal }),
    overlay as AlertOverlay[],
  );

  return [...nilai, ...kepatuhan].sort((a, b) => b.terakhirDiperbarui - a.terakhirDiperbarui);
}

/** Status yang sudah diakui/diselesaikan petugas tetap menempel setelah dihitung ulang. */
function terapkanOverlay(alerts: Alert[], overlay: AlertOverlay[]): Alert[] {
  const byId = new Map(overlay.map(o => [o.id, o]));
  for (const a of alerts) {
    const o = byId.get(a.id);
    if (!o) continue;
    a.status = o.status;
    a.diakuiOleh = o.diakuiOleh;
    a.diselesaikanOleh = o.diselesaikanOleh;
    a.mitigasi = o.mitigasi;
  }
  return alerts;
}

/** Alert yang masih menuntut perhatian. */
export async function scanAlerts(): Promise<Alert[]> {
  return (await getAllAlerts()).filter(a => a.status !== 'selesai');
}

async function simpanStatus(patch: AlertOverlay): Promise<boolean> {
  const existing = await get('alerts', patch.id);
  const hasil = existing ? await update('alerts', patch.id, patch) : await create('alerts', patch);
  return hasil !== null;
}

export async function acknowledgeAlert(id: string, oleh: string): Promise<boolean> {
  return simpanStatus({ id, status: 'diakui', diakuiOleh: oleh, terakhirDiperbarui: Date.now() });
}

export type ResolusiAlertPayload = {
  oleh: string;
  jenisTindakan: string;
  jam?: string;
  dosis?: string;
  catatanMitigasi?: string;
  tankId?: string;
  siklusId?: string;
  tanggal?: string;
};

export async function resolveAlert(id: string, payload: string | ResolusiAlertPayload): Promise<boolean> {
  const data: ResolusiAlertPayload = typeof payload === 'string' ? { oleh: payload, jenisTindakan: 'tindakan lain' } : payload;
  const jam = data.jam || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const tanggal = data.tanggal || new Date().toISOString().slice(0, 10);

  // 1. Secara otomatis catat ke Log Tindakan dan Perlakuan (§12)
  let logRecordId: string | undefined = undefined;
  try {
    const logRes = await create('records', {
      categoryId: 'prodLogTindakan',
      tankId: data.tankId || 'Semua Bak',
      siklusId: data.siklusId || '-',
      tanggal,
      jam,
      jenisTindakan: data.jenisTindakan,
      dosis: data.dosis || '-',
      alasan: data.catatanMitigasi || `Mitigasi anomali alert: ${id}`,
      petugas: data.oleh,
      status: 'draft',
      dibuatOleh: data.oleh,
      dibuatPada: Date.now(),
    });
    logRecordId = logRes?.id;
  } catch (err) {
    console.warn('Gagal mencatat log tindakan otomatis:', err);
  }

  // 2. Simpan status alert 'selesai' beserta bukti mitigasi terverifikasi
  return simpanStatus({
    id,
    status: 'selesai',
    diselesaikanOleh: data.oleh,
    terakhirDiperbarui: Date.now(),
    mitigasi: {
      buktiTindakanId: logRecordId,
      jenisTindakan: data.jenisTindakan,
      jam,
      dosis: data.dosis,
      catatanMitigasi: data.catatanMitigasi,
    },
  });
}


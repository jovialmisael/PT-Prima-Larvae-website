import { ROLES, USERS, RoleDef, UserDef } from '@services/rolesConfig';
import { Area } from '@domainTypes/index';

/**
 * Preset "isi cepat peran" pada halaman Login.
 *
 * SUMBER KEBENARAN: daftar chip diturunkan dari `USERS` (bukan daftar manual),
 * supaya SETIAP akun demo — termasuk tiap area Lab — punya chip-nya sendiri.
 * Berkas ini hanya menyimpan meta presentasi (warna, ikon, urutan).
 */

export type LoginIconKey =
  | 'owner' | 'manager' | 'produksi' | 'lab' | 'qc'
  | 'pj_lab' | 'operator_prod' | 'operator_lab';

export interface RolePreset {
  username: string;
  /** Judul lengkap untuk tooltip, mis. "Petugas Lab — Area Algae". */
  title: string;
  /** Teks utama chip = `role.title` apa adanya, supaya tak bisa menyimpang dari peran. */
  badge: string;
  /** Label area Lab; undefined untuk role non-area. */
  area?: string;
  color: string;
  iconKey: LoginIconKey;
}

/**
 * Meta presentasi per role.id — HANYA warna & ikon.
 * Teks chip sengaja TIDAK disimpan di sini: label diambil langsung dari
 * `role.title` (rolesConfig), supaya chip selalu menyebut peran yang sebenarnya.
 */
type PresetMeta = { color: string; iconKey: LoginIconKey };

const PRESET_META: Record<string, PresetMeta> = {
  owner:       { color: '#F59E0B', iconKey: 'owner' },
  manager:     { color: '#2563EB', iconKey: 'manager' },
  kepalaProd:  { color: '#10B981', iconKey: 'produksi' },
  kepalaLab:   { color: '#8B5CF6', iconKey: 'lab' },
  mpm:         { color: '#EC4899', iconKey: 'qc' },
  pjLab:       { color: '#6366F1', iconKey: 'pj_lab' },
  petugasProd: { color: '#3B82F6', iconKey: 'operator_prod' },
  petugasLab:  { color: '#06B6D4', iconKey: 'operator_lab' }
};

/** Urutan tampil chip: pimpinan → pengesahan → pelaksana. */
const ROLE_ORDER = [
  'owner', 'manager', 'kepalaProd', 'kepalaLab', 'mpm', 'pjLab', 'petugasProd', 'petugasLab'
];

/**
 * Role yang sengaja TIDAK ditampilkan sebagai chip isi-cepat.
 * Akunnya tetap ada di `USERS` (masih bisa dipakai lewat `?as=` atau ketik manual),
 * hanya tombol pintasnya yang disembunyikan.
 */
const HIDDEN_ROLE_IDS: string[] = ['pjLab'];

/** Urutan area Lab dalam satu role yang sama. */
const AREA_ORDER: Area[] = ['maturasi', 'algae', 'pl'];
const AREA_LABEL: Record<Area, string> = { maturasi: 'Maturasi', algae: 'Algae', pl: 'PL' };

/** Role baru yang belum diberi meta tetap muncul, bukan hilang diam-diam. */
function fallbackMeta(role: RoleDef): PresetMeta {
  const iconKey: LoginIconKey =
    role.division === 'lab' ? 'lab' : role.division === 'produksi' ? 'produksi' : 'manager';
  return { color: '#64748B', iconKey };
}

function toPreset(user: UserDef): RolePreset | null {
  const role = ROLES.find((r) => r.id === user.roleId);
  if (!role) return null;
  const meta = PRESET_META[role.id] ?? fallbackMeta(role);
  const area = user.area ? AREA_LABEL[user.area] : undefined;
  return {
    username: user.username,
    title: area ? `${role.title} — Area ${area}` : role.title,
    badge: role.title,
    area,
    color: meta.color,
    iconKey: meta.iconKey
  };
}

function areaRank(user: UserDef): number {
  const i = user.area ? AREA_ORDER.indexOf(user.area) : -1;
  return i === -1 ? 0 : i;
}

function roleRank(user: UserDef): number {
  const i = ROLE_ORDER.indexOf(user.roleId);
  return i === -1 ? ROLE_ORDER.length : i;
}

export const DEMO_ROLE_PRESETS: RolePreset[] = USERS
  .filter((u) => !HIDDEN_ROLE_IDS.includes(u.roleId))
  .sort((a, b) => roleRank(a) - roleRank(b) || areaRank(a) - areaRank(b))
  .map(toPreset)
  .filter((p): p is RolePreset => p !== null);

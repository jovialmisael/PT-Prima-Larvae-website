import type { LucideIcon } from 'lucide-react';
import {
  Home, Droplets, FlaskConical, PackageCheck, Database,
  ShieldCheck, AlertTriangle, PieChart,
} from 'lucide-react';
import type { RoleDef } from '@services/rolesConfig';

export type PageMeta = { title: string; sub: string };
export type NavTarget = { label: string; to: string; icon: LucideIcon };

/** Judul + sub-label per route (key = pathname). */
export const PAGE_TITLES: Record<string, PageMeta> = {
  '/': { title: 'Beranda Kerja', sub: '' },
  '/tugas-saya': { title: 'Tugas Saya', sub: '' },
  '/input-produksi': { title: 'Input Data Entry', sub: '' },
  '/riwayat': { title: 'Riwayat Logbook', sub: '' },
  '/status-bak': { title: 'Status Bak', sub: '' },
  '/siklus-berjalan': { title: 'Siklus Berjalan', sub: '' },
  '/input-lab': { title: 'Input Data Lab', sub: '' },
  '/lab-riwayat': { title: 'Riwayat Uji Lab', sub: '' },
  '/lab-standar': { title: 'Standar Mutu Lab', sub: '' },
  '/panen': { title: 'Panen & Packing', sub: '' },
  '/master-siklus': { title: 'Master Data & Traceability', sub: '' },
  '/inbox-pengesahan': { title: 'Inbox Pengesahan', sub: '' },
  '/baku-mutu': { title: 'Baku Mutu', sub: '' },
  '/jadwal-berkala': { title: 'Jadwal Berkala', sub: '' },
  '/alert-center': { title: 'Pusat Alert', sub: '' },
  '/laporan': { title: 'Laporan Eksekutif', sub: '' },
  '/asisten-ai': { title: 'Asisten AI', sub: '' },
};



export const FALLBACK_META: PageMeta = { title: 'Segera Hadir', sub: '' };

export function pageMeta(pathname: string): PageMeta {
  return PAGE_TITLES[pathname] ?? FALLBACK_META;
}

/** Dua huruf inisial dari username (mis. "petugas.lab.pl" → "PP"→"PL"). */
export function initials(username: string): string {
  const parts = username.split(/[.\s_-]+/).filter(Boolean);
  const picked = parts.length >= 2 ? [parts[0], parts[parts.length - 1]] : parts;
  return picked.map(p => p[0]?.toUpperCase() ?? '').join('').slice(0, 2) || '?';
}

/** Destinasi navigasi yang boleh diakses role — sumber hasil pencarian (mirror Sidebar). */
export function searchTargets(role: RoleDef | null): NavTarget[] {
  const t: NavTarget[] = [{ label: 'Beranda', to: '/', icon: Home }];
  if (!role) return t;

  if (role.id === 'petugasProd') {
    t.push({ label: 'Tugas Saya', to: '/tugas-saya', icon: Droplets });
    t.push({ label: 'Input Produksi', to: '/input-produksi', icon: Droplets });
    t.push({ label: 'Riwayat Logbook', to: '/riwayat', icon: Droplets });
    t.push({ label: 'Siklus Berjalan', to: '/siklus-berjalan', icon: Droplets });
    t.push({ label: 'Status Bak', to: '/status-bak', icon: Droplets });
  } else if (role.id === 'kepalaProd') {
    t.push({ label: 'Input Produksi', to: '/input-produksi', icon: Droplets });
    t.push({ label: 'Riwayat Logbook', to: '/riwayat', icon: Droplets });
    t.push({ label: 'Panen & Packing', to: '/panen', icon: PackageCheck });
    t.push({ label: 'Master & Ketelusuran', to: '/master-siklus', icon: Database });
    t.push({ label: 'Inbox Pengesahan', to: '/inbox-pengesahan', icon: ShieldCheck });
    t.push({ label: 'Baku Mutu', to: '/baku-mutu', icon: ShieldCheck });
    t.push({ label: 'Jadwal Berkala', to: '/jadwal-berkala', icon: ShieldCheck });
    t.push({ label: 'Laporan Eksekutif', to: '/laporan', icon: PieChart });
  } else if (role.id === 'petugasLab') {
    t.push({ label: 'Input Lab', to: '/input-lab', icon: FlaskConical });
    t.push({ label: 'Riwayat Uji Lab', to: '/lab-riwayat', icon: FlaskConical });
    t.push({ label: 'Standar Mutu Lab', to: '/lab-standar', icon: FlaskConical });
  } else if (role.id === 'kepalaLab' || role.id === 'pjLab') {
    t.push({ label: 'Input Lab', to: '/input-lab', icon: FlaskConical });
    t.push({ label: 'Riwayat Uji Lab', to: '/lab-riwayat', icon: FlaskConical });
    t.push({ label: 'Standar Mutu Lab', to: '/lab-standar', icon: FlaskConical });
    t.push({ label: 'Inbox Pengesahan Lab', to: '/inbox-pengesahan', icon: ShieldCheck });
    t.push({ label: 'Baku Mutu', to: '/baku-mutu', icon: ShieldCheck });
    t.push({ label: 'Jadwal Berkala', to: '/jadwal-berkala', icon: ShieldCheck });
    t.push({ label: 'Laporan Eksekutif', to: '/laporan', icon: PieChart });
  } else if (role.id === 'mpm') {
    t.push({ label: 'Inbox Pengesahan QC', to: '/inbox-pengesahan', icon: ShieldCheck });
    t.push({ label: 'Standar Mutu Lab', to: '/lab-standar', icon: FlaskConical });
    t.push({ label: 'Master Data & Traceability', to: '/master-siklus', icon: Database });
    t.push({ label: 'Riwayat Logbook Produksi', to: '/riwayat', icon: Droplets });
    t.push({ label: 'Riwayat Uji Lab', to: '/lab-riwayat', icon: FlaskConical });
    t.push({ label: 'Baku Mutu', to: '/baku-mutu', icon: ShieldCheck });
    t.push({ label: 'Jadwal Berkala', to: '/jadwal-berkala', icon: ShieldCheck });
    t.push({ label: 'Laporan Eksekutif', to: '/laporan', icon: PieChart });
  } else if (role.id === 'manager') {
    t.push({ label: 'Master Data & Traceability', to: '/master-siklus', icon: Database });
    t.push({ label: 'Siklus Berjalan', to: '/siklus-berjalan', icon: Droplets });
    t.push({ label: 'Status Bak', to: '/status-bak', icon: Droplets });
    t.push({ label: 'Inbox Pengesahan', to: '/inbox-pengesahan', icon: ShieldCheck });
    t.push({ label: 'Baku Mutu', to: '/baku-mutu', icon: ShieldCheck });
    t.push({ label: 'Jadwal Berkala', to: '/jadwal-berkala', icon: ShieldCheck });
    t.push({ label: 'Riwayat Logbook', to: '/riwayat', icon: Droplets });
    t.push({ label: 'Laporan Eksekutif', to: '/laporan', icon: PieChart });
  } else if (role.id === 'owner') {
    t.push({ label: 'Siklus Berjalan', to: '/siklus-berjalan', icon: Droplets });
    t.push({ label: 'Master Data & Traceability', to: '/master-siklus', icon: Database });
    t.push({ label: 'Laporan Eksekutif', to: '/laporan', icon: PieChart });
  }

  t.push({ label: 'Pusat Alert', to: '/alert-center', icon: AlertTriangle });
  return t;
}


/** Apakah role boleh menavigasi ke area master (untuk menautkan hasil batch/tank). */
export function canOpenMaster(role: RoleDef | null): boolean {
  return role?.id === 'kepalaProd' || role?.division === 'manager';
}

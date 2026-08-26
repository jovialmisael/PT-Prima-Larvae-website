import type { LucideIcon } from 'lucide-react';
import {
  Home, ClipboardList, AlertTriangle, PenLine,
  History, RefreshCw, LayoutGrid, Bot,
  BookOpen, Database, ShieldCheck, PieChart, SlidersHorizontal, CalendarClock, PackageCheck
} from 'lucide-react';
import { CATEGORIES, SECTION_LABELS, SECTION_ORDER } from '@utils/schema';
import { type RoleDef } from '@services/rolesConfig';

export type NavSubItem = {
  label: string;
  to: string;
  categoryId?: string;
  section?: string;
};

export type NavLink = {
  label: string;
  to: string;
  icon: LucideIcon;
  children?: NavSubItem[];
};

export type NavGroup = {
  title: string;
  items: NavLink[];
};

/**
 * Menghasilkan daftar sub-bab input formulir berdasarkan divisi peran
 */
function buildInputSections(division: 'produksi' | 'lab'): NavSubItem[] {
  const items: NavSubItem[] = [];
  for (const sec of SECTION_ORDER) {
    if (sec === '11') continue;

    // Saring bab yang benar-benar memiliki formulir aktif di divisi terkait
    const cats = CATEGORIES.filter(c => c.section === sec && c.division === division);
    if (cats.length === 0) continue;

    const basePath = division === 'lab' ? '/input-lab' : '/input-produksi';
    items.push({
      label: SECTION_LABELS[sec] || `Bab §${sec}`,
      to: `${basePath}?section=${sec}`,
      categoryId: cats[0]?.id,
      section: sec,
    });
  }
  return items;
}


const AREA_LABEL: Record<string, string> = { maturasi: 'Maturasi', algae: 'Algae', pl: 'PL' };

/**
 * Matriks Hak Akses & Pembagian Fitur Sidebar Sesuai Standar Buku Acuan PDF
 */
export function getNavGroups(role: RoleDef | null, area?: string): NavGroup[] {
  if (!role) return [];

  // ==========================================
  // 1. PETUGAS PRODUKSI LAPANGAN
  // ==========================================
  if (role.id === 'petugasProd') {
    return [
      {
        title: 'Hari Ini',
        items: [
          { label: 'Beranda Kerja', to: '/', icon: Home },
          { label: 'Tugas Saya', to: '/tugas-saya', icon: ClipboardList },
          { label: 'Pusat Alert', to: '/alert-center', icon: AlertTriangle },
        ],
      },
      {
        title: 'Operasional Produksi',
        items: [
          {
            label: 'Input Data Entry',
            to: '/input-produksi',
            icon: PenLine,
            children: buildInputSections('produksi'),
          },
          { label: 'Riwayat Logbook', to: '/riwayat', icon: History },
        ],
      },
      {
        title: 'Monitoring Lapangan',
        items: [
          { label: 'Siklus Berjalan', to: '/siklus-berjalan', icon: RefreshCw },
          { label: 'Status Bak', to: '/status-bak', icon: LayoutGrid },
        ],
      },
      {
        title: 'Bantuan SOP',
        items: [{ label: 'Asisten AI', to: '/asisten-ai', icon: Bot }],
      },
    ];
  }

  // ==========================================
  // 2. KEPALA PRODUKSI
  // ==========================================
  if (role.id === 'kepalaProd') {
    return [
      {
        title: 'Global',
        items: [
          { label: 'Beranda Kepala Produksi', to: '/', icon: Home },
          { label: 'Pusat Alert', to: '/alert-center', icon: AlertTriangle },
        ],
      },
      {
        title: 'Operasional & Supervisi',
        items: [
          {
            label: 'Input Data Entry',
            to: '/input-produksi',
            icon: PenLine,
            children: buildInputSections('produksi'),
          },
          { label: 'Riwayat Logbook', to: '/riwayat', icon: History },
          { label: 'Panen & Packing', to: '/panen', icon: PackageCheck },
        ],
      },
      {
        title: 'Master & Ketelusuran',
        items: [
          { label: 'Master Data & Traceability', to: '/master-siklus', icon: Database },
          { label: 'Siklus Berjalan', to: '/siklus-berjalan', icon: RefreshCw },
          { label: 'Status Bak', to: '/status-bak', icon: LayoutGrid },
        ],
      },
      {
        title: 'Pengesahan & Standar',
        items: [
          { label: 'Inbox Pengesahan', to: '/inbox-pengesahan', icon: ShieldCheck },
          { label: 'Baku Mutu Threshold', to: '/baku-mutu', icon: SlidersHorizontal },
          { label: 'Jadwal Berkala', to: '/jadwal-berkala', icon: CalendarClock },
        ],
      },
      {
        title: 'Laporan & Bantuan',
        items: [
          { label: 'Laporan Eksekutif', to: '/laporan', icon: PieChart },
          { label: 'Asisten AI', to: '/asisten-ai', icon: Bot },
        ],
      },
    ];
  }

  // ==========================================
  // 3. PETUGAS LAB / ANALIS
  // ==========================================
  if (role.id === 'petugasLab') {
    const areaName = AREA_LABEL[area ?? ''] ?? 'Umum';
    return [
      {
        title: 'Hari Ini',
        items: [
          { label: 'Beranda Analis Lab', to: '/', icon: Home },
          { label: 'Pusat Alert', to: '/alert-center', icon: AlertTriangle },
        ],
      },
      {
        title: `Laboratorium — ${areaName}`,
        items: [
          {
            label: 'Input Data Lab',
            to: '/input-lab',
            icon: PenLine,
            children: buildInputSections('lab'),
          },
          { label: 'Riwayat Uji Lab', to: '/lab-riwayat', icon: History },
          { label: 'Standar Mutu Lab', to: '/lab-standar', icon: BookOpen },
        ],
      },
      {
        title: 'Bantuan SOP',
        items: [{ label: 'Asisten AI', to: '/asisten-ai', icon: Bot }],
      },
    ];
  }

  // ==========================================
  // 4. KEPALA LAB & PJ LAB
  // ==========================================
  if (role.id === 'kepalaLab' || role.id === 'pjLab') {
    return [
      {
        title: 'Global',
        items: [
          { label: 'Beranda Laboratorium', to: '/', icon: Home },
          { label: 'Pusat Alert', to: '/alert-center', icon: AlertTriangle },
        ],
      },
      {
        title: 'Laboratorium & Standar',
        items: [
          {
            label: 'Input Data Lab',
            to: '/input-lab',
            icon: PenLine,
            children: buildInputSections('lab'),
          },
          { label: 'Riwayat Uji Lab', to: '/lab-riwayat', icon: History },
          { label: 'Standar Mutu Lab', to: '/lab-standar', icon: BookOpen },
        ],
      },
      {
        title: 'Validasi & Mutu',
        items: [
          { label: 'Inbox Pengesahan Lab', to: '/inbox-pengesahan', icon: ShieldCheck },
          { label: 'Baku Mutu Threshold', to: '/baku-mutu', icon: SlidersHorizontal },
          { label: 'Jadwal Berkala', to: '/jadwal-berkala', icon: CalendarClock },
        ],
      },
      {
        title: 'Laporan & Bantuan',
        items: [
          { label: 'Laporan Eksekutif', to: '/laporan', icon: PieChart },
          { label: 'Asisten AI', to: '/asisten-ai', icon: Bot },
        ],
      },
    ];
  }

  // ==========================================
  // 5. QUALITY CONTROL / MPM INSPECTOR
  // ==========================================
  if (role.id === 'mpm') {
    return [
      {
        title: 'Global',
        items: [
          { label: 'Beranda MPM / QC', to: '/', icon: Home },
          { label: 'Pusat Alert & Anomali', to: '/alert-center', icon: AlertTriangle },
        ],
      },
      {
        title: 'Pengawasan & Verifikasi',
        items: [
          { label: 'Inbox Pengesahan QC', to: '/inbox-pengesahan', icon: ShieldCheck },
          { label: 'Standar Mutu Lab', to: '/lab-standar', icon: BookOpen },
          { label: 'Master Data & Traceability', to: '/master-siklus', icon: Database },
        ],
      },
      {
        title: 'Audit Trail & Standar',
        items: [
          { label: 'Riwayat Logbook Produksi', to: '/riwayat', icon: History },
          { label: 'Riwayat Uji Lab', to: '/lab-riwayat', icon: History },
          { label: 'Baku Mutu Threshold', to: '/baku-mutu', icon: SlidersHorizontal },
          { label: 'Jadwal Berkala', to: '/jadwal-berkala', icon: CalendarClock },
        ],
      },
      {
        title: 'Laporan & Bantuan',
        items: [
          { label: 'Laporan Eksekutif', to: '/laporan', icon: PieChart },
          { label: 'Asisten AI', to: '/asisten-ai', icon: Bot },
        ],
      },
    ];
  }

  // ==========================================
  // 6. MANAGER OPERASIONAL
  // ==========================================
  if (role.id === 'manager') {
    return [
      {
        title: 'Global',
        items: [
          { label: 'Beranda Manager', to: '/', icon: Home },
          { label: 'Pusat Alert', to: '/alert-center', icon: AlertTriangle },
        ],
      },
      {
        title: 'Operasional & Ketelusuran',
        items: [
          { label: 'Master Data & Traceability', to: '/master-siklus', icon: Database },
          { label: 'Siklus Berjalan', to: '/siklus-berjalan', icon: RefreshCw },
          { label: 'Status Bak', to: '/status-bak', icon: LayoutGrid },
        ],
      },
      {
        title: 'Pengesahan & Standar QC',
        items: [
          { label: 'Inbox Pengesahan', to: '/inbox-pengesahan', icon: ShieldCheck },
          { label: 'Baku Mutu Threshold', to: '/baku-mutu', icon: SlidersHorizontal },
          { label: 'Jadwal Berkala', to: '/jadwal-berkala', icon: CalendarClock },
        ],
      },
      {
        title: 'Audit Trail & Analitik',
        items: [
          { label: 'Riwayat Logbook', to: '/riwayat', icon: History },
          { label: 'Laporan Eksekutif', to: '/laporan', icon: PieChart },
        ],
      },
      {
        title: 'Lainnya',
        items: [{ label: 'Asisten AI', to: '/asisten-ai', icon: Bot }],
      },
    ];
  }

  // ==========================================
  // 7. OWNER / EXECUTIVE
  // ==========================================
  if (role.id === 'owner') {
    return [
      {
        title: 'Global',
        items: [
          { label: 'Beranda Owner', to: '/', icon: Home },
          { label: 'Pusat Alert', to: '/alert-center', icon: AlertTriangle },
        ],
      },
      {
        title: 'Pemantauan Strategis',
        items: [
          { label: 'Siklus Berjalan', to: '/siklus-berjalan', icon: RefreshCw },
          { label: 'Master Data & Traceability', to: '/master-siklus', icon: Database },
          { label: 'Laporan Eksekutif', to: '/laporan', icon: PieChart },
        ],
      },
      {
        title: 'Lainnya',
        items: [{ label: 'Asisten AI', to: '/asisten-ai', icon: Bot }],
      },
    ];
  }

  return [];
}

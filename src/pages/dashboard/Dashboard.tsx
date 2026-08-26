import { currentUser, currentRole } from '@services/session';
import { PetugasProduksiDashboard } from './petugasProduksi';
import { PetugasLabDashboard } from './petugasLab';
import { KepalaProduksiDashboard } from './kepalaProduksi';
import { KepalaLabDashboard } from './kepalaLab';
import { MpmDashboard } from './mpm';
import { ManagerDashboard } from './manager';
import { OwnerDashboard } from './owner';

export function Dashboard() {
  const user = currentUser();
  const role = currentRole();

  if (!user || !role) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Harap masuk terlebih dahulu untuk mengakses portal operasional.
      </div>
    );
  }

  // Peta 8 role.id (lihat services/rolesConfig.ts) -> 7 dashboard.
  // Catatan: 'pjLab' (PJ/Ka.Sie Lab) sengaja MENUMPANG konsol Kepala Lab,
  // sehingga jumlah folder dashboard (7) lebih sedikit dari jumlah role (8).
  //   petugasProd -> petugasProduksi     kepalaProd -> kepalaProduksi
  //   petugasLab  -> petugasLab           kepalaLab  -> kepalaLab
  //   pjLab       -> kepalaLab            mpm        -> mpm
  //   manager     -> manager              owner      -> owner
  switch (role.id) {
    // Tier 1 — Petugas Lapangan
    case 'petugasProd':
      return <PetugasProduksiDashboard user={user} />;
    case 'petugasLab':
      return <PetugasLabDashboard user={user} />;

    // Tier 2 — Kepala Divisi & QC
    case 'kepalaProd':
      return <KepalaProduksiDashboard user={user} role={role} />;
    case 'kepalaLab':
    case 'pjLab': // PJ/Ka.Sie Lab berbagi konsol Kepala Lab
      return <KepalaLabDashboard user={user} role={role} />;
    case 'mpm':
      return <MpmDashboard user={user} role={role} />;

    // Tier 3 — Manager Operasional
    case 'manager':
      return <ManagerDashboard user={user} />;

    // Tier 4 — Owner / Direktur
    case 'owner':
      return <OwnerDashboard user={user} />;

    default:
      return <ManagerDashboard user={user} />;
  }
}

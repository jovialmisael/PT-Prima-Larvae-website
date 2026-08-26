import { Card, CardHeader, CardBody } from '@components/ui/Card';
import { Link } from 'react-router-dom';
import type { UserDef, RoleDef } from '@services/rolesConfig';
import { RingkasanOperasi, CatatanAnalitikBelumAda } from '../RingkasanOperasi';
import './MpmDashboard.css';

interface Props {
  user: UserDef;
  /** Dikirim dispatcher Dashboard; tidak semua dashboard memerlukannya. */
  role?: RoleDef;
}

export function MpmDashboard({ user }: Props) {
  return (
    <div className="dash-container">
      <div className="dash-header">
        <div>
          <div className="tier-tag">MPM / QC &bull; MUTU LINTAS DIVISI</div>
          <h1 className="dash-title">Verifikasi Mutu & Audit</h1>
          <p className="dash-subtitle">{user.username} — Antrean verifikasi QC lintas divisi. MPM memverifikasi, bukan mengisi form rutin.</p>
        </div>
      </div>

      <RingkasanOperasi fokus="qc" />

      <Card>
        <CardHeader>Pintasan Tugas</CardHeader>
        <CardBody>
          <ul className="dash-shortcut-list">
            <li><Link to="/inbox-pengesahan">Inbox Pengesahan</Link><span className="metric-sub">Jalankan langkah QC untuk record Produksi dan Lab</span></li>
            <li><Link to="/alert-center">Pusat Alert</Link><span className="metric-sub">Pantau parameter yang melewati ambang</span></li>
          </ul>
        </CardBody>
      </Card>

      <CatatanAnalitikBelumAda />
    </div>
  );
}

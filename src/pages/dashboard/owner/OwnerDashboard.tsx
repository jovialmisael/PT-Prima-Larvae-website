import { Card, CardHeader, CardBody } from '@components/ui/Card';
import { Link } from 'react-router-dom';
import type { UserDef, RoleDef } from '@services/rolesConfig';
import { RingkasanOperasi, CatatanAnalitikBelumAda } from '../RingkasanOperasi';
import './OwnerDashboard.css';

interface Props {
  user: UserDef;
  /** Dikirim dispatcher Dashboard; tidak semua dashboard memerlukannya. */
  role?: RoleDef;
}

export function OwnerDashboard({ user }: Props) {
  return (
    <div className="dash-container">
      <div className="dash-header">
        <div>
          <div className="tier-tag">TIER 5 &bull; OWNER</div>
          <h1 className="dash-title">Ringkasan Hatchery</h1>
          <p className="dash-subtitle">{user.username} — Pandangan menyeluruh atas kesehatan operasi hatchery.</p>
        </div>
      </div>

      <RingkasanOperasi fokus="manager" />

      <Card>
        <CardHeader>Pintasan Tugas</CardHeader>
        <CardBody>
          <ul className="dash-shortcut-list">
            <li><Link to="/laporan">Laporan</Link><span className="metric-sub">Rekap operasi</span></li>
            <li><Link to="/alert-center">Pusat Alert</Link><span className="metric-sub">Peringatan aktif seluruh divisi</span></li>
            <li><Link to="/master-siklus">Master & Siklus</Link><span className="metric-sub">Telusuri siklus dan penempatan tank</span></li>
          </ul>
        </CardBody>
      </Card>

      <CatatanAnalitikBelumAda />
    </div>
  );
}

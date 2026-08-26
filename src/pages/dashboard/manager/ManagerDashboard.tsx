import { Card, CardHeader, CardBody } from '@components/ui/Card';
import { Link } from 'react-router-dom';
import type { UserDef, RoleDef } from '@services/rolesConfig';
import { RingkasanOperasi, CatatanAnalitikBelumAda } from '../RingkasanOperasi';
import './ManagerDashboard.css';

interface Props {
  user: UserDef;
  /** Dikirim dispatcher Dashboard; tidak semua dashboard memerlukannya. */
  role?: RoleDef;
}

export function ManagerDashboard({ user }: Props) {
  return (
    <div className="dash-container">
      <div className="dash-header">
        <div>
          <div className="tier-tag">TIER 4 &bull; MANAGER</div>
          <h1 className="dash-title">Pemantauan Operasi Hatchery</h1>
          <p className="dash-subtitle">{user.username} — Pandangan menyeluruh atas operasi. Manager memantau dan mengekspor, tidak menginput.</p>
        </div>
      </div>

      <RingkasanOperasi fokus="manager" />

      <Card>
        <CardHeader>Pintasan Tugas</CardHeader>
        <CardBody>
          <ul className="dash-shortcut-list">
            <li><Link to="/laporan">Laporan</Link><span className="metric-sub">Rekap operasi</span></li>
            <li><Link to="/alert-center">Pusat Alert</Link><span className="metric-sub">Peringatan aktif seluruh divisi</span></li>
            <li><Link to="/inbox-pengesahan">Inbox Pengesahan</Link><span className="metric-sub">Cadangan langkah QC bila MPM berhalangan</span></li>
          </ul>
        </CardBody>
      </Card>

      <CatatanAnalitikBelumAda />
    </div>
  );
}

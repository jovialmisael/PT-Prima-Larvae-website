import { Card, CardHeader, CardBody } from '@components/ui/Card';
import { Link } from 'react-router-dom';
import type { UserDef, RoleDef } from '@services/rolesConfig';
import { RingkasanOperasi, CatatanAnalitikBelumAda } from '../RingkasanOperasi';
import './KepalaLabDashboard.css';

interface Props {
  user: UserDef;
  /** Dikirim dispatcher Dashboard; tidak semua dashboard memerlukannya. */
  role?: RoleDef;
}

export function KepalaLabDashboard({ user }: Props) {
  return (
    <div className="dash-container">
      <div className="dash-header">
        <div>
          <div className="tier-tag">TIER 3 &bull; KEPALA LAB</div>
          <h1 className="dash-title">Kendali Mutu Laboratorium</h1>
          <p className="dash-subtitle">{user.username} — Ringkasan operasi, antrean pengesahan divisi Lab (tiga area), dan peringatan aktif.</p>
        </div>
      </div>

      <RingkasanOperasi fokus="lab" />

      <Card>
        <CardHeader>Pintasan Tugas</CardHeader>
        <CardBody>
          <ul className="dash-shortcut-list">
            <li><Link to="/inbox-pengesahan">Inbox Pengesahan</Link><span className="metric-sub">Sahkan record Lab dari area Maturasi, Algae, dan PL</span></li>
            <li><Link to="/input-lab">Input Data Laboratorium</Link><span className="metric-sub">Lihat kategori pemeriksaan per area</span></li>
            <li><Link to="/alert-center">Pusat Alert</Link><span className="metric-sub">Peringatan mikrobiologi dan kimia air</span></li>
          </ul>
        </CardBody>
      </Card>

      <CatatanAnalitikBelumAda />
    </div>
  );
}

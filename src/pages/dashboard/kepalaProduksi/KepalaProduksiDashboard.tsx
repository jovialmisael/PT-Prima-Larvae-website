import { Card, CardHeader, CardBody } from '@components/ui/Card';
import { Link } from 'react-router-dom';
import type { UserDef, RoleDef } from '@services/rolesConfig';
import { RingkasanOperasi, CatatanAnalitikBelumAda } from '../RingkasanOperasi';
import './KepalaProduksiDashboard.css';

interface Props {
  user: UserDef;
  /** Dikirim dispatcher Dashboard; tidak semua dashboard memerlukannya. */
  role?: RoleDef;
}

export function KepalaProduksiDashboard({ user }: Props) {
  return (
    <div className="dash-container">
      <div className="dash-header">
        <div>
          <div className="tier-tag">TIER 3 &bull; KEPALA PRODUKSI</div>
          <h1 className="dash-title">Kendali Operasi Produksi</h1>
          <p className="dash-subtitle">{user.username} — Ringkasan operasi harian, antrean pengesahan divisi Produksi, dan peringatan aktif.</p>
        </div>
      </div>

      <RingkasanOperasi fokus="produksi" />

      <Card>
        <CardHeader>Pintasan Tugas</CardHeader>
        <CardBody>
          <ul className="dash-shortcut-list">
            <li><Link to="/inbox-pengesahan">Inbox Pengesahan</Link><span className="metric-sub">Sahkan record Produksi yang sudah lolos QC</span></li>
            <li><Link to="/master-siklus">Master & Siklus</Link><span className="metric-sub">Kelola tank, induk, spawn, dan siklus</span></li>
            <li><Link to="/alert-center">Pusat Alert</Link><span className="metric-sub">Peringatan dari ambang parameter</span></li>
            <li><Link to="/panen">Panen</Link><span className="metric-sub">Catat panen dan pengiriman PL</span></li>
          </ul>
        </CardBody>
      </Card>

      <CatatanAnalitikBelumAda />
    </div>
  );
}

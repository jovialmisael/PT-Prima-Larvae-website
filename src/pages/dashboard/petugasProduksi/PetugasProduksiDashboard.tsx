import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '@components/ui/Card';
import type { UserDef } from '@services/rolesConfig';
import { tugasBakHariIni, type TugasBak } from '@services/dashboardStats';
import { PetugasTaskSchedule, type TugasItem } from './PetugasTaskSchedule';
import './PetugasProduksiDashboard.css';

interface PetugasProduksiDashboardProps {
  user: UserDef;
}

/** Status pencatatan bak → tampilan timeline tugas. */
function keTugas(bak: TugasBak): TugasItem {
  const status: TugasItem['status'] =
    bak.status === 'ditolak' ? 'perhatian' : bak.sudahDicatat ? 'selesai' : 'pending';

  const jenis =
    bak.status === 'ditolak' ? 'Observasi Harian — perlu diperbaiki'
    : bak.status === 'disahkan' ? 'Observasi Harian — sudah disahkan'
    : bak.status === 'qc' ? 'Observasi Harian — menunggu QC'
    : bak.sudahDicatat ? 'Observasi Harian — tersimpan (draft)'
    : 'Observasi Harian — belum dicatat';

  return { id: bak.tankId, waktu: '—', bak: bak.namaTank, jenis, status };
}

export function PetugasProduksiDashboard({ user }: PetugasProduksiDashboardProps) {
  const [baks, setBaks] = useState<TugasBak[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [selectedId, setSelectedId] = useState<string>('');

  useEffect(() => {
    let aktif = true;
    tugasBakHariIni()
      .then(hasil => {
        if (!aktif) return;
        setBaks(hasil);
        setSelectedId(hasil.find(b => !b.sudahDicatat)?.tankId ?? hasil[0]?.tankId ?? '');
      })
      .finally(() => { if (aktif) setMemuat(false); });
    return () => { aktif = false; };
  }, []);

  const tugas = baks.map(keTugas);
  const selesai = baks.filter(b => b.sudahDicatat).length;
  const terpilih = baks.find(b => b.tankId === selectedId);

  return (
    <div className="dash-container">
      <div className="dash-header">
        <div>
          <div className="tier-tag">TIER 1 &bull; PETUGAS PRODUKSI</div>
          <h1 className="dash-title">Tugas Pencatatan Hari Ini</h1>
          <p className="dash-subtitle">
            Halo, {user.username}. Daftar bak di bawah diambil dari penempatan tank pada siklus yang sedang berjalan.
          </p>
        </div>
      </div>

      <div className="dash-metrics-grid">
        <Card>
          <CardBody>
            <div className="metric-large font-mono">{memuat ? '—' : `${selesai}/${baks.length}`}</div>
            <div className="metric-sub">Bak sudah dicatat hari ini</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="metric-large font-mono">{memuat ? '—' : baks.length - selesai}</div>
            <div className="metric-sub">Bak menunggu pencatatan</div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="card-header-flex">
            <span>Daftar Bak pada Siklus Berjalan</span>
            <Link to="/input-produksi" className="active-bak-tag">Buka Input Data Harian</Link>
          </div>
        </CardHeader>
        <CardBody>
          {memuat ? (
            <p className="metric-sub">Memuat daftar bak...</p>
          ) : baks.length === 0 ? (
            <div className="metric-sub">
              <p><strong>Belum ada bak yang bisa dicatat.</strong></p>
              <p>
                Bak muncul di sini setelah Kepala Produksi membuat siklus dan menempatkan tank ke dalamnya
                lewat halaman Master &amp; Siklus.
              </p>
            </div>
          ) : (
            <>
              <PetugasTaskSchedule tasks={tugas} selectedId={selectedId} onSelect={setSelectedId} />
              {terpilih && (
                <p className="metric-sub" style={{ marginTop: '12px' }}>
                  Bak terpilih: <strong>{terpilih.namaTank}</strong>.{' '}
                  <Link to={`/observasi-bak?tank=${terpilih.tankId}&siklus=${terpilih.siklusId}`}>
                    Catat observasi bak ini
                  </Link>
                </p>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

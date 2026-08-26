import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { DataTable } from '@components/ui/DataTable';
import { PanenStats } from './PanenStats';
import { riwayatPanen, type CatatanPanen } from './riwayatPanen';
import { PlusCircle } from 'lucide-react';
import './panen.css';

export function Panen() {
  const [riwayat, setRiwayat] = useState<CatatanPanen[]>([]);
  const [memuat, setMemuat] = useState(true);

  useEffect(() => {
    let aktif = true;
    riwayatPanen()
      .then(r => { if (aktif) setRiwayat(r); })
      .finally(() => { if (aktif) setMemuat(false); });
    return () => { aktif = false; };
  }, []);

  const totalPl = riwayat.reduce((n, r) => n + (r.jumlahPl || 0), 0);
  const totalKantong = riwayat.reduce((n, r) => n + (r.jumlahKantong || 0), 0);

  return (
    <div className="panen-container">
      <div className="dash-header">
        <div>
          <div className="tier-tag">PANEN &amp; PENGIRIMAN PL</div>
          <h1 className="dash-title">Panen Post-Larvae</h1>
          <p className="dash-subtitle">
            Rekapitulasi panen dalam basis ekor, dihitung dari record yang sudah dicatat.
          </p>
        </div>
        <Link to="/input-produksi?category=panenPl">
          <Button variant="primary">
            <PlusCircle size={16} style={{ marginRight: '6px' }} /> Catat Panen
          </Button>
        </Link>
      </div>

      <PanenStats
        totalPl={totalPl}
        readyCount={riwayat.length}
        readyPl={totalPl}
        totalKantong={totalKantong}
      />

      <Card>
        <CardHeader>Riwayat Panen Tercatat</CardHeader>
        <CardBody>
          {memuat ? (
            <p className="metric-sub">Memuat riwayat panen...</p>
          ) : riwayat.length === 0 ? (
            <p className="metric-sub">
              <strong>Belum ada panen tercatat.</strong> Riwayat terisi setelah panen dicatat lewat
              kategori &ldquo;Panen, Packing &amp; Pengiriman PL&rdquo; pada Input Data Harian.
            </p>
          ) : (
            <DataTable
              columns={[
                { key: 'tanggal', header: 'TANGGAL', render: (v) => <span className="font-mono">{v}</span> },
                { key: 'tankId', header: 'BAK', render: (v) => <span className="font-mono">{v}</span> },
                { key: 'stadia', header: 'STADIA' },
                { key: 'umurDoc', header: 'DOC', render: (v) => <span className="font-mono">{v ?? '—'}</span> },
                {
                  key: 'jumlahPl',
                  header: 'JUMLAH PL (EKOR)',
                  render: (v) => <span className="font-mono">{v ? v.toLocaleString('id-ID') : '—'}</span>,
                },
                { key: 'jumlahKantong', header: 'KANTONG', render: (v) => <span className="font-mono">{v ?? '—'}</span> },
                { key: 'status', header: 'STATUS' },
              ]}
              data={riwayat}
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
}

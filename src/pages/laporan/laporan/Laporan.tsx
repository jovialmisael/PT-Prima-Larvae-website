import { useEffect, useState } from 'react';
import { Button } from '@components/ui/Button';
import { Card, CardHeader, CardBody } from '@components/ui/Card';
import { DataTable } from '@components/ui/DataTable';
import { RingkasanOperasi } from '@pages/dashboard/RingkasanOperasi';
import { rekapKategori, type RekapKategori } from './rekapLaporan';
import { Download } from 'lucide-react';
import './laporan.css';

export function Laporan() {
  const [rekap, setRekap] = useState<RekapKategori[]>([]);
  const [memuat, setMemuat] = useState(true);

  useEffect(() => {
    let aktif = true;
    rekapKategori()
      .then(r => { if (aktif) setRekap(r); })
      .finally(() => { if (aktif) setMemuat(false); });
    return () => { aktif = false; };
  }, []);

  const adaData = rekap.length > 0;

  return (
    <div className="laporan-page-container">
      <div className="dash-header">
        <div>
          <div className="tier-tag">PELAPORAN OPERASI</div>
          <h1 className="dash-title">Laporan Operasi Hatchery</h1>
          <p className="dash-subtitle">
            Rekap pencatatan dan status pengesahan, dihitung langsung dari data tersimpan.
          </p>
        </div>
        <Button variant="primary" onClick={() => window.print()}>
          <Download size={16} style={{ marginRight: '6px' }} /> Cetak Halaman
        </Button>
      </div>

      <RingkasanOperasi />

      <Card>
        <CardHeader>Rekap Pencatatan per Kategori</CardHeader>
        <CardBody>
          {memuat ? (
            <p className="metric-sub">Memuat rekap...</p>
          ) : !adaData ? (
            <p className="metric-sub">
              <strong>Belum ada record tersimpan.</strong> Rekap akan terisi begitu petugas mulai
              mencatat data harian.
            </p>
          ) : (
            <DataTable
              columns={[
                { key: 'judul', header: 'KATEGORI' },
                { key: 'divisi', header: 'DIVISI' },
                { key: 'total', header: 'TOTAL', render: (v) => <span className="font-mono">{v}</span> },
                { key: 'draft', header: 'MENUNGGU QC', render: (v) => <span className="font-mono">{v}</span> },
                { key: 'qc', header: 'MENUNGGU SAHKAN', render: (v) => <span className="font-mono">{v}</span> },
                { key: 'disahkan', header: 'DISAHKAN', render: (v) => <span className="font-mono">{v}</span> },
                { key: 'ditolak', header: 'DITOLAK', render: (v) => <span className="font-mono">{v}</span> },
              ]}
              data={rekap}
            />
          )}
        </CardBody>
      </Card>

      <p className="metric-sub">
        Laporan analitik (SR per siklus, CV keseragaman, tren kualitas air, perbandingan siklus berhasil
        vs gagal) belum tersedia — modul analitik menyusul di Fase 7, dan laporan PDF resmi di Roadmap F5.
        Sampai saat itu halaman ini hanya menyajikan angka yang bisa ditelusuri ke record.
      </p>
    </div>
  );
}

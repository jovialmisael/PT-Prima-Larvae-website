import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody } from '@components/ui/Card';
import { ringkasanOperasi, type RingkasanOperasi as Ringkasan } from '@services/dashboardStats';

type Kartu = { label: string; nilai: number; ke?: string; nada?: 'bahaya' | 'waspada' };

/**
 * Kartu ringkasan operasi untuk dashboard tingkat kepala ke atas.
 * Semua angka diturunkan dari data tersimpan — tidak ada nilai contoh.
 * Selama modul analitik (dokumen 06) belum ada, SR/skor risiko/tren sengaja
 * TIDAK ditampilkan daripada diisi angka karangan.
 */
export function RingkasanOperasi({ fokus }: { fokus?: 'produksi' | 'lab' | 'qc' | 'manager' }) {
  const [data, setData] = useState<Ringkasan | null>(null);
  const [memuat, setMemuat] = useState(true);

  useEffect(() => {
    let aktif = true;
    ringkasanOperasi()
      .then(r => { if (aktif) setData(r); })
      .finally(() => { if (aktif) setMemuat(false); });
    return () => { aktif = false; };
  }, []);

  if (memuat) return <p className="metric-sub">Memuat ringkasan dari data tersimpan...</p>;
  if (!data) return null;

  const kartu: Kartu[] = [
    { label: 'Siklus berjalan', nilai: data.siklusAktif, ke: '/master-siklus' },
    { label: 'Tank aktif', nilai: data.tankAktif, ke: '/master-siklus' },
    { label: 'Record tercatat hari ini', nilai: data.recordHariIni },
    { label: 'Menunggu QC', nilai: data.menungguQc, ke: '/inbox-pengesahan', nada: 'waspada' },
    { label: 'Menunggu pengesahan', nilai: data.menungguPengesahan, ke: '/inbox-pengesahan', nada: 'waspada' },
    { label: 'Ditolak / perlu revisi', nilai: data.ditolak, ke: '/inbox-pengesahan', nada: data.ditolak ? 'bahaya' : undefined },
    { label: 'Peringatan aktif', nilai: data.alertAktif, ke: '/alert-center', nada: data.alertBahaya ? 'bahaya' : undefined },
  ];

  if (fokus === 'produksi') kartu.push({ label: 'Batch induk aktif', nilai: data.indukAktif, ke: '/master-siklus' });

  return (
    <>
      {data.kosong && (
        <p className="metric-sub">
          <strong>Belum ada data tercatat.</strong> Angka di bawah akan terisi sendiri begitu petugas
          mulai menyimpan pencatatan harian.
        </p>
      )}

      <div className="dash-metrics-grid">
        {kartu.map(k => (
          <Card key={k.label}>
            <CardBody>
              <div className={`metric-large font-mono ${k.nada === 'bahaya' && k.nilai > 0 ? 'text-danger' : ''}`}>
                {k.nilai}
              </div>
              <div className="metric-sub">
                {k.ke ? <Link to={k.ke}>{k.label}</Link> : k.label}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </>
  );
}

/** Catatan jujur soal kapabilitas analitik yang belum dibangun. */
export function CatatanAnalitikBelumAda() {
  return (
    <p className="metric-sub">
      Analitik siklus (SR per stadia, skor risiko, perbandingan kohort, prediksi SR) belum tersedia —
      modulnya menyusul sesuai Fase 7. Angka-angka itu sengaja tidak ditampilkan daripada diperkirakan.
    </p>
  );
}

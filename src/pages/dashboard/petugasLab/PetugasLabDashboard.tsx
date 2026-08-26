import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '@components/ui/Card';
import type { UserDef } from '@services/rolesConfig';
import { isianKategoriHariIni, type IsianKategori } from '@services/dashboardStats';
import './PetugasLabDashboard.css';

interface PetugasLabDashboardProps {
  user: UserDef;
}

const AREA_LABEL: Record<string, string> = {
  maturasi: 'Maturasi',
  algae: 'Algae',
  pl: 'Post-Larvae (PL)',
};

function greeting(): string {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat Pagi';
  if (h < 15) return 'Selamat Siang';
  if (h < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

export function PetugasLabDashboard({ user }: PetugasLabDashboardProps) {
  const [kategori, setKategori] = useState<IsianKategori[]>([]);
  const [memuat, setMemuat] = useState(true);

  const areaLabel = AREA_LABEL[user.area ?? ''] ?? 'Laboratorium';

  useEffect(() => {
    let aktif = true;
    isianKategoriHariIni('lab', user.area)
      .then(hasil => { if (aktif) setKategori(hasil); })
      .finally(() => { if (aktif) setMemuat(false); });
    return () => { aktif = false; };
  }, [user.area]);

  const terisi = kategori.filter(k => k.jumlahHariIni > 0);
  const totalRecord = kategori.reduce((n, k) => n + k.jumlahHariIni, 0);

  return (
    <div className="dash-container">
      <div className="dash-header">
        <div>
          <div className="tier-tag">LABORATORY WORKSPACE &bull; PETUGAS LAB</div>
          <h1 className="dash-title">{greeting()}, {user.username}</h1>
          <p className="dash-subtitle">
            Area Anda: <span className="badge-area">{areaLabel}</span> — pemeriksaan yang tercatat hari ini.
          </p>
        </div>
      </div>

      <div className="dash-metrics-grid">
        <Card>
          <CardBody>
            <div className="metric-large font-mono">{memuat ? '—' : totalRecord}</div>
            <div className="metric-sub">Hasil pemeriksaan tercatat hari ini</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="metric-large font-mono">{memuat ? '—' : `${terisi.length}/${kategori.length}`}</div>
            <div className="metric-sub">Jenis pemeriksaan yang sudah diisi</div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="card-header-flex">
            <span>Pemeriksaan Area {areaLabel}</span>
            <Link to="/input-lab" className="active-bak-tag">Buka Input Data Harian</Link>
          </div>
        </CardHeader>
        <CardBody>
          {memuat ? (
            <p className="metric-sub">Memuat...</p>
          ) : kategori.length === 0 ? (
            <p className="metric-sub">Tidak ada kategori pemeriksaan untuk area ini.</p>
          ) : (
            <ul className="lab-kategori-list">
              {kategori.map(k => (
                <li key={k.categoryId} className="lab-kategori-row">
                  <Link to={`/input-lab?category=${k.categoryId}`}>{k.judul}</Link>
                  <span className={`count-badge font-mono ${k.jumlahHariIni ? '' : 'is-kosong'}`}>
                    {k.jumlahHariIni ? `${k.jumlahHariIni} record` : 'belum diisi'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <p className="metric-sub">
        Catatan: alur antrean sampel (registrasi sampel masuk → pemeriksaan → hasil) belum dibangun.
        Untuk sekarang pencatatan dilakukan langsung per jenis pemeriksaan di atas.
      </p>
    </div>
  );
}

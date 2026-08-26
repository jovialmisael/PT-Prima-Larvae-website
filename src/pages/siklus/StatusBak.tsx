import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, RefreshCw, Filter, 
  Activity, Thermometer, Droplets, ArrowUpRight, 
  AlertCircle 
} from 'lucide-react';
import { list } from '@services/api';
import type { Tank, Siklus } from '@domainTypes/masters';
import './statusBak.css';

function Sparkline({ points, stroke = 'var(--primary)' }: { points: number[]; stroke?: string }) {
  if (!points || points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const w = 54;
  const h = 18;
  const p = 2;

  const path = points.map((val, idx) => {
    const x = p + (idx / (points.length - 1)) * (w - 2 * p);
    const y = h - p - ((val - min) / range) * (h - 2 * p);
    return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="bak-sparkline">
      <path d={path} fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StatusBak() {

  const navigate = useNavigate();
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [siklusList, setSiklusList] = useState<Siklus[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterRuang, setFilterRuang] = useState<string>('semua');
  const [filterStatus, setFilterStatus] = useState<string>('semua');

  const loadData = async () => {
    setLoading(true);
    try {
      const [tList, sList, rList] = await Promise.all([
        list('tank'),
        list('siklus'),
        list('records'),
      ]);
      setTanks((tList as Tank[]) || []);
      setSiklusList((sList as Siklus[]) || []);
      setRecords(rList || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Agregasi status real-time per tank
  const tankData = useMemo(() => {
    const airRecords = records.filter(r => r.categoryId === 'prodAirRutin');
    const larvaRecords = records.filter(r => r.categoryId === 'prodLarvae');

    return tanks.map(tank => {
      // Cari siklus aktif di bak ini
      const activeSiklus = siklusList.find(s => s.status === 'aktif' || s.status === 'panen');
      
      // Ambil data kualitas air terbaru bak ini
      const latestAir = airRecords
        .filter(r => r.tankId === tank.id || r.tankId === tank.namaTank)
        .pop();

      // Ambil observasi larva terbaru bak ini
      const latestLarva = larvaRecords
        .filter(r => r.tankId === tank.id || r.tankId === tank.namaTank)
        .pop();

      const suhu = latestAir?.suhuSore || latestAir?.suhuPagi || '-';
      const doVal = latestAir?.doSore || latestAir?.doPagi || '-';
      const ph = latestAir?.phSore || latestAir?.phPagi || '-';
      const stadia = latestLarva?.stadia || latestLarva?.stadiaUtama || tank.ruangStadia?.toUpperCase() || '-';
      const statusOperasional: 'aktif' | 'siap' | 'maintenance' = activeSiklus ? 'aktif' : (tank.status === 'aktif' ? 'siap' : 'maintenance');

      return {
        ...tank,
        activeSiklus,
        suhu,
        doVal,
        ph,
        stadia,
        populasi: latestLarva?.populasi || latestLarva?.jumlah || undefined,
        statusOperasional,
      };
    });
  }, [tanks, siklusList, records]);

  const filteredTanks = useMemo(() => {
    return tankData.filter(t => {
      if (filterRuang !== 'semua' && t.ruangStadia !== filterRuang) return false;
      if (filterStatus !== 'semua' && t.statusOperasional !== filterStatus) return false;
      return true;
    });
  }, [tankData, filterRuang, filterStatus]);

  const stats = useMemo(() => {
    const total = tankData.length;
    const aktif = tankData.filter(t => t.statusOperasional === 'aktif').length;
    const siap = tankData.filter(t => t.statusOperasional === 'siap').length;
    const maintenance = tankData.filter(t => t.statusOperasional === 'maintenance').length;
    return { total, aktif, siap, maintenance };
  }, [tankData]);

  return (
    <div className="status-bak-page">
      {/* Header Banner */}
      <div className="status-bak-header">
        <div className="status-bak-title-row">
          <div className="status-bak-icon-wrap">
            <LayoutGrid size={24} />
          </div>
          <div>
            <h1 className="status-bak-title">Status Bak & Ruang Budidaya</h1>
            <p className="status-bak-sub">
              Monitoring real-time kondisi fisik, kualitas air, dan populasi aktif di setiap bak hatchery.
            </p>
          </div>
        </div>

        <div className="status-bak-actions">
          <button className="status-bak-btn-refresh" onClick={loadData} title="Muat Ulang">
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Segarkan Data</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="status-bak-stats">
        <div className="status-bak-stat-card">
          <span className="status-bak-stat-val">{stats.total}</span>
          <span className="status-bak-stat-lbl">Total Bak Terdaftar</span>
        </div>
        <div className="status-bak-stat-card status-bak-stat-card--aktif">
          <span className="status-bak-stat-val">{stats.aktif}</span>
          <span className="status-bak-stat-lbl">Bak Berisi Benur / Aktif</span>
        </div>
        <div className="status-bak-stat-card status-bak-stat-card--siap">
          <span className="status-bak-stat-val">{stats.siap}</span>
          <span className="status-bak-stat-lbl">Bak Siap Tebar / Kosong</span>
        </div>
        <div className="status-bak-stat-card status-bak-stat-card--maint">
          <span className="status-bak-stat-val">{stats.maintenance}</span>
          <span className="status-bak-stat-lbl">Sterilisasi / Treatment</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="status-bak-filter-bar">
        <div className="status-bak-filter-group">
          <span className="status-bak-filter-lbl"><Filter size={14} /> Ruang:</span>
          {['semua', 'naupli', 'zoea', 'mysis', 'pl'].map(r => (
            <button
              key={r}
              className={`status-bak-pill ${filterRuang === r ? 'active' : ''}`}
              onClick={() => setFilterRuang(r)}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="status-bak-filter-group">
          <span className="status-bak-filter-lbl">Status:</span>
          {['semua', 'aktif', 'siap', 'maintenance'].map(st => (
            <button
              key={st}
              className={`status-bak-pill ${filterStatus === st ? 'active' : ''}`}
              onClick={() => setFilterStatus(st)}
            >
              {st === 'semua' ? 'SEMUA' : st.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Tanks */}
      <div className="status-bak-grid">
        {loading ? (
          <div className="status-bak-empty">
            <RefreshCw size={28} className="spin" />
            <p>Memuat visualisasi bak...</p>
          </div>
        ) : filteredTanks.length === 0 ? (
          <div className="status-bak-empty">
            <AlertCircle size={36} style={{ color: 'var(--text-muted)' }} />
            <h3>Tidak Ada Bak Ditemukan</h3>
            <p>Tidak ada bak yang memenuhi kriteria filter yang dipilih.</p>
          </div>
        ) : (
          filteredTanks.map(tank => {
            const isAktif = tank.statusOperasional === 'aktif';
            return (
              <div 
                key={tank.id} 
                className={`bak-card ${isAktif ? 'bak-card--aktif' : 'bak-card--siap'}`}
                onClick={() => navigate(`/input-produksi?section=04`)}
              >
                <div className="bak-card-header">
                  <div>
                    <span className="bak-ruang-tag">{tank.ruangStadia?.toUpperCase()}</span>
                    <h3 className="bak-nama">{tank.namaTank}</h3>
                  </div>
                  <span className={`bak-status-badge bak-status-badge--${tank.statusOperasional}`}>
                    {tank.statusOperasional.toUpperCase()}
                  </span>
                </div>

                <div className="bak-card-body">
                  <div className="bak-metric-row">
                    <div className="bak-metric-item">
                      <div className="bak-metric-top">
                        <span className="bak-metric-lbl"><Thermometer size={12} /> Suhu</span>
                        <Sparkline points={[29.8, 30.1, 30.5, 30.2, 30.0]} stroke="#059669" />
                      </div>
                      <span className="bak-metric-val">{tank.suhu !== '-' ? `${tank.suhu}°C` : '-'}</span>
                    </div>
                    <div className="bak-metric-item">
                      <div className="bak-metric-top">
                        <span className="bak-metric-lbl"><Droplets size={12} /> DO Air</span>
                        <Sparkline points={[6.1, 5.9, 5.8, 6.2, 6.0]} stroke="#2563eb" />
                      </div>
                      <span className="bak-metric-val">{tank.doVal !== '-' ? `${tank.doVal} ppm` : '-'}</span>
                    </div>
                    <div className="bak-metric-item">
                      <div className="bak-metric-top">
                        <span className="bak-metric-lbl"><Activity size={12} /> pH Air</span>
                        <Sparkline points={[8.0, 8.1, 8.2, 8.1, 8.0]} stroke="#d97706" />
                      </div>
                      <span className="bak-metric-val">{tank.ph !== '-' ? tank.ph : '-'}</span>
                    </div>
                  </div>


                  {isAktif && (
                    <div className="bak-active-info">
                      <div className="bak-stadia-row">
                        <span className="bak-stadia-lbl">Stadia Benur:</span>
                        <span className="bak-stadia-val">{tank.stadia}</span>
                      </div>
                      {tank.activeSiklus && (
                        <div className="bak-batch-row">
                          <span className="bak-batch-lbl">Batch:</span>
                          <span className="bak-batch-val">{tank.activeSiklus.kodeBatch}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="bak-card-footer">
                  <span className="bak-action-text">Input Parameter Bak</span>
                  <ArrowUpRight size={15} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}


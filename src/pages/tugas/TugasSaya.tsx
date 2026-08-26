import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, CheckCircle2, Clock, AlertCircle, 
  Calendar, RefreshCw, ArrowRight, Filter, ChevronLeft, ChevronRight
} from 'lucide-react';
import { list } from '@services/api';
import { turunkanTugas, type Tugas, type StatusTugas, type BakRingkas } from '@services/tugas';
import { CATEGORIES } from '@utils/schema';
import type { Tank } from '@domainTypes/masters';
import type { Category } from '@domainTypes/index';
import './tugasSaya.css';

export function TugasSaya() {
  const navigate = useNavigate();

  const [tanggal, setTanggal] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [filterShift, setFilterShift] = useState<string>('semua');
  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const [loading, setLoading] = useState<boolean>(true);
  const [records, setRecords] = useState<any[]>([]);
  const [tanks, setTanks] = useState<Tank[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recList, tankList] = await Promise.all([
        list('records'),
        list('tank'),
      ]);
      setRecords(recList || []);
      setTanks((tankList as Tank[]) || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tanggal]);

  const changeDateByDays = (days: number) => {
    const current = new Date(tanggal);
    current.setDate(current.getDate() + days);
    setTanggal(current.toISOString().slice(0, 10));
  };

  const isToday = useMemo(() => {
    return tanggal === new Date().toISOString().slice(0, 10);
  }, [tanggal]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    CATEGORIES.forEach(c => map.set(c.id, c));
    return map;
  }, []);

  const allTugas = useMemo<Tugas[]>(() => {
    const baks: BakRingkas[] = tanks.map(t => ({ id: t.id, nama: t.namaTank, ruang: t.ruangStadia }));
    return turunkanTugas({
      categories: CATEGORIES,
      records,
      tanggal,
      sekarang: new Date(),
      bak: baks,
    });
  }, [tanggal, records, tanks]);

  const enrichedTugas = useMemo(() => {
    return allTugas.map(t => {
      const cat = categoryMap.get(t.categoryId);
      const section = cat?.section || '00';
      const categoryTitle = cat?.title || t.categoryId;
      const division = cat?.division || 'produksi';
      const linkTo = division === 'lab' 
        ? `/input-lab?section=${section}` 
        : `/input-produksi?section=${section}`;
      
      const shift = t.slot || (t.frekuensiLabel?.includes('2x') ? 'pagi & sore' : 'harian');

      return {
        ...t,
        section,
        categoryTitle,
        linkTo,
        shift,
      };
    });
  }, [allTugas, categoryMap]);

  const filteredTugas = useMemo(() => {
    return enrichedTugas.filter(t => {
      if (filterShift !== 'semua') {
        if (filterShift === 'pagi' && t.slot !== 'pagi') return false;
        if (filterShift === 'sore' && t.slot !== 'sore') return false;
        if (filterShift === 'harian' && t.slot) return false;
      }
      if (filterStatus !== 'semua' && t.status !== filterStatus) return false;
      return true;
    });
  }, [enrichedTugas, filterShift, filterStatus]);

  // Statistik KPI
  const stats = useMemo(() => {
    const total = allTugas.length;
    const terisi = allTugas.filter(t => t.status === 'terisi').length;
    const terlambat = allTugas.filter(t => t.status === 'terlambat').length;
    const belum = allTugas.filter(t => t.status === 'belum').length;
    const percent = total > 0 ? Math.round((terisi / total) * 100) : 100;
    return { total, terisi, terlambat, belum, percent };
  }, [allTugas]);

  const getStatusBadge = (status: StatusTugas) => {
    switch (status) {
      case 'terisi':
        return <span className="tugas-badge tugas-badge--terisi"><CheckCircle2 size={13} /> Selesai</span>;
      case 'terlambat':
        return <span className="tugas-badge tugas-badge--terlambat"><AlertCircle size={13} /> Terlambat</span>;
      case 'belum':
      default:
        return <span className="tugas-badge tugas-badge--belum"><Clock size={13} /> Perlu Diisi</span>;
    }
  };

  return (
    <div className="tugas-page">
      {/* Header Banner - Full Width */}
      <div className="tugas-header">
        <div className="tugas-header-info">
          <div className="tugas-title-row">
            <div className="tugas-icon-wrap">
              <ClipboardList size={26} />
            </div>
            <div>
              <div className="tugas-title-badge-wrap">
                <h1 className="tugas-title">Tugas Saya</h1>
                {isToday ? (
                  <span className="tugas-badge-today">Hari Ini</span>
                ) : (
                  <span className="tugas-badge-custom-date">{tanggal}</span>
                )}
              </div>
              <p className="tugas-sub">
                Agenda dan checklist pengukuran parameter operasional hatchery hari ini.
              </p>
            </div>
          </div>
        </div>

        {/* Date Selector Quick Toolbar */}
        <div className="tugas-date-toolbar">
          <div className="tugas-date-nav-group">
            <button 
              className="tugas-date-nav-btn" 
              onClick={() => changeDateByDays(-1)} 
              title="Hari Sebelumnya"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              className={`tugas-date-quick-btn ${isToday ? 'active' : ''}`}
              onClick={() => setTanggal(new Date().toISOString().slice(0, 10))}
            >
              Hari Ini
            </button>
            <button 
              className="tugas-date-nav-btn" 
              onClick={() => changeDateByDays(1)} 
              title="Hari Berikutnya"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="tugas-date-input-wrap">
            <Calendar size={16} className="tugas-date-icon" />
            <input
              type="date"
              className="tugas-date-input"
              value={tanggal}
              onChange={e => setTanggal(e.target.value)}
            />
          </div>

          <button className="tugas-btn-refresh" onClick={loadData} title="Muat Ulang Data">
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="tugas-stats-grid">
        <div className="tugas-stat-card tugas-stat-card--main">
          <div className="tugas-stat-header">
            <span className="tugas-stat-lbl">Progres Agenda Hari Ini</span>
            <span className="tugas-stat-percent">{stats.percent}%</span>
          </div>
          <div className="tugas-stat-val-group">
            <span className="tugas-stat-val">{stats.terisi}</span>
            <span className="tugas-stat-val-sub">/ {stats.total} Tugas</span>
          </div>
          <div className="tugas-progress-bar">
            <div className="tugas-progress-fill" style={{ width: `${stats.percent}%` }} />
          </div>
        </div>

        <div className="tugas-stat-card tugas-stat-card--terisi">
          <div className="tugas-stat-icon-wrap">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="tugas-stat-val">{stats.terisi}</div>
            <div className="tugas-stat-lbl">Tuntas Terisi</div>
          </div>
        </div>

        <div className="tugas-stat-card tugas-stat-card--belum">
          <div className="tugas-stat-icon-wrap">
            <Clock size={20} />
          </div>
          <div>
            <div className="tugas-stat-val">{stats.belum}</div>
            <div className="tugas-stat-lbl">Menunggu Input</div>
          </div>
        </div>

        <div className="tugas-stat-card tugas-stat-card--terlambat">
          <div className="tugas-stat-icon-wrap">
            <AlertCircle size={20} />
          </div>
          <div>
            <div className="tugas-stat-val">{stats.terlambat}</div>
            <div className="tugas-stat-lbl">Melewati Batas Shift</div>
          </div>
        </div>
      </div>

      {/* Segmented Filter Control Bar */}
      <div className="tugas-filter-bar">
        <div className="tugas-filter-group">
          <span className="tugas-filter-label"><Filter size={14} /> Filter Shift:</span>
          {['semua', 'pagi', 'sore', 'harian'].map(s => (
            <button
              key={s}
              className={`tugas-filter-pill ${filterShift === s ? 'active' : ''}`}
              onClick={() => setFilterShift(s)}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="tugas-filter-group">
          <span className="tugas-filter-label">Status:</span>
          {['semua', 'belum', 'terlambat', 'terisi'].map(st => (
            <button
              key={st}
              className={`tugas-filter-pill ${filterStatus === st ? 'active' : ''}`}
              onClick={() => setFilterStatus(st)}
            >
              {st === 'semua' ? 'SEMUA' : st === 'terisi' ? 'SELESAI' : st.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Task List Grid - Full Width Fluid */}
      <div className="tugas-list-wrap">
        {loading ? (
          <div className="tugas-empty">
            <RefreshCw size={28} className="spin" />
            <p>Memuat daftar tugas terintegrasi...</p>
          </div>
        ) : filteredTugas.length === 0 ? (
          <div className="tugas-empty">
            <CheckCircle2 size={40} style={{ color: 'var(--success)', opacity: 0.8 }} />
            <h3>Tidak Ada Tugas pada Filter Ini</h3>
            <p>Seluruh agenda pengukuran sesuai kriteria filter telah tuntas atau tidak ada jadwal.</p>
          </div>
        ) : (
          <div className="tugas-grid">
            {filteredTugas.map((tugas) => (
              <div 
                key={tugas.id} 
                className={`tugas-card tugas-card--${tugas.status}`}
                onClick={() => navigate(tugas.linkTo)}
              >
                <div className="tugas-card-header">
                  <div className="tugas-card-section">
                    <span className="tugas-card-sec-badge">§{tugas.section}</span>
                    <span className="tugas-card-cat">{tugas.categoryTitle}</span>
                  </div>
                  {getStatusBadge(tugas.status)}
                </div>

                <div className="tugas-card-body">
                  <h3 className="tugas-card-label">{tugas.judul}</h3>
                  {tugas.tankId && (
                    <div className="tugas-target-tank-badge">
                      <span>Lokasi Target:</span>
                      <strong>{tugas.tankId}</strong>
                    </div>
                  )}
                  
                  <div className="tugas-card-meta">
                    {tugas.frekuensiLabel && (
                      <span className="tugas-meta-item">
                        <Clock size={12} /> {tugas.frekuensiLabel}
                      </span>
                    )}
                    {tugas.slot && (
                      <span className="tugas-meta-item tugas-meta-item--shift">
                        Shift {tugas.slot.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="tugas-card-footer">
                  <span className="tugas-card-action-text">
                    {tugas.status === 'terisi' ? 'Buka / Edit Data' : 'Mulai Input Data'}
                  </span>
                  <ArrowRight size={15} className="tugas-card-arrow" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RefreshCw, Plus, FileText, 
  ArrowRight, Layers 
} from 'lucide-react';
import { list } from '@services/api';
import type { Siklus, Induk } from '@domainTypes/masters';
import { PasporSiklusModal } from '../produksi/masterSiklus/paspor/PasporSiklusModal';
import './statusBak.css';


export function SiklusBerjalan() {
  const navigate = useNavigate();
  const [siklusList, setSiklusList] = useState<Siklus[]>([]);
  const [indukList, setIndukList] = useState<Induk[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pasporSiklusId, setPasporSiklusId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sList, iList, rList] = await Promise.all([
        list('siklus'),
        list('induk'),
        list('records'),
      ]);
      setSiklusList((sList as Siklus[]) || []);
      setIndukList((iList as Induk[]) || []);
      setRecords(rList || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const indukMap = useMemo(() => {
    const map = new Map<string, Induk>();
    indukList.forEach(i => map.set(i.id, i));
    return map;
  }, [indukList]);

  // Agregasi siklus berjalan
  const activeSiklusList = useMemo(() => {
    const srRecords = records.filter(r => r.categoryId === 'prodEstimasiSr');

    return siklusList.map(s => {
      const induk = s.indukId ? indukMap.get(s.indukId) : undefined;
      const latestSR = srRecords.filter(r => r.siklusId === s.id).pop();
      
      const tglMulaiDate = new Date(s.tglMulai);
      const doc = Math.max(0, Math.floor((Date.now() - tglMulaiDate.getTime()) / (1000 * 60 * 60 * 24)));

      return {
        ...s,
        induk,
        doc,
        srTotal: latestSR?.srNPL || s.srFinal || '-',
        statusDisplay: s.status === 'aktif' ? 'Sedang Berjalan' : s.status === 'panen' ? 'Proses Panen' : 'Selesai',
      };
    });
  }, [siklusList, indukMap, records]);

  return (
    <div className="status-bak-page">
      {/* Header Banner */}
      <div className="status-bak-header">
        <div className="status-bak-title-row">
          <div className="status-bak-icon-wrap">
            <RefreshCw size={24} />
          </div>
          <div>
            <h1 className="status-bak-title">Siklus Budidaya Berjalan</h1>
            <p className="status-bak-sub">
              Monitoring seluruh batch pemeliharaan larva & PL aktif dari kedatangan induk hingga panen (§01 - §11).
            </p>
          </div>
        </div>

        <div className="status-bak-actions">
          <button 
            className="status-bak-btn-primary" 
            onClick={() => navigate('/master-siklus')}
          >
            <Plus size={15} />
            <span>Buka Siklus Baru</span>
          </button>
        </div>
      </div>

      {/* Siklus Cards Grid */}
      <div className="siklus-grid">
        {loading ? (
          <div className="status-bak-empty">
            <RefreshCw size={28} className="spin" />
            <p>Memuat siklus berjalan...</p>
          </div>
        ) : activeSiklusList.length === 0 ? (
          <div className="status-bak-empty">
            <Layers size={36} style={{ color: 'var(--text-muted)' }} />
            <h3>Belum Ada Siklus Terbuka</h3>
            <p>Klik tombol Buka Siklus Baru untuk memulai pemeliharaan batch nauplii.</p>
          </div>
        ) : (
          activeSiklusList.map(siklus => (
            <div key={siklus.id} className="siklus-card">
              <div className="siklus-card-header">
                <div>
                  <span className="siklus-doc-badge">DOC {siklus.doc} HARI</span>
                  <h3 className="siklus-kode">{siklus.kodeBatch}</h3>
                </div>
                <span className={`siklus-status-badge siklus-status-badge--${siklus.status}`}>
                  {siklus.statusDisplay}
                </span>
              </div>

              <div className="siklus-card-body">
                <div className="siklus-info-row">
                  <span className="siklus-info-lbl">Asal Induk:</span>
                  <span className="siklus-info-val">
                    {siklus.induk?.kodeBatch || 'Batch Induk Terverifikasi'}
                  </span>
                </div>
                <div className="siklus-info-row">
                  <span className="siklus-info-lbl">Tgl Mulai:</span>
                  <span className="siklus-info-val">
                    {siklus.tglMulai.slice(0, 10)}
                  </span>
                </div>
                <div className="siklus-info-row">
                  <span className="siklus-info-lbl">Total Survival (N→PL):</span>
                  <span className="siklus-info-val siklus-info-val--sr">
                    {siklus.srTotal !== '-' ? `${siklus.srTotal}%` : 'Dalam Observasi'}
                  </span>
                </div>
              </div>

              <div className="siklus-card-footer">
                <button 
                  className="siklus-btn-paspor"
                  onClick={() => setPasporSiklusId(siklus.id)}
                >
                  <FileText size={14} />
                  <span>Paspor Siklus (§11)</span>
                </button>
                <button 
                  className="siklus-btn-entry"
                  onClick={() => navigate(`/input-produksi?section=06`)}
                >
                  <span>Data Larva</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Paspor Modal */}
      {pasporSiklusId && (
        <PasporSiklusModal
          isOpen={true}
          siklusId={pasporSiklusId}
          onClose={() => setPasporSiklusId(null)}
        />
      )}

    </div>
  );
}

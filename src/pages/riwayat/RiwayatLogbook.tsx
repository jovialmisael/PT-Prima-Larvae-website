import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  History, Search, Download, Upload, Calendar, 
  Eye, CheckCircle2, AlertTriangle, 
  X, RefreshCw, Layers 
} from 'lucide-react';

import { list, create } from '@services/api';
import { CATEGORIES, SECTION_LABELS, SECTION_ORDER } from '@utils/schema';
import type { Category } from '@domainTypes/index';
import './riwayatLogbook.css';

interface RiwayatProps {
  mode?: 'all' | 'produksi' | 'lab';
}

export function RiwayatLogbook({ mode = 'all' }: RiwayatProps) {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSec, setSelectedSec] = useState<string>('semua');
  const [selectedCat, setSelectedCat] = useState<string>('semua');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = await list('records');
      setRecords(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    CATEGORIES.forEach(c => map.set(c.id, c));
    return map;
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const cat = categoryMap.get(r.categoryId);
      if (!cat) return false;

      // Division filter (if mode is restricted)
      if (mode === 'produksi' && cat.division !== 'produksi') return false;
      if (mode === 'lab' && cat.division !== 'lab') return false;

      // Section filter
      if (selectedSec !== 'semua' && cat.section !== selectedSec) return false;

      // Category filter
      if (selectedCat !== 'semua' && r.categoryId !== selectedCat) return false;

      // Date filter
      const recDate = r.tanggal || r.tglKedatangan || r.createdAt?.slice(0, 10);
      if (startDate && recDate && recDate < startDate) return false;
      if (endDate && recDate && recDate > endDate) return false;

      // Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const catTitle = cat.title.toLowerCase();
        const tank = (r.tankId || r.bakPl || r.bakInduk || r.bakAlgae || '').toLowerCase();
        const petugas = (r.petugas || r.pemeriksa || r.pelaksana || '').toLowerCase();
        if (!catTitle.includes(q) && !tank.includes(q) && !petugas.includes(q)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const dateA = a.tanggal || a.createdAt || '';
      const dateB = b.tanggal || b.createdAt || '';
      return dateB.localeCompare(dateA);
    });
  }, [records, categoryMap, mode, selectedSec, selectedCat, startDate, endDate, searchQuery]);

  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;
    const rows = filteredRecords.map(r => {
      const cat = categoryMap.get(r.categoryId);
      return {
        Tanggal: r.tanggal || r.createdAt?.slice(0, 10) || '-',
        Seksi: `§${cat?.section || '00'}`,
        Formulir: cat?.title || r.categoryId,
        Tank: r.tankId || r.bakPl || r.bakInduk || r.bakAlgae || '-',
        Petugas: r.petugas || r.pemeriksa || r.pelaksana || '-',
        Validasi: r.validated ? 'Terverifikasi' : 'Draft'
      };
    });

    const headers = Object.keys(rows[0]).join(',');
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows.map(e => Object.values(e).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `logbook-prima-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      let importedCount = 0;

      if (file.name.endsWith('.json')) {
        const json = JSON.parse(text);
        const arrayData = Array.isArray(json) ? json : [json];
        for (const item of arrayData) {
          if (item.categoryId) {
            await create('records', { ...item, status: 'draft' });
            importedCount++;
          }
        }
      }
      setImportStatus(`Berhasil mengimpor ${importedCount} record data.`);
      loadRecords();
    } catch (err) {
      setImportStatus('Format berkas tidak valid. Harap gunakan file JSON/CSV yang sesuai.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="riwayat-page">
      {/* Hidden File Input for Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json,.csv"
        style={{ display: 'none' }}
      />

      {/* Header Banner */}
      <div className="riwayat-header">
        <div className="riwayat-title-row">
          <div className="riwayat-icon-wrap">
            <History size={24} />
          </div>
          <div>
            <h1 className="riwayat-title">
              {mode === 'lab' ? 'Riwayat Pengujian Laboratorium' : 'Riwayat Logbook Operasional'}
            </h1>
            <p className="riwayat-sub">
              Arsip data entry harian dan riwayat pencatatan parameter mutu hatchery (§01 s/d §12).
            </p>
          </div>
        </div>

        <div className="riwayat-actions">
          <button 
            className="riwayat-btn-export" 
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
            onClick={() => fileInputRef.current?.click()} 
            title="Impor Record (JSON/CSV)"
          >
            <Upload size={15} />
            <span>Impor Data</span>
          </button>

          <button className="riwayat-btn-export" onClick={handleExportCSV} title="Ekspor ke CSV">
            <Download size={15} />
            <span>Ekspor CSV</span>
          </button>

          <button className="riwayat-btn-refresh" onClick={loadRecords} title="Muat Ulang">
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {importStatus && (
        <div className="riwayat-import-banner" style={{
          padding: '8px 16px',
          background: 'var(--primary-faded)',
          border: '1px solid var(--primary-border)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-xs)',
          color: 'var(--primary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-3)'
        }}>
          <span>{importStatus}</span>
          <button onClick={() => setImportStatus(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
            <X size={14} />
          </button>
        </div>
      )}


      {/* Filter Control Bar */}
      <div className="riwayat-filter-panel">
        <div className="riwayat-filter-row">
          {/* Search Box */}
          <div className="riwayat-search-box">
            <Search size={16} className="riwayat-search-icon" />
            <input
              type="text"
              placeholder="Cari formulir, tank, petugas..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="riwayat-search-input"
            />
            {searchQuery && (
              <button className="riwayat-clear-btn" onClick={() => setSearchQuery('')}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Section Filter */}
          <div className="riwayat-select-wrap">
            <span className="riwayat-select-label">Seksi:</span>
            <select 
              value={selectedSec} 
              onChange={e => { setSelectedSec(e.target.value); setSelectedCat('semua'); }}
              className="riwayat-select"
            >
              <option value="semua">Semua Seksi (§01 - §12)</option>
              {SECTION_ORDER.map(sec => (
                <option key={sec} value={sec}>{SECTION_LABELS[sec]}</option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="riwayat-date-range">
            <div className="riwayat-date-field">
              <span className="riwayat-date-lbl">Dari:</span>
              <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
                className="riwayat-date-input"
              />
            </div>
            <div className="riwayat-date-field">
              <span className="riwayat-date-lbl">S/D:</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)} 
                className="riwayat-date-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="riwayat-table-container">
        {loading ? (
          <div className="riwayat-loading">
            <RefreshCw size={28} className="spin" />
            <p>Memuat riwayat logbook...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="riwayat-empty">
            <Layers size={36} style={{ color: 'var(--text-muted)', opacity: 0.6 }} />
            <h3>Tidak Ada Logbook Ditemukan</h3>
            <p>Belum ada data pencatatan yang sesuai dengan kriteria filter.</p>
          </div>
        ) : (
          <div className="riwayat-table-scroll">
            <table className="riwayat-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Bab / Seksi</th>
                  <th>Nama Formulir</th>
                  <th>Tank / Sumber</th>
                  <th>Petugas / Penguji</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r, idx) => {
                  const cat = categoryMap.get(r.categoryId);
                  const tanggalDisplay = r.tanggal || r.tglKedatangan || r.createdAt?.slice(0, 10) || '-';
                  const tankDisplay = r.tankId || r.bakPl || r.bakInduk || r.bakAlgae || '-';
                  const petugasDisplay = r.petugas || r.pemeriksa || r.pelaksana || '-';

                  return (
                    <tr key={r.id || idx}>
                      <td className="riwayat-cell-date">
                        <Calendar size={13} /> {tanggalDisplay}
                      </td>
                      <td>
                        <span className="riwayat-sec-tag">§{cat?.section || '00'}</span>
                      </td>
                      <td className="riwayat-cell-title">
                        {cat?.title || r.categoryId}
                      </td>
                      <td className="riwayat-cell-tank">
                        {tankDisplay}
                      </td>
                      <td className="riwayat-cell-petugas">
                        {petugasDisplay}
                      </td>
                      <td>
                        {r.status === 'anomali' ? (
                          <span className="riwayat-status-badge riwayat-status-badge--anomali">
                            <AlertTriangle size={12} /> Anomali
                          </span>
                        ) : (
                          <span className="riwayat-status-badge riwayat-status-badge--ok">
                            <CheckCircle2 size={12} /> Tersimpan
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="riwayat-row-btn"
                          onClick={() => setSelectedRecord(r)}
                          title="Lihat Rincian Record"
                        >
                          <Eye size={13} />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  );

                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Record Modal */}
      {selectedRecord && (
        <div className="riwayat-modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="riwayat-modal-content" onClick={e => e.stopPropagation()}>
            <div className="riwayat-modal-header">
              <div>
                <span className="riwayat-modal-sec">
                  §{categoryMap.get(selectedRecord.categoryId)?.section || '00'}
                </span>
                <h2 className="riwayat-modal-title">
                  {categoryMap.get(selectedRecord.categoryId)?.title || selectedRecord.categoryId}
                </h2>
                <p className="riwayat-modal-sub">
                  ID Record: {selectedRecord.id || '-'} • Tanggal: {selectedRecord.tanggal || selectedRecord.createdAt || '-'}
                </p>
              </div>
              <button className="riwayat-modal-close" onClick={() => setSelectedRecord(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="riwayat-modal-body">
              <div className="riwayat-fields-grid">
                {Object.entries(selectedRecord)
                  .filter(([k]) => !['id', 'categoryId', 'createdAt', 'updatedAt', 'rev', 'deleted'].includes(k))
                  .map(([key, val]) => {
                    const catDef = categoryMap.get(selectedRecord.categoryId);
                    const fieldDef = catDef?.fields.find(f => f.key === key);
                    const label = fieldDef?.label || key;
                    const unit = fieldDef?.unit || '';
                    const formattedVal = typeof val === 'object' ? JSON.stringify(val) : String(val);

                    return (
                      <div key={key} className="riwayat-field-card">
                        <span className="riwayat-field-label">{label}</span>
                        <div className="riwayat-field-val">
                          {formattedVal} {unit && <span className="riwayat-field-unit">{unit}</span>}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="riwayat-modal-footer">
              <button className="riwayat-btn-close" onClick={() => setSelectedRecord(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

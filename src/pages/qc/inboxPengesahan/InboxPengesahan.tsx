import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardBody } from '@components/ui/Card';
import { DataTable } from '@components/ui/DataTable';
import { currentUser, currentRole } from '@services/session';
import { InboxStats } from './InboxStats';
import { InboxDetailModal } from './InboxDetailModal';
import { InboxRejectModal } from './InboxRejectModal';
import { InboxSignModal } from './InboxSignModal';
import { muatAntrean, sahkanItem, tolakItem, type AntreanItem } from './inboxQueue';
import { kolomAntrean } from './inboxColumns';
import './inboxPengesahan.css';

export function InboxPengesahan() {
  const user = currentUser();
  const role = currentRole();

  const [items, setItems] = useState<AntreanItem[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filterDivisi, setFilterDivisi] = useState('semua');
  const [filterStatus, setFilterStatus] = useState('semua');
  const [selectedRecord, setSelectedRecord] = useState<AntreanItem | null>(null);
  const [rejectingRecord, setRejectingRecord] = useState<AntreanItem | null>(null);
  const [signingRecord, setSigningRecord] = useState<AntreanItem | null>(null);

  const muat = useCallback(async () => {
    setMemuat(true);
    try {
      setItems(await muatAntrean(role));
    } finally {
      setMemuat(false);
    }
  }, [role]);

  useEffect(() => { void muat(); }, [muat]);

  const filteredItems = useMemo(() => items.filter(item => {
    const matchDiv = filterDivisi === 'semua' || item.divisi.toLowerCase().startsWith(filterDivisi);
    const matchStat = filterStatus === 'semua' || item.status === filterStatus;
    return matchDiv && matchStat;
  }), [items, filterDivisi, filterStatus]);

  const kolom = useMemo(() => kolomAntrean({
    onDetail: setSelectedRecord,
    onSign: setSigningRecord,
    onReject: setRejectingRecord,
  }), []);

  const handleSign = async (ttd: string) => {
    if (!signingRecord) return;
    setSubmitting(true);
    setGalat('');
    try {
      const pesan = await sahkanItem(signingRecord, user?.username || 'pejabat', ttd);
      if (pesan) { setGalat(pesan); return; }
      setSigningRecord(null);
      setSelectedRecord(null);
      await muat();
    } finally { setSubmitting(false); }
  };

  const handleRejectConfirm = async (alasan: string) => {
    if (!rejectingRecord) return;
    setSubmitting(true);
    setGalat('');
    try {
      const pesan = await tolakItem(rejectingRecord, user?.username || 'pejabat', alasan);
      if (pesan) { setGalat(pesan); return; }
      setRejectingRecord(null);
      setSelectedRecord(null);
      await muat();
    } finally { setSubmitting(false); }
  };

  return (
    <div className="inbox-container">
      <div className="dash-header">
        <div>
          <div className="tier-tag">AUDIT MUTU &amp; PENGESAHAN DOKUMEN</div>
          <h1 className="dash-title">Inbox Pengesahan &amp; Verifikasi Data</h1>
          <p className="dash-subtitle">
            Pusat pengesahan berantai: verifikasi teknis MPM/QC dan persetujuan Kepala Divisi.
          </p>
        </div>
      </div>

      {galat && <div className="inbox-error" role="alert">{galat}</div>}

      <InboxStats
        pendingQcCount={items.filter(i => i.status === 'draft').length}
        pendingSahkanCount={items.filter(i => i.status === 'qc').length}
        disahkanCount={items.filter(i => i.status === 'disahkan').length}
        ditolakCount={items.filter(i => i.status === 'ditolak').length}
      />

      <Card>
        <CardHeader>
          <div className="inbox-filter-bar">
            <span>Antrean Record Masuk</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select value={filterDivisi} onChange={(e) => setFilterDivisi(e.target.value)} className="filter-select font-mono">
                <option value="semua">Divisi: Semua</option>
                <option value="produksi">Produksi</option>
                <option value="laboratorium">Laboratorium</option>
              </select>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select font-mono">
                <option value="semua">Status: Semua</option>
                <option value="draft">Menunggu QC</option>
                <option value="qc">Menunggu Pengesahan</option>
                <option value="disahkan">Disahkan</option>
                <option value="ditolak">Ditolak</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {memuat ? (
            <p className="inbox-empty">Memuat antrean dari data tersimpan...</p>
          ) : items.length === 0 ? (
            <p className="inbox-empty">
              Belum ada record yang masuk antrean. Record muncul di sini begitu petugas menyimpan data harian.
            </p>
          ) : (
            <DataTable
              columns={kolom}
              data={filteredItems}
            />
          )}
        </CardBody>
      </Card>

      <InboxDetailModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onApprove={(r) => setSigningRecord(r)}
        onReject={(r) => { setSelectedRecord(null); setRejectingRecord(r); }}
        canApprove={!!selectedRecord?.langkah}
        canRejectRecord={!!selectedRecord?.langkah}
      />

      <InboxSignModal
        item={signingRecord}
        onClose={() => setSigningRecord(null)}
        onConfirm={handleSign}
        submitting={submitting}
      />

      <InboxRejectModal
        isOpen={!!rejectingRecord}
        onClose={() => setRejectingRecord(null)}
        onConfirmReject={handleRejectConfirm}
      />
    </div>
  );
}

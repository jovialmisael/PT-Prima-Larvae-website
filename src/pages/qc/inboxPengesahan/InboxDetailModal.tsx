import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';

interface InboxDetailModalProps {
  record: any | null;
  onClose: () => void;
  onApprove: (record: any) => void;
  onReject: (record: any) => void;
  canApprove: boolean;
  canRejectRecord: boolean;
}

export function InboxDetailModal({
  record,
  onClose,
  onApprove,
  onReject,
  canApprove,
  canRejectRecord,
}: InboxDetailModalProps) {
  if (!record) return null;

  return (
    <div className="modal-overlay">
      <div className="helpdesk-modal" style={{ maxWidth: '580px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div>
            <h3 className="modal-title">Detail Pemeriksaan Record</h3>
            <span className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)' }}>
              ID: {record.id} • Divisi: {record.divisi}
            </span>
          </div>
          <Badge status={record.status === 'disahkan' || record.status === 'lolos' ? 'normal' : record.status === 'ditolak' ? 'bahaya' : 'waspada'}>
            {record.status?.toUpperCase()}
          </Badge>
        </div>

        <p className="modal-description" style={{ marginBottom: '10px' }}>
          Audit parameter, kesesuaian ambang batas SOP, dan riwayat paraf digital.
        </p>

        <div className="detail-field-grid">
          <div className="detail-field-item">
            <span className="detail-field-label">OBJEK / BAK</span>
            <span className="detail-field-val font-mono">{record.objek || record.bak || '-'}</span>
          </div>
          <div className="detail-field-item">
            <span className="detail-field-label">OPERATOR / PENGISI</span>
            <span className="detail-field-val font-mono">{record.petugas || record.dibuatOleh || 'operator'}</span>
          </div>
          <div className="detail-field-item">
            <span className="detail-field-label">PARAMETER UTAMA</span>
            <span className="detail-field-val">{record.parameter || '-'}</span>
          </div>
          <div className="detail-field-item">
            <span className="detail-field-label">NILAI / HASIL UKUR</span>
            <span className="detail-field-val font-mono" style={{ color: 'var(--primary)', fontWeight: 700 }}>
              {record.nilai || (record.suhu ? `${record.suhu}°C` : '-')}
            </span>
          </div>
          <div className="detail-field-item">
            <span className="detail-field-label">AMONIA / MUTU</span>
            <span className="detail-field-val font-mono">{record.amonia !== undefined ? `${record.amonia} ppm` : 'Normal'}</span>
          </div>
          <div className="detail-field-item">
            <span className="detail-field-label">WAKTU SAMPLING</span>
            <span className="detail-field-val font-mono">{record.waktu || '08:00 WITA'}</span>
          </div>
        </div>

        {record.ditolakOleh && (
          <div style={{ padding: '10px 14px', background: 'var(--status-bahaya-bg)', border: '1px solid var(--status-bahaya)', borderRadius: 'var(--radius-sm)', marginBottom: '14px', fontSize: 'var(--text-xs)', color: 'var(--status-bahaya)' }}>
            <strong>Alasan Penolakan:</strong> {record.ditolakOleh.alasan || 'Parameter tidak sesuai standar'}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
          <Button variant="secondary" onClick={onClose}>
            Tutup
          </Button>
          {canRejectRecord && record.status === 'pending' && (
            <Button variant="danger" onClick={() => onReject(record)}>
              Tolak Record
            </Button>
          )}
          {canApprove && record.status === 'pending' && (
            <Button variant="primary" onClick={() => onApprove(record)}>
              ✓ Verifikasi & Sahkan
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

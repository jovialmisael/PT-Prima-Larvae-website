import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { AlertTriangle, Clock, CheckCircle2, ShieldAlert, FileCheck } from 'lucide-react';
import type { Alert } from '@domainTypes/index';

interface AlertItemCardProps {
  alert: Alert;
  onAcknowledge: (id: string) => void;
  onOpenMitigasi: (alert: Alert) => void;
}

export function AlertItemCard({ alert, onAcknowledge, onOpenMitigasi }: AlertItemCardProps) {
  const isDanger = alert.tingkat === 'bahaya';
  const isResolved = alert.status === 'selesai';
  const isAcknowledged = alert.status === 'diakui';

  const timeFormatted = new Date(alert.tanggal).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`alert-card-item ${alert.tingkat} ${alert.status}`}>
      {/* Baris 1: identitas + status + waktu + aksi */}
      <div className="alert-row-head">
        <div className="alert-head-left">
          {isDanger ? (
            <ShieldAlert size={15} color="var(--status-bahaya)" />
          ) : (
            <AlertTriangle size={15} color="var(--status-waspada)" />
          )}
          <span className="alert-msg-title">{alert.parameter}</span>
          {alert.tankId && <span className="alert-target-chip font-mono">{alert.tankId}</span>}
          {alert.siklusId && <span className="alert-target-chip font-mono">{alert.siklusId}</span>}
        </div>

        <div className="alert-head-right">
          <Badge status={isDanger ? 'bahaya' : 'waspada'}>{alert.tingkat.toUpperCase()}</Badge>
          <Badge status={isResolved ? 'normal' : isAcknowledged ? 'waspada' : 'netral'}>
            {alert.status.toUpperCase()}
          </Badge>
          <span className="alert-time font-mono">
            <Clock size={12} /> {timeFormatted}
          </span>
          {!isResolved && !isAcknowledged && (
            <Button size="sm" variant="secondary" onClick={() => onAcknowledge(alert.id)}>
              Akui
            </Button>
          )}
          {!isResolved && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => onOpenMitigasi(alert)}
              title="Isi Bukti Tindakan & Selesaikan Mitigasi"
            >
              <CheckCircle2 size={14} style={{ marginRight: '4px' }} />
              Mitigasi
            </Button>
          )}
          {isResolved && (
            <span className="alert-resolved-tag">
              <CheckCircle2 size={14} /> Teratasi
            </span>
          )}
        </div>
      </div>

      {/* Baris 2: pesan + SOP + PJ */}
      <div className="alert-row-body">
        <span className="alert-body-text">
          <span className="alert-pesan-inline">{alert.pesan}</span>
          {' '}
          <span className="alert-sop-label">· SOP:</span> {alert.tindakan}
        </span>
        <span className="alert-pj-inline">PJ: {alert.kontakRole}</span>
      </div>

      {/* Baris 3: Bukti Tindakan Mitigasi Terverifikasi (§12) */}
      {isResolved && alert.mitigasi && (
        <div className="alert-mitigasi-proof">
          <div className="proof-header">
            <FileCheck size={13} color="var(--status-normal)" />
            <strong>Bukti Tindakan (§12):</strong>
            <span className="proof-chip font-mono">{alert.mitigasi.jenisTindakan}</span>
            {alert.mitigasi.dosis && alert.mitigasi.dosis !== '-' && (
              <span className="proof-chip font-mono">Dosis: {alert.mitigasi.dosis}</span>
            )}
            <span className="proof-chip font-mono">Pukul {alert.mitigasi.jam}</span>
            {alert.diselesaikanOleh && (
              <span className="proof-author">oleh @{alert.diselesaikanOleh}</span>
            )}
          </div>
          {alert.mitigasi.catatanMitigasi && (
            <div className="proof-notes">"{alert.mitigasi.catatanMitigasi}"</div>
          )}
        </div>
      )}
    </div>
  );
}


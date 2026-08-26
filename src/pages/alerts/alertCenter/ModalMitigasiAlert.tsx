import { useState, type FormEvent } from 'react';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import type { Alert } from '@domainTypes/index';
import type { ResolusiAlertPayload } from '@services/alerts';

interface ModalMitigasiAlertProps {
  alert: Alert | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, payload: ResolusiAlertPayload) => void;
  currentUser: string;
}

export function ModalMitigasiAlert({
  alert,
  isOpen,
  onClose,
  onSubmit,
  currentUser,
}: ModalMitigasiAlertProps) {
  const [jenisTindakan, setJenisTindakan] = useState('pergantian air');
  const [jam, setJam] = useState(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  );
  const [dosis, setDosis] = useState('');
  const [catatanMitigasi, setCatatanMitigasi] = useState('');

  if (!isOpen || !alert) return null;

  const isDanger = alert.tingkat === 'bahaya';

  return (
    <div className="modal-overlay">
      <div className="helpdesk-modal" style={{ maxWidth: '540px' }}>
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            onSubmit(alert.id, {
              oleh: currentUser,
              jenisTindakan,
              jam,
              dosis: dosis.trim() || '-',
              catatanMitigasi: catatanMitigasi.trim() || `Tindakan mitigasi ${jenisTindakan} untuk ${alert.parameter}`,
              tankId: alert.tankId,
              siklusId: alert.siklusId,
            });
            onClose();
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            {isDanger ? (
              <ShieldAlert size={22} color="var(--status-bahaya)" />
            ) : (
              <AlertTriangle size={22} color="var(--status-waspada)" />
            )}
            <h3 className="modal-title" style={{ margin: 0 }}>
              Bukti Tindakan Mitigasi Alert
            </h3>
          </div>

          <p className="modal-description" style={{ marginBottom: '14px' }}>
            Wajib mencatat perlakuan operasional nyata di bak sesuai <strong>PDF §12 (Log Tindakan)</strong> sebelum menyelesaikan peringatan ini.
          </p>

          {/* Anomali Ringkasan */}
          <div
            style={{
              padding: '10px 12px',
              background: isDanger ? 'var(--status-bahaya-bg)' : 'var(--status-waspada-bg)',
              border: `1px solid ${isDanger ? 'var(--status-bahaya-border)' : 'var(--status-waspada-border)'}`,
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px',
              fontSize: 'var(--text-xs)',
              lineHeight: 1.5,
            }}
          >
            <div>
              <strong>Parameter:</strong> {alert.parameter}{' '}
              {alert.tankId && <span className="font-mono">({alert.tankId})</span>}
            </div>
            <div style={{ color: 'var(--text-main)', marginTop: '2px' }}>
              <strong>Kondisi:</strong> {alert.pesan}
            </div>
            {alert.tindakan && (
              <div style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>
                <strong>Rujukan SOP:</strong> {alert.tindakan}
              </div>
            )}
          </div>

          {/* Form Fields PDF §12 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            <div className="ui-input-wrapper">
              <label className="ui-label">JENIS TINDAKAN (§12)</label>
              <select
                value={jenisTindakan}
                onChange={(e) => setJenisTindakan(e.target.value)}
                className="ui-input"
                required
              >
                <option value="pergantian air">Pergantian air</option>
                <option value="pemberian probiotik">Pemberian probiotik</option>
                <option value="bahan kimia/desinfektan">Pemberian bahan kimia atau desinfektan</option>
                <option value="penyesuaian suhu/salinitas">Penyesuaian suhu atau salinitas</option>
                <option value="penyiponan">Penyiponan dan tindakan lain</option>
                <option value="tindakan lain">Tindakan korektif lainnya</option>
              </select>
            </div>

            <div className="form-row-2">
              <Input
                label="JAM PELAKSANAAN"
                type="text"
                value={jam}
                onChange={(e) => setJam(e.target.value)}
                placeholder="Contoh: 14:30"
                required
                className="font-mono"
              />
              <Input
                label="DOSIS / VOLUME PERLAKUAN"
                type="text"
                value={dosis}
                onChange={(e) => setDosis(e.target.value)}
                placeholder="Misal: 200 Liter / 5 ppm"
                required
                className="font-mono"
              />
            </div>

            <div className="ui-input-wrapper">
              <label className="ui-label">ALASAN & BUKTI HASIL TINDAKAN</label>
              <textarea
                value={catatanMitigasi}
                onChange={(e) => setCatatanMitigasi(e.target.value)}
                className="ui-input ui-textarea"
                rows={3}
                placeholder="Jelaskan tindakan yang telah selesai dikerjakan di bak dan kondisi benur setelah perlakuan..."
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={onClose} type="button">
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Bukti & Selesaikan Alert
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

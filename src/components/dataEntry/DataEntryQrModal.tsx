import { useState, useRef, useEffect } from 'react';
import { X, Check, QrCode, AlertCircle } from 'lucide-react';
import './dataEntryQrModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

export function DataEntryQrModal({ isOpen, onClose, onScan }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');

  useEffect(() => {
    if (!isOpen) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      return;
    }

    // Try to access camera
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(s => {
          setStream(s);
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(() => {
          setError('Kamera tidak dapat diakses atau izin ditolak. Anda dapat memasukkan kode bak/batch secara manual di bawah.');
        });
    } else {
      setError('Perangkat tidak mendukung akses kamera HTML5.');
    }


    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      onClose();
    }
  };

  return (
    <div className="qr-modal-backdrop" onClick={onClose}>
      <div className="qr-modal-card" onClick={e => e.stopPropagation()}>
        <div className="qr-modal-header">
          <div className="qr-modal-title">
            <QrCode size={18} />
            <span>Pindai QR Code Bak / Batch</span>
          </div>
          <button className="qr-modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="qr-modal-body">
          {error ? (
            <div className="qr-camera-error">
              <AlertCircle size={32} />
              <p>{error}</p>
            </div>
          ) : (
            <div className="qr-video-wrapper">
              <video ref={videoRef} autoPlay playsInline muted className="qr-video" />
              <div className="qr-scanner-overlay">
                <div className="qr-target-box">
                  <div className="qr-scan-line" />
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleManualSubmit} className="qr-manual-form">
            <label className="qr-manual-lbl">Atau ketik ID Bak / Batch langsung:</label>
            <div className="qr-manual-input-row">
              <input
                type="text"
                className="qr-manual-input"
                placeholder="Contoh: BAK-01 atau B-2026-08"
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                autoFocus
              />
              <button type="submit" className="qr-manual-btn" disabled={!manualCode.trim()}>
                <Check size={16} /> Terapkan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

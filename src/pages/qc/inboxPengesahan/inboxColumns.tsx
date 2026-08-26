import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import type { AntreanItem } from './inboxQueue';

const TONE: Record<string, 'normal' | 'bahaya' | 'waspada' | 'netral'> = {
  disahkan: 'normal',
  ditolak: 'bahaya',
  qc: 'waspada',
  draft: 'netral',
  revisi: 'bahaya',
};

const LABEL_STATUS: Record<string, string> = {
  draft: 'MENUNGGU QC',
  qc: 'MENUNGGU PENGESAHAN',
  disahkan: 'DISAHKAN',
  ditolak: 'DITOLAK',
  revisi: 'PERLU REVISI',
};

interface Aksi {
  onDetail: (row: AntreanItem) => void;
  onSign: (row: AntreanItem) => void;
  onReject: (row: AntreanItem) => void;
}

/**
 * Kolom tabel antrean pengesahan. Tombol Sahkan/Tolak hanya dirender bila role
 * berwenang pada langkah aktif (`row.langkah`) — tidak dirender, bukan sekadar
 * dinonaktifkan (prinsip gating di dokumen 13).
 */
export function kolomAntrean({ onDetail, onSign, onReject }: Aksi) {
  return [
    { key: 'objek', header: 'OBJEK', render: (v: any) => <span className="font-mono">{v}</span> },
    { key: 'divisi', header: 'DIVISI', render: (v: any) => <strong>{v}</strong> },
    { key: 'parameter', header: 'KATEGORI' },
    { key: 'nilai', header: 'NILAI' },
    { key: 'petugas', header: 'OPERATOR', render: (v: any) => <span className="font-mono">{v}</span> },
    { key: 'waktu', header: 'WAKTU', render: (v: any) => <span className="font-mono">{v}</span> },
    {
      key: 'status',
      header: 'STATUS',
      render: (v: any) => <Badge status={TONE[v] ?? 'netral'}>{LABEL_STATUS[v] ?? v}</Badge>,
    },
    {
      key: 'actions',
      header: 'TINDAKAN',
      render: (_: any, row: AntreanItem) => (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <Button size="sm" variant="ghost" onClick={() => onDetail(row)}>
            <Eye size={14} /> Detail
          </Button>
          {row.langkah && (
            <>
              <Button size="sm" variant="primary" onClick={() => onSign(row)}>
                <CheckCircle size={14} />
              </Button>
              <Button size="sm" variant="danger" onClick={() => onReject(row)}>
                <XCircle size={14} />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];
}

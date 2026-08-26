import { Card, CardHeader, CardBody } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { DataTable } from '@components/ui/DataTable';
import { PlusCircle, FileText } from 'lucide-react';
import type { Siklus } from '@domainTypes/index';

interface TabSiklusProps {
  siklusList: Siklus[];
  onOpenModal: () => void;
  onCloseSiklus: (id: string) => void;
  onViewPaspor: (siklusId: string) => void;
}

export function TabSiklus({ siklusList, onOpenModal, onCloseSiklus, onViewPaspor }: TabSiklusProps) {
  return (
    <Card>
      <CardHeader>
        <div className="card-header-flex">
          <span>Daftar Siklus Budidaya Aktif & Riwayat</span>
          <Button size="sm" variant="primary" onClick={onOpenModal}>
            <PlusCircle size={14} style={{ marginRight: '4px' }} /> Buka Siklus Baru
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        <DataTable
          columns={[
            { key: 'kodeBatch', header: 'KODE SIKLUS', render: (v) => <strong><span className="font-mono">{v}</span></strong> },
            { key: 'tglMulai', header: 'TGL MULAI', render: (v) => <span className="font-mono">{new Date(v).toLocaleDateString('id-ID')}</span> },
            { key: 'status', header: 'STATUS', render: (v) => (
              <Badge status={v === 'aktif' || v === 'setup' ? 'normal' : v === 'panen' ? 'waspada' : 'netral'}>
                {v.toUpperCase()}
              </Badge>
            )},
            { key: 'srFinal', header: 'SR FINAL', render: (v) => <span className="font-mono">{v ? `${v}%` : '-'}</span> },
            {
              key: 'action',
              header: 'AKSI & TRACEABILITY',
              render: (_, row: Siklus) => (
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <Button size="sm" variant="secondary" onClick={() => onViewPaspor(row.id)} title="Lihat Paspor Batch & Rantai Ketelusuran">
                    <FileText size={13} style={{ marginRight: '4px' }} /> Paspor
                  </Button>
                  {(row.status === 'aktif' || row.status === 'setup') && (
                    <Button size="sm" variant="danger" onClick={() => onCloseSiklus(row.id)}>
                      Tutup
                    </Button>
                  )}
                </div>
              )
            }
          ]}
          data={siklusList}
        />
      </CardBody>
    </Card>
  );
}


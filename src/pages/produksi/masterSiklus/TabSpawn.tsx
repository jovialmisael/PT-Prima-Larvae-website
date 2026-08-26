import { Card, CardHeader, CardBody } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { DataTable } from '@components/ui/DataTable';
import { PlusCircle } from 'lucide-react';
import type { Spawn } from '@domainTypes/index';

interface TabSpawnProps {
  spawnList: Spawn[];
  onOpenModal: () => void;
}

export function TabSpawn({ spawnList, onOpenModal }: TabSpawnProps) {
  return (
    <Card>
      <CardHeader>
        <div className="card-header-flex">
          <span>Performa Pemijahan & Mutu Nauplii (PDF §01)</span>
          <Button size="sm" variant="primary" onClick={onOpenModal}>
            <PlusCircle size={14} style={{ marginRight: '4px' }} /> Catat Pemijahan
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        <DataTable
          columns={[
            { key: 'tanggal', header: 'TANGGAL', render: (v) => <span className="font-mono">{new Date(v).toLocaleDateString('id-ID')}</span> },
            { key: 'indukId', header: 'BATCH INDUK', render: (v) => <span className="font-mono">{v}</span> },
            { key: 'fekunditas', header: 'FEKUNDITAS', render: (v) => <span className="font-mono">{v ? Number(v).toLocaleString() : '—'} Butir</span> },
            { key: 'fertilizationRate', header: 'FERTILIZATION', render: (v) => <span className="font-mono">{v ? `${v}%` : '—'}</span> },
            { key: 'hatchingRate', header: 'HATCHING', render: (v) => <span className="font-mono">{v ? `${v}%` : '—'}</span> },
            { key: 'jumlahNauplii', header: 'JUMLAH NAUPLII', render: (v) => <span className="font-mono">{v ? Number(v).toLocaleString() : '—'} Ekor</span> },
            {
              key: 'keaktifan',
              header: 'MUTU NAUPLII',
              render: (_, row: Spawn) => (
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <Badge status={row.keaktifan === 'aktif' ? 'normal' : row.keaktifan === 'sedang' ? 'waspada' : 'bahaya'}>
                    {(row.keaktifan || 'aktif').toUpperCase()}
                  </Badge>
                  {row.responFototaksis && (
                    <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>
                      ({row.responFototaksis})
                    </span>
                  )}
                </div>
              )
            }
          ]}
          data={spawnList}
        />
      </CardBody>
    </Card>
  );
}



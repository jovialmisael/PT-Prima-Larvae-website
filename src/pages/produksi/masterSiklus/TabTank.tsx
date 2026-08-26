import { Card, CardHeader, CardBody } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { DataTable } from '@components/ui/DataTable';
import { PlusCircle } from 'lucide-react';
import type { Tank } from '@domainTypes/index';

interface TabTankProps {
  tankList: Tank[];
  onOpenModal: () => void;
}

export function TabTank({ tankList, onOpenModal }: TabTankProps) {
  return (
    <Card>
      <CardHeader>
        <div className="card-header-flex">
          <span>Master Bak & Wadah Hatchery</span>
          <Button size="sm" variant="primary" onClick={onOpenModal}>
            <PlusCircle size={14} style={{ marginRight: '4px' }} /> Tambah Bak
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        <DataTable
          columns={[
            { key: 'namaTank', header: 'NAMA BAK', render: (v) => <strong><span className="font-mono">{v}</span></strong> },
            { key: 'ruangStadia', header: 'RUANG STADIA', render: (v) => <span className="font-mono">{String(v).toUpperCase()}</span> },
            { key: 'lokasi', header: 'LOKASI' },
            { key: 'kapasitas', header: 'KAPASITAS', render: (v) => <span className="font-mono">{Number(v).toLocaleString()} L</span> },
            { key: 'status', header: 'STATUS', render: (v) => (
              <Badge status={v === 'aktif' ? 'normal' : 'netral'}>
                {v.toUpperCase()}
              </Badge>
            )}
          ]}
          data={tankList}
        />
      </CardBody>
    </Card>
  );
}

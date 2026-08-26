import { Card, CardHeader, CardBody } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { DataTable } from '@components/ui/DataTable';
import { PlusCircle } from 'lucide-react';
import type { Induk } from '@domainTypes/index';

interface TabIndukProps {
  indukList: Induk[];
  onOpenModal: () => void;
  onAfkir?: (id: string) => void;
}

export function TabInduk({ indukList, onOpenModal }: TabIndukProps) {
  return (
    <Card>
      <CardHeader>
        <div className="card-header-flex">
          <span>Master Batch Induk Udang (PDF §01)</span>
          <Button size="sm" variant="primary" onClick={onOpenModal}>
            <PlusCircle size={14} style={{ marginRight: '4px' }} /> Tambah Batch Induk
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        <DataTable
          columns={[
            { key: 'kodeBatch', header: 'KODE BATCH', render: (v) => <strong><span className="font-mono">{v}</span></strong> },
            { key: 'tglKedatangan', header: 'TGL KEDATANGAN', render: (v) => <span className="font-mono">{new Date(v).toLocaleDateString('id-ID')}</span> },
            { key: 'umur', header: 'UMUR', render: (v) => <span className="font-mono">{v} Hari</span> },
            { key: 'berat', header: 'BERAT', render: (v) => <span className="font-mono">{v} g</span> }
          ]}
          data={indukList}
        />
      </CardBody>
    </Card>
  );
}


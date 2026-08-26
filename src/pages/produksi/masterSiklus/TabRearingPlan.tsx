import { Card, CardHeader, CardBody } from '@components/ui/Card';
import { DataTable } from '@components/ui/DataTable';
import type { RearingPlan } from '@domainTypes/index';

interface TabRearingPlanProps {
  planList: RearingPlan[];
}

export function TabRearingPlan({ planList }: TabRearingPlanProps) {
  return (
    <Card>
      <CardHeader>
        <div className="card-header-flex">
          <span>Standar Rearing Plan SOP (N5 s/d PL10)</span>
          <span className="count-badge font-mono">{planList.length} Stadia Ditetapkan</span>
        </div>
      </CardHeader>
      <CardBody>
        <DataTable
          columns={[
            { key: 'stadia', header: 'STADIA', render: (v) => <strong><span className="font-mono">{v}</span></strong> },
            { key: 'doc', header: 'DOC', render: (v) => <span className="font-mono">{v}</span> },
            { key: 'targetSuhu', header: 'TARGET SUHU', render: (v) => <span className="font-mono">{v}°C</span> },
            { key: 'algaeTH', header: 'TH (sel/mL)', render: (v) => <span className="font-mono">{Number(v).toLocaleString()}</span> },
            { key: 'algaeCH', header: 'CH (sel/mL)', render: (v) => <span className="font-mono">{Number(v).toLocaleString()}</span> },
            { key: 'exchange', header: 'WATER EX. (%)', render: (v) => <span className="font-mono">{v}%</span> },
            { key: 'probiotikSchedule', header: 'JADWAL PROBIOTIK', render: (v) => <span className="font-mono">{v}</span> }
          ]}
          data={planList}
        />
      </CardBody>
    </Card>
  );
}

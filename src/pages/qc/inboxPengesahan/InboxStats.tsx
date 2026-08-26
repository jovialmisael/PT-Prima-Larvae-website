import { Card, CardBody } from '@components/ui/Card';

interface InboxStatsProps {
  pendingQcCount: number;
  pendingSahkanCount: number;
  disahkanCount: number;
  ditolakCount: number;
}

export function InboxStats({
  pendingQcCount,
  pendingSahkanCount,
  disahkanCount,
  ditolakCount,
}: InboxStatsProps) {
  return (
    <div className="inbox-stats-grid">
      <Card>
        <CardBody>
          <div className="metric-sub">MENUNGGU VERIFIKASI QC</div>
          <div className="metric-large font-mono" style={{ color: 'var(--status-waspada)', margin: 'var(--space-1) 0' }}>
            {pendingQcCount}
          </div>
          <div className="metric-sub">Verifikasi parameter biologis & SOP</div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="metric-sub">MENUNGGU PENGESAHAN KEPALA</div>
          <div className="metric-large font-mono" style={{ color: 'var(--primary)', margin: 'var(--space-1) 0' }}>
            {pendingSahkanCount}
          </div>
          <div className="metric-sub">Paraf & pengesahan Ka. Divisi</div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="metric-sub">TELAH DISAHKAN (HARI INI)</div>
          <div className="metric-large font-mono" style={{ color: 'var(--status-normal)', margin: 'var(--space-1) 0' }}>
            {disahkanCount}
          </div>
          <div className="metric-sub">Record valid & terkunci di log</div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="metric-sub">DITOLAK / PERLU REVISI</div>
          <div className="metric-large font-mono" style={{ color: 'var(--status-bahaya)', margin: 'var(--space-1) 0' }}>
            {ditolakCount}
          </div>
          <div className="metric-sub">Dikembalikan ke operator</div>
        </CardBody>
      </Card>
    </div>
  );
}

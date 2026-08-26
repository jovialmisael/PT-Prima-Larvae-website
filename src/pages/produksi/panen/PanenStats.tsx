import { Card, CardBody } from '@components/ui/Card';

interface PanenStatsProps {
  totalPl: number;      // total ekor pada seluruh panen yang tercatat
  readyCount: number;   // jumlah catatan panen
  readyPl: number;      // ekor pada catatan panen tsb
  totalKantong: number; // jumlah kantong pengiriman tercatat
}

export function PanenStats({ totalPl, readyCount, readyPl, totalKantong }: PanenStatsProps) {
  return (
    <div className="panen-stats-grid">
      <Card>
        <CardBody>
          <div className="metric-sub">TOTAL PL DIPANEN (TERCATAT)</div>
          <div className="metric-large font-mono" style={{ color: 'var(--primary)', margin: 'var(--space-1) 0' }}>
            {(totalPl / 1_000_000).toFixed(2)} <span style={{ fontSize: 'var(--text-base)', fontWeight: 400 }}>juta ekor</span>
          </div>
          <div className="metric-sub font-mono">≈ {totalPl.toLocaleString()} ekor benur PL</div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="metric-sub">CATATAN PANEN</div>
          <div className="metric-large font-mono" style={{ color: 'var(--status-normal)', margin: 'var(--space-1) 0' }}>
            {readyCount} <span style={{ fontSize: 'var(--text-base)', fontWeight: 400 }}>catatan (≈ {(readyPl / 1_000_000).toFixed(2)} juta PL)</span>
          </div>
          <div style={{ color: 'var(--status-normal)', fontSize: 'var(--text-xs)', fontWeight: 700 }}>
            Dari record panen yang sudah dicatat
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="metric-sub">KANTONG PENGIRIMAN</div>
          <div className="metric-large font-mono" style={{ color: 'var(--primary)', margin: 'var(--space-1) 0' }}>
            {totalKantong.toLocaleString('id-ID')}
          </div>
          <div className="metric-sub">Total kantong pada panen yang tercatat</div>
        </CardBody>
      </Card>
    </div>
  );
}

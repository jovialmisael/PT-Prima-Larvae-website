import { Card, CardBody } from '@components/ui/Card';
import { Activity, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Alert } from '@domainTypes/index';

interface AlertCenterStatsProps {
  alerts: Alert[];
}

type StatItem = {
  variant: 'total' | 'bahaya' | 'waspada' | 'normal';
  icon: LucideIcon;
  label: string;
  value: number;
  caption: string;
};

export function AlertCenterStats({ alerts }: AlertCenterStatsProps) {
  const stats: StatItem[] = [
    { variant: 'total', icon: Activity, label: 'Total Alert Aktif', value: alerts.filter(a => a.status === 'aktif').length, caption: 'Insiden butuh penanganan' },
    { variant: 'bahaya', icon: ShieldAlert, label: 'Bahaya (Kritis)', value: alerts.filter(a => a.status !== 'selesai' && a.tingkat === 'bahaya').length, caption: 'Ambang batas kritis terlewati' },
    { variant: 'waspada', icon: AlertTriangle, label: 'Waspada (Perhatian)', value: alerts.filter(a => a.status !== 'selesai' && a.tingkat === 'waspada').length, caption: 'Perlu pemantauan intensif' },
    { variant: 'normal', icon: CheckCircle2, label: 'Selesai / Dimitigasi', value: alerts.filter(a => a.status === 'selesai').length, caption: 'Tindakan SOP teratasi' },
  ];

  return (
    <div className="alert-stats-grid">
      {stats.map(({ variant, icon: Icon, label, value, caption }) => (
        <Card key={variant}>
          <CardBody>
            <div className={`alert-stat-row is-${variant}`}>
              <div className="alert-stat-icon"><Icon size={18} /></div>
              <div>
                <div className="metric-sub">{label}</div>
                <div className="metric-large font-mono alert-stat-num">{value}</div>
                <div className="metric-sub">{caption}</div>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

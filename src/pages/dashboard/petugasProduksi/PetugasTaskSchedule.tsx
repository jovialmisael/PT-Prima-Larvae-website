import { CheckCircle2, AlertTriangle, Circle } from 'lucide-react';

export type TugasStatus = 'selesai' | 'perhatian' | 'pending';

export interface TugasItem {
  id: string;
  waktu: string;   // "08:00"
  bak: string;     // "B-01"
  jenis: string;   // "Observasi Harian"
  status: TugasStatus;
  suhu?: number;
  amonia?: number;
}

const STATUS_META: Record<TugasStatus, { icon: typeof Circle; label: string }> = {
  selesai: { icon: CheckCircle2, label: 'Selesai' },
  perhatian: { icon: AlertTriangle, label: 'Perhatian' },
  pending: { icon: Circle, label: 'Pending' },
};

interface PetugasTaskScheduleProps {
  tasks: TugasItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function PetugasTaskSchedule({ tasks, selectedId, onSelect }: PetugasTaskScheduleProps) {
  return (
    <div className="tugas-timeline">
      {tasks.map(t => {
        const meta = STATUS_META[t.status];
        const Icon = meta.icon;
        return (
          <button
            key={t.id}
            type="button"
            className={`tugas-row ${t.status} ${selectedId === t.id ? 'active' : ''}`}
            onClick={() => onSelect(t.id)}
          >
            <span className="tugas-waktu font-mono">{t.waktu}</span>
            <span className="tugas-bak font-mono">{t.bak}</span>
            <span className="tugas-jenis">{t.jenis}</span>
            <span className={`tugas-status tugas-status--${t.status}`}>
              <Icon size={16} /> {meta.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

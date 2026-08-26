import { ReactNode } from 'react';

interface PasporTimelineStageProps {
  stageNumber: number;
  icon: ReactNode;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  children: ReactNode;
}

export function PasporTimelineStage({
  stageNumber,
  icon,
  title,
  subtitle,
  badge,
  children,
}: PasporTimelineStageProps) {
  return (
    <div className="timeline-stage-card">
      <div className="stage-num-badge">
        {icon}
        <span style={{ fontSize: 'var(--text-2xs)', fontWeight: 800 }}>§0{stageNumber}</span>
      </div>
      <div className="stage-body">
        <div className="stage-head-row">
          <div>
            <h4 className="stage-title">{title}</h4>
            {subtitle && (
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                {subtitle}
              </span>
            )}
          </div>
          {badge && <div>{badge}</div>}
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

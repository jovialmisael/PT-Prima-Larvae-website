import './ui.css';

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
}

export function Skeleton({ width = '100%', height = '20px', className = '' }: SkeletonProps) {
  return (
    <div 
      className={`skeleton-loader ${className}`} 
      style={{ width, height }}
    />
  );
}

export function SkeletonTable({ rows = 3, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="data-table-container">
      <table className="table-dense">
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i}><Skeleton width="80px" height="16px" /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c}><Skeleton width="100%" height="16px" /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

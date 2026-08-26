import { HTMLAttributes, ReactNode } from 'react';
import './ui.css';

interface ColumnDef {
  key: string;
  header: string;
  render?: (value: any, row: any) => ReactNode;
}

interface DataTableProps extends HTMLAttributes<HTMLDivElement> {
  columns: ColumnDef[];
  data: any[];
}

export function DataTable({ columns, data, className = '', ...props }: DataTableProps) {
  return (
    <div className={`data-table-container ${className}`} {...props}>
      <table className="table-dense">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                <span className="empty-state-text">NO DATA SIGNAL</span>
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={i}>
                {columns.map(col => (
                  <td key={col.key}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

import { HTMLAttributes, ReactNode, CSSProperties } from 'react';
import './ui.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`ui-card ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <div className={`ui-card-header ${className}`} style={style}>{children}</div>;
}

export function CardBody({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <div className={`ui-card-body ${className}`} style={style}>{children}</div>;
}

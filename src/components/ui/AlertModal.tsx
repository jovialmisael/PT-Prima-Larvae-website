import { ReactNode } from 'react';
import './ui.css';

interface AlertModalProps {
  isOpen: boolean;
  title: string;
  type?: 'warning' | 'danger' | 'info';
  children: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function AlertModal({ 
  isOpen, 
  title, 
  type = 'warning', 
  children, 
  onConfirm, 
  onCancel,
  confirmLabel = 'CONFIRM',
  cancelLabel = 'CANCEL'
}: AlertModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className={`modal-content modal-${type}`}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
        </div>
        <div className="modal-body">
          {children}
        </div>
        <div className="modal-footer">
          <button className="ui-btn ui-btn-ghost" onClick={onCancel}>{cancelLabel}</button>
          <button className={`ui-btn ui-btn-${type === 'danger' ? 'danger' : 'primary'}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

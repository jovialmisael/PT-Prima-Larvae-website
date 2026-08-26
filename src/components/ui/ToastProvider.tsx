import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Undo2 } from 'lucide-react';
import './toast.css';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  onUndo?: () => void;
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info', onUndo?: () => void) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success', onUndo?: () => void) => {
    const id = Date.now().toString() + Math.random().toString();
    const newToast: Toast = { id, type, message, onUndo };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, onUndo ? 6000 : 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" role="region" aria-label="Notifikasi Sistem">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card toast-card--${t.type}`}>
            <div className="toast-icon">
              {t.type === 'success' && <CheckCircle2 size={16} />}
              {t.type === 'error' && <AlertCircle size={16} />}
              {t.type === 'info' && <Info size={16} />}
            </div>
            <span className="toast-msg">{t.message}</span>

            {t.onUndo && (
              <button 
                className="toast-undo-btn" 
                onClick={() => { t.onUndo?.(); removeToast(t.id); }}
              >
                <Undo2 size={13} />
                <span>Batalkan</span>
              </button>
            )}

            <button className="toast-close-btn" onClick={() => removeToast(t.id)}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return { showToast: (msg: string) => alert(msg) };
  }
  return ctx;
}

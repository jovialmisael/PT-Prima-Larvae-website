import { useState } from 'react';
import { Category } from '@domainTypes/index';
import { SECTION_LABELS } from '@utils/schema';
import { SchemaForm } from '@components/ui/SchemaForm';
import type { FormSection } from '@components/ui/SchemaFormSection';
import { ArrowLeft, Clock, QrCode } from 'lucide-react';
import { DataEntryQrModal } from './DataEntryQrModal';

interface FormPanelProps {
  active: Category;
  errorMsg: string | null;
  submitting: boolean;
  formKey: number;
  draftKey?: string;
  onBack: () => void;
  onSubmit: (data: Record<string, any>) => void;
  standalone?: boolean;
  /** Bila diisi: field dirender per formulir asal, bukan satu grid datar. */
  sections?: FormSection[];
}

/** Tampilan pengisian: breadcrumb kembali + form schema-driven full page. */
export function FormPanel({ active, errorMsg, submitting, formKey, draftKey, onBack, onSubmit, standalone = true, sections }: FormPanelProps) {
  const [showQrModal, setShowQrModal] = useState(false);

  const handleScanCode = (code: string) => {
    // Look for tank/batch inputs in form and auto-fill
    const targetInput = document.querySelector<HTMLInputElement>('input[name="bakId"], input[name="bakPl"], input[name="kodeBatch"], input[name$="__bakId"], input[name$="__bakPl"]');
    if (targetInput) {
      targetInput.value = code;
      targetInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  return (
    <>
      <DataEntryQrModal 
        isOpen={showQrModal} 
        onClose={() => setShowQrModal(false)} 
        onScan={handleScanCode} 
      />

      {standalone && (
        <header className="entry-form-header-bar">
          <button type="button" className="entry-back-btn" onClick={onBack}>
            <ArrowLeft size={16} />
            <span>Kembali ke Daftar Form</span>
          </button>

          <div className="entry-form-title-group">
            <div className="entry-form-meta-badges">
              {active.section && <span className="entry-pill-group">{SECTION_LABELS[active.section]}</span>}
              {active.frekuensi && (
                <span className="entry-pill-freq">
                  <Clock size={12} />
                  {active.frekuensi}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
              <h1 className="entry-form-active-title" style={{ margin: 0 }}>{active.title}</h1>
              <button 
                type="button" 
                className="entry-back-btn" 
                style={{ borderColor: 'var(--primary-border)', color: 'var(--primary)', background: 'var(--primary-faded)' }}
                onClick={() => setShowQrModal(true)}
                title="Pindai QR Code Bak/Batch"
              >
                <QrCode size={16} />
                <span>Scan QR Bak</span>
              </button>
            </div>
          </div>
        </header>
      )}


      <div className="entry-page-panel">
        {errorMsg && (
          <div className="entry-feedback is-error" role="alert">
            <div className="entry-feedback-icon-box">!</div>
            <div className="entry-feedback-content">
              <strong>Harap lengkapi isian wajib:</strong>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        <SchemaForm
          key={formKey}
          fields={active.fields}
          onSubmitData={onSubmit}
          submitLabel="Simpan sebagai Draft"
          submitting={submitting}
          draftKey={draftKey}
          division={active.division}
          sections={sections}
        />
      </div>
    </>
  );
}

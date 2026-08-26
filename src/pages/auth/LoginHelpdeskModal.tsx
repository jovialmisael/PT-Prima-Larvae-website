interface LoginHelpdeskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginHelpdeskModal({ isOpen, onClose }: LoginHelpdeskModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="helpdesk-modal">
        <h3 className="modal-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
          </svg>
          Bantuan Akses & Reset Password
        </h3>
        <p className="modal-description">
          Sesuai kebijakan keamanan operasional PT Prima Larvae, pemulihan kata sandi harus diproses melalui Tim Helpdesk Administrator IT Hatchery.
        </p>
        
        <div className="contact-info-box">
          <div className="contact-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span><strong>Hotline IT Helpdesk:</strong> Ext. 104 / 105</span>
          </div>
          <div className="contact-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            <span><strong>WhatsApp Support:</strong> +62 812-3456-7890</span>
          </div>
          <div className="contact-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span><strong>Email IT Ops:</strong> <code style={{ color: '#2563eb' }}>helpdesk.it@primalarvae.co.id</code></span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="btn-close-modal"
        >
          Tutup Bantuan
        </button>
      </div>
    </div>
  );
}

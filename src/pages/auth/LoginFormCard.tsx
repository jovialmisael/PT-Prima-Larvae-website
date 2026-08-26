import type { FormEvent } from 'react';
import type { RolePreset } from './loginPresets';
import { LoginRolePresets } from './LoginRolePresets';

interface LoginFormCardProps {
  username: string;
  setUsername: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  rememberMe: boolean;
  setRememberMe: (val: boolean) => void;
  showPassword: boolean;
  toggleShowPassword: () => void;
  errorMsg: string | null;
  isLoading: boolean;
  onOpenHelpdesk: () => void;
  onSubmit: (e: FormEvent) => void;
  presets: RolePreset[];
  onSelectRole: (username: string) => void;
}

export function LoginFormCard({
  username,
  setUsername,
  password,
  setPassword,
  rememberMe,
  setRememberMe,
  showPassword,
  toggleShowPassword,
  errorMsg,
  isLoading,
  onOpenHelpdesk,
  onSubmit,
  presets,
  onSelectRole,
}: LoginFormCardProps) {
  return (
    <div className="login-form-panel">
      {/* Desktop Header Branding */}
      <div className="panel-header">
        <div className="brand-wrapper">
          <div className="brand-icon-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12c.5-2-1-4.5-3.5-5.5a7 7 0 0 0-7.5 1.5C6 10 5 13 6.5 15.5c1 1.7 3 2.5 5 2.5 3 0 5-1.5 6-3.5" />
              <path d="M14 6.5c1-1.5 3-2.5 5-2" />
              <path d="M16 9c1.5-.5 3.5-.5 4.5.5" />
              <circle cx="16" cy="8.5" r="0.75" fill="var(--primary)" />
              <path d="M3 19.5c2 0 3-1 5-1s3 1 5 1 3-1 5-1 3 1 4 1" strokeWidth="1.6" strokeOpacity="0.7" />
            </svg>
          </div>

          <div>
            <h1 className="brand-title">PT Prima Larvae</h1>
            <p className="brand-subtitle">Hatchery Operating System</p>
          </div>
        </div>

        <div className="server-status-pill">
          <span className="status-dot" />
          ONLINE
        </div>
      </div>

      {/* Form Content Body */}
      <div className="form-content">
        <h2 className="form-title">Masuk ke Portal</h2>
        <p className="form-description">
          Masukkan NIP atau Username operasional Anda untuk mengakses sistem.
        </p>

        {errorMsg && (
          <div className="error-alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label-row">
              <span>USERNAME / NIP PEGAWAI</span>
            </label>
            <div className="input-container">
              <svg className="input-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Contoh: manager / petugas.produksi"
                required
                autoFocus
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <span>KATA SANDI (PASSWORD)</span>
              <button
                type="button"
                onClick={onOpenHelpdesk}
                className="forgot-link"
              >
                Lupa kata sandi?
              </button>
            </div>
            <div className="input-container">
              <svg className="input-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                required
                className="form-input"
              />
              <button
                type="button"
                onClick={toggleShowPassword}
                className="toggle-password-btn"
                title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="remember-row">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="checkbox-input"
            />
            <label htmlFor="rememberMe" className="checkbox-label">
              Simpan sesi masuk di perangkat ini
            </label>
          </div>

          <button type="submit" disabled={isLoading} className="btn-submit">
            {isLoading ? (
              <span>Memverifikasi Kredensial...</span>
            ) : (
              <>
                <span>Masuk ke Portal Operasional</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>
        </form>

        <LoginRolePresets
          presets={presets}
          activeUsername={username}
          onSelectRole={onSelectRole}
        />
      </div>

      {/* Left Panel Footer */}
      <div className="panel-footer">
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Enkripsi End-to-End SSL/TLS
        </span>
        <span>© 2026 PT Prima Larvae Bali</span>
      </div>
    </div>
  );
}

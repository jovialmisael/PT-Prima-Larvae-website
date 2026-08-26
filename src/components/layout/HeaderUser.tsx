import { useCallback, useEffect, useRef, useState } from 'react';
import { LogOut, ChevronDown } from 'lucide-react';
import { currentUser, currentRole, currentArea, logout } from '@services/session';
import { initials } from './headerConfig';

export function HeaderUser() {
  const user = currentUser();
  const role = currentRole();
  const area = currentArea();

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const toggle = useCallback(() => setOpen(o => !o), []);
  const handleLogout = useCallback(() => {
    logout();
    window.location.href = '/login';
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  return (
    <div className="header-user" ref={ref}>
      <button className="header-user-btn" onClick={toggle} aria-expanded={open}>
        <div className="header-avatar">{initials(user ? user.username : '?')}</div>
        <div className="header-user-meta">
          <span className="header-user-name">{user ? user.username : 'Belum Login'}</span>
          <span className="header-user-role">
            {role?.title ?? 'Tamu'}
            {area && <span className="header-area-badge">{area.toUpperCase()}</span>}
          </span>
        </div>
        <ChevronDown size={16} className="header-user-caret" />
      </button>

      {open && (
        <div className="header-menu" role="menu">
          <button className="header-menu-item danger" onClick={handleLogout} role="menuitem">
            <LogOut size={16} /> Keluar
          </button>
        </div>
      )}
    </div>
  );
}

import { Link, useLocation } from 'react-router-dom';
import { currentRole, currentArea } from '@services/session';
import { X } from 'lucide-react';
import { getNavGroups } from './sidebarNav';
import { SidebarCollapsible } from './SidebarCollapsible';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Sidebar = navigasi murni; identitas/akun (nama, role, Keluar) ada di header.
export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const role = currentRole();
  const area = currentArea();

  const groups = getNavGroups(role, area);

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
    const active = location.pathname === to;
    return (
      <Link to={to} className={`nav-item ${active ? 'active' : ''}`} onClick={onClose}>
        <Icon size={18} />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="sidebar-brand-icon" style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary-faded)',
              border: '1px solid var(--primary-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12c.5-2-1-4.5-3.5-5.5a7 7 0 0 0-7.5 1.5C6 10 5 13 6.5 15.5c1 1.7 3 2.5 5 2.5 3 0 5-1.5 6-3.5" />
                <path d="M14 6.5c1-1.5 3-2.5 5-2" />
                <path d="M16 9c1.5-.5 3.5-.5 4.5.5" />
                <circle cx="16" cy="8.5" r="0.75" fill="var(--primary)" />
                <path d="M3 19.5c2 0 3-1 5-1s3 1 5 1 3-1 5-1 3 1 4 1" strokeWidth="1.6" strokeOpacity="0.7" />
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.2, color: 'var(--text-heading)' }}>
                Prima Larvae
              </h2>
              <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Hatchery System
              </span>
            </div>
          </div>

          <button className="sidebar-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>


        <nav className="sidebar-nav">
          {groups.map(group => (
            <div className="nav-group" key={group.title}>
              <span className="nav-group-title">{group.title}</span>
              {group.items.map(item => (
                item.children && item.children.length > 0 ? (
                  <SidebarCollapsible key={item.to + item.label} item={item} onClose={onClose} />
                ) : (
                  <NavItem key={item.to + item.label} to={item.to} icon={item.icon} label={item.label} />
                )
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { NavLink } from './sidebarNav';

interface SidebarCollapsibleProps {
  item: NavLink;
  onClose: () => void;
}

export function SidebarCollapsible({ item, onClose }: SidebarCollapsibleProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isParentActive = location.pathname === item.to;
  const [isOpen, setIsOpen] = useState(() => isParentActive);

  // Auto-expand jika route aktif berada di /input-produksi
  useEffect(() => {
    if (isParentActive) {
      setIsOpen(true);
    }
  }, [isParentActive]);

  const searchParams = new URLSearchParams(location.search);
  const activeCategory = searchParams.get('category');
  const activeSection = searchParams.get('section');

  const handleHeaderClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isOpen) {
      setIsOpen(true);
      // Langsung buka bagian pertama (mis. §01 Induk & Pemijahan), skip katalog perantara.
      const target = item.children?.[0]?.to ?? item.to;
      if (location.pathname + location.search !== target) {
        navigate(target);
      }
    } else {
      setIsOpen(false);
    }
  };

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(prev => !prev);
  };

  return (
    <div className="nav-collapsible">
      <div
        className={`nav-collapsible-header ${isParentActive ? 'active' : ''}`}
        onClick={handleHeaderClick}
        role="button"
        tabIndex={0}
      >
        <div className="nav-collapsible-left">
          <item.icon size={18} />
          <span>{item.label}</span>
        </div>
        <button
          type="button"
          className="nav-chevron"
          onClick={handleChevronClick}
          aria-label={isOpen ? 'Tutup sub-menu' : 'Buka sub-menu'}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {isOpen && item.children && (
        <div className="nav-submenu">
          {item.children.map((child) => {
            const isChildActive = isParentActive && (
              (child.section != null && activeSection === child.section) ||
              (activeCategory != null && activeCategory === child.categoryId)
            );
            return (
              <Link
                key={child.to}
                to={child.to}
                className={`nav-subitem ${isChildActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <span className="nav-subitem-bullet">{isChildActive ? '●' : '○'}</span>
                <span>{child.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

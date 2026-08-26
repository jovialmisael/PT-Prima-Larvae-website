import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import { scanAlerts } from '@services/alerts';
import { pageMeta } from './headerConfig';
import { HeaderSearch } from './HeaderSearch';
import { HeaderBatchChip } from './HeaderBatchChip';
import { HeaderUtility } from './HeaderUtility';
import { HeaderUser } from './HeaderUser';
import './header.css';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation();

  const meta = pageMeta(location.pathname);

  // Jumlah alert dihitung dari record tersimpan — dimuat asinkron tiap pindah halaman.
  const [alertCount, setAlertCount] = useState(0);
  useEffect(() => {
    let aktif = true;
    scanAlerts().then(a => { if (aktif) setAlertCount(a.length); });
    return () => { aktif = false; };
  }, [location.pathname]);

  return (
    <header className="app-header">
      {/* Zona kiri: menu + judul + chip batch */}
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuClick} aria-label="Buka menu">
          <Menu size={24} />
        </button>
        <div className="header-title">
          <h1 className="header-page-title">{meta.title}</h1>
        </div>
        <HeaderBatchChip />
      </div>


      {/* Zona tengah: pencarian */}
      <div className="header-center">
        <HeaderSearch />
      </div>

      {/* Zona kanan: utilitas + lonceng + user */}
      <div className="header-right">
        <HeaderUtility />

        <Link to="/alert-center" className="header-icon-btn header-bell" aria-label="Pusat Alert" title="Notifikasi">
          <Bell size={20} />
          {alertCount > 0 && <span className="header-bell-badge">{alertCount}</span>}
        </Link>

        <HeaderUser />
      </div>
    </header>
  );
}

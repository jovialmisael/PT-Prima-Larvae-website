import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { currentUser } from '@services/session';

// Layout
import { AppLayout } from '@components/layout/AppLayout';

// Modular Pages
import { Login } from '@pages/auth/Login';
import { Dashboard } from '@pages/dashboard/Dashboard';
import { InputProduksi } from '@pages/produksi/inputProduksi';
import { InputLab } from '@pages/lab/inputLab';
import { AlertCenter } from '@pages/alerts/alertCenter';
import { Panen } from '@pages/produksi/panen';
import { Laporan } from '@pages/laporan/laporan';
import { MasterSiklus } from '@pages/produksi/masterSiklus';
import { InboxPengesahan } from '@pages/qc/inboxPengesahan';
import { BakuMutuPage } from '@pages/mutu/bakuMutu';
import { JadwalBerkalaPage } from '@pages/mutu/jadwalBerkala';
import { TugasSaya } from '@pages/tugas/TugasSaya';
import { RiwayatLogbook } from '@pages/riwayat/RiwayatLogbook';
import { StatusBak } from '@pages/siklus/StatusBak';
import { SiklusBerjalan } from '@pages/siklus/SiklusBerjalan';
import { StandarMutuLab } from '@pages/lab/StandarMutuLab';
import { AsistenAI } from '@pages/asisten/AsistenAI';
import { ToastProvider } from '@components/ui/ToastProvider';
import './styles/print.css';


function PrivateRoute({ children }: { children: React.ReactNode }) {
  const user = currentUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

export function App() {

  return (
    <ToastProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/tugas-saya" element={<PrivateRoute><TugasSaya /></PrivateRoute>} />
          <Route path="/input-produksi" element={<PrivateRoute><InputProduksi /></PrivateRoute>} />
          <Route path="/input-lab" element={<PrivateRoute><InputLab /></PrivateRoute>} />
          <Route path="/riwayat" element={<PrivateRoute><RiwayatLogbook mode="produksi" /></PrivateRoute>} />
          <Route path="/lab-riwayat" element={<PrivateRoute><RiwayatLogbook mode="lab" /></PrivateRoute>} />
          <Route path="/status-bak" element={<PrivateRoute><StatusBak /></PrivateRoute>} />
          <Route path="/siklus-berjalan" element={<PrivateRoute><SiklusBerjalan /></PrivateRoute>} />
          <Route path="/lab-standar" element={<PrivateRoute><StandarMutuLab /></PrivateRoute>} />
          <Route path="/asisten-ai" element={<PrivateRoute><AsistenAI /></PrivateRoute>} />
          <Route path="/master-siklus" element={<PrivateRoute><MasterSiklus /></PrivateRoute>} />
          <Route path="/panen" element={<PrivateRoute><Panen /></PrivateRoute>} />
          <Route path="/inbox-pengesahan" element={<PrivateRoute><InboxPengesahan /></PrivateRoute>} />
          <Route path="/alert-center" element={<PrivateRoute><AlertCenter /></PrivateRoute>} />
          <Route path="/baku-mutu" element={<PrivateRoute><BakuMutuPage /></PrivateRoute>} />
          <Route path="/jadwal-berkala" element={<PrivateRoute><JadwalBerkalaPage /></PrivateRoute>} />
          <Route path="/laporan" element={<PrivateRoute><Laporan /></PrivateRoute>} />
          
          {/* Fallback for undefined routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </ToastProvider>
  );
}


export default App;


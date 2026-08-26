import { useState, useMemo, useEffect, useCallback } from 'react';
import { currentUser } from '@services/session';
import { getAllAlerts, acknowledgeAlert, resolveAlert, type ResolusiAlertPayload } from '@services/alerts';
import type { Alert } from '@domainTypes/index';
import { AlertCenterStats } from './AlertCenterStats';
import { AlertCenterFilters } from './AlertCenterFilters';
import { AlertItemCard } from './AlertItemCard';
import { ModalMitigasiAlert } from './ModalMitigasiAlert';
import { ShieldCheck } from 'lucide-react';
import './alertCenter.css';

export function AlertCenter() {
  const user = currentUser();
  // Alert diturunkan dari record tersimpan, jadi pemuatannya asinkron.
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTingkat, setSelectedTingkat] = useState('semua');
  const [selectedStatus, setSelectedStatus] = useState('semua');
  const [mitigasiTarget, setMitigasiTarget] = useState<Alert | null>(null);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      const matchSearch =
        searchQuery === '' ||
        a.parameter.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.tankId && a.tankId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        a.pesan.toLowerCase().includes(searchQuery.toLowerCase());

      const matchTingkat = selectedTingkat === 'semua' || a.tingkat === selectedTingkat;
      const matchStatus = selectedStatus === 'semua' || a.status === selectedStatus;

      return matchSearch && matchTingkat && matchStatus;
    });
  }, [alerts, searchQuery, selectedTingkat, selectedStatus]);

  const muat = useCallback(async (tampilkanLoading = true) => {
    if (tampilkanLoading) setMemuat(true);
    try {
      setAlerts(await getAllAlerts());
    } finally {
      if (tampilkanLoading) setMemuat(false);
    }
  }, []);

  useEffect(() => { void muat(true); }, [muat]);

  const handleAcknowledge = async (id: string) => {
    await acknowledgeAlert(id, user?.username || 'operator');
    await muat(false); // Background update: cegah scroll jump ke atas page
  };

  const handleResolveSubmit = async (id: string, payload: ResolusiAlertPayload) => {
    await resolveAlert(id, payload);
    await muat(false); // Background update: cegah scroll jump ke atas page
  };

  return (
    <div className="alert-center-container">
      {/* Page Header */}
      <div className="dash-header">
        <div>
          <div className="tier-tag">PUSAT PEMANTAUAN & MITIGASI ANOMALI</div>
          <h1 className="dash-title">Pusat Alert & Peringatan Dini</h1>
          <p className="dash-subtitle">
            Deteksi otomatis anomali kualitas air, mikrobiologi, dan ambang batas biologis benur.
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <AlertCenterStats alerts={alerts} />

      {/* Filters */}
      <AlertCenterFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedTingkat={selectedTingkat}
        setSelectedTingkat={setSelectedTingkat}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
      />

      {/* Alert List */}
      <div className="alert-list">
        {memuat ? (
          <div className="empty-alert-state">
            <p>Memuat peringatan dari data tersimpan...</p>
          </div>
        ) : filteredAlerts.length > 0 ? (
          filteredAlerts.map(alert => (
            <AlertItemCard
              key={alert.id}
              alert={alert}
              onAcknowledge={handleAcknowledge}
              onOpenMitigasi={(a) => setMitigasiTarget(a)}
            />
          ))
        ) : (
          <div className="empty-alert-state">
            <ShieldCheck size={32} color="var(--status-normal)" />
            <h3>{alerts.length === 0 ? 'Belum Ada Peringatan' : 'Semua Parameter Normal'}</h3>
            <p>
              {alerts.length === 0
                ? 'Peringatan muncul otomatis begitu ada nilai yang melewati ambang pada data yang dicatat.'
                : 'Tidak ada peringatan yang sesuai dengan kriteria filter saat ini.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal Bukti Mitigasi Alert (§12) */}
      <ModalMitigasiAlert
        alert={mitigasiTarget}
        isOpen={mitigasiTarget !== null}
        onClose={() => setMitigasiTarget(null)}
        onSubmit={handleResolveSubmit}
        currentUser={user?.username || 'operator'}
      />
    </div>
  );
}


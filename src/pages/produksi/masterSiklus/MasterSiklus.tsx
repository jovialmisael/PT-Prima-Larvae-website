import { useState, useEffect } from 'react';
import { list, create, createInduk, createSpawn, createSiklus, afkirInduk, closeSiklus, getRearingPlan } from '@services/api';
import type { Siklus, Induk, Spawn, Tank, RearingPlan } from '@domainTypes/index';
import { TabSiklus } from './TabSiklus';
import { TabInduk } from './TabInduk';
import { TabSpawn } from './TabSpawn';
import { TabTank } from './TabTank';
import { TabRearingPlan } from './TabRearingPlan';
import { MasterModals } from './MasterModals';
import { PasporSiklusModal } from './paspor/PasporSiklusModal';
import { Database, Fish, Egg, Box, BookOpen } from 'lucide-react';
import './masterSiklus.css';

export function MasterSiklus() {
  const [activeTab, setActiveTab] = useState<'siklus' | 'induk' | 'spawn' | 'tank' | 'sop'>('siklus');
  const [siklusList, setSiklusList] = useState<Siklus[]>([]);
  const [indukList, setIndukList] = useState<Induk[]>([]);
  const [spawnList, setSpawnList] = useState<Spawn[]>([]);
  const [tankList, setTankList] = useState<Tank[]>([]);
  const [planList, setPlanList] = useState<RearingPlan[]>([]);
  const [modalType, setModalType] = useState<'siklus' | 'induk' | 'spawn' | 'tank' | null>(null);
  const [pasporSiklusId, setPasporSiklusId] = useState<string | null>(null);


  const loadData = async () => {
    const s = await list('siklus');
    const i = await list('induk');
    const sp = await list('spawn');
    const t = await list('tank');
    const p = await getRearingPlan();
    setSiklusList(s || []);
    setIndukList(i || []);
    setSpawnList(sp || []);
    setTankList(t || []);
    setPlanList(p || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSiklus = async (data: { indukId: string; tglMulai: string }) => {
    await createSiklus(data);
    loadData();
  };

  const handleSaveInduk = async (data: any) => {
    await createInduk(data);
    loadData();
  };

  const handleSaveSpawn = async (data: any) => {
    await createSpawn(data);
    loadData();
  };

  const handleSaveTank = async (data: any) => {
    await create('tank', data);
    loadData();
  };

  const handleAfkirInduk = async (id: string) => {
    await afkirInduk(id);
    loadData();
  };

  const handleCloseSiklus = async (id: string) => {
    await closeSiklus(id, 85.0);
    loadData();
  };

  return (
    <div className="master-siklus-container">
      {/* Header */}
      <div className="dash-header">
        <div>
          <div className="tier-tag">OPERASIONAL — KEPALA PRODUKSI</div>
          <h1 className="dash-title">Master Data & Traceability Siklus</h1>
          <p className="dash-subtitle">
            Kelola rantai ketelusuran induk, pemijahan telur, pembukaan siklus, dan inventori bak.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="master-tab-bar">
        <button
          type="button"
          onClick={() => setActiveTab('siklus')}
          className={`master-tab-btn ${activeTab === 'siklus' ? 'active' : ''}`}
        >
          <Database size={16} /> Siklus Budidaya
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('induk')}
          className={`master-tab-btn ${activeTab === 'induk' ? 'active' : ''}`}
        >
          <Fish size={16} /> Batch Induk
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('spawn')}
          className={`master-tab-btn ${activeTab === 'spawn' ? 'active' : ''}`}
        >
          <Egg size={16} /> Pemijahan (Spawn)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('tank')}
          className={`master-tab-btn ${activeTab === 'tank' ? 'active' : ''}`}
        >
          <Box size={16} /> Master Bak
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('sop')}
          className={`master-tab-btn ${activeTab === 'sop' ? 'active' : ''}`}
        >
          <BookOpen size={16} /> Rearing Plan (SOP)
        </button>
      </div>

      {/* Active Tab View */}
      {activeTab === 'siklus' && (
        <TabSiklus
          siklusList={siklusList}
          onOpenModal={() => setModalType('siklus')}
          onCloseSiklus={handleCloseSiklus}
          onViewPaspor={(id) => setPasporSiklusId(id)}
        />
      )}
      {activeTab === 'induk' && (
        <TabInduk
          indukList={indukList}
          onOpenModal={() => setModalType('induk')}
          onAfkir={handleAfkirInduk}
        />
      )}
      {activeTab === 'spawn' && (
        <TabSpawn
          spawnList={spawnList}
          onOpenModal={() => setModalType('spawn')}
        />
      )}
      {activeTab === 'tank' && (
        <TabTank
          tankList={tankList}
          onOpenModal={() => setModalType('tank')}
        />
      )}
      {activeTab === 'sop' && (
        <TabRearingPlan planList={planList} />
      )}

      {/* Modals */}
      <MasterModals
        type={modalType}
        onClose={() => setModalType(null)}
        onSaveSiklus={handleSaveSiklus}
        onSaveInduk={handleSaveInduk}
        onSaveSpawn={handleSaveSpawn}
        onSaveTank={handleSaveTank}
        indukList={indukList}
      />

      {/* Paspor Siklus Digital (§11) */}
      <PasporSiklusModal
        siklusId={pasporSiklusId}
        isOpen={pasporSiklusId !== null}
        onClose={() => setPasporSiklusId(null)}
      />
    </div>
  );
}


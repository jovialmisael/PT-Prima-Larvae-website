import { SiklusModal } from './modals/SiklusModal';
import { IndukModal } from './modals/IndukModal';
import { SpawnModal } from './modals/SpawnModal';
import { TankModal } from './modals/TankModal';

interface MasterModalProps {
  type: 'siklus' | 'induk' | 'spawn' | 'tank' | null;
  onClose: () => void;
  onSaveSiklus: (data: { indukId: string; tglMulai: string }) => void;
  onSaveInduk: (data: any) => void;
  onSaveSpawn: (data: {
    indukId: string;
    tanggal: string;
    fekunditas: number;
    fertilizationRate: number;
    hatchingRate: number;
    jumlahNauplii: number;
    keaktifan?: 'aktif' | 'sedang' | 'lemah';
    responFototaksis?: 'positif' | 'lemah' | 'negatif';
    keseragaman?: string;
  }) => void;

  onSaveTank: (data: any) => void;
  indukList: any[];
}


export function MasterModals({
  type,
  onClose,
  onSaveSiklus,
  onSaveInduk,
  onSaveSpawn,
  onSaveTank,
  indukList,
}: MasterModalProps) {
  if (!type) return null;

  return (
    <>
      <SiklusModal
        isOpen={type === 'siklus'}
        onClose={onClose}
        onSave={onSaveSiklus}
        indukList={indukList}
      />
      <IndukModal
        isOpen={type === 'induk'}
        onClose={onClose}
        onSave={onSaveInduk}
      />
      <SpawnModal
        isOpen={type === 'spawn'}
        onClose={onClose}
        onSave={onSaveSpawn}
        indukList={indukList}
      />
      <TankModal
        isOpen={type === 'tank'}
        onClose={onClose}
        onSave={onSaveTank}
      />
    </>
  );
}

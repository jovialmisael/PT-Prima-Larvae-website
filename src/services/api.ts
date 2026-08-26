import { ApiResult, Collection, ApprovalStamp, RejectStamp } from '@domainTypes/index';

const STORAGE_PREFIX = 'prima_larvae_';

function getStorage(key: string): any {
  if (typeof localStorage === 'undefined') return null;
  const val = localStorage.getItem(STORAGE_PREFIX + key);
  return val ? JSON.parse(val) : null;
}

function setStorage(key: string, value: any): boolean {
  if (typeof localStorage === 'undefined') return false;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    return true;
  } catch (e) {
    return false;
  }
}

function getCollection(collection: Collection): any[] {
  return getStorage(collection) || [];
}

function setCollection(collection: Collection, data: any[]): boolean {
  return setStorage(collection, data);
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

export async function list(collection: Collection, filter?: (item: any) => boolean): Promise<any[]> {
  const items = getCollection(collection);
  return Promise.resolve(filter ? items.filter(filter) : items);
}

export async function get(collection: Collection, id: string): Promise<any | null> {
  const items = getCollection(collection);
  return Promise.resolve(items.find(i => i.id === id) || null);
}

export async function create(collection: Collection, data: any): Promise<ApiResult<any>> {
  const items = getCollection(collection);
  const newItem = { ...data, id: data.id || generateId(), dibuatPada: Date.now() };
  items.push(newItem);
  if (setCollection(collection, items)) {
    return Promise.resolve(newItem);
  }
  return Promise.resolve(null);
}

export async function update(collection: Collection, id: string, patch: any): Promise<ApiResult<any>> {
  const items = getCollection(collection);
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return Promise.resolve(null);
  
  const updatedItem = { ...items[idx], ...patch };
  items[idx] = updatedItem;
  if (setCollection(collection, items)) {
    return Promise.resolve(updatedItem);
  }
  return Promise.resolve(null);
}

export async function remove(collection: Collection, id: string): Promise<boolean> {
  const items = getCollection(collection);
  const newItems = items.filter(i => i.id !== id);
  if (items.length === newItems.length) return Promise.resolve(false);
  return Promise.resolve(setCollection(collection, newItems));
}

export async function verify(collection: Collection, id: string, step: 'parafArea' | 'qc' | 'sahkan', stamp: ApprovalStamp): Promise<ApiResult<any>> {
  const item = await get(collection, id);
  if (!item) return Promise.resolve(null);
  
  if (step === 'parafArea') {
    item.diparafArea = stamp;
  } else if (step === 'qc') {
    item.status = 'qc';
    item.diperiksaMpm = stamp;
  } else if (step === 'sahkan') {
    item.status = 'disahkan';
    item.disahkanKepala = stamp;
  }
  return update(collection, id, item);
}

export async function tolak(collection: Collection, id: string, { step: _step, alasan, stamp }: { step: 'qc' | 'sahkan', alasan: string, stamp: RejectStamp }): Promise<ApiResult<any>> {
  const item = await get(collection, id);
  if (!item) return Promise.resolve(null);
  
  item.status = 'ditolak';
  item.ditolakOleh = { ...stamp, alasan };
  return update(collection, id, item);
}

export async function createInduk(data: any): Promise<ApiResult<any>> {
  const tgl = new Date(data.tglKedatangan);
  const yymm = tgl.toISOString().slice(2, 7).replace('-', '');
  const items = getCollection('induk');
  const count = items.filter(i => i.kodeBatch?.includes(`IND-${yymm}`)).length + 1;
  const kodeBatch = data.kodeBatch?.trim() || `IND-${yymm}-${String.fromCharCode(64 + count)}`;
  
  return create('induk', {
    ...data,
    kodeBatch,
    status: 'aktif'
  });
}

export async function afkirInduk(id: string): Promise<ApiResult<any>> {
  return update('induk', id, { status: 'selesai' });
}

export async function createSpawn(data: {
  indukId: string;
  tanggal: string;
  fekunditas?: number;
  fertilizationRate?: number;
  hatchingRate?: number;
  jumlahNauplii?: number;
}): Promise<ApiResult<any>> {
  return create('spawn', data);
}


export async function createSiklus(data: { indukId: string; tglMulai: string }): Promise<ApiResult<any>> {
  const tgl = new Date(data.tglMulai);
  const yymm = tgl.toISOString().slice(2, 7).replace('-', '');
  const items = getCollection('siklus');
  const count = items.filter(i => i.kodeBatch.includes(`SIK-${yymm}`)).length + 1;
  const kodeBatch = `SIK-${yymm}-${count.toString().padStart(2, '0')}`;
  
  const parameterBaseline = getCollection('rearingPlan');
  return create('siklus', { ...data, kodeBatch, status: 'setup', parameterBaseline });
}

export async function createPenempatan(data: any): Promise<ApiResult<any>> {
  return create('penempatan', data);
}

export async function transfer(data: any): Promise<ApiResult<any>> {
  return create('transfer', data);
}

export async function closeSiklus(id: string, srFinal: number): Promise<ApiResult<any>> {
  return update('siklus', id, { status: 'selesai', srFinal });
}

export async function refLabel(refName: string, id: string): Promise<string> {
  const collection = refName as Collection;
  const item = await get(collection, id);
  if (!item) return id;
  if (item.namaTank) return item.namaTank;
  if (item.kodeBatch) return item.kodeBatch;
  return id;
}

export async function getThresholdOverride(categoryId: string, fieldKey: string, _stadia?: string): Promise<any> {
  const key = `threshold_${categoryId}_${fieldKey}`;
  return Promise.resolve(getStorage(key));
}

export async function patchStandard(categoryId: string, fieldKey: string, threshold: any): Promise<boolean> {
  const key = `threshold_${categoryId}_${fieldKey}`;
  return Promise.resolve(setStorage(key, threshold));
}

export async function clearStandard(categoryId: string, fieldKey: string): Promise<boolean> {
  if (typeof localStorage !== 'undefined') {
    const key = `threshold_${categoryId}_${fieldKey}`;
    localStorage.removeItem(STORAGE_PREFIX + key);
    return Promise.resolve(true);
  }
  return Promise.resolve(false);
}

export async function getRearingPlan(stadia?: string): Promise<any> {
  const plans = getCollection('rearingPlan');
  if (stadia) return Promise.resolve(plans.find(p => p.stadia === stadia));
  return Promise.resolve(plans);
}

export async function patchRearingPlan(stadia: string, patch: any): Promise<ApiResult<any>> {
  const plans = getCollection('rearingPlan');
  const idx = plans.findIndex(p => p.stadia === stadia);
  if (idx === -1) return Promise.resolve(null);
  plans[idx] = { ...plans[idx], ...patch };
  if (setCollection('rearingPlan', plans)) return Promise.resolve(plans[idx]);
  return Promise.resolve(null);
}

export async function exportAll(): Promise<any> {
  const data: Record<string, any> = {};
  if (typeof localStorage !== 'undefined') {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        data[key.substring(STORAGE_PREFIX.length)] = JSON.parse(localStorage.getItem(key) || 'null');
      }
    }
  }
  return Promise.resolve(data);
}

export async function importAll(obj: any): Promise<boolean> {
  if (typeof localStorage !== 'undefined') {
    for (const [key, value] of Object.entries(obj)) {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    }
    return Promise.resolve(true);
  }
  return Promise.resolve(false);
}

export async function saveDraft(key: string, values: any): Promise<boolean> {
  return Promise.resolve(setStorage(`draft_${key}`, values));
}

export async function loadDraft(key: string): Promise<any> {
  return Promise.resolve(getStorage(`draft_${key}`));
}

export async function clearDraft(key: string): Promise<boolean> {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STORAGE_PREFIX + `draft_${key}`);
    return Promise.resolve(true);
  }
  return Promise.resolve(false);
}

/**
 * Mesin Rekomendasi (dokumen 06) belum dibangun. Kontrak kejujuran Product DNA
 * melarang mengarang jawaban, jadi fungsi ini menyatakan ketidaktersediaannya
 * secara eksplisit alih-alih mengembalikan kalimat kaleng.
 */
export async function askAssistant(_question: string, _context?: any): Promise<{ tersedia: false; alasan: string }> {
  return Promise.resolve({
    tersedia: false,
    alasan: 'Asisten rekomendasi belum tersedia — mesinnya menyusul bersama backend (Roadmap F4).',
  });
}

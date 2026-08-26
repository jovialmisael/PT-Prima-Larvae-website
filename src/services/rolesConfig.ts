import { Division, RoleLevel, Area } from '@domainTypes/index';

export type RoleDef = {
  id: string;
  title: string;
  division: Division;
  level: RoleLevel;
};

export const ROLES: RoleDef[] = [
  { id: 'petugasProd', title: 'Petugas Produksi', division: 'produksi', level: 'petugas' },
  { id: 'kepalaProd', title: 'Kepala Produksi', division: 'produksi', level: 'kepala' },
  { id: 'petugasLab', title: 'Petugas Lab', division: 'lab', level: 'petugas' },
  { id: 'pjLab', title: 'PJ/Ka.Sie Lab', division: 'lab', level: 'pj' },
  { id: 'kepalaLab', title: 'Kepala Lab', division: 'lab', level: 'kepala' },
  { id: 'mpm', title: 'MPM / QC', division: 'mpm', level: 'mpm' },
  { id: 'manager', title: 'Manager', division: 'manager', level: 'manager' },
  { id: 'owner', title: 'Owner', division: 'manager', level: 'owner' }
];

export type UserDef = {
  username: string;
  userId: string;
  roleId: string;
  area?: Area;
};

export const USERS: UserDef[] = [
  { username: 'petugas.produksi', userId: 'u-petugas-prod', roleId: 'petugasProd' },
  { username: 'kepala.produksi', userId: 'u-kepala-prod', roleId: 'kepalaProd' },
  { username: 'petugas.lab.maturasi', userId: 'u-petugas-lab-mat', roleId: 'petugasLab', area: 'maturasi' },
  { username: 'petugas.lab.algae', userId: 'u-petugas-lab-alg', roleId: 'petugasLab', area: 'algae' },
  { username: 'petugas.lab.pl', userId: 'u-petugas-lab-pl', roleId: 'petugasLab', area: 'pl' },
  { username: 'pj.lab.maturasi', userId: 'u-pj-lab-mat', roleId: 'pjLab', area: 'maturasi' },
  { username: 'kepala.lab', userId: 'u-kepala-lab', roleId: 'kepalaLab' },
  { username: 'mpm', userId: 'u-mpm', roleId: 'mpm' },
  { username: 'manager', userId: 'u-manager', roleId: 'manager' },
  { username: 'owner', userId: 'u-owner', roleId: 'owner' }
];

// Matrix Izin

export function canInput(role: RoleDef, category: any, userArea?: Area): boolean {
  if (role.level !== 'petugas') return false;
  if (role.division !== category.division) return false;
  if (role.division === 'lab' && category.area && category.area !== userArea) return false;
  return true;
}

export function canParafArea(role: RoleDef, category: any, userArea?: Area): boolean {
  if (role.level !== 'pj') return false;
  if (category.division !== 'lab') return false;
  if (category.area && category.area !== userArea) return false;
  return true;
}

export function canQcMpm(role: RoleDef): boolean {
  return role.level === 'mpm' || role.level === 'kepala' || role.level === 'manager';
}

export function canSahkan(role: RoleDef, category: any): boolean {
  if (role.level !== 'kepala') return false;
  return role.division === category.division;
}

export function canTolak(role: RoleDef, step: 'qc' | 'sahkan', category: any): boolean {
  if (step === 'qc') return canQcMpm(role);
  if (step === 'sahkan') return canSahkan(role, category);
  return false;
}

export function canViewTrends(role: RoleDef): boolean {
  return role.level !== 'petugas';
}

export function canEditStandard(role: RoleDef): boolean {
  return role.level === 'mpm' || role.id === 'kepalaLab';
}

export function canManageMaster(role: RoleDef): boolean {
  return role.id === 'kepalaProd';
}

export function categoryVisible(role: RoleDef, category: any, userArea?: Area): boolean {
  if (role.division === 'mpm' || role.division === 'manager') return true;
  if (role.division !== category.division) return false;
  if (role.division === 'lab' && role.level !== 'kepala') {
    if (category.area && category.area !== userArea) return false;
  }
  return true;
}

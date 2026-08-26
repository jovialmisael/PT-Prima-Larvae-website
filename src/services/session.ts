import { USERS, ROLES, RoleDef, UserDef } from '@services/rolesConfig';

let currentUserState: UserDef | null = null;

export function login(username: string, password?: string): boolean {
  // Password is 'prima123' for all demo accounts
  if (password && password !== 'prima123') return false;

  const user = USERS.find(u => u.username === username);
  if (user) {
    currentUserState = user;
    return true;
  }
  return false;
}

export function logout() {
  currentUserState = null;
}

export function currentUser(): UserDef | null {
  // Override via query param if in browser environment
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const override = urlParams.get('as');
    if (override) {
      const user = USERS.find(u => u.userId === override);
      if (user) return user;
    }
  }
  return currentUserState;
}

export function currentRole(): RoleDef | null {
  const u = currentUser();
  if (!u) return null;
  return ROLES.find(r => r.id === u.roleId) || null;
}

export function currentArea() {
  const u = currentUser();
  return u?.area;
}

import type { Role } from './types'

// Mirrors the Flutter reference app's per-role screen sets (admin/reception/
// therapist each get a different bottom nav and page list there) and the
// backend's actual permission classes (IsAdmin / IsAdminOrReception) — a
// page listed here for a role is one that role's backend calls will
// actually succeed on, not just a UI guess.
//
// Admin sees everything, so only non-admin allowances are listed; a path
// with no entry here is open to every authenticated role (Dashboard,
// Appointments, Patients, Assistant, Settings).
export const ROLE_PAGE_ACCESS: Record<string, Role[]> = {
  staff: ['admin'],
  treatments: ['admin'],
  rooms: ['admin'],
  'clinic-hours': ['admin'],
  inventory: ['admin'],
  leads: ['admin', 'reception'],
  billing: ['admin', 'reception'],
}

// path: the route without a leading slash, e.g. "staff" or "clinic-hours".
export function canAccessPage(role: Role | undefined, path: string): boolean {
  if (!role) return false
  if (role === 'admin') return true
  const allowed = ROLE_PAGE_ACCESS[path]
  if (!allowed) return true // not role-restricted — open to any authenticated role
  return allowed.includes(role)
}

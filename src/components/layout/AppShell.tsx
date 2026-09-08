import { Outlet, useLocation, NavLink } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, Users, Receipt, Sparkles, Target, Settings as SettingsIcon } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { cn } from '../../lib/cn'
import { useAuth } from '../../lib/auth'
import type { Role } from '../../lib/types'

// Mirrors the Flutter reference app's per-role bottom nav tab sets: admin
// (this app's own back-office hub via "More"), reception (DASH, SCHEDULES,
// LEADS, PATIENTS, PAYMENTS), therapist (DASH, SCHEDULES, PATIENTS,
// PRODUCTS→Assistant, SETTINGS — no Leads/Billing, matching Flutter's
// therapist nav which never exposes either). Back-office sections (Staff,
// Treatments, Rooms, Clinic hours) live in the desktop sidebar only — on
// mobile the admin's "More" tab opens Settings, which links out to them.
const NAV_BY_ROLE: Record<Role, { to: string; label: string; icon: typeof LayoutDashboard; end?: boolean }[]> = {
  admin: [
    { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
    { to: '/appointments', label: 'Bookings', icon: CalendarDays },
    { to: '/patients', label: 'Patients', icon: Users },
    { to: '/billing', label: 'Billing', icon: Receipt },
    { to: '/assistant', label: 'Aura', icon: Sparkles },
    { to: '/settings', label: 'More', icon: SettingsIcon },
  ],
  reception: [
    { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
    { to: '/appointments', label: 'Bookings', icon: CalendarDays },
    { to: '/leads', label: 'Leads', icon: Target },
    { to: '/patients', label: 'Patients', icon: Users },
    { to: '/billing', label: 'Billing', icon: Receipt },
  ],
  therapist: [
    { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
    { to: '/appointments', label: 'Bookings', icon: CalendarDays },
    { to: '/patients', label: 'Patients', icon: Users },
    { to: '/assistant', label: 'Aura', icon: Sparkles },
    { to: '/settings', label: 'Settings', icon: SettingsIcon },
  ],
}

export function AppShell() {
  const location = useLocation()
  const role = useAuth((s) => s.user?.role) ?? 'admin'
  const mobileNavItems = NAV_BY_ROLE[role]

  return (
    <div className="flex h-screen bg-[var(--color-ivory)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar path={location.pathname} />
        <main className="flex-1 overflow-y-auto px-6 pb-24 pt-6 lg:px-10 lg:pb-8">
          <Outlet />
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-[var(--color-line-soft)] bg-[var(--color-surface)]/95 px-2 py-2 backdrop-blur lg:hidden">
          {mobileNavItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[11px] font-medium',
                  isActive ? 'text-[var(--color-forest-800)]' : 'text-[var(--color-ink-faint)]',
                )
              }
            >
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}

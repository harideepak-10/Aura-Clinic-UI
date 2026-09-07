import { Outlet, useLocation, NavLink } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, Users, Package, Receipt, Sparkles } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { cn } from '../../lib/cn'

const mobileNavItems = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/appointments', label: 'Bookings', icon: CalendarDays },
  { to: '/patients', label: 'Patients', icon: Users },
  { to: '/inventory', label: 'Stock', icon: Package },
  { to: '/billing', label: 'Billing', icon: Receipt },
  { to: '/assistant', label: 'Aura', icon: Sparkles },
]

export function AppShell() {
  const location = useLocation()

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

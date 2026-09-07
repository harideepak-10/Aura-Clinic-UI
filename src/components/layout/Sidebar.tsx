import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Package,
  Receipt,
  Sparkles,
  Leaf,
} from 'lucide-react'
import { cn } from '../../lib/cn'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/appointments', label: 'Appointments', icon: CalendarDays },
  { to: '/patients', label: 'Patients', icon: Users },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/billing', label: 'Billing', icon: Receipt },
  { to: '/assistant', label: 'AI Assistant', icon: Sparkles },
]

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--color-line-soft)] bg-[var(--color-surface-soft)] px-4 py-6 lg:flex">
      <div className="mb-8 flex items-center gap-2.5 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-forest-800)] text-[var(--color-gold-500)]">
          <Leaf size={18} />
        </div>
        <div>
          <p className="font-display text-lg font-medium leading-none text-[var(--color-ink)]">Aura</p>
          <p className="text-[11px] uppercase tracking-wide text-[var(--color-ink-faint)]">Clinic Suite</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-full px-3.5 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[var(--color-forest-800)] text-[var(--color-ivory)] shadow-soft'
                  : 'text-[var(--color-ink-soft)] hover:bg-[var(--color-ivory-dim)] hover:text-[var(--color-ink)]',
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="rounded-[var(--radius-lg)] bg-[var(--color-forest-50)] p-4">
        <p className="font-display text-sm font-medium text-[var(--color-forest-800)]">Occupancy today</p>
        <p className="mt-1 text-2xl font-semibold text-[var(--color-forest-900)]">78%</p>
        <p className="mt-1 text-xs text-[var(--color-ink-faint)]">6 of 8 slots booked across 3 rooms</p>
      </div>
    </aside>
  )
}

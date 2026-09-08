import { NavLink } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Package,
  Receipt,
  Sparkles,
  Leaf,
  UserCog,
  Stethoscope,
  DoorOpen,
  Target,
  Clock,
  Settings,
} from 'lucide-react'
import { cn } from '../../lib/cn'
import { useAuth } from '../../lib/auth'
import { canAccessPage } from '../../lib/roles'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Overview',
    items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Clinic',
    items: [
      { to: '/appointments', label: 'Appointments', icon: CalendarDays },
      { to: '/patients', label: 'Patients', icon: Users },
      { to: '/leads', label: 'Leads', icon: Target },
    ],
  },
  {
    label: 'People & services',
    items: [
      { to: '/staff', label: 'Staff', icon: UserCog },
      { to: '/treatments', label: 'Treatments', icon: Stethoscope },
      { to: '/rooms', label: 'Rooms', icon: DoorOpen },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/inventory', label: 'Inventory', icon: Package },
      { to: '/billing', label: 'Billing', icon: Receipt },
      { to: '/clinic-hours', label: 'Clinic hours', icon: Clock },
    ],
  },
  {
    label: '',
    items: [
      { to: '/assistant', label: 'AI Assistant', icon: Sparkles },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
]

// path without a leading slash, matching roles.ts's ROLE_PAGE_ACCESS keys.
const pathKey = (to: string) => (to === '/' ? '' : to.replace(/^\//, ''))

export function Sidebar() {
  const role = useAuth((s) => s.user?.role)

  return (
    <aside className="hidden w-64 shrink-0 flex-col overflow-y-auto border-r border-[var(--color-line-soft)] bg-[var(--color-surface-soft)] px-4 py-6 lg:flex">
      <div className="mb-6 flex items-center gap-2.5 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-forest-800)] text-[var(--color-gold-500)]">
          <Leaf size={18} />
        </div>
        <div>
          <p className="font-display text-lg font-medium leading-none text-[var(--color-ink)]">Aura</p>
          <p className="text-[11px] uppercase tracking-wide text-[var(--color-ink-faint)]">Clinic Suite</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-4">
        {navGroups.map((group, gi) => {
          const items = group.items.filter((item) => canAccessPage(role, pathKey(item.to)))
          if (items.length === 0) return null
          return (
            <div key={gi}>
              {group.label && (
                <p className="mb-1.5 px-3.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink-faint)]">{group.label}</p>
              )}
              <div className="flex flex-col gap-1">
                {items.map(({ to, label, icon: Icon, end }) => (
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
              </div>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}

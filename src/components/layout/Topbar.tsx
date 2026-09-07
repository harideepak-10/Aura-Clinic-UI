import { Bell, Search, LogOut } from 'lucide-react'
import { Input } from '../ui/Input'
import { Avatar } from '../ui/Avatar'
import { useAuth } from '../../lib/auth'

const titles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Good morning', subtitle: "Here's how the clinic looks today" },
  '/appointments': { title: 'Appointments', subtitle: 'Bookings across all therapists and rooms' },
  '/patients': { title: 'Patients', subtitle: 'Manage patient records and history' },
  '/inventory': { title: 'Inventory', subtitle: 'Stock levels across skincare, injectables, and spa' },
  '/billing': { title: 'Billing', subtitle: 'Invoices and Stripe payment activity' },
  '/assistant': { title: 'AI Assistant', subtitle: 'Ask Aura about your clinic in plain language' },
}

export function Topbar({ path }: { path: string }) {
  const { user, logout } = useAuth()
  const copy = titles[path] ?? titles['/']

  return (
    <header className="flex items-center justify-between gap-6 border-b border-[var(--color-line-soft)] bg-[var(--color-ivory)]/80 px-6 py-5 backdrop-blur lg:px-10">
      <div>
        <h1 className="font-display text-2xl font-medium text-[var(--color-ink)]">{copy.title}</h1>
        <p className="text-sm text-[var(--color-ink-faint)]">{copy.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden w-64 md:block">
          <Input placeholder="Search patients, invoices…" icon={<Search size={16} />} />
        </div>
        <button className="relative rounded-full p-2.5 text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-ivory-dim)]">
          <Bell size={19} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--color-gold-600)]" />
        </button>
        <div className="mx-1 h-8 w-px bg-[var(--color-line)]" />
        <div className="flex items-center gap-2.5">
          <Avatar name={user?.username ?? 'Aura Admin'} size={36} />
          <div className="hidden text-sm md:block">
            <p className="font-medium leading-none text-[var(--color-ink)]">{user?.username}</p>
            <p className="text-xs text-[var(--color-ink-faint)] capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
        <button
          onClick={logout}
          title="Sign out"
          className="rounded-full p-2.5 text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-ivory-dim)] hover:text-[var(--color-danger)]"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}

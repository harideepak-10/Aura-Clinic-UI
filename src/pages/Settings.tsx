import { Link } from 'react-router-dom'
import { Stethoscope, DoorOpen, Clock, Target, UserCog, LogOut, Mail, Phone, ChevronRight, Package } from 'lucide-react'
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { useAuth } from '../lib/auth'

const links = [
  { to: '/staff', label: 'Staff', description: 'Accounts, schedules, breaks and leave', icon: UserCog },
  { to: '/treatments', label: 'Treatments', description: 'Services, pricing plans and protocols', icon: Stethoscope },
  { to: '/rooms', label: 'Rooms', description: 'Treatment rooms available for booking', icon: DoorOpen },
  { to: '/clinic-hours', label: 'Clinic hours', description: 'Weekly schedule and planned closures', icon: Clock },
  { to: '/leads', label: 'Leads', description: 'Enquiry pipeline and marketing sources', icon: Target },
  { to: '/inventory', label: 'Inventory', description: 'Stock levels across skincare, injectables, and spa', icon: Package },
]

export function Settings() {
  const { user, logout } = useAuth()

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-4">
            <Avatar name={user?.username ?? 'Aura Admin'} size={56} />
            <div>
              <p className="font-display text-lg font-medium text-[var(--color-ink)]">{user?.username}</p>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-[var(--color-ink-faint)]">
                <span className="flex items-center gap-1.5">
                  <Mail size={13} /> {user?.email}
                </span>
                {user?.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone size={13} /> {user.phone}
                  </span>
                )}
              </div>
              <Badge tone="gold" className="mt-2 capitalize">
                {user?.role?.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          <Button variant="danger" onClick={logout}>
            <LogOut size={16} /> Sign out
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clinic configuration</CardTitle>
        </CardHeader>
        <CardBody className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {links.map(({ to, label, description, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3.5 rounded-[var(--radius-md)] border border-[var(--color-line-soft)] px-4 py-3.5 transition-colors hover:border-[var(--color-forest-500)] hover:bg-[var(--color-ivory-dim)]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-forest-50)] text-[var(--color-forest-700)]">
                <Icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--color-ink)]">{label}</p>
                <p className="truncate text-xs text-[var(--color-ink-faint)]">{description}</p>
              </div>
              <ChevronRight size={16} className="shrink-0 text-[var(--color-ink-faint)]" />
            </Link>
          ))}
        </CardBody>
      </Card>
    </div>
  )
}

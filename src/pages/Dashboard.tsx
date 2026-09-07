import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CalendarClock, Euro, Users, Percent, AlertTriangle, ChevronRight } from 'lucide-react'
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card'
import { StatTile } from '../components/ui/StatTile'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { getAppointments, getDashboardStats, getInventory } from '../lib/dataSource'
import type { Appointment, DashboardStats, InventoryItem } from '../lib/types'
import { statusTone } from '../lib/format'

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])

  useEffect(() => {
    getDashboardStats().then(setStats)
    getAppointments().then(setAppointments)
    getInventory().then(setInventory)
  }, [])

  const lowStock = inventory.filter((i) => i.status !== 'in_stock')
  const upcoming = appointments.filter((a) => a.status !== 'cancelled').slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Today's appointments"
          value={stats ? String(stats.todayAppointments) : '—'}
          delta="+2 vs. yesterday"
          deltaTone="up"
          icon={<CalendarClock size={18} />}
        />
        <StatTile
          label="Today's revenue"
          value={stats ? `€${stats.todayRevenueEur.toLocaleString()}` : '—'}
          delta="+18% vs. yesterday"
          deltaTone="up"
          icon={<Euro size={18} />}
        />
        <StatTile
          label="Active patients"
          value={stats ? stats.activePatients.toLocaleString() : '—'}
          delta="12 new this month"
          deltaTone="neutral"
          icon={<Users size={18} />}
        />
        <StatTile
          label="Occupancy rate"
          value={stats ? `${Math.round(stats.occupancyRate * 100)}%` : '—'}
          delta="3 rooms in use"
          deltaTone="neutral"
          icon={<Percent size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Revenue, last 7 days</CardTitle>
            <Badge tone="success" dot>
              +14.2% WoW
            </Badge>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={stats?.revenueTrend ?? []} margin={{ left: -20, top: 8 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-forest-600)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-forest-600)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line-soft)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'var(--color-ink-faint)', fontSize: 12 }}
                />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--color-ink-faint)', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid var(--color-line-soft)',
                    fontSize: 13,
                  }}
                  formatter={((value: number | undefined) => [`€${Number(value ?? 0).toLocaleString()}`, 'Revenue']) as never}
                />
                <Area
                  type="monotone"
                  dataKey="revenueEur"
                  stroke="var(--color-forest-700)"
                  strokeWidth={2.5}
                  fill="url(#revenueFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Appointments by service</CardTitle>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats?.appointmentsByService ?? []} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line-soft)" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="service"
                  tickLine={false}
                  axisLine={false}
                  width={80}
                  tick={{ fill: 'var(--color-ink-soft)', fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: 'var(--color-ivory-dim)' }}
                  contentStyle={{ borderRadius: 12, border: '1px solid var(--color-line-soft)', fontSize: 13 }}
                />
                <Bar dataKey="count" fill="var(--color-gold-600)" radius={[0, 8, 8, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Today's schedule</CardTitle>
            <a href="/appointments" className="flex items-center gap-1 text-xs font-medium text-[var(--color-forest-700)] hover:underline">
              View all <ChevronRight size={14} />
            </a>
          </CardHeader>
          <CardBody className="space-y-1">
            {upcoming.map((appt) => (
              <div
                key={appt.id}
                className="flex items-center justify-between gap-4 rounded-[var(--radius-lg)] px-3 py-3 transition-colors hover:bg-[var(--color-ivory-dim)]"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={appt.patientName} size={38} />
                  <div>
                    <p className="text-sm font-medium text-[var(--color-ink)]">{appt.patientName}</p>
                    <p className="text-xs text-[var(--color-ink-faint)]">{appt.service}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[var(--color-ink-soft)]">
                    {new Date(appt.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <Badge tone={statusTone(appt.status)}>{appt.status}</Badge>
                </div>
              </div>
            ))}
            {upcoming.length === 0 && (
              <p className="py-6 text-center text-sm text-[var(--color-ink-faint)]">No appointments yet today.</p>
            )}
          </CardBody>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Inventory alerts</CardTitle>
            <Badge tone="warning" dot>
              {lowStock.length} need attention
            </Badge>
          </CardHeader>
          <CardBody className="space-y-3">
            {lowStock.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--color-line-soft)] px-3.5 py-3">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-[var(--color-warning-soft)] p-2 text-[var(--color-warning)]">
                    <AlertTriangle size={15} />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-ink)]">{item.name}</p>
                    <p className="text-xs text-[var(--color-ink-faint)]">{item.supplier}</p>
                  </div>
                </div>
                <Badge tone={item.status === 'out_of_stock' ? 'danger' : 'warning'}>
                  {item.quantity} {item.unit}
                </Badge>
              </div>
            ))}
            {lowStock.length === 0 && (
              <p className="py-6 text-center text-sm text-[var(--color-ink-faint)]">All stock levels healthy.</p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

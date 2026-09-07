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
import { CalendarClock, Euro, Users, Percent, AlertTriangle, ChevronRight, RotateCcw } from 'lucide-react'
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card'
import { StatTile } from '../components/ui/StatTile'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { getDashboard } from '../lib/dataSource'
import { apiErrorMessage } from '../lib/api'
import type { DashboardResponse, ScheduleAppointment } from '../lib/types'
import { statusTone, statusLabel, formatEur } from '../lib/format'

function trendDelta(t: { change_pct: number; trend: 'up' | 'down' | 'neutral' }, suffix: string) {
  const sign = t.trend === 'up' ? '+' : t.trend === 'down' ? '-' : ''
  return `${sign}${t.change_pct}% ${suffix}`
}

function ScheduleRow({ appt }: { appt: ScheduleAppointment }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[var(--radius-lg)] px-3 py-3 transition-colors hover:bg-[var(--color-ivory-dim)]">
      <div className="flex items-center gap-3">
        <Avatar name={appt.patient_name ?? '—'} size={38} />
        <div>
          <p className="text-sm font-medium text-[var(--color-ink)]">{appt.patient_name ?? 'Walk-in'}</p>
          <p className="text-xs text-[var(--color-ink-faint)]">
            {appt.treatment ?? 'Consultation'}
            {appt.staff_name ? ` · ${appt.staff_name}` : ''}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-[var(--color-ink-soft)]">{appt.time ?? '—'}</span>
        <Badge tone={statusTone(appt.status)}>{statusLabel(appt.status)}</Badge>
      </div>
    </div>
  )
}

export function Dashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    setError(null)
    getDashboard()
      .then(setData)
      .catch((err) => setError(apiErrorMessage(err, 'Could not load the dashboard.')))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  if (loading) {
    return <p className="py-16 text-center text-sm text-[var(--color-ink-faint)]">Loading your clinic's dashboard…</p>
  }

  if (error || !data) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-[var(--color-danger)]">{error ?? 'Something went wrong.'}</p>
        <button
          onClick={load}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-forest-800)] px-4 py-2 text-sm font-medium text-[var(--color-ivory)]"
        >
          <RotateCcw size={14} /> Retry
        </button>
      </Card>
    )
  }

  if (data.role !== 'admin') {
    // Reception / therapist dashboards — a simpler single-column view.
    const stats = data.stats as Record<string, number>
    const upcoming = 'next_up' in data ? data.next_up : []
    const current = 'current_session' in data ? data.current_session : null
    const currentSessions = 'current_sessions' in data ? data.current_sessions : []

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Object.entries(stats).map(([key, value]) => (
            <StatTile key={key} label={key.replace(/_/g, ' ')} value={String(value)} icon={<CalendarClock size={18} />} />
          ))}
        </div>

        {current && (
          <Card>
            <CardHeader>
              <CardTitle>Current session</CardTitle>
            </CardHeader>
            <CardBody>
              <ScheduleRow appt={current} />
            </CardBody>
          </Card>
        )}

        {currentSessions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>In session now</CardTitle>
            </CardHeader>
            <CardBody className="space-y-1">
              {currentSessions.map((a) => (
                <ScheduleRow key={a.id} appt={a} />
              ))}
            </CardBody>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Next up today</CardTitle>
          </CardHeader>
          <CardBody className="space-y-1">
            {upcoming.length === 0 && <p className="py-6 text-center text-sm text-[var(--color-ink-faint)]">Nothing else on today's schedule.</p>}
            {upcoming.map((a) => (
              <ScheduleRow key={a.id} appt={a} />
            ))}
          </CardBody>
        </Card>
      </div>
    )
  }

  const lowRevenue = data.leads.by_marketing_source.filter((s) => s.total > 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Today's appointments"
          value={String(data.today.appointments.value)}
          delta={trendDelta(data.today.appointments, 'vs. yesterday')}
          deltaTone={data.today.appointments.trend}
          icon={<CalendarClock size={18} />}
        />
        <StatTile
          label="Today's revenue"
          value={formatEur(data.revenue.today.value)}
          delta={trendDelta(data.revenue.today, 'vs. yesterday')}
          deltaTone={data.revenue.today.trend}
          icon={<Euro size={18} />}
        />
        <StatTile
          label="Total patients"
          value={data.patients.total.toLocaleString()}
          delta={`${data.patients.new_this_month} new this month`}
          deltaTone="neutral"
          icon={<Users size={18} />}
        />
        <StatTile
          label="Rebooking rate"
          value={`${data.rebooking_rate.value}%`}
          delta={trendDelta(data.rebooking_rate, 'vs. last month')}
          deltaTone={data.rebooking_rate.trend}
          icon={<Percent size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Revenue, last 30 days</CardTitle>
            <Badge tone={data.revenue.monthly.trend === 'down' ? 'danger' : 'success'} dot>
              {trendDelta(data.revenue.monthly, 'MoM')}
            </Badge>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.revenue_chart} margin={{ left: -20, top: 8 }}>
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
                  tick={{ fill: 'var(--color-ink-faint)', fontSize: 11 }}
                  tickFormatter={(d: string) => d.slice(5)}
                  interval={4}
                />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--color-ink-faint)', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid var(--color-line-soft)', fontSize: 13 }}
                  formatter={((value: number | undefined) => [formatEur(value ?? 0), 'Revenue']) as never}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-forest-700)" strokeWidth={2.5} fill="url(#revenueFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Best services this month</CardTitle>
          </CardHeader>
          <CardBody>
            {data.best_services.length === 0 ? (
              <p className="py-10 text-center text-sm text-[var(--color-ink-faint)]">No bookings yet this month.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.best_services} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line-soft)" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    width={90}
                    tick={{ fill: 'var(--color-ink-soft)', fontSize: 12 }}
                  />
                  <Tooltip cursor={{ fill: 'var(--color-ivory-dim)' }} contentStyle={{ borderRadius: 12, border: '1px solid var(--color-line-soft)', fontSize: 13 }} />
                  <Bar dataKey="bookings" fill="var(--color-gold-600)" radius={[0, 8, 8, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Staff performance this month</CardTitle>
          </CardHeader>
          <CardBody className="space-y-1">
            {data.staff_performance.length === 0 && (
              <p className="py-6 text-center text-sm text-[var(--color-ink-faint)]">No therapists on staff yet.</p>
            )}
            {data.staff_performance.map((s) => (
              <div key={s.staff_id} className="flex items-center justify-between gap-4 rounded-[var(--radius-lg)] px-3 py-3 transition-colors hover:bg-[var(--color-ivory-dim)]">
                <div className="flex items-center gap-3">
                  <Avatar name={s.name} size={38} />
                  <div>
                    <p className="text-sm font-medium text-[var(--color-ink)]">{s.name}</p>
                    <p className="text-xs text-[var(--color-ink-faint)]">{s.specialist_area ?? 'Therapist'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[var(--color-ink)]">{formatEur(s.revenue)}</p>
                  <p className="text-xs text-[var(--color-ink-faint)]">
                    {s.completed}/{s.total} completed
                  </p>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Lead sources</CardTitle>
            <Badge tone="gold" dot>
              {data.leads.active} active
            </Badge>
          </CardHeader>
          <CardBody className="space-y-3">
            {lowRevenue.length === 0 && <p className="py-6 text-center text-sm text-[var(--color-ink-faint)]">No leads recorded yet.</p>}
            {lowRevenue.map((s) => (
              <div key={s.marketing_source_id} className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--color-line-soft)] px-3.5 py-3">
                <p className="text-sm font-medium text-[var(--color-ink)]">{s.label}</p>
                <div className="flex items-center gap-2 text-xs text-[var(--color-ink-faint)]">
                  <Badge tone="neutral">{s.lead_count} leads</Badge>
                  <Badge tone="gold">{s.patient_count} patients</Badge>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-faint)]">Checked in today</p>
          <p className="mt-2 font-display text-2xl font-medium text-[var(--color-ink)]">{data.today.checked_in}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-faint)]">New patients today</p>
          <p className="mt-2 font-display text-2xl font-medium text-[var(--color-ink)]">{data.today.new_patients}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-faint)]">VIP patients</p>
          <p className="mt-2 font-display text-2xl font-medium text-[var(--color-ink)]">{data.patients.vip}</p>
        </Card>
        <Card className="flex items-center gap-3 p-5">
          <span className="rounded-full bg-[var(--color-warning-soft)] p-2.5 text-[var(--color-warning)]">
            <AlertTriangle size={16} />
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-faint)]">Cancellation rate</p>
            <p className="font-display text-xl font-medium text-[var(--color-ink)]">{data.cancellation_rate.value}%</p>
          </div>
        </Card>
      </div>

      <a href="/appointments" className="flex items-center justify-end gap-1 text-xs font-medium text-[var(--color-forest-700)] hover:underline">
        View full appointments list <ChevronRight size={14} />
      </a>
    </div>
  )
}

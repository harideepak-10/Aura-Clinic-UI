import { useEffect, useState } from 'react'
import { Plus, Trash2, RotateCcw, AlertTriangle, CalendarOff } from 'lucide-react'
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card'
import { Input, Label } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { apiErrorMessage } from '../lib/api'
import { addPlannedClosure, deletePlannedClosure, getClinicHours, getPlannedClosures, saveClinicHours } from '../lib/dataSource'
import type { ClinicHoursDay, PlannedClosure, WeekDay } from '../lib/types'
import { formatDate } from '../lib/format'

const WEEK_DAYS: WeekDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function ClinicHours() {
  const [days, setDays] = useState<ClinicHoursDay[]>([])
  const [closures, setClosures] = useState<PlannedClosure[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newClosure, setNewClosure] = useState({ from_date: '', to_date: '', reason: '' })

  const load = () => {
    setLoading(true)
    setError(null)
    Promise.all([getClinicHours(), getPlannedClosures()])
      .then(([d, c]) => {
        setDays(d)
        setClosures(c)
      })
      .catch((err) => setError(apiErrorMessage(err, 'Could not load clinic hours.')))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const toggleDay = (day: WeekDay) => {
    setDays((prev) =>
      prev.map((d) => (d.day === day ? { ...d, is_open: !d.is_open, open_time: d.open_time ?? '09:00', close_time: d.close_time ?? '18:00' } : d)),
    )
  }

  const updateTime = (day: WeekDay, field: 'open_time' | 'close_time', value: string) => {
    setDays((prev) => prev.map((d) => (d.day === day ? { ...d, [field]: value } : d)))
  }

  const saveHours = async () => {
    setSaving(true)
    setError(null)
    try {
      await saveClinicHours(
        days.map((d) => ({ day: d.day, is_open: d.is_open, open_time: d.open_time ?? undefined, close_time: d.close_time ?? undefined })),
      )
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not save the weekly schedule.'))
    } finally {
      setSaving(false)
    }
  }

  const submitClosure = async () => {
    if (!newClosure.from_date || !newClosure.to_date) return
    try {
      const created = await addPlannedClosure(newClosure)
      setClosures((c) => [...c, created])
      setNewClosure({ from_date: '', to_date: '', reason: '' })
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not add this closure.'))
    }
  }

  const removeClosure = async (id: number) => {
    try {
      await deletePlannedClosure(id)
      setClosures((c) => c.filter((x) => x.id !== id))
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not remove this closure.'))
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Card className="flex items-center justify-between gap-4 p-5">
          <p className="text-sm text-[var(--color-danger)]">{error}</p>
          <Button variant="secondary" size="sm" onClick={load}>
            <RotateCcw size={14} /> Retry
          </Button>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Weekly hours</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          {loading ? (
            <p className="py-6 text-center text-sm text-[var(--color-ink-faint)]">Loading schedule…</p>
          ) : (
            <>
              {WEEK_DAYS.map((day) => {
                const d = days.find((h) => h.day === day) ?? { day, is_open: false, open_time: null, close_time: null, id: null }
                return (
                  <div key={day} className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-line-soft)] px-3.5 py-2.5">
                    <button
                      onClick={() => toggleDay(day)}
                      className={`h-6 w-11 shrink-0 rounded-full transition-colors ${d.is_open ? 'bg-[var(--color-forest-700)]' : 'bg-[var(--color-line)]'}`}
                    >
                      <span className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${d.is_open ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                    <span className="w-10 text-sm font-medium text-[var(--color-ink)]">{day}</span>
                    {d.is_open ? (
                      <div className="flex flex-1 items-center gap-2">
                        <Input type="time" value={d.open_time ?? '09:00'} onChange={(e) => updateTime(day, 'open_time', e.target.value)} className="h-9" />
                        <span className="text-xs text-[var(--color-ink-faint)]">to</span>
                        <Input type="time" value={d.close_time ?? '18:00'} onChange={(e) => updateTime(day, 'close_time', e.target.value)} className="h-9" />
                      </div>
                    ) : (
                      <span className="flex-1 text-xs text-[var(--color-ink-faint)]">Closed</span>
                    )}
                  </div>
                )
              })}
              <div className="flex justify-end pt-2">
                <Button onClick={saveHours} disabled={saving}>
                  {saving ? 'Saving…' : 'Save schedule'}
                </Button>
              </div>
            </>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Planned closures</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="space-y-2">
            {closures.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-line-soft)] px-3.5 py-2.5 text-sm">
                <div className="flex items-center gap-2.5">
                  <CalendarOff size={14} className="text-[var(--color-ink-faint)]" />
                  <span className="text-[var(--color-ink)]">
                    {formatDate(c.from_date)} – {formatDate(c.to_date)}
                  </span>
                  <span className="text-xs text-[var(--color-ink-faint)]">{c.reason}</span>
                </div>
                <button onClick={() => removeClosure(c.id)} className="text-[var(--color-ink-faint)] hover:text-[var(--color-danger)]">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            {closures.length === 0 && <p className="text-sm text-[var(--color-ink-faint)]">No planned closures.</p>}
          </div>
          <div className="flex items-end gap-2 border-t border-[var(--color-line-soft)] pt-4">
            <div className="flex-1">
              <Label>From</Label>
              <Input type="date" value={newClosure.from_date} onChange={(e) => setNewClosure((c) => ({ ...c, from_date: e.target.value }))} />
            </div>
            <div className="flex-1">
              <Label>To</Label>
              <Input type="date" value={newClosure.to_date} onChange={(e) => setNewClosure((c) => ({ ...c, to_date: e.target.value }))} />
            </div>
            <div className="flex-1">
              <Label>Reason</Label>
              <Input value={newClosure.reason} onChange={(e) => setNewClosure((c) => ({ ...c, reason: e.target.value }))} />
            </div>
            <Button size="sm" onClick={submitClosure}>
              <Plus size={14} /> Add
            </Button>
          </div>
        </CardBody>
      </Card>

      {error && (
        <div className="flex items-start gap-2.5 rounded-[var(--radius-md)] bg-[var(--color-danger-soft)] px-3.5 py-3 text-sm text-[var(--color-danger)]">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

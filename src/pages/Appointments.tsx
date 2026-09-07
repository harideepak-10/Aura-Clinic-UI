import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, AlertTriangle, MapPin, RotateCcw } from 'lucide-react'
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Input, Label } from '../components/ui/Input'
import { Avatar } from '../components/ui/Avatar'
import { apiErrorMessage } from '../lib/api'
import { createAppointment, getAppointments, getPatients, getRooms, getTherapists, getTreatments } from '../lib/dataSource'
import type { Appointment, Patient, Room, StaffMember, Treatment } from '../lib/types'
import { statusTone, statusLabel } from '../lib/format'

const DAY_START = 8
const DAY_END = 20
const THERAPIST_COLORS = ['var(--color-forest-600)', 'var(--color-gold-600)', 'var(--color-info)', 'var(--color-danger)', 'var(--color-forest-800)']

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function parseTimeRange(time: string): { start: number; end: number } | null {
  const [startStr, endStr] = time.split('-').map((s) => s.trim())
  const toHour = (s: string) => {
    const [h, m] = s.split(':').map(Number)
    return h + (m || 0) / 60
  }
  if (!startStr) return null
  return { start: toHour(startStr), end: endStr ? toHour(endStr) : toHour(startStr) + 1 }
}

export function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [therapists, setTherapists] = useState<StaffMember[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedDate, setSelectedDate] = useState(todayIso())
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [roomsBlocked, setRoomsBlocked] = useState(false)

  const [form, setForm] = useState({
    patientId: '',
    treatmentId: '',
    pricePlanId: '',
    therapistId: '',
    roomId: '',
    time: '09:00',
  })

  const selectedTreatment = treatments.find((t) => String(t.id) === form.treatmentId)

  const loadDay = (date: string) => {
    setLoading(true)
    setLoadError(null)
    getAppointments({ date })
      .then(setAppointments)
      .catch((err) => setLoadError(apiErrorMessage(err, 'Could not load appointments.')))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadDay(selectedDate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate])

  useEffect(() => {
    getTherapists().then(setTherapists).catch(() => {})
    getTreatments().then(setTreatments).catch(() => {})
    getPatients().then(setPatients).catch(() => {})
    getRooms()
      .then(setRooms)
      .catch(() => setRoomsBlocked(true)) // rooms/ is admin-only on the backend
  }, [])

  const shiftDate = (days: number) => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + days)
    setSelectedDate(d.toISOString().slice(0, 10))
  }

  const submitBooking = async () => {
    if (!form.patientId || !form.therapistId || !form.treatmentId || !form.pricePlanId) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await createAppointment({
        patient_id: form.patientId,
        staff_id: Number(form.therapistId),
        treatment_id: Number(form.treatmentId),
        room_id: form.roomId ? Number(form.roomId) : undefined,
        price_plan_id: Number(form.pricePlanId),
        date: selectedDate,
        time: form.time,
        duration: selectedTreatment?.duration,
      })
      setModalOpen(false)
      setForm({ patientId: '', treatmentId: '', pricePlanId: '', therapistId: '', roomId: '', time: '09:00' })
      loadDay(selectedDate)
    } catch (err) {
      setSubmitError(apiErrorMessage(err, 'Could not create this booking.'))
    } finally {
      setSubmitting(false)
    }
  }

  const totalHours = DAY_END - DAY_START
  const therapistColor = (id: number) => THERAPIST_COLORS[therapists.findIndex((t) => t.id === id) % THERAPIST_COLORS.length] ?? THERAPIST_COLORS[0]

  const sorted = useMemo(() => [...appointments].sort((a, b) => a.time.localeCompare(b.time)), [appointments])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] p-1">
          <button onClick={() => shiftDate(-1)} className="rounded-full p-2 text-[var(--color-ink-soft)] hover:bg-[var(--color-ivory-dim)]">
            <ChevronLeft size={16} />
          </button>
          <span className="min-w-[9rem] text-center text-sm font-medium text-[var(--color-ink)]">
            {new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
          <button onClick={() => shiftDate(1)} className="rounded-full p-2 text-[var(--color-ink-soft)] hover:bg-[var(--color-ivory-dim)]">
            <ChevronRight size={16} />
          </button>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> New appointment
        </Button>
      </div>

      {loadError && (
        <Card className="flex items-center justify-between gap-4 p-5">
          <p className="text-sm text-[var(--color-danger)]">{loadError}</p>
          <Button variant="secondary" size="sm" onClick={() => loadDay(selectedDate)}>
            <RotateCcw size={14} /> Retry
          </Button>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Room &amp; therapist timeline</CardTitle>
          <div className="flex flex-wrap gap-2">
            {therapists.map((t) => (
              <span key={t.id} className="flex items-center gap-1.5 text-xs text-[var(--color-ink-faint)]">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: therapistColor(t.id) }} />
                {t.username.split(' ')[0]}
              </span>
            ))}
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <p className="py-16 text-center text-sm text-[var(--color-ink-faint)]">Loading schedule…</p>
          ) : therapists.length === 0 ? (
            <p className="py-16 text-center text-sm text-[var(--color-ink-faint)]">No therapists on staff yet.</p>
          ) : (
            <div className="grid gap-3" style={{ gridTemplateColumns: `3rem repeat(${therapists.length}, 1fr)` }}>
              <div className="relative" style={{ height: totalHours * 56 }}>
                {Array.from({ length: totalHours + 1 }).map((_, i) => (
                  <div key={i} className="absolute left-0 -translate-y-2 text-xs text-[var(--color-ink-faint)]" style={{ top: `${(i / totalHours) * 100}%` }}>
                    {DAY_START + i}:00
                  </div>
                ))}
              </div>
              {therapists.map((therapist) => (
                <div key={therapist.id} className="relative rounded-[var(--radius-lg)] bg-[var(--color-ivory-dim)]" style={{ height: totalHours * 56 }}>
                  {Array.from({ length: totalHours }).map((_, i) => (
                    <div key={i} className="absolute inset-x-0 border-t border-[var(--color-line-soft)]" style={{ top: `${(i / totalHours) * 100}%` }} />
                  ))}
                  {appointments
                    .filter((a) => a.staff_detail.id === therapist.id)
                    .map((a) => {
                      const range = parseTimeRange(a.time)
                      if (!range) return null
                      const top = ((range.start - DAY_START) / totalHours) * 100
                      const height = ((range.end - range.start) / totalHours) * 100
                      const cancelled = a.status === 'cancelled'
                      return (
                        <div
                          key={a.id}
                          className="absolute inset-x-1 overflow-hidden rounded-[var(--radius-md)] border px-2 py-1.5 text-xs shadow-soft"
                          style={{
                            top: `${top}%`,
                            height: `${Math.max(height, 6)}%`,
                            backgroundColor: cancelled ? 'var(--color-ivory-dim)' : 'var(--color-surface)',
                            borderColor: cancelled ? 'var(--color-line)' : therapistColor(therapist.id),
                            opacity: cancelled ? 0.55 : 1,
                          }}
                          title={`${a.patient_detail.name} — ${a.treatment_detail.name}`}
                        >
                          <p className={`font-medium text-[var(--color-ink)] ${cancelled ? 'line-through' : ''}`}>{a.patient_detail.name}</p>
                          <p className="text-[var(--color-ink-faint)]">{a.treatment_detail.name}</p>
                        </div>
                      )
                    })}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>List view</CardTitle>
        </CardHeader>
        <CardBody className="space-y-1">
          {!loading && sorted.length === 0 && <p className="py-6 text-center text-sm text-[var(--color-ink-faint)]">No appointments on this day.</p>}
          {sorted.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] px-3 py-3 transition-colors hover:bg-[var(--color-ivory-dim)]">
              <div className="flex items-center gap-3">
                <Avatar name={a.patient_detail.name} size={38} />
                <div>
                  <p className="text-sm font-medium text-[var(--color-ink)]">{a.patient_detail.name}</p>
                  <p className="flex items-center gap-1 text-xs text-[var(--color-ink-faint)]">
                    {a.treatment_detail.name} · {a.staff_detail.name}
                    {a.room_detail && (
                      <>
                        <MapPin size={11} className="ml-1" /> {a.room_detail.name}
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-[var(--color-ink-soft)]">{a.time}</span>
                <Badge tone={statusTone(a.status)}>{statusLabel(a.status)}</Badge>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New appointment"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitBooking} disabled={submitting || !form.patientId || !form.therapistId || !form.treatmentId || !form.pricePlanId}>
              {submitting ? 'Booking…' : 'Confirm booking'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label>Patient</Label>
            <select
              className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-forest-600)]"
              value={form.patientId}
              onChange={(e) => setForm((f) => ({ ...f, patientId: e.target.value }))}
            >
              <option value="">Select patient…</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Treatment</Label>
            <select
              className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-forest-600)]"
              value={form.treatmentId}
              onChange={(e) => setForm((f) => ({ ...f, treatmentId: e.target.value, pricePlanId: '' }))}
            >
              <option value="">Select treatment…</option>
              {treatments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.duration} min)
                </option>
              ))}
            </select>
          </div>

          {selectedTreatment && (
            <div>
              <Label>Price plan</Label>
              <select
                className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-forest-600)]"
                value={form.pricePlanId}
                onChange={(e) => setForm((f) => ({ ...f, pricePlanId: e.target.value }))}
              >
                <option value="">Select price plan…</option>
                {selectedTreatment.price_plans.map((pp) => (
                  <option key={pp.id} value={pp.id}>
                    {pp.sessions} session{pp.sessions > 1 ? 's' : ''} — €{pp.price}
                  </option>
                ))}
              </select>
              {selectedTreatment.price_plans.length === 0 && (
                <p className="mt-1.5 text-xs text-[var(--color-warning)]">This treatment has no price plans set up yet.</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Therapist</Label>
              <select
                className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-forest-600)]"
                value={form.therapistId}
                onChange={(e) => setForm((f) => ({ ...f, therapistId: e.target.value }))}
              >
                <option value="">Select…</option>
                {therapists.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.username}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Room {roomsBlocked && <span className="normal-case text-[var(--color-ink-faint)]">(admin only)</span>}</Label>
              <select
                className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-forest-600)] disabled:opacity-50"
                value={form.roomId}
                disabled={roomsBlocked}
                onChange={(e) => setForm((f) => ({ ...f, roomId: e.target.value }))}
              >
                <option value="">No room / any</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label>Start time</Label>
            <Input type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
            <p className="mt-1.5 text-xs text-[var(--color-ink-faint)]">
              Booking for {new Date(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}. The backend checks
              therapist/room availability, working hours, breaks, and leave — you'll see its message here if the slot doesn't work.
            </p>
          </div>

          {submitError && (
            <div className="flex items-start gap-2.5 rounded-[var(--radius-md)] bg-[var(--color-danger-soft)] px-3.5 py-3 text-sm text-[var(--color-danger)]">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, AlertTriangle, MapPin } from 'lucide-react'
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Input, Label } from '../components/ui/Input'
import { Avatar } from '../components/ui/Avatar'
import { getAppointments, getPatients, getRooms, getTherapists } from '../lib/dataSource'
import type { Appointment, Patient, Room, Therapist } from '../lib/types'
import { formatTime, statusTone } from '../lib/format'

const DAY_START = 8
const DAY_END = 20

function isSameDay(iso: string, date: string) {
  return iso.slice(0, 10) === date
}

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return new Date(aStart) < new Date(bEnd) && new Date(bStart) < new Date(aEnd)
}

export function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedDate, setSelectedDate] = useState('2026-09-07')
  const [modalOpen, setModalOpen] = useState(false)

  const [form, setForm] = useState({
    patientId: '',
    therapistId: '',
    roomId: '',
    service: '',
    time: '09:00',
    durationMin: 60,
  })

  useEffect(() => {
    getAppointments().then(setAppointments)
    getTherapists().then(setTherapists)
    getRooms().then(setRooms)
    getPatients().then(setPatients)
  }, [])

  const dayAppointments = useMemo(
    () => appointments.filter((a) => isSameDay(a.start, selectedDate)),
    [appointments, selectedDate],
  )

  const conflict = useMemo(() => {
    if (!form.therapistId || !form.time) return null
    const start = `${selectedDate}T${form.time}:00`
    const end = new Date(new Date(start).getTime() + form.durationMin * 60000).toISOString().slice(0, 19)
    return dayAppointments.find(
      (a) =>
        a.status !== 'cancelled' &&
        (a.therapistId === form.therapistId || a.roomId === form.roomId) &&
        overlaps(a.start, a.end, start, end),
    )
  }, [form, dayAppointments, selectedDate])

  const shiftDate = (days: number) => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + days)
    setSelectedDate(d.toISOString().slice(0, 10))
  }

  const submitBooking = () => {
    const patient = patients.find((p) => p.id === form.patientId)
    const start = `${selectedDate}T${form.time}:00`
    const end = new Date(new Date(start).getTime() + form.durationMin * 60000).toISOString().slice(0, 19)
    const newAppt: Appointment = {
      id: `local-${Date.now()}`,
      patientId: form.patientId,
      patientName: patient?.name ?? 'Walk-in',
      therapistId: form.therapistId,
      roomId: form.roomId,
      service: form.service || 'Consultation',
      start,
      end,
      status: 'pending',
    }
    setAppointments((prev) => [...prev, newAppt])
    setModalOpen(false)
    setForm({ patientId: '', therapistId: '', roomId: '', service: '', time: '09:00', durationMin: 60 })
  }

  const totalHours = DAY_END - DAY_START

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

      <Card>
        <CardHeader>
          <CardTitle>Room &amp; therapist timeline</CardTitle>
          <div className="flex gap-2">
            {therapists.map((t) => (
              <span key={t.id} className="flex items-center gap-1.5 text-xs text-[var(--color-ink-faint)]">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
                {t.name.split(' ')[0]}
              </span>
            ))}
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-[3rem_repeat(4,1fr)] gap-3">
            <div className="relative" style={{ height: totalHours * 56 }}>
              {Array.from({ length: totalHours + 1 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute left-0 -translate-y-2 text-xs text-[var(--color-ink-faint)]"
                  style={{ top: `${(i / totalHours) * 100}%` }}
                >
                  {DAY_START + i}:00
                </div>
              ))}
            </div>
            {therapists.map((therapist) => (
              <div
                key={therapist.id}
                className="relative rounded-[var(--radius-lg)] bg-[var(--color-ivory-dim)]"
                style={{ height: totalHours * 56 }}
              >
                {Array.from({ length: totalHours }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute inset-x-0 border-t border-[var(--color-line-soft)]"
                    style={{ top: `${(i / totalHours) * 100}%` }}
                  />
                ))}
                {dayAppointments
                  .filter((a) => a.therapistId === therapist.id)
                  .map((a) => {
                    const startHour = new Date(a.start).getHours() + new Date(a.start).getMinutes() / 60
                    const endHour = new Date(a.end).getHours() + new Date(a.end).getMinutes() / 60
                    const top = ((startHour - DAY_START) / totalHours) * 100
                    const height = ((endHour - startHour) / totalHours) * 100
                    const cancelled = a.status === 'cancelled'
                    return (
                      <div
                        key={a.id}
                        className="absolute inset-x-1 overflow-hidden rounded-[var(--radius-md)] border px-2 py-1.5 text-xs shadow-soft"
                        style={{
                          top: `${top}%`,
                          height: `${Math.max(height, 6)}%`,
                          backgroundColor: cancelled ? 'var(--color-ivory-dim)' : 'var(--color-surface)',
                          borderColor: cancelled ? 'var(--color-line)' : therapist.color,
                          opacity: cancelled ? 0.55 : 1,
                        }}
                        title={`${a.patientName} — ${a.service}`}
                      >
                        <p className={`font-medium text-[var(--color-ink)] ${cancelled ? 'line-through' : ''}`}>
                          {a.patientName}
                        </p>
                        <p className="text-[var(--color-ink-faint)]">{a.service}</p>
                      </div>
                    )
                  })}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>List view</CardTitle>
        </CardHeader>
        <CardBody className="space-y-1">
          {dayAppointments.length === 0 && (
            <p className="py-6 text-center text-sm text-[var(--color-ink-faint)]">No appointments on this day.</p>
          )}
          {dayAppointments
            .sort((a, b) => a.start.localeCompare(b.start))
            .map((a) => {
              const room = rooms.find((r) => r.id === a.roomId)
              const therapist = therapists.find((t) => t.id === a.therapistId)
              return (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] px-3 py-3 transition-colors hover:bg-[var(--color-ivory-dim)]"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={a.patientName} size={38} />
                    <div>
                      <p className="text-sm font-medium text-[var(--color-ink)]">{a.patientName}</p>
                      <p className="flex items-center gap-1 text-xs text-[var(--color-ink-faint)]">
                        {a.service} · {therapist?.name} <MapPin size={11} className="ml-1" /> {room?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[var(--color-ink-soft)]">
                      {formatTime(a.start)}–{formatTime(a.end)}
                    </span>
                    <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                  </div>
                </div>
              )
            })}
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
            <Button onClick={submitBooking} disabled={!form.patientId || !form.therapistId || !form.roomId}>
              Confirm booking
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
            <Label>Service</Label>
            <Input
              value={form.service}
              onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
              placeholder="e.g. Signature Facial"
            />
          </div>

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
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Room</Label>
              <select
                className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-forest-600)]"
                value={form.roomId}
                onChange={(e) => setForm((f) => ({ ...f, roomId: e.target.value }))}
              >
                <option value="">Select…</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start time</Label>
              <Input
                type="time"
                value={form.time}
                onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
              />
            </div>
            <div>
              <Label>Duration (min)</Label>
              <Input
                type="number"
                step={15}
                min={15}
                value={form.durationMin}
                onChange={(e) => setForm((f) => ({ ...f, durationMin: Number(e.target.value) }))}
              />
            </div>
          </div>

          {conflict && (
            <div className="flex items-start gap-2.5 rounded-[var(--radius-md)] bg-[var(--color-warning-soft)] px-3.5 py-3 text-sm text-[var(--color-warning)]">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>
                Overlaps with <strong>{conflict.patientName}</strong>'s {conflict.service} (
                {formatTime(conflict.start)}–{formatTime(conflict.end)}). Choose a different time, therapist, or room.
              </span>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

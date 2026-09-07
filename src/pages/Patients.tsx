import { useEffect, useMemo, useState } from 'react'
import { Search, Phone, Mail, Calendar, ChevronRight } from 'lucide-react'
import { Card, CardBody } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { getAppointments, getPatients } from '../lib/dataSource'
import type { Appointment, Patient } from '../lib/types'
import { formatDate, statusTone } from '../lib/format'

export function Patients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Patient | null>(null)

  useEffect(() => {
    getPatients().then(setPatients)
    getAppointments().then(setAppointments)
  }, [])

  const filtered = useMemo(
    () =>
      patients.filter((p) =>
        [p.name, p.email, ...p.tags].join(' ').toLowerCase().includes(query.toLowerCase()),
      ),
    [patients, query],
  )

  const history = selected ? appointments.filter((a) => a.patientId === selected.id) : []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="w-full max-w-sm">
          <Input
            placeholder="Search by name, email, or tag…"
            icon={<Search size={16} />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <p className="text-sm text-[var(--color-ink-faint)]">{filtered.length} patients</p>
      </div>

      <Card>
        <CardBody className="p-0">
          <div className="divide-y divide-[var(--color-line-soft)]">
            {filtered.map((patient) => (
              <button
                key={patient.id}
                onClick={() => setSelected(patient)}
                className="flex w-full flex-wrap items-center justify-between gap-3 px-6 py-4 text-left transition-colors hover:bg-[var(--color-ivory-dim)]"
              >
                <div className="flex items-center gap-3.5">
                  <Avatar name={patient.name} size={42} />
                  <div>
                    <p className="text-sm font-medium text-[var(--color-ink)]">{patient.name}</p>
                    <p className="flex items-center gap-3 text-xs text-[var(--color-ink-faint)]">
                      <span className="flex items-center gap-1">
                        <Mail size={11} /> {patient.email}
                      </span>
                      <span className="hidden items-center gap-1 sm:flex">
                        <Phone size={11} /> {patient.phone}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden gap-1.5 sm:flex">
                    {patient.tags.map((tag) => (
                      <Badge key={tag} tone={tag === 'VIP' ? 'gold' : 'neutral'}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="hidden text-right text-xs text-[var(--color-ink-faint)] md:block">
                    <p>{patient.totalVisits} visits</p>
                    <p>Last: {patient.lastVisit ? formatDate(patient.lastVisit) : '—'}</p>
                  </div>
                  <ChevronRight size={16} className="text-[var(--color-ink-faint)]" />
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-6 py-10 text-center text-sm text-[var(--color-ink-faint)]">No patients match your search.</p>
            )}
          </div>
        </CardBody>
      </Card>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name} width="max-w-xl">
        {selected && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar name={selected.name} size={56} />
              <div>
                <div className="flex flex-wrap gap-1.5">
                  {selected.tags.map((tag) => (
                    <Badge key={tag} tone={tag === 'VIP' ? 'gold' : 'neutral'}>
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="mt-1 text-xs text-[var(--color-ink-faint)]">
                  Member since {formatDate(selected.memberSince)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-[var(--color-ink-soft)]">
                <Mail size={14} className="text-[var(--color-ink-faint)]" /> {selected.email}
              </div>
              <div className="flex items-center gap-2 text-[var(--color-ink-soft)]">
                <Phone size={14} className="text-[var(--color-ink-faint)]" /> {selected.phone}
              </div>
              <div className="flex items-center gap-2 text-[var(--color-ink-soft)]">
                <Calendar size={14} className="text-[var(--color-ink-faint)]" /> {selected.totalVisits} total visits
              </div>
            </div>

            {selected.notes && (
              <div className="rounded-[var(--radius-md)] bg-[var(--color-forest-50)] px-4 py-3 text-sm text-[var(--color-forest-800)]">
                {selected.notes}
              </div>
            )}

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-ink-faint)]">
                Appointment history
              </p>
              <div className="space-y-2">
                {history.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-line-soft)] px-3.5 py-2.5 text-sm">
                    <div>
                      <p className="font-medium text-[var(--color-ink)]">{a.service}</p>
                      <p className="text-xs text-[var(--color-ink-faint)]">{formatDate(a.start)}</p>
                    </div>
                    <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                  </div>
                ))}
                {history.length === 0 && (
                  <p className="text-sm text-[var(--color-ink-faint)]">No appointments recorded yet.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setSelected(null)}>
                Close
              </Button>
              <Button>Book new appointment</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

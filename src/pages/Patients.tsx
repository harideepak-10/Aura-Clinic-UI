import { useEffect, useMemo, useState } from 'react'
import { Search, Phone, Mail, Calendar, ChevronRight, RotateCcw } from 'lucide-react'
import { Card, CardBody } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { getPatients } from '../lib/dataSource'
import { apiErrorMessage } from '../lib/api'
import type { Patient } from '../lib/types'
import { formatDate, formatEur } from '../lib/format'

export function Patients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    getPatients()
      .then(setPatients)
      .catch((err) => setError(apiErrorMessage(err, 'Could not load patients.')))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const filtered = useMemo(
    () => patients.filter((p) => [p.name, p.email ?? '', p.tags, p.category].join(' ').toLowerCase().includes(query.toLowerCase())),
    [patients, query],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="w-full max-w-sm">
          <Input placeholder="Search by name, email, or tag…" icon={<Search size={16} />} value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <p className="text-sm text-[var(--color-ink-faint)]">{filtered.length} patients</p>
      </div>

      {error && (
        <Card className="flex items-center justify-between gap-4 p-5">
          <p className="text-sm text-[var(--color-danger)]">{error}</p>
          <Button variant="secondary" size="sm" onClick={load}>
            <RotateCcw size={14} /> Retry
          </Button>
        </Card>
      )}

      <Card>
        <CardBody className="p-0">
          {loading ? (
            <p className="px-6 py-10 text-center text-sm text-[var(--color-ink-faint)]">Loading patients…</p>
          ) : (
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
                      <p className="text-sm font-medium text-[var(--color-ink)]">
                        {patient.name} <span className="font-normal text-[var(--color-ink-faint)]">· {patient.id}</span>
                      </p>
                      <p className="flex items-center gap-3 text-xs text-[var(--color-ink-faint)]">
                        {patient.email && (
                          <span className="flex items-center gap-1">
                            <Mail size={11} /> {patient.email}
                          </span>
                        )}
                        <span className="hidden items-center gap-1 sm:flex">
                          <Phone size={11} /> {patient.phone}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge tone={patient.category === 'VIP' ? 'gold' : 'neutral'}>{patient.category}</Badge>
                    <div className="hidden text-right text-xs text-[var(--color-ink-faint)] md:block">
                      <p>{patient.visits} visits</p>
                      <p>Last: {patient.last_visit.date ? formatDate(patient.last_visit.date) : '—'}</p>
                    </div>
                    <ChevronRight size={16} className="text-[var(--color-ink-faint)]" />
                  </div>
                </button>
              ))}
              {filtered.length === 0 && <p className="px-6 py-10 text-center text-sm text-[var(--color-ink-faint)]">No patients match your search.</p>}
            </div>
          )}
        </CardBody>
      </Card>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name} width="max-w-xl">
        {selected && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar name={selected.name} size={56} />
              <div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone={selected.category === 'VIP' ? 'gold' : 'neutral'}>{selected.category}</Badge>
                  {selected.tags &&
                    selected.tags
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .map((tag) => (
                        <Badge key={tag} tone="neutral">
                          {tag}
                        </Badge>
                      ))}
                </div>
                <p className="mt-1 text-xs text-[var(--color-ink-faint)]">
                  {selected.id} · Member since {formatDate(selected.createdAt)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {selected.email && (
                <div className="flex items-center gap-2 text-[var(--color-ink-soft)]">
                  <Mail size={14} className="text-[var(--color-ink-faint)]" /> {selected.email}
                </div>
              )}
              <div className="flex items-center gap-2 text-[var(--color-ink-soft)]">
                <Phone size={14} className="text-[var(--color-ink-faint)]" /> {selected.phone}
              </div>
              <div className="flex items-center gap-2 text-[var(--color-ink-soft)]">
                <Calendar size={14} className="text-[var(--color-ink-faint)]" /> {selected.visits} total visits
              </div>
              <div className="text-[var(--color-ink-soft)]">Total spent: {formatEur(selected.total_spent)}</div>
            </div>

            {(selected.allergies || selected.contraindications || selected.notes) && (
              <div className="space-y-2">
                {selected.allergies && (
                  <div className="rounded-[var(--radius-md)] bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger)]">
                    <span className="font-medium">Allergies:</span> {selected.allergies}
                  </div>
                )}
                {selected.contraindications && (
                  <div className="rounded-[var(--radius-md)] bg-[var(--color-warning-soft)] px-4 py-3 text-sm text-[var(--color-warning)]">
                    <span className="font-medium">Contraindications:</span> {selected.contraindications}
                  </div>
                )}
                {selected.notes && (
                  <div className="rounded-[var(--radius-md)] bg-[var(--color-forest-50)] px-4 py-3 text-sm text-[var(--color-forest-800)]">{selected.notes}</div>
                )}
              </div>
            )}

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-ink-faint)]">Last visit</p>
              {selected.last_visit.date ? (
                <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-line-soft)] px-3.5 py-2.5 text-sm">
                  <p className="font-medium text-[var(--color-ink)]">{selected.last_visit.treatment}</p>
                  <p className="text-xs text-[var(--color-ink-faint)]">{formatDate(selected.last_visit.date)}</p>
                </div>
              ) : (
                <p className="text-sm text-[var(--color-ink-faint)]">No completed appointments yet.</p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setSelected(null)}>
                Close
              </Button>
              <a href="/appointments">
                <Button>Book new appointment</Button>
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

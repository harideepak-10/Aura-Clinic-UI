import { useEffect, useMemo, useState } from 'react'
import { Search, Phone, Mail, Calendar, ChevronRight, RotateCcw, AlertTriangle, Camera, FileCheck2, StickyNote, Plus } from 'lucide-react'
import { Card, CardBody } from '../components/ui/Card'
import { Input, Label } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import {
  addPatientConsent,
  addPatientNote,
  getPatientConsent,
  getPatientHistory,
  getPatientNotes,
  getPatientOverview,
  getPatientPhotos,
  getPatients,
} from '../lib/dataSource'
import { apiErrorMessage } from '../lib/api'
import type { ConsentResponse, Patient, PatientHistory, PatientNotesResponse, PatientOverview, PatientPhotosResponse } from '../lib/types'
import { formatDate, formatEur, statusLabel, statusTone } from '../lib/format'

type DetailTab = 'overview' | 'history' | 'notes' | 'photos' | 'consent'

export function Patients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Patient | null>(null)
  const [tab, setTab] = useState<DetailTab>('overview')
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
                  onClick={() => {
                    setSelected(patient)
                    setTab('overview')
                  }}
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

      <PatientDetailModal patient={selected} onClose={() => setSelected(null)} tab={tab} setTab={setTab} />
    </div>
  )
}

const TABS: { key: DetailTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'history', label: 'History' },
  { key: 'notes', label: 'Notes' },
  { key: 'photos', label: 'Photos' },
  { key: 'consent', label: 'Consent' },
]

function PatientDetailModal({
  patient,
  onClose,
  tab,
  setTab,
}: {
  patient: Patient | null
  onClose: () => void
  tab: DetailTab
  setTab: (t: DetailTab) => void
}) {
  const [overview, setOverview] = useState<PatientOverview | null>(null)
  const [history, setHistory] = useState<PatientHistory | null>(null)
  const [notes, setNotes] = useState<PatientNotesResponse | null>(null)
  const [photos, setPhotos] = useState<PatientPhotosResponse | null>(null)
  const [consent, setConsent] = useState<ConsentResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [addNoteOpen, setAddNoteOpen] = useState(false)
  const [addConsentOpen, setAddConsentOpen] = useState(false)

  useEffect(() => {
    if (!patient) return
    setError(null)
    getPatientOverview(patient.id).then(setOverview).catch((err) => setError(apiErrorMessage(err, 'Could not load overview.')))
  }, [patient])

  useEffect(() => {
    if (!patient) return
    if (tab === 'history' && !history) getPatientHistory(patient.id).then(setHistory).catch((err) => setError(apiErrorMessage(err, 'Could not load history.')))
    if (tab === 'notes' && !notes) getPatientNotes(patient.id).then(setNotes).catch((err) => setError(apiErrorMessage(err, 'Could not load notes.')))
    if (tab === 'photos' && !photos) getPatientPhotos(patient.id).then(setPhotos).catch((err) => setError(apiErrorMessage(err, 'Could not load photos.')))
    if (tab === 'consent' && !consent) getPatientConsent(patient.id).then(setConsent).catch((err) => setError(apiErrorMessage(err, 'Could not load consent records.')))
  }, [tab, patient])

  useEffect(() => {
    setOverview(null)
    setHistory(null)
    setNotes(null)
    setPhotos(null)
    setConsent(null)
  }, [patient?.id])

  if (!patient) return null

  return (
    <Modal open={!!patient} onClose={onClose} title={patient.name} width="max-w-2xl">
      <div className="mb-5 flex items-center gap-4">
        <Avatar name={patient.name} size={48} />
        <div>
          <div className="flex flex-wrap gap-1.5">
            <Badge tone={patient.category === 'VIP' ? 'gold' : 'neutral'}>{patient.category}</Badge>
            {patient.allergies && <Badge tone="danger">Allergy warning</Badge>}
          </div>
          <p className="mt-1 text-xs text-[var(--color-ink-faint)]">
            {patient.id} · {patient.phone} · Member since {formatDate(patient.createdAt)}
          </p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-1.5 border-b border-[var(--color-line-soft)] pb-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${tab === t.key ? 'bg-[var(--color-forest-800)] text-[var(--color-ivory)]' : 'text-[var(--color-ink-soft)] hover:bg-[var(--color-ivory-dim)]'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-5">
          {overview?.allergy_warning && (
            <div className="rounded-[var(--radius-md)] bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger)]">
              <span className="font-medium">Allergy warning:</span> {overview.allergy_warning}
            </div>
          )}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-ink-faint)]">Upcoming appointment</p>
            {overview?.upcoming_appointment ? (
              <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-line-soft)] px-3.5 py-2.5 text-sm">
                <div>
                  <p className="font-medium text-[var(--color-ink)]">{overview.upcoming_appointment.treatment}</p>
                  <p className="text-xs text-[var(--color-ink-faint)]">
                    {overview.upcoming_appointment.therapist} · Session {overview.upcoming_appointment.session_number}/{overview.upcoming_appointment.total_sessions}
                  </p>
                </div>
                <p className="text-xs text-[var(--color-ink-faint)]">
                  {formatDate(overview.upcoming_appointment.date)} · {overview.upcoming_appointment.time}
                </p>
              </div>
            ) : (
              <p className="text-sm text-[var(--color-ink-faint)]">No upcoming appointment.</p>
            )}
          </div>
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-ink-faint)]">Active packages</p>
            <div className="space-y-2">
              {(overview?.active_packages ?? []).map((pkg, i) => (
                <div key={i} className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-line-soft)] px-3.5 py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-[var(--color-ink)]">{pkg.package_name}</p>
                    <p className="text-xs text-[var(--color-ink-faint)]">{pkg.therapist}</p>
                  </div>
                  <p className="text-xs text-[var(--color-ink-faint)]">
                    {pkg.sessions_used}/{pkg.total_sessions} used
                  </p>
                </div>
              ))}
              {(overview?.active_packages ?? []).length === 0 && <p className="text-sm text-[var(--color-ink-faint)]">No active packages.</p>}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-ink-faint)]">Recent activity</p>
            <div className="space-y-2">
              {(overview?.patient_activity ?? []).map((a, i) => (
                <div key={i} className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-line-soft)] px-3.5 py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-[var(--color-ink)]">{a.title}</p>
                    <p className="text-xs text-[var(--color-ink-faint)]">{a.subtitle}</p>
                  </div>
                  <p className="text-xs text-[var(--color-ink-faint)]">{formatDate(a.date)}</p>
                </div>
              ))}
              {(overview?.patient_activity ?? []).length === 0 && <p className="text-sm text-[var(--color-ink-faint)]">No recent activity.</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
            <Calendar size={14} className="text-[var(--color-ink-faint)]" /> {patient.visits} total visits · Total spent {formatEur(patient.total_spent)}
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-4">
          {history ? (
            <>
              <div className="grid grid-cols-4 gap-3 text-center text-xs">
                <div className="rounded-[var(--radius-md)] bg-[var(--color-ivory-dim)] py-2.5">
                  <p className="font-display text-lg text-[var(--color-ink)]">{history.stats.total}</p>
                  <p className="text-[var(--color-ink-faint)]">Total</p>
                </div>
                <div className="rounded-[var(--radius-md)] bg-[var(--color-ivory-dim)] py-2.5">
                  <p className="font-display text-lg text-[var(--color-ink)]">{history.stats.completed}</p>
                  <p className="text-[var(--color-ink-faint)]">Completed</p>
                </div>
                <div className="rounded-[var(--radius-md)] bg-[var(--color-ivory-dim)] py-2.5">
                  <p className="font-display text-lg text-[var(--color-ink)]">{history.stats.scheduled}</p>
                  <p className="text-[var(--color-ink-faint)]">Scheduled</p>
                </div>
                <div className="rounded-[var(--radius-md)] bg-[var(--color-ivory-dim)] py-2.5">
                  <p className="font-display text-lg text-[var(--color-ink)]">{history.stats.cancelled}</p>
                  <p className="text-[var(--color-ink-faint)]">Cancelled</p>
                </div>
              </div>
              <div className="space-y-2">
                {history.timeline.map((h) => (
                  <div key={h.id} className="rounded-[var(--radius-md)] border border-[var(--color-line-soft)] px-3.5 py-2.5 text-sm">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-[var(--color-ink)]">{h.treatment}</p>
                      <Badge tone={statusTone(h.status)}>{statusLabel(h.status)}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--color-ink-faint)]">
                      {formatDate(h.date)} · {h.therapist} · {h.price}
                    </p>
                    {h.cancellation_reason && <p className="mt-1 text-xs text-[var(--color-danger)]">{h.cancellation_reason}</p>}
                  </div>
                ))}
                {history.timeline.length === 0 && <p className="text-sm text-[var(--color-ink-faint)]">No treatment history yet.</p>}
              </div>
            </>
          ) : (
            <p className="py-6 text-center text-sm text-[var(--color-ink-faint)]">Loading history…</p>
          )}
        </div>
      )}

      {tab === 'notes' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setAddNoteOpen(true)}>
              <Plus size={14} /> Add note
            </Button>
          </div>
          {notes ? (
            <div className="space-y-2">
              {notes.notes.map((n) => (
                <div key={n.id} className="rounded-[var(--radius-md)] border border-[var(--color-line-soft)] px-3.5 py-3 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="flex items-center gap-1.5 font-medium text-[var(--color-ink)]">
                      <StickyNote size={13} /> {n.treatment_name}
                    </p>
                    <p className="text-xs text-[var(--color-ink-faint)]">{formatDate(n.date)}</p>
                  </div>
                  {n.skin_observation && <p className="mt-1.5 text-xs text-[var(--color-ink-soft)]">{n.skin_observation}</p>}
                  {n.session_notes && <p className="mt-1 text-xs text-[var(--color-ink-faint)]">{n.session_notes}</p>}
                </div>
              ))}
              {notes.notes.length === 0 && <p className="text-sm text-[var(--color-ink-faint)]">No clinical notes yet.</p>}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-[var(--color-ink-faint)]">Loading notes…</p>
          )}
          <AddNoteModal
            open={addNoteOpen}
            onClose={() => setAddNoteOpen(false)}
            patientId={patient.id}
            onAdded={(n) => setNotes((prev) => (prev ? { ...prev, notes: [n, ...prev.notes] } : prev))}
          />
        </div>
      )}

      {tab === 'photos' && (
        <div className="space-y-3">
          {photos ? (
            <div className="grid grid-cols-2 gap-3">
              {photos.photos.map((p) => (
                <div key={p.session_id} className="rounded-[var(--radius-md)] border border-[var(--color-line-soft)] p-3">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-ink)]">
                    <Camera size={13} /> {p.treatment_name}
                  </p>
                  <p className="text-xs text-[var(--color-ink-faint)]">{formatDate(p.date)}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {p.before_photo ? (
                      <img src={p.before_photo} alt="Before" className="h-20 w-full rounded-[var(--radius-sm)] object-cover" />
                    ) : (
                      <div className="flex h-20 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-ivory-dim)] text-[10px] text-[var(--color-ink-faint)]">No before</div>
                    )}
                    {p.after_photo ? (
                      <img src={p.after_photo} alt="After" className="h-20 w-full rounded-[var(--radius-sm)] object-cover" />
                    ) : (
                      <div className="flex h-20 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-ivory-dim)] text-[10px] text-[var(--color-ink-faint)]">No after</div>
                    )}
                  </div>
                </div>
              ))}
              {photos.photos.length === 0 && <p className="col-span-2 text-sm text-[var(--color-ink-faint)]">No progress photos yet.</p>}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-[var(--color-ink-faint)]">Loading photos…</p>
          )}
        </div>
      )}

      {tab === 'consent' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setAddConsentOpen(true)}>
              <Plus size={14} /> Add record
            </Button>
          </div>
          {consent ? (
            <div className="space-y-2">
              {consent.records.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-line-soft)] px-3.5 py-2.5 text-sm">
                  <p className="flex items-center gap-1.5 font-medium text-[var(--color-ink)]">
                    <FileCheck2 size={14} /> {r.title}
                  </p>
                  <Badge tone={r.status === 'signed' ? 'success' : 'warning'}>{r.status}</Badge>
                </div>
              ))}
              {consent.records.length === 0 && <p className="text-sm text-[var(--color-ink-faint)]">No consent records yet.</p>}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-[var(--color-ink-faint)]">Loading consent records…</p>
          )}
          <AddConsentModal
            open={addConsentOpen}
            onClose={() => setAddConsentOpen(false)}
            patientId={patient.id}
            onAdded={(r) => setConsent((prev) => (prev ? { ...prev, records: [r, ...prev.records] } : prev))}
          />
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2.5 rounded-[var(--radius-md)] bg-[var(--color-danger-soft)] px-3.5 py-3 text-sm text-[var(--color-danger)]">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </Modal>
  )
}

function AddNoteModal({
  open,
  onClose,
  patientId,
  onAdded,
}: {
  open: boolean
  onClose: () => void
  patientId: string
  onAdded: (n: PatientNotesResponse['notes'][number]) => void
}) {
  const [form, setForm] = useState({ treatment_name: '', skin_observation: '', session_notes: '', products_used: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setSaving(true)
    setError(null)
    try {
      const created = await addPatientNote(patientId, form)
      onAdded(created)
      onClose()
      setForm({ treatment_name: '', skin_observation: '', session_notes: '', products_used: '' })
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not add this note.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add clinical note"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? 'Saving…' : 'Save note'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <Label>Treatment</Label>
          <Input value={form.treatment_name} onChange={(e) => setForm((f) => ({ ...f, treatment_name: e.target.value }))} />
        </div>
        <div>
          <Label>Skin observation</Label>
          <textarea
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-forest-600)]"
            rows={2}
            value={form.skin_observation}
            onChange={(e) => setForm((f) => ({ ...f, skin_observation: e.target.value }))}
          />
        </div>
        <div>
          <Label>Session notes</Label>
          <textarea
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-forest-600)]"
            rows={2}
            value={form.session_notes}
            onChange={(e) => setForm((f) => ({ ...f, session_notes: e.target.value }))}
          />
        </div>
        <div>
          <Label>Products used</Label>
          <Input value={form.products_used} onChange={(e) => setForm((f) => ({ ...f, products_used: e.target.value }))} />
        </div>
        {error && (
          <div className="flex items-start gap-2.5 rounded-[var(--radius-md)] bg-[var(--color-danger-soft)] px-3.5 py-3 text-sm text-[var(--color-danger)]">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </Modal>
  )
}

function AddConsentModal({
  open,
  onClose,
  patientId,
  onAdded,
}: {
  open: boolean
  onClose: () => void
  patientId: string
  onAdded: (r: ConsentResponse['records'][number]) => void
}) {
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setSaving(true)
    setError(null)
    try {
      const created = await addPatientConsent(patientId, { title })
      onAdded(created)
      onClose()
      setTitle('')
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not add this consent record.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add consent record"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving || !title}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </>
      }
    >
      <div>
        <Label>Form title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Facial treatment consent" />
      </div>
      {error && (
        <div className="mt-4 flex items-start gap-2.5 rounded-[var(--radius-md)] bg-[var(--color-danger-soft)] px-3.5 py-3 text-sm text-[var(--color-danger)]">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </Modal>
  )
}

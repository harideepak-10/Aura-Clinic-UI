import { useEffect, useMemo, useState } from 'react'
import { Search, Plus, Star, Users as UsersIcon, RotateCcw, AlertTriangle, Phone, Mail, UserX } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Input, Label } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { apiErrorMessage } from '../lib/api'
import {
  addStaffBreak,
  addStaffLeave,
  deactivateStaff,
  getStaff,
  getStaffBreaks,
  getStaffLeaves,
  getWorkingHours,
  registerStaff,
  saveWorkingHours,
  updateStaff,
} from '../lib/dataSource'
import type { StaffBreak, StaffLeave, StaffMember, WeekDay, WorkingHoursDay } from '../lib/types'

const WEEK_DAYS: WeekDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
type RoleFilter = 'all' | 'therapist' | 'reception'
type DetailTab = 'profile' | 'hours' | 'breaks' | 'leaves'

export function Staff() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selected, setSelected] = useState<StaffMember | null>(null)
  const [detailTab, setDetailTab] = useState<DetailTab>('profile')
  const [addOpen, setAddOpen] = useState(false)

  const load = () => {
    setLoading(true)
    setError(null)
    getStaff()
      .then(setStaff)
      .catch((err) => setError(apiErrorMessage(err, 'Could not load staff.')))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const filtered = useMemo(
    () => staff.filter((s) => (roleFilter === 'all' || s.role === roleFilter) && s.username.toLowerCase().includes(query.toLowerCase())),
    [staff, roleFilter, query],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-64">
            <Input placeholder="Search staff…" icon={<Search size={16} />} value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="flex gap-1.5">
            {(['all', 'therapist', 'reception'] as RoleFilter[]).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${roleFilter === r ? 'bg-[var(--color-forest-800)] text-[var(--color-ivory)]' : 'bg-[var(--color-surface)] text-[var(--color-ink-soft)] border border-[var(--color-line)] hover:border-[var(--color-forest-500)]'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus size={16} /> Add staff
        </Button>
      </div>

      {error && (
        <Card className="flex items-center justify-between gap-4 p-5">
          <p className="text-sm text-[var(--color-danger)]">{error}</p>
          <Button variant="secondary" size="sm" onClick={load}>
            <RotateCcw size={14} /> Retry
          </Button>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading && <p className="col-span-full py-10 text-center text-sm text-[var(--color-ink-faint)]">Loading staff…</p>}
        {!loading &&
          filtered.map((s) => (
            <Card
              key={s.id}
              className="cursor-pointer p-5 transition-shadow hover:shadow-lift"
              onClick={() => {
                setSelected(s)
                setDetailTab('profile')
              }}
            >
              <div className="flex items-start gap-3">
                <Avatar name={s.username} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-[var(--color-ink)]">{s.username}</p>
                  <p className="truncate text-xs text-[var(--color-ink-faint)]">{s.specialist_area || (s.role === 'therapist' ? 'Therapist' : 'Receptionist')}</p>
                </div>
                <Badge tone={s.role === 'therapist' ? 'gold' : 'info'}>{s.role}</Badge>
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs text-[var(--color-ink-faint)]">
                <span className="flex items-center gap-1">
                  <Star size={12} /> {s.rating || '—'}
                </span>
                <span className="flex items-center gap-1">
                  <UsersIcon size={12} /> {s.clients} clients
                </span>
                {s.years_of_experience != null && <span>{s.years_of_experience} yrs exp.</span>}
              </div>
            </Card>
          ))}
        {!loading && filtered.length === 0 && <p className="col-span-full py-10 text-center text-sm text-[var(--color-ink-faint)]">No staff match your search.</p>}
      </div>

      <AddStaffModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={load} />
      <StaffDetailModal staff={selected} onClose={() => setSelected(null)} tab={detailTab} setTab={setDetailTab} onChanged={load} />
    </div>
  )
}

function AddStaffModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ username: '', email: '', password: '', roleId: 3 })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setSaving(true)
    setError(null)
    try {
      await registerStaff({ username: form.username, email: form.email, password: form.password, confirm_password: form.password, role_id: form.roleId })
      onCreated()
      onClose()
      setForm({ username: '', email: '', password: '', roleId: 3 })
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not create this account.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add staff member"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving || !form.username || !form.email || !form.password}>
            {saving ? 'Creating…' : 'Create account'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <Label>Name</Label>
          <Input value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </div>
        <div>
          <Label>Temporary password</Label>
          <Input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
        </div>
        <div>
          <Label>Role</Label>
          <select
            className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 text-sm outline-none focus:border-[var(--color-forest-600)]"
            value={form.roleId}
            onChange={(e) => setForm((f) => ({ ...f, roleId: Number(e.target.value) }))}
          >
            <option value={3}>Therapist</option>
            <option value={2}>Receptionist</option>
          </select>
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

function StaffDetailModal({
  staff,
  onClose,
  tab,
  setTab,
  onChanged,
}: {
  staff: StaffMember | null
  onClose: () => void
  tab: DetailTab
  setTab: (t: DetailTab) => void
  onChanged: () => void
}) {
  const [profile, setProfile] = useState({ username: '', phone: '', specialist_area: '', years_of_experience: '' })
  const [hours, setHours] = useState<WorkingHoursDay[]>([])
  const [breaks, setBreaks] = useState<StaffBreak[]>([])
  const [leaves, setLeaves] = useState<StaffLeave[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newBreak, setNewBreak] = useState({ start_time: '13:00', end_time: '14:00', label: 'Lunch' })
  const [newLeave, setNewLeave] = useState({ from_date: '', to_date: '', reason: '' })

  useEffect(() => {
    if (!staff) return
    setProfile({
      username: staff.username,
      phone: staff.phone ?? '',
      specialist_area: staff.specialist_area ?? '',
      years_of_experience: staff.years_of_experience != null ? String(staff.years_of_experience) : '',
    })
    getWorkingHours(staff.id).then((r) => setHours(r.days)).catch(() => {})
    getStaffBreaks(staff.id).then((r) => setBreaks(r.breaks)).catch(() => {})
    getStaffLeaves(staff.id).then(setLeaves).catch(() => {})
  }, [staff])

  if (!staff) return null

  const saveProfile = async () => {
    setSaving(true)
    setError(null)
    try {
      await updateStaff(staff.id, {
        username: profile.username,
        phone: profile.phone,
        specialist_area: profile.specialist_area,
        years_of_experience: profile.years_of_experience ? Number(profile.years_of_experience) : undefined,
      })
      onChanged()
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not update this profile.'))
    } finally {
      setSaving(false)
    }
  }

  const toggleDay = (day: WeekDay) => {
    setHours((prev) =>
      prev.map((d) => (d.day === day ? { ...d, day_off: !d.day_off, start_time: d.start_time ?? '09:00', end_time: d.end_time ?? '17:00' } : d)),
    )
  }

  const updateDayTime = (day: WeekDay, field: 'start_time' | 'end_time', value: string) => {
    setHours((prev) => prev.map((d) => (d.day === day ? { ...d, [field]: value } : d)))
  }

  const saveHours = async () => {
    setSaving(true)
    setError(null)
    try {
      await saveWorkingHours(
        staff.id,
        hours.map((d) => ({ day: d.day, day_off: d.day_off, start_time: d.start_time ?? undefined, end_time: d.end_time ?? undefined })),
      )
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not save the weekly schedule.'))
    } finally {
      setSaving(false)
    }
  }

  const submitBreak = async () => {
    try {
      const created = await addStaffBreak(staff.id, newBreak)
      setBreaks((b) => [...b, created])
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not add this break.'))
    }
  }

  const submitLeave = async () => {
    if (!newLeave.from_date || !newLeave.to_date) return
    try {
      const created = await addStaffLeave(staff.id, newLeave)
      setLeaves((l) => [...l, created])
      setNewLeave({ from_date: '', to_date: '', reason: '' })
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not add this leave.'))
    }
  }

  const deactivate = async () => {
    try {
      await deactivateStaff(staff.id)
      onChanged()
      onClose()
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not deactivate this account.'))
    }
  }

  const tabs: { key: DetailTab; label: string }[] = [
    { key: 'profile', label: 'Profile' },
    { key: 'hours', label: 'Working hours' },
    { key: 'breaks', label: 'Breaks' },
    { key: 'leaves', label: 'Leave' },
  ]

  return (
    <Modal open={!!staff} onClose={onClose} title={staff.username} width="max-w-2xl">
      <div className="mb-5 flex gap-1.5 border-b border-[var(--color-line-soft)] pb-3">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${tab === t.key ? 'bg-[var(--color-forest-800)] text-[var(--color-ivory)]' : 'text-[var(--color-ink-soft)] hover:bg-[var(--color-ivory-dim)]'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-[var(--color-ink-soft)]">
            <Mail size={14} className="text-[var(--color-ink-faint)]" /> {staff.email}
          </div>
          <div>
            <Label>Name</Label>
            <Input value={profile.username} onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Phone</Label>
              <Input icon={<Phone size={14} />} value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            <div>
              <Label>Years of experience</Label>
              <Input type="number" value={profile.years_of_experience} onChange={(e) => setProfile((p) => ({ ...p, years_of_experience: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label>Specialist area</Label>
            <Input value={profile.specialist_area} onChange={(e) => setProfile((p) => ({ ...p, specialist_area: e.target.value }))} />
          </div>
          <div className="flex items-center justify-between border-t border-[var(--color-line-soft)] pt-4">
            <Button variant="danger" size="sm" onClick={deactivate}>
              <UserX size={14} /> Deactivate account
            </Button>
            <Button onClick={saveProfile} disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </div>
      )}

      {tab === 'hours' && (
        <div className="space-y-3">
          {WEEK_DAYS.map((day) => {
            const d = hours.find((h) => h.day === day) ?? { day, day_off: true }
            return (
              <div key={day} className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-line-soft)] px-3.5 py-2.5">
                <button
                  onClick={() => toggleDay(day)}
                  className={`h-6 w-11 shrink-0 rounded-full transition-colors ${!d.day_off ? 'bg-[var(--color-forest-700)]' : 'bg-[var(--color-line)]'}`}
                >
                  <span className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${!d.day_off ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
                <span className="w-10 text-sm font-medium text-[var(--color-ink)]">{day}</span>
                {!d.day_off ? (
                  <div className="flex flex-1 items-center gap-2">
                    <Input type="time" value={d.start_time ?? '09:00'} onChange={(e) => updateDayTime(day, 'start_time', e.target.value)} className="h-9" />
                    <span className="text-xs text-[var(--color-ink-faint)]">to</span>
                    <Input type="time" value={d.end_time ?? '17:00'} onChange={(e) => updateDayTime(day, 'end_time', e.target.value)} className="h-9" />
                  </div>
                ) : (
                  <span className="flex-1 text-xs text-[var(--color-ink-faint)]">Day off</span>
                )}
              </div>
            )
          })}
          <div className="flex justify-end pt-2">
            <Button onClick={saveHours} disabled={saving}>
              {saving ? 'Saving…' : 'Save schedule'}
            </Button>
          </div>
        </div>
      )}

      {tab === 'breaks' && (
        <div className="space-y-4">
          <div className="space-y-2">
            {breaks.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-line-soft)] px-3.5 py-2.5 text-sm">
                <span className="font-medium text-[var(--color-ink)]">{b.label || 'Break'}</span>
                <span className="text-[var(--color-ink-faint)]">
                  {b.start_time} – {b.end_time}
                </span>
              </div>
            ))}
            {breaks.length === 0 && <p className="text-sm text-[var(--color-ink-faint)]">No breaks scheduled yet.</p>}
          </div>
          <div className="flex items-end gap-2 border-t border-[var(--color-line-soft)] pt-4">
            <div className="flex-1">
              <Label>Start</Label>
              <Input type="time" value={newBreak.start_time} onChange={(e) => setNewBreak((b) => ({ ...b, start_time: e.target.value }))} />
            </div>
            <div className="flex-1">
              <Label>End</Label>
              <Input type="time" value={newBreak.end_time} onChange={(e) => setNewBreak((b) => ({ ...b, end_time: e.target.value }))} />
            </div>
            <div className="flex-1">
              <Label>Label</Label>
              <Input value={newBreak.label} onChange={(e) => setNewBreak((b) => ({ ...b, label: e.target.value }))} />
            </div>
            <Button size="sm" onClick={submitBreak}>
              Add
            </Button>
          </div>
        </div>
      )}

      {tab === 'leaves' && (
        <div className="space-y-4">
          <div className="space-y-2">
            {leaves.map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-line-soft)] px-3.5 py-2.5 text-sm">
                <span className="text-[var(--color-ink)]">
                  {l.from_date} – {l.to_date}
                </span>
                <span className="text-xs text-[var(--color-ink-faint)]">{l.reason || '—'}</span>
              </div>
            ))}
            {leaves.length === 0 && <p className="text-sm text-[var(--color-ink-faint)]">No leave recorded yet.</p>}
          </div>
          <div className="flex items-end gap-2 border-t border-[var(--color-line-soft)] pt-4">
            <div className="flex-1">
              <Label>From</Label>
              <Input type="date" value={newLeave.from_date} onChange={(e) => setNewLeave((l) => ({ ...l, from_date: e.target.value }))} />
            </div>
            <div className="flex-1">
              <Label>To</Label>
              <Input type="date" value={newLeave.to_date} onChange={(e) => setNewLeave((l) => ({ ...l, to_date: e.target.value }))} />
            </div>
            <div className="flex-1">
              <Label>Reason</Label>
              <Input value={newLeave.reason} onChange={(e) => setNewLeave((l) => ({ ...l, reason: e.target.value }))} />
            </div>
            <Button size="sm" onClick={submitLeave}>
              Add
            </Button>
          </div>
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

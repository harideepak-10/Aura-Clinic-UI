import { useEffect, useMemo, useState } from 'react'
import { Search, Plus, Clock, Trash2, AlertTriangle, Stethoscope, RotateCcw } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Input, Label } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { apiErrorMessage } from '../lib/api'
import { createTreatment, getRooms, getStaff, getTreatments, updateTreatment } from '../lib/dataSource'
import type { Room, StaffMember, Treatment } from '../lib/types'

type CategoryFilter = 'all' | 'face' | 'body'

export function Treatments() {
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [editing, setEditing] = useState<Treatment | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    getTreatments()
      .then(setTreatments)
      .catch((err) => setError(apiErrorMessage(err, 'Could not load treatments.')))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const filtered = useMemo(
    () => treatments.filter((t) => (category === 'all' || t.category === category) && t.name.toLowerCase().includes(query.toLowerCase())),
    [treatments, category, query],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-64">
            <Input placeholder="Search treatments…" icon={<Search size={16} />} value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="flex gap-1.5">
            {(['all', 'face', 'body'] as CategoryFilter[]).map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${category === c ? 'bg-[var(--color-forest-800)] text-[var(--color-ivory)]' : 'bg-[var(--color-surface)] text-[var(--color-ink-soft)] border border-[var(--color-line)] hover:border-[var(--color-forest-500)]'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus size={16} /> Add treatment
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
        {loading && <p className="col-span-full py-10 text-center text-sm text-[var(--color-ink-faint)]">Loading treatments…</p>}
        {!loading &&
          filtered.map((t) => (
            <Card key={t.id} className="cursor-pointer p-5 transition-shadow hover:shadow-lift" onClick={() => setEditing(t)}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-forest-50)] text-[var(--color-forest-700)]">
                  <Stethoscope size={20} />
                </div>
                <Badge tone={t.category === 'face' ? 'gold' : 'info'}>{t.category}</Badge>
              </div>
              <p className="mt-3 font-medium text-[var(--color-ink)]">{t.name}</p>
              <p className="flex items-center gap-1.5 text-xs text-[var(--color-ink-faint)]">
                <Clock size={12} /> {t.duration} min
              </p>
              {t.price_plans.length > 0 && (
                <p className="mt-2 text-sm font-medium text-[var(--color-forest-800)]">
                  From €{Math.min(...t.price_plans.map((p) => Number(p.price)))}
                </p>
              )}
              {t.rooms_detail.length > 0 && (
                <p className="mt-2 truncate text-xs text-[var(--color-ink-faint)]">{t.rooms_detail.map((r) => r.room_name).join(', ')}</p>
              )}
            </Card>
          ))}
        {!loading && filtered.length === 0 && <p className="col-span-full py-10 text-center text-sm text-[var(--color-ink-faint)]">No treatments match your search.</p>}
      </div>

      <TreatmentFormModal open={addOpen} onClose={() => setAddOpen(false)} onSaved={load} />
      <TreatmentFormModal open={!!editing} onClose={() => setEditing(null)} onSaved={load} treatment={editing} />
    </div>
  )
}

interface PricePlanForm {
  sessions: string
  price: string
}

function TreatmentFormModal({
  open,
  onClose,
  onSaved,
  treatment,
}: {
  open: boolean
  onClose: () => void
  onSaved: () => void
  treatment?: Treatment | null
}) {
  const [form, setForm] = useState({
    name: '',
    categoryId: 1,
    description: '',
    duration: '60',
    preCare: '',
    postCare: '',
    contraindications: '',
  })
  const [plans, setPlans] = useState<PricePlanForm[]>([{ sessions: '1', price: '' }])
  const [rooms, setRooms] = useState<Room[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [roomIds, setRoomIds] = useState<number[]>([])
  const [staffIds, setStaffIds] = useState<number[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    getRooms().then(setRooms).catch(() => {})
    getStaff().then(setStaff).catch(() => {})
  }, [open])

  useEffect(() => {
    if (treatment) {
      setForm({
        name: treatment.name,
        categoryId: treatment.category === 'face' ? 1 : 2,
        description: treatment.description,
        duration: String(treatment.duration),
        preCare: treatment.pre_care_instructions,
        postCare: treatment.post_care_instructions,
        contraindications: treatment.contraindications.join(', '),
      })
      setPlans(treatment.price_plans.length ? treatment.price_plans.map((p) => ({ sessions: String(p.sessions), price: p.price })) : [{ sessions: '1', price: '' }])
      setRoomIds(treatment.rooms_detail.map((r) => r.room_id))
      setStaffIds(treatment.staffs.map((s) => s.staff_id))
    } else {
      setForm({ name: '', categoryId: 1, description: '', duration: '60', preCare: '', postCare: '', contraindications: '' })
      setPlans([{ sessions: '1', price: '' }])
      setRoomIds([])
      setStaffIds([])
    }
    setError(null)
  }, [treatment, open])

  const toggle = (list: number[], id: number, set: (v: number[]) => void) => {
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id])
  }

  const submit = async () => {
    setSaving(true)
    setError(null)
    try {
      const payload = {
        name: form.name,
        category_id: form.categoryId,
        description: form.description,
        duration: Number(form.duration),
        price_plans: plans.filter((p) => p.price).map((p) => ({ sessions: Number(p.sessions), price: Number(p.price) })),
        pre_care_instructions: form.preCare,
        post_care_instructions: form.postCare,
        contraindications: form.contraindications
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean),
        room_ids: roomIds,
        staff_ids: staffIds,
      }
      if (treatment) {
        await updateTreatment(treatment.id, payload)
      } else {
        await createTreatment(payload)
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not save this treatment.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={treatment ? 'Edit treatment' : 'Add treatment'}
      width="max-w-2xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving || !form.name}>
            {saving ? 'Saving…' : 'Save treatment'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <Label>Category</Label>
            <select
              className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 text-sm outline-none focus:border-[var(--color-forest-600)]"
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: Number(e.target.value) }))}
            >
              <option value={1}>Face</option>
              <option value={2}>Body</option>
            </select>
          </div>
        </div>

        <div>
          <Label>Description</Label>
          <textarea
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-forest-600)]"
            rows={2}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>

        <div>
          <Label>Duration (minutes)</Label>
          <Input type="number" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} className="max-w-[160px]" />
        </div>

        <div>
          <Label>Price plans</Label>
          <div className="space-y-2">
            {plans.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Sessions"
                  value={p.sessions}
                  onChange={(e) => setPlans((prev) => prev.map((x, xi) => (xi === i ? { ...x, sessions: e.target.value } : x)))}
                  className="w-28"
                />
                <span className="text-xs text-[var(--color-ink-faint)]">session(s) for €</span>
                <Input
                  type="number"
                  placeholder="Price"
                  value={p.price}
                  onChange={(e) => setPlans((prev) => prev.map((x, xi) => (xi === i ? { ...x, price: e.target.value } : x)))}
                  className="w-28"
                />
                {plans.length > 1 && (
                  <button onClick={() => setPlans((prev) => prev.filter((_, xi) => xi !== i))} className="text-[var(--color-ink-faint)] hover:text-[var(--color-danger)]">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setPlans((prev) => [...prev, { sessions: '1', price: '' }])}>
              <Plus size={14} /> Add price plan
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Pre-care instructions</Label>
            <textarea
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-forest-600)]"
              rows={2}
              value={form.preCare}
              onChange={(e) => setForm((f) => ({ ...f, preCare: e.target.value }))}
            />
          </div>
          <div>
            <Label>Post-care instructions</Label>
            <textarea
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-forest-600)]"
              rows={2}
              value={form.postCare}
              onChange={(e) => setForm((f) => ({ ...f, postCare: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <Label>Contraindications (comma-separated)</Label>
          <Input value={form.contraindications} onChange={(e) => setForm((f) => ({ ...f, contraindications: e.target.value }))} placeholder="Pregnancy, Active infection" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Rooms</Label>
            <div className="flex max-h-32 flex-col gap-1 overflow-y-auto rounded-[var(--radius-md)] border border-[var(--color-line-soft)] p-2">
              {rooms.map((r) => (
                <label key={r.id} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-[var(--color-ivory-dim)]">
                  <input type="checkbox" checked={roomIds.includes(r.id)} onChange={() => toggle(roomIds, r.id, setRoomIds)} />
                  {r.name}
                </label>
              ))}
              {rooms.length === 0 && <p className="px-2 py-1 text-xs text-[var(--color-ink-faint)]">No rooms yet.</p>}
            </div>
          </div>
          <div>
            <Label>Staff</Label>
            <div className="flex max-h-32 flex-col gap-1 overflow-y-auto rounded-[var(--radius-md)] border border-[var(--color-line-soft)] p-2">
              {staff.map((s) => (
                <label key={s.id} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-[var(--color-ivory-dim)]">
                  <input type="checkbox" checked={staffIds.includes(s.id)} onChange={() => toggle(staffIds, s.id, setStaffIds)} />
                  {s.username}
                </label>
              ))}
              {staff.length === 0 && <p className="px-2 py-1 text-xs text-[var(--color-ink-faint)]">No staff yet.</p>}
            </div>
          </div>
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

import { useEffect, useState } from 'react'
import { Plus, Phone, Mail, RotateCcw, AlertTriangle, Target, TrendingUp, Users } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Input, Label } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { StatTile } from '../components/ui/StatTile'
import { apiErrorMessage } from '../lib/api'
import { createLead, getLeadMeta, getLeadPipeline, getLeadStats, updateLeadStage } from '../lib/dataSource'
import type { Lead, LeadMeta, LeadPipelineColumn, LeadStats } from '../lib/types'
import { formatEur } from '../lib/format'

export function Leads() {
  const [columns, setColumns] = useState<LeadPipelineColumn[]>([])
  const [stats, setStats] = useState<LeadStats | null>(null)
  const [meta, setMeta] = useState<LeadMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [selected, setSelected] = useState<Lead | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    Promise.all([getLeadPipeline(), getLeadStats(), getLeadMeta()])
      .then(([pipeline, s, m]) => {
        setColumns(pipeline)
        setStats(s)
        setMeta(m)
      })
      .catch((err) => setError(apiErrorMessage(err, 'Could not load the leads pipeline.')))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const moveLead = async (lead: Lead, stageId: number) => {
    try {
      await updateLeadStage(lead.id, stageId)
      load()
      setSelected(null)
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not move this lead.'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Active leads" value={String(stats?.active ?? 0)} deltaTone="neutral" delta={`${stats?.total_leads ?? 0} total`} icon={<Users size={18} />} />
        <StatTile label="Pipeline valuation" value={stats ? formatEur(stats.valuation) : '—'} deltaTone="up" delta="Sum of open deals" icon={<TrendingUp size={18} />} />
        <StatTile label="Lost" value={String(stats?.lost ?? 0)} deltaTone="down" delta="This period" icon={<Target size={18} />} />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--color-ink-faint)]">Drag isn't wired — use the stage buttons on a lead card to move it.</p>
        <Button onClick={() => setAddOpen(true)}>
          <Plus size={16} /> Add lead
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

      {loading ? (
        <p className="py-10 text-center text-sm text-[var(--color-ink-faint)]">Loading pipeline…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {columns.map((col) => (
            <div key={col.stage} className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <p className="text-sm font-medium text-[var(--color-ink)]">{col.stage_label}</p>
                <Badge tone="neutral">{col.count}</Badge>
              </div>
              <div className="flex flex-col gap-3">
                {col.leads.map((lead) => (
                  <Card key={lead.id} className="cursor-pointer p-4 transition-shadow hover:shadow-lift" onClick={() => setSelected(lead)}>
                    <p className="font-medium text-[var(--color-ink)]">{lead.name}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-ink-faint)]">
                      <Phone size={11} /> {lead.phone}
                    </p>
                    {lead.value && <p className="mt-2 text-sm font-medium text-[var(--color-forest-800)]">{formatEur(Number(lead.value))}</p>}
                    <div className="mt-2 flex items-center justify-between">
                      <Badge tone="gold">{lead.source}</Badge>
                      {lead.assigned_to_name && <span className="text-xs text-[var(--color-ink-faint)]">{lead.assigned_to_name}</span>}
                    </div>
                  </Card>
                ))}
                {col.leads.length === 0 && <p className="px-1 text-xs text-[var(--color-ink-faint)]">No leads in this stage.</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <AddLeadModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={load} meta={meta} />

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name} width="max-w-lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-[var(--color-ink-soft)]">
                <Phone size={14} className="text-[var(--color-ink-faint)]" /> {selected.phone}
              </div>
              {selected.email && (
                <div className="flex items-center gap-2 text-[var(--color-ink-soft)]">
                  <Mail size={14} className="text-[var(--color-ink-faint)]" /> {selected.email}
                </div>
              )}
            </div>
            {selected.interest && (
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--color-ink-faint)]">Interested in</p>
                <p className="text-sm text-[var(--color-ink)]">{selected.interest}</p>
              </div>
            )}
            {selected.notes && (
              <div className="rounded-[var(--radius-md)] bg-[var(--color-forest-50)] px-4 py-3 text-sm text-[var(--color-forest-800)]">{selected.notes}</div>
            )}
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-ink-faint)]">Move to stage</p>
              <div className="flex flex-wrap gap-1.5">
                {meta?.stages
                  .filter((s) => s.value !== 'converted' && s.value !== 'lost')
                  .concat(meta?.stages.filter((s) => s.value === 'lost') ?? [])
                  .map((s) => (
                    <button
                      key={s.id}
                      onClick={() => moveLead(selected, s.id)}
                      disabled={s.value === selected.stage}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition-colors disabled:opacity-40 ${
                        s.value === selected.stage
                          ? 'bg-[var(--color-forest-800)] text-[var(--color-ivory)]'
                          : 'bg-[var(--color-surface)] text-[var(--color-ink-soft)] border border-[var(--color-line)] hover:border-[var(--color-forest-500)]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function AddLeadModal({ open, onClose, onCreated, meta }: { open: boolean; onClose: () => void; onCreated: () => void; meta: LeadMeta | null }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', marketingSourceId: 1, interest: '', notes: '', value: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setSaving(true)
    setError(null)
    try {
      await createLead({
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        marketing_source_id: form.marketingSourceId,
        interest: form.interest || undefined,
        notes: form.notes || undefined,
        value: form.value ? Number(form.value) : undefined,
      })
      onCreated()
      onClose()
      setForm({ name: '', phone: '', email: '', marketingSourceId: 1, interest: '', notes: '', value: '' })
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not create this lead.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add lead"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving || !form.name || !form.phone}>
            {saving ? 'Creating…' : 'Create lead'}
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
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <Label>Source</Label>
            <select
              className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 text-sm outline-none focus:border-[var(--color-forest-600)]"
              value={form.marketingSourceId}
              onChange={(e) => setForm((f) => ({ ...f, marketingSourceId: Number(e.target.value) }))}
            >
              {(meta?.marketing_sources ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <Label>Interested in</Label>
          <Input value={form.interest} onChange={(e) => setForm((f) => ({ ...f, interest: e.target.value }))} placeholder="e.g. Detox facial package" />
        </div>
        <div>
          <Label>Estimated value (€)</Label>
          <Input type="number" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} className="max-w-[160px]" />
        </div>
        <div>
          <Label>Notes</Label>
          <textarea
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-forest-600)]"
            rows={2}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
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

import { useEffect, useMemo, useState } from 'react'
import { Search, Plus, Package, RotateCcw, AlertTriangle } from 'lucide-react'
import { Card, CardBody } from '../components/ui/Card'
import { Input, Label } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { createInventoryItem, getInventory } from '../lib/dataSource'
import { apiErrorMessage } from '../lib/api'
import type { InventoryCategory, InventoryItem, InventoryUnit } from '../lib/types'
import { categoryLabel, formatDate, inventoryStatusLabel, inventoryTone } from '../lib/format'

const CATEGORY_OPTIONS: { id: number; value: InventoryCategory; label: string }[] = [
  { id: 1, value: 'consumable', label: 'Consumable' },
  { id: 2, value: 'equipment', label: 'Equipment' },
  { id: 3, value: 'product', label: 'Product' },
  { id: 4, value: 'disposable', label: 'Disposable' },
]

const UNIT_OPTIONS: { id: number; value: InventoryUnit }[] = [
  { id: 1, value: 'ml' },
  { id: 2, value: 'pcs' },
  { id: 3, value: 'units' },
  { id: 4, value: 'kg' },
  { id: 5, value: 'g' },
  { id: 6, value: 'l' },
]

export function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<InventoryCategory | 'all'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    categoryId: 1,
    unitId: 3,
    initialStock: 0,
    minimumStockAlert: 10,
    supplierName: '',
    supplierPhone: '',
    costPerUnit: '',
  })

  const load = () => {
    setLoading(true)
    setError(null)
    getInventory()
      .then(setItems)
      .catch((err) => setError(apiErrorMessage(err, 'Could not load inventory.')))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const filtered = useMemo(
    () => items.filter((i) => (category === 'all' || i.category === category) && i.name.toLowerCase().includes(query.toLowerCase())),
    [items, query, category],
  )

  const addItem = async () => {
    setSaving(true)
    setSaveError(null)
    try {
      await createInventoryItem({
        name: form.name,
        category_id: form.categoryId,
        unit_id: form.unitId,
        initial_stock: form.initialStock,
        minimum_stock_alert: form.minimumStockAlert,
        supplier_name: form.supplierName || undefined,
        supplier_phone: form.supplierPhone || undefined,
        cost_per_unit: form.costPerUnit ? Number(form.costPerUnit) : undefined,
      })
      setModalOpen(false)
      setForm({ name: '', categoryId: 1, unitId: 3, initialStock: 0, minimumStockAlert: 10, supplierName: '', supplierPhone: '', costPerUnit: '' })
      load()
    } catch (err) {
      setSaveError(apiErrorMessage(err, 'Could not add this item — admin access is required.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-64">
            <Input placeholder="Search items…" icon={<Search size={16} />} value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setCategory('all')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${category === 'all' ? 'bg-[var(--color-forest-800)] text-[var(--color-ivory)]' : 'bg-[var(--color-surface)] text-[var(--color-ink-soft)] border border-[var(--color-line)] hover:border-[var(--color-forest-500)]'}`}
            >
              All
            </button>
            {CATEGORY_OPTIONS.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${category === c.value ? 'bg-[var(--color-forest-800)] text-[var(--color-ivory)]' : 'bg-[var(--color-surface)] text-[var(--color-ink-soft)] border border-[var(--color-line)] hover:border-[var(--color-forest-500)]'}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Add item
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

      <Card>
        <CardBody className="overflow-x-auto p-0">
          {loading ? (
            <p className="px-6 py-10 text-center text-sm text-[var(--color-ink-faint)]">Loading inventory…</p>
          ) : (
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-[var(--color-line-soft)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-faint)]">
                  <th className="px-6 py-3 font-medium">Item</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Quantity</th>
                  <th className="px-4 py-3 font-medium">Supplier</th>
                  <th className="px-4 py-3 font-medium">Last restock</th>
                  <th className="px-6 py-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-line-soft)]">
                {filtered.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-[var(--color-ivory-dim)]">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-forest-50)] text-[var(--color-forest-700)]">
                          <Package size={15} />
                        </span>
                        <div>
                          <p className="font-medium text-[var(--color-ink)]">{item.name}</p>
                          {item.description && <p className="text-xs text-[var(--color-ink-faint)]">{item.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[var(--color-ink-soft)]">{categoryLabel(item.category)}</td>
                    <td className="px-4 py-3.5 text-[var(--color-ink-soft)]">
                      {item.current_stock} {item.unit}
                      {item.is_low_stock && <span className="ml-1.5 text-xs text-[var(--color-ink-faint)]">(reorder at {item.minimum_stock_alert})</span>}
                    </td>
                    <td className="px-4 py-3.5 text-[var(--color-ink-soft)]">{item.supplier_name || '—'}</td>
                    <td className="px-4 py-3.5 text-[var(--color-ink-faint)]">{item.last_restock_date ? formatDate(item.last_restock_date) : '—'}</td>
                    <td className="px-6 py-3.5 text-right">
                      <Badge tone={inventoryTone(item)}>{inventoryStatusLabel(item)}</Badge>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-[var(--color-ink-faint)]">
                      No items match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add inventory item"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addItem} disabled={saving || !form.name}>
              {saving ? 'Adding…' : 'Add item'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label>Item name</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Vitamin C Serum" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <select
                className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 text-sm outline-none focus:border-[var(--color-forest-600)]"
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: Number(e.target.value) }))}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Unit</Label>
              <select
                className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 text-sm outline-none focus:border-[var(--color-forest-600)]"
                value={form.unitId}
                onChange={(e) => setForm((f) => ({ ...f, unitId: Number(e.target.value) }))}
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.value}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Initial stock</Label>
              <Input type="number" value={form.initialStock} onChange={(e) => setForm((f) => ({ ...f, initialStock: Number(e.target.value) }))} />
            </div>
            <div>
              <Label>Reorder threshold</Label>
              <Input type="number" value={form.minimumStockAlert} onChange={(e) => setForm((f) => ({ ...f, minimumStockAlert: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Supplier name</Label>
              <Input value={form.supplierName} onChange={(e) => setForm((f) => ({ ...f, supplierName: e.target.value }))} />
            </div>
            <div>
              <Label>Cost per unit (€)</Label>
              <Input type="number" step="0.01" value={form.costPerUnit} onChange={(e) => setForm((f) => ({ ...f, costPerUnit: e.target.value }))} />
            </div>
          </div>

          {saveError && (
            <div className="flex items-start gap-2.5 rounded-[var(--radius-md)] bg-[var(--color-danger-soft)] px-3.5 py-3 text-sm text-[var(--color-danger)]">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

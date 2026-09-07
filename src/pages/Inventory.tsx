import { useEffect, useMemo, useState } from 'react'
import { Search, Plus, Package } from 'lucide-react'
import { Card, CardBody } from '../components/ui/Card'
import { Input, Label } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { getInventory } from '../lib/dataSource'
import type { InventoryItem } from '../lib/types'
import { formatDate, inventoryTone } from '../lib/format'

const categories = ['All', 'Skincare', 'Injectables', 'Spa', 'Consumables']

export function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ name: '', category: 'Skincare', quantity: 0, reorderThreshold: 10, unit: 'units', supplier: '' })

  useEffect(() => {
    getInventory().then(setItems)
  }, [])

  const filtered = useMemo(
    () =>
      items.filter(
        (i) =>
          (category === 'All' || i.category === category) &&
          i.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [items, query, category],
  )

  const addItem = () => {
    const status = form.quantity === 0 ? 'out_of_stock' : form.quantity <= form.reorderThreshold ? 'low' : 'in_stock'
    const newItem: InventoryItem = {
      id: `local-${Date.now()}`,
      name: form.name || 'New item',
      category: form.category,
      sku: `SKU-${Math.floor(Math.random() * 9000 + 1000)}`,
      quantity: form.quantity,
      reorderThreshold: form.reorderThreshold,
      unit: form.unit,
      status,
      supplier: form.supplier || 'Unassigned',
      updatedAt: new Date().toISOString().slice(0, 10),
    }
    setItems((prev) => [newItem, ...prev])
    setModalOpen(false)
    setForm({ name: '', category: 'Skincare', quantity: 0, reorderThreshold: 10, unit: 'units', supplier: '' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-64">
            <Input placeholder="Search items…" icon={<Search size={16} />} value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  category === c
                    ? 'bg-[var(--color-forest-800)] text-[var(--color-ivory)]'
                    : 'bg-[var(--color-surface)] text-[var(--color-ink-soft)] border border-[var(--color-line)] hover:border-[var(--color-forest-500)]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Add item
        </Button>
      </div>

      <Card>
        <CardBody className="overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-[var(--color-line-soft)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-faint)]">
                <th className="px-6 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Quantity</th>
                <th className="px-4 py-3 font-medium">Supplier</th>
                <th className="px-4 py-3 font-medium">Updated</th>
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
                        <p className="text-xs text-[var(--color-ink-faint)]">{item.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[var(--color-ink-soft)]">{item.category}</td>
                  <td className="px-4 py-3.5 text-[var(--color-ink-soft)]">
                    {item.quantity} {item.unit}
                    {item.quantity <= item.reorderThreshold && (
                      <span className="ml-1.5 text-xs text-[var(--color-ink-faint)]">(reorder at {item.reorderThreshold})</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-[var(--color-ink-soft)]">{item.supplier}</td>
                  <td className="px-4 py-3.5 text-[var(--color-ink-faint)]">{formatDate(item.updatedAt)}</td>
                  <td className="px-6 py-3.5 text-right">
                    <Badge tone={inventoryTone(item.status)}>{item.status.replace(/_/g, ' ')}</Badge>
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
            <Button onClick={addItem}>Add item</Button>
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
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                {categories.slice(1).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Unit</Label>
              <Input value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} placeholder="units / vials / pcs" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Quantity</Label>
              <Input type="number" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) }))} />
            </div>
            <div>
              <Label>Reorder threshold</Label>
              <Input
                type="number"
                value={form.reorderThreshold}
                onChange={(e) => setForm((f) => ({ ...f, reorderThreshold: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div>
            <Label>Supplier</Label>
            <Input value={form.supplier} onChange={(e) => setForm((f) => ({ ...f, supplier: e.target.value }))} placeholder="Supplier name" />
          </div>
        </div>
      </Modal>
    </div>
  )
}

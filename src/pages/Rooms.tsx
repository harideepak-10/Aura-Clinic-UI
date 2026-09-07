import { useEffect, useState } from 'react'
import { DoorOpen, Plus, RotateCcw, AlertTriangle } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input, Label } from '../components/ui/Input'
import { apiErrorMessage } from '../lib/api'
import { createRoom, getRooms, updateRoom } from '../lib/dataSource'
import type { Room } from '../lib/types'

const ROOM_TYPES = [
  { id: 1, label: 'Facial treatment room' },
  { id: 2, label: 'Body treatment room' },
]

export function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [editing, setEditing] = useState<Room | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    getRooms()
      .then(setRooms)
      .catch((err) => setError(apiErrorMessage(err, 'Could not load rooms.')))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-[var(--color-ink-faint)]">{rooms.length} rooms configured</p>
        <Button onClick={() => setAddOpen(true)}>
          <Plus size={16} /> Add room
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
        {loading && <p className="col-span-full py-10 text-center text-sm text-[var(--color-ink-faint)]">Loading rooms…</p>}
        {!loading &&
          rooms.map((room) => (
            <Card key={room.id} className="cursor-pointer p-5 transition-shadow hover:shadow-lift" onClick={() => setEditing(room)}>
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-forest-50)] text-[var(--color-forest-700)]">
                  <DoorOpen size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-[var(--color-ink)]">{room.name}</p>
                  <Badge tone={room.room_type === 'facial_treatment' ? 'gold' : 'info'} className="mt-1">
                    {room.room_type === 'facial_treatment' ? 'Facial' : 'Body'}
                  </Badge>
                </div>
              </div>
              {room.description && <p className="mt-3 line-clamp-2 text-xs text-[var(--color-ink-faint)]">{room.description}</p>}
            </Card>
          ))}
        {!loading && rooms.length === 0 && <p className="col-span-full py-10 text-center text-sm text-[var(--color-ink-faint)]">No rooms yet — add your first one.</p>}
      </div>

      <RoomFormModal open={addOpen} onClose={() => setAddOpen(false)} onSaved={load} />
      <RoomFormModal open={!!editing} onClose={() => setEditing(null)} onSaved={load} room={editing} />
    </div>
  )
}

function RoomFormModal({ open, onClose, onSaved, room }: { open: boolean; onClose: () => void; onSaved: () => void; room?: Room | null }) {
  const [form, setForm] = useState({ name: '', roomTypeId: 1, description: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (room) {
      setForm({ name: room.name, roomTypeId: room.room_type_id, description: room.description })
    } else {
      setForm({ name: '', roomTypeId: 1, description: '' })
    }
    setError(null)
  }, [room, open])

  const submit = async () => {
    setSaving(true)
    setError(null)
    try {
      if (room) {
        await updateRoom(room.id, { name: form.name, room_type_id: form.roomTypeId, description: form.description })
      } else {
        await createRoom({ name: form.name, room_type_id: form.roomTypeId, description: form.description })
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not save this room.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={room ? 'Edit room' : 'Add room'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving || !form.name}>
            {saving ? 'Saving…' : 'Save room'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <Label>Room name</Label>
          <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <Label>Room type</Label>
          <select
            className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 text-sm outline-none focus:border-[var(--color-forest-600)]"
            value={form.roomTypeId}
            onChange={(e) => setForm((f) => ({ ...f, roomTypeId: Number(e.target.value) }))}
          >
            {ROOM_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Description</Label>
          <textarea
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-forest-600)]"
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
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

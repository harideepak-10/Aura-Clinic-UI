import type { BadgeTone } from '../components/ui/Badge'
import type { AppointmentStatus, InventoryCategory, PaymentStatus } from './types'

export function statusTone(status: AppointmentStatus): BadgeTone {
  switch (status) {
    case 'upcoming':
      return 'info'
    case 'in_session':
      return 'gold'
    case 'completed':
      return 'success'
    case 'cancelled':
      return 'danger'
  }
}

export function statusLabel(status: AppointmentStatus): string {
  switch (status) {
    case 'upcoming':
      return 'Upcoming'
    case 'in_session':
      return 'In session'
    case 'completed':
      return 'Completed'
    case 'cancelled':
      return 'Cancelled'
  }
}

export function inventoryTone(item: { current_stock: number; minimum_stock_alert: number; is_low_stock: boolean }): BadgeTone {
  if (item.current_stock <= 0) return 'danger'
  if (item.is_low_stock) return 'warning'
  return 'success'
}

export function inventoryStatusLabel(item: { current_stock: number; is_low_stock: boolean }): string {
  if (item.current_stock <= 0) return 'Out of stock'
  if (item.is_low_stock) return 'Low stock'
  return 'In stock'
}

export function categoryLabel(category: InventoryCategory): string {
  switch (category) {
    case 'consumable':
      return 'Consumable'
    case 'equipment':
      return 'Equipment'
    case 'product':
      return 'Product'
    case 'disposable':
      return 'Disposable'
  }
}

export function paymentTone(status: PaymentStatus): BadgeTone {
  switch (status) {
    case 'paid':
      return 'success'
    case 'pending':
      return 'warning'
    case 'refunded':
      return 'info'
  }
}

export function formatDate(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatEur(amount: number) {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(amount)
}

// Parses the backend's already-formatted "€180.00" strings back to a number
// for totals/sorting; falls back to 0 for anything unparsable.
export function parseEur(amountStr: string | null | undefined): number {
  if (!amountStr) return 0
  const n = parseFloat(amountStr.replace(/[^\d.-]/g, ''))
  return Number.isFinite(n) ? n : 0
}

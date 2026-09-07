import type { BadgeTone } from '../components/ui/Badge'
import type { AppointmentStatus, InventoryStatus, PaymentStatus } from './types'

export function statusTone(status: AppointmentStatus): BadgeTone {
  switch (status) {
    case 'confirmed':
      return 'success'
    case 'pending':
      return 'warning'
    case 'completed':
      return 'info'
    case 'cancelled':
      return 'danger'
  }
}

export function inventoryTone(status: InventoryStatus): BadgeTone {
  switch (status) {
    case 'in_stock':
      return 'success'
    case 'low':
      return 'warning'
    case 'out_of_stock':
      return 'danger'
  }
}

export function paymentTone(status: PaymentStatus): BadgeTone {
  switch (status) {
    case 'paid':
      return 'success'
    case 'pending':
      return 'warning'
    case 'failed':
      return 'danger'
    case 'refunded':
      return 'info'
  }
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function formatEur(amount: number) {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(amount)
}

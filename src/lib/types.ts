// Shapes are modeled after the Aura Django/DRF backend so wiring up the
// real API later is mostly a matter of pointing VITE_API_BASE_URL at it
// and confirming field names.

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'therapist' | 'front_desk'
  avatarUrl?: string
}

export interface Therapist {
  id: string
  name: string
  specialty: string
  color: string // used for calendar chips
}

export interface Room {
  id: string
  name: string
}

export type AppointmentStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled'

export interface Appointment {
  id: string
  patientId: string
  patientName: string
  therapistId: string
  roomId: string
  service: string
  start: string // ISO datetime
  end: string // ISO datetime
  status: AppointmentStatus
  notes?: string
}

export interface Patient {
  id: string
  name: string
  email: string
  phone: string
  memberSince: string
  lastVisit?: string
  totalVisits: number
  tags: string[]
  notes?: string
  upcomingAppointmentId?: string
}

export type InventoryStatus = 'in_stock' | 'low' | 'out_of_stock'

export interface InventoryItem {
  id: string
  name: string
  category: string
  sku: string
  quantity: number
  reorderThreshold: number
  unit: string
  status: InventoryStatus
  supplier: string
  updatedAt: string
}

export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded'

export interface Invoice {
  id: string
  patientId: string
  patientName: string
  service: string
  amountEur: number
  status: PaymentStatus
  issuedAt: string
  paidAt?: string
  method?: 'card' | 'sepa' | 'cash'
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface DashboardStats {
  todayAppointments: number
  todayRevenueEur: number
  activePatients: number
  occupancyRate: number
  revenueTrend: { date: string; revenueEur: number }[]
  appointmentsByService: { service: string; count: number }[]
}

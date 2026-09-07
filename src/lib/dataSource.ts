// Talks directly to the real Aura Django/DRF backend — every endpoint
// path and payload shape here matches aura_backend's urls.py /
// serializers.py exactly (verified against the actual source, not
// guessed). No mock data, no offline fallback.
import { api } from './api'
import type {
  Appointment,
  AppointmentBookingInput,
  ChatResponse,
  ChatTurn,
  DashboardResponse,
  InventoryItem,
  InventoryItemInput,
  Patient,
  PaymentsResponse,
  Room,
  StaffMember,
  Treatment,
} from './types'

export async function getDashboard(): Promise<DashboardResponse> {
  const { data } = await api.get('/dashboard/')
  return data
}

export interface AppointmentFilters {
  date?: string
  staffId?: number
  status?: string
  search?: string
}

export async function getAppointments(filters: AppointmentFilters = {}): Promise<Appointment[]> {
  const { data } = await api.get('/appointments/', {
    params: {
      date: filters.date,
      staff_id: filters.staffId,
      status: filters.status,
      search: filters.search,
    },
  })
  return data
}

export async function createAppointment(input: AppointmentBookingInput): Promise<Appointment> {
  const { data } = await api.post('/appointments/', input)
  return data
}

export async function getTherapists(): Promise<StaffMember[]> {
  const { data } = await api.get('/users/staff/', { params: { role: 'therapist' } })
  return data
}

// Admin-only on the backend (IsAdmin) — a non-admin login will get a 403 here.
export async function getRooms(): Promise<Room[]> {
  const { data } = await api.get('/rooms/')
  return data
}

export async function getTreatments(): Promise<Treatment[]> {
  const { data } = await api.get('/treatments/')
  return data
}

export interface PatientFilters {
  search?: string
  category?: string
}

export async function getPatients(filters: PatientFilters = {}): Promise<Patient[]> {
  const { data } = await api.get('/patients/', { params: filters })
  return data
}

export async function getInventory(): Promise<InventoryItem[]> {
  const { data } = await api.get('/inventory/')
  return data
}

export async function createInventoryItem(input: InventoryItemInput): Promise<InventoryItem> {
  const { data } = await api.post('/inventory/', input)
  return data
}

export async function getInvoices(status?: string): Promise<PaymentsResponse> {
  const { data } = await api.get('/payments/', { params: { status } })
  return data
}

export async function sendChatMessage(message: string, history: ChatTurn[]): Promise<ChatResponse> {
  const { data } = await api.post('/ai/chat/', { message, conversation_history: history })
  return data
}

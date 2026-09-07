// Thin data-access layer: every page imports from here, never from
// lib/api or lib/mockData directly. That keeps a single switch point
// for going from mock data to the live Aura backend.
import { api, USE_MOCKS } from './api'
import * as mocks from './mockData'
import type {
  Appointment,
  ChatMessage,
  DashboardStats,
  InventoryItem,
  Invoice,
  Patient,
  Room,
  Therapist,
} from './types'

const delay = <T,>(value: T, ms = 350) => new Promise<T>((resolve) => setTimeout(() => resolve(value), ms))

export async function getDashboardStats(): Promise<DashboardStats> {
  if (USE_MOCKS) return delay(mocks.dashboardStats)
  const { data } = await api.get('/dashboard/stats/')
  return data
}

export async function getAppointments(): Promise<Appointment[]> {
  if (USE_MOCKS) return delay(mocks.appointments)
  const { data } = await api.get('/appointments/')
  return data
}

export async function getTherapists(): Promise<Therapist[]> {
  if (USE_MOCKS) return delay(mocks.therapists)
  const { data } = await api.get('/therapists/')
  return data
}

export async function getRooms(): Promise<Room[]> {
  if (USE_MOCKS) return delay(mocks.rooms)
  const { data } = await api.get('/rooms/')
  return data
}

export async function getPatients(): Promise<Patient[]> {
  if (USE_MOCKS) return delay(mocks.patients)
  const { data } = await api.get('/patients/')
  return data
}

export async function getInventory(): Promise<InventoryItem[]> {
  if (USE_MOCKS) return delay(mocks.inventory)
  const { data } = await api.get('/inventory/')
  return data
}

export async function getInvoices(): Promise<Invoice[]> {
  if (USE_MOCKS) return delay(mocks.invoices)
  const { data } = await api.get('/payments/invoices/')
  return data
}

export async function getChatMessages(): Promise<ChatMessage[]> {
  if (USE_MOCKS) return delay(mocks.chatMessages)
  const { data } = await api.get('/chat/messages/')
  return data
}

export async function sendChatMessage(content: string): Promise<ChatMessage> {
  if (USE_MOCKS) {
    return delay(
      {
        id: `mock-${Date.now()}`,
        role: 'assistant',
        content:
          "This is a preview response — connect VITE_API_BASE_URL to the Aura Groq-backed agent to get real answers about schedules, patients, and inventory.",
        createdAt: new Date().toISOString(),
      },
      600,
    )
  }
  const { data } = await api.post('/chat/messages/', { content })
  return data
}

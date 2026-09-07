// Talks directly to the real Aura Django/DRF backend — every endpoint
// path and payload shape here matches aura_backend's urls.py /
// serializers.py exactly (verified against the actual source, not
// guessed). No mock data, no offline fallback.
import { api } from './api'
import type {
  Appointment,
  AppointmentBookingInput,
  AuthUser,
  ChatResponse,
  ChatTurn,
  ClinicHoursDay,
  ConsentRecord,
  ConsentResponse,
  DashboardResponse,
  InventoryItem,
  InventoryItemInput,
  Lead,
  LeadInput,
  LeadMeta,
  LeadPipelineColumn,
  LeadStats,
  Patient,
  PatientHistory,
  PatientNote,
  PatientNoteInput,
  PatientNotesResponse,
  PatientOverview,
  PatientPhotosResponse,
  PaymentsResponse,
  PlannedClosure,
  RoleOption,
  Room,
  RoomInput,
  StaffBreak,
  StaffLeave,
  StaffMember,
  StaffRegisterInput,
  StaffUpdateInput,
  Treatment,
  TreatmentInput,
  WeekDay,
  WorkingHoursDay,
} from './types'

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function getDashboard(): Promise<DashboardResponse> {
  const { data } = await api.get('/dashboard/')
  return data
}

// ─── Appointments ─────────────────────────────────────────────────────────────

export interface AppointmentFilters {
  date?: string
  staffId?: number
  status?: string
  search?: string
}

export async function getAppointments(filters: AppointmentFilters = {}): Promise<Appointment[]> {
  const { data } = await api.get('/appointments/', {
    params: { date: filters.date, staff_id: filters.staffId, status: filters.status, search: filters.search },
  })
  return data
}

export async function createAppointment(input: AppointmentBookingInput): Promise<Appointment> {
  const { data } = await api.post('/appointments/', input)
  return data
}

export async function updateAppointmentStatus(id: number, statusId: number): Promise<Appointment> {
  const { data } = await api.patch(`/appointments/${id}/status/`, { status_id: statusId })
  return data
}

// ─── Roles (public — used by the sign-up screen's role picker) ──────────────

export async function getRoles(): Promise<RoleOption[]> {
  const { data } = await api.get('/users/roles/')
  return data
}

// ─── Staff ────────────────────────────────────────────────────────────────────

export async function getTherapists(): Promise<StaffMember[]> {
  const { data } = await api.get('/users/staff/', { params: { role: 'therapist' } })
  return data
}

export interface StaffFilters {
  role?: 'reception' | 'therapist'
  search?: string
}

export async function getStaff(filters: StaffFilters = {}): Promise<StaffMember[]> {
  const { data } = await api.get('/users/staff/', { params: filters })
  return data
}

export async function getStaffMember(id: number): Promise<StaffMember> {
  const { data } = await api.get(`/users/staff/${id}/`)
  return data
}

// Creates the login account — there is no direct "create staff" endpoint,
// new staff go through the same /register/ flow as any account.
export async function registerStaff(input: StaffRegisterInput): Promise<{ user: AuthUser }> {
  const { data } = await api.post('/users/register/', input)
  return data
}

export async function updateStaff(id: number, input: StaffUpdateInput): Promise<StaffMember> {
  const { data } = await api.patch(`/users/staff/${id}/`, input)
  return data
}

export async function deactivateStaff(id: number): Promise<{ message: string }> {
  const { data } = await api.delete(`/users/staff/${id}/`)
  return data
}

export async function getWorkingHours(staffId: number): Promise<{ is_added: boolean; days: WorkingHoursDay[] }> {
  const { data } = await api.get(`/users/staff/${staffId}/working-hours/`)
  return data
}

export async function saveWorkingHours(
  staffId: number,
  days: { day: WeekDay; day_off?: boolean; start_time?: string; end_time?: string }[],
): Promise<unknown> {
  const { data } = await api.post(`/users/staff/${staffId}/working-hours/`, days)
  return data
}

export async function getStaffBreaks(staffId: number): Promise<{ is_added: boolean; breaks: StaffBreak[] }> {
  const { data } = await api.get(`/users/staff/${staffId}/break-times/`)
  return data
}

export async function addStaffBreak(staffId: number, input: { start_time: string; end_time: string; label?: string }): Promise<StaffBreak> {
  const { data } = await api.post(`/users/staff/${staffId}/break-times/`, input)
  return data
}

export async function getStaffLeaves(staffId: number): Promise<StaffLeave[]> {
  const { data } = await api.get(`/users/staff/${staffId}/leaves/`)
  return data
}

export async function addStaffLeave(staffId: number, input: { from_date: string; to_date: string; reason?: string }): Promise<StaffLeave> {
  const { data } = await api.post(`/users/staff/${staffId}/leaves/`, input)
  return data
}

// ─── Rooms (admin-only on the backend) ───────────────────────────────────────

export async function getRooms(): Promise<Room[]> {
  const { data } = await api.get('/rooms/')
  return data
}

export async function createRoom(input: RoomInput): Promise<Room> {
  const { data } = await api.post('/rooms/', input)
  return data
}

export async function updateRoom(id: number, input: Partial<RoomInput>): Promise<Room> {
  const { data } = await api.patch(`/rooms/${id}/`, input)
  return data
}

// ─── Treatments / services ───────────────────────────────────────────────────

export async function getTreatments(): Promise<Treatment[]> {
  const { data } = await api.get('/treatments/')
  return data
}

export async function createTreatment(input: TreatmentInput): Promise<Treatment> {
  const { data } = await api.post('/treatments/', input)
  return data
}

export async function updateTreatment(id: number, input: Partial<TreatmentInput>): Promise<Treatment> {
  const { data } = await api.patch(`/treatments/${id}/`, input)
  return data
}

// ─── Patients ─────────────────────────────────────────────────────────────────

export interface PatientFilters {
  search?: string
  category?: string
}

export async function getPatients(filters: PatientFilters = {}): Promise<Patient[]> {
  const { data } = await api.get('/patients/', { params: filters })
  return data
}

export async function getPatientOverview(id: string): Promise<PatientOverview> {
  const { data } = await api.get(`/patients/${id}/overview/`)
  return data
}

export async function getPatientHistory(id: string): Promise<PatientHistory> {
  const { data } = await api.get(`/patients/${id}/history/`)
  return data
}

export async function getPatientNotes(id: string): Promise<PatientNotesResponse> {
  const { data } = await api.get(`/patients/${id}/notes/`)
  return data
}

export async function addPatientNote(id: string, input: PatientNoteInput): Promise<PatientNote> {
  const { data } = await api.post(`/patients/${id}/notes/`, input)
  return data
}

export async function getPatientPhotos(id: string): Promise<PatientPhotosResponse> {
  const { data } = await api.get(`/patients/${id}/photos/`)
  return data
}

export async function getPatientConsent(id: string): Promise<ConsentResponse> {
  const { data } = await api.get(`/patients/${id}/consent/`)
  return data
}

export async function addPatientConsent(
  id: string,
  input: { title: string; file_name?: string; file_url?: string; status?: 'pending' | 'signed' },
): Promise<ConsentRecord> {
  const { data } = await api.post(`/patients/${id}/consent/`, input)
  return data
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export async function getInventory(): Promise<InventoryItem[]> {
  const { data } = await api.get('/inventory/')
  return data
}

export async function createInventoryItem(input: InventoryItemInput): Promise<InventoryItem> {
  const { data } = await api.post('/inventory/', input)
  return data
}

export async function addStockMovement(
  itemId: number,
  input: { type: 'added' | 'used' | 'adjusted' | 'ordered'; quantity: number; note?: string },
): Promise<unknown> {
  const { data } = await api.post(`/inventory/${itemId}/movements/`, input)
  return data
}

// ─── Billing / payments ───────────────────────────────────────────────────────

export async function getInvoices(status?: string): Promise<PaymentsResponse> {
  const { data } = await api.get('/payments/', { params: { status } })
  return data
}

export async function markAppointmentPaid(appointmentId: number): Promise<unknown> {
  const { data } = await api.post('/payments/mark-paid/', { appointment_id: appointmentId })
  return data
}

export async function refundAppointment(appointmentId: number): Promise<unknown> {
  const { data } = await api.post('/payments/refund/', { appointment_id: appointmentId })
  return data
}

export async function getInvoiceDetail(appointmentId: number): Promise<Record<string, unknown>> {
  const { data } = await api.get(`/payments/invoice/${appointmentId}/`)
  return data
}

// ─── Leads / CRM ──────────────────────────────────────────────────────────────

export async function getLeadMeta(): Promise<LeadMeta> {
  const { data } = await api.get('/leads/meta/')
  return data
}

export async function getLeadStats(): Promise<LeadStats> {
  const { data } = await api.get('/leads/stats/')
  return data
}

export async function getLeadPipeline(): Promise<LeadPipelineColumn[]> {
  const { data } = await api.get('/leads/pipeline/')
  return data
}

export async function getLeads(search?: string): Promise<Lead[]> {
  const { data } = await api.get('/leads/', { params: { search } })
  return data
}

export async function createLead(input: LeadInput): Promise<Lead> {
  const { data } = await api.post('/leads/', input)
  return data
}

export async function updateLeadStage(id: number, stageId: number, note?: string): Promise<Lead> {
  const { data } = await api.patch(`/leads/${id}/stage/`, { stage_id: stageId, note })
  return data
}

// ─── Clinic hours / planned closures (admin-only on the backend) ────────────

export async function getClinicHours(): Promise<ClinicHoursDay[]> {
  const { data } = await api.get('/clinic/hours/')
  return data
}

export async function saveClinicHours(
  days: { day: WeekDay; is_open: boolean; open_time?: string; close_time?: string }[],
): Promise<ClinicHoursDay[]> {
  const { data } = await api.post('/clinic/hours/', days)
  return data
}

export async function getPlannedClosures(): Promise<PlannedClosure[]> {
  const { data } = await api.get('/clinic/closures/')
  return data
}

export async function addPlannedClosure(input: { from_date: string; to_date: string; reason?: string }): Promise<PlannedClosure> {
  const { data } = await api.post('/clinic/closures/', input)
  return data
}

export async function deletePlannedClosure(id: number): Promise<void> {
  await api.delete(`/clinic/closures/${id}/`)
}

// ─── AI Assistant ─────────────────────────────────────────────────────────────

export async function sendChatMessage(message: string, history: ChatTurn[]): Promise<ChatResponse> {
  const { data } = await api.post('/ai/chat/', { message, conversation_history: history })
  return data
}

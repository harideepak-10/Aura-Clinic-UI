// Shapes here mirror the real Aura Django/DRF backend responses exactly
// (read from aura_backend's serializers.py / views.py), not a guess.

export type Role = 'admin' | 'reception' | 'therapist'

export interface AuthUser {
  id: number
  username: string
  email: string
  role: Role
  role_id: number
  profile_image: string | null
  phone?: string | null
  specialist_area?: string | null
  years_of_experience?: number | null
  joining_date?: string | null
}

export interface StaffMember {
  id: number
  username: string
  email: string
  role: Role
  role_id: number
  profile_image: string | null
  phone: string | null
  specialist_area: string | null
  joining_date: string | null
  years_of_experience: number | null
  rating: number
  clients: number
}

export interface PricePlan {
  id: number
  sessions: number
  price: string
}

export interface RoomRef {
  room_id: number
  room_name: string
  room_type: string
  room_type_label: string
}

export interface StaffRef {
  staff_id: number
  staff_name: string
  staff_role: string
  staff_email: string
  profile_image: string | null
}

export interface Treatment {
  id: number
  name: string
  category: 'face' | 'body'
  category_id: number
  description: string
  duration: number
  image_url: string | null
  price_plans: PricePlan[]
  pre_care_instructions: string
  post_care_instructions: string
  contraindications: string[]
  rooms_detail: RoomRef[]
  staffs: StaffRef[]
  recommended_frequency_value: number | null
  recommended_frequency_unit: string | null
  created_at: string
  updated_at: string
}

export interface Room {
  id: number
  name: string
  room_type: 'facial_treatment' | 'body_treatment'
  room_type_id: number
  description: string
  created_at: string
  updated_at: string
}

export interface MarketingSource {
  id: number
  label: string
}

export interface Patient {
  id: string // e.g. "Aura41" — the Aura patient_id, not the numeric db id
  name: string
  phone: string
  email: string | null
  image: string | null
  city: string
  country: string
  gender: string
  dob: string | null
  age: number | null
  bloodType: string
  allergies: string
  skinType: string
  contraindications: string
  notes: string
  category: 'New' | 'Returning' | 'VIP' | 'Lead'
  marketingSource: MarketingSource | null
  tags: string
  createdAt: string
  visits: number
  last_visit: { date: string | null; treatment: string | null }
  total_spent: number
}

// Write payload for POST/PATCH /patients/ — the backend accepts camelCase
// bloodType/skinType/marketingSource (see PatientSerializer.to_internal_value)
// and marketingSource is just the integer id, not the {id,label} object the
// read side returns.
export interface PatientInput {
  name: string
  phone: string
  email?: string
  city?: string
  country?: string
  gender?: string
  dob?: string
  bloodType?: string
  allergies?: string
  skinType?: string
  contraindications?: string
  marketingSource?: number
  notes?: string
}

export interface PatientFormOption {
  id: number
  value: string
  label: string
}

export interface PatientFormChoices {
  gender: PatientFormOption[]
  skin_type: PatientFormOption[]
  blood_type: PatientFormOption[]
  marketing_source: PatientFormOption[]
  category: PatientFormOption[]
}

export type AppointmentStatus = 'upcoming' | 'in_session' | 'completed' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'refunded'
export type PaymentType = 'online' | 'cash'
export type ConsentStatus = 'pending' | 'signed'

export interface AppointmentPatientDetail {
  id: number
  patient_id: string
  name: string
  phone: string
  email: string | null
  gender: string
  age: number | null
  image: string | null
  last_visit: { date: string | null; treatment: string | null }
}

export interface AppointmentStaffDetail {
  id: number
  name: string
  role: Role
  specialist_area: string | null
  profile_image: string | null
}

export interface AppointmentTreatmentDetail {
  id: number
  name: string
  duration: number
  category: string
  price: string
  price_plan_id: number | null
  sessions: number
}

export interface AppointmentRoomDetail {
  id: number
  name: string
  room_type: string
}

export interface Appointment {
  id: number
  patient_detail: AppointmentPatientDetail
  staff_detail: AppointmentStaffDetail
  treatment_detail: AppointmentTreatmentDetail
  room_detail: AppointmentRoomDetail | null
  date: string // YYYY-MM-DD
  time: string // "09:00 - 10:00"
  duration: number
  session_number: number
  total_sessions: number
  package_id: number | null
  status: AppointmentStatus
  patient_arrived: boolean
  consent_status: ConsentStatus
  consent_form_url: string
  payment_amount: string | null
  payment_status: PaymentStatus
  payment_type: PaymentType
  notes: string
  updated_at: string
}

export interface AppointmentBookingInput {
  patient_id: string
  staff_id: number
  treatment_id: number
  room_id?: number
  price_plan_id: number
  date: string // YYYY-MM-DD
  time: string // "HH:MM"
  duration?: number
  total_sessions?: number
  payment_amount?: number
  notes?: string
}

export type InventoryCategory = 'consumable' | 'equipment' | 'product' | 'disposable'
export type InventoryUnit = 'ml' | 'pcs' | 'units' | 'kg' | 'g' | 'l'

export interface InventoryItem {
  id: number
  name: string
  description: string
  category: InventoryCategory
  unit: InventoryUnit
  current_stock: number
  minimum_stock_alert: number
  is_low_stock: boolean
  last_restock_date: string | null
  supplier_name: string
  supplier_phone: string
  cost_per_unit: string
}

export interface InventoryItemInput {
  name: string
  description?: string
  category_id: number
  unit_id: number
  initial_stock?: number
  minimum_stock_alert?: number
  supplier_name?: string
  supplier_phone?: string
  cost_per_unit?: number
}

export interface PaymentListItem {
  appointment_id: number
  patient_name: string
  treatment_name: string
  date: string
  amount: string // pre-formatted "€180.00"
  payment_status: PaymentStatus
  payment_type: PaymentType
}

export interface PaymentsResponse {
  payments: PaymentListItem[]
  stats: {
    total: number
    paid_count: number
    pending_count: number
    total_paid: string
    total_pending: string
  }
}

export interface Trend {
  value: number
  change_pct: number
  trend: 'up' | 'down' | 'neutral'
}

export interface LeadSourceStat {
  marketing_source_id: number
  source: string
  label: string
  lead_count: number
  patient_count: number
  total: number
}

export interface BestService {
  treatment_id: number
  name: string
  duration: number
  bookings: number
  revenue: number
}

export interface StaffPerformance {
  staff_id: number
  name: string
  profile_image: string | null
  specialist_area: string | null
  total: number
  completed: number
  revenue: number
}

export interface AdminDashboard {
  role: 'admin'
  greeting: string
  name: string
  date: string
  revenue: { today: Trend; weekly: Trend; monthly: Trend }
  today: { appointments: Trend; checked_in: number; cancelled: number; new_patients: number }
  appointments: { this_month: number; completed: number; cancelled: number }
  cancellation_rate: Trend
  rebooking_rate: Trend
  patients: { total: number; new_this_month: number; returning: number; vip: number }
  leads: { total: number; active: number; converted: number; valuation: number; by_marketing_source: LeadSourceStat[] }
  best_services: BestService[]
  staff_performance: StaffPerformance[]
  revenue_chart: { date: string; revenue: number }[]
}

export interface ScheduleAppointment {
  id: number
  time: string | null
  time_24: string | null
  patient_name: string | null
  treatment: string | null
  staff_name: string | null
  duration: number
  room: string | null
  status: AppointmentStatus
  patient_arrived: boolean
  consent_status: ConsentStatus
}

export interface ReceptionDashboard {
  role: 'reception'
  greeting: string
  name: string
  date: string
  stats: { todays_appointments: number; checked_in: number; cancelled: number; in_session: number; new_patients: number }
  current_sessions: ScheduleAppointment[]
  next_up: ScheduleAppointment[]
}

export interface TherapistDashboard {
  role: 'therapist'
  greeting: string
  name: string
  date: string
  stats: { todays_appointments: number; completed_sessions: number; pending_sessions: number }
  current_session: ScheduleAppointment | null
  next_up: ScheduleAppointment[]
}

export type DashboardResponse = AdminDashboard | ReceptionDashboard | TherapistDashboard

export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  reply: string
  role: string
  action_result: unknown
  options: unknown
  context: { name: string; today: string }
}

// ─── Staff scheduling (working hours / breaks / leave) ───────────────────────

export type WeekDay = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'

export interface WorkingHoursDay {
  id?: number
  day: WeekDay
  day_off: boolean
  start_time?: string | null
  end_time?: string | null
}

export interface StaffBreak {
  id: number
  start_time: string
  end_time: string
  label: string
}

export interface StaffLeave {
  id: number
  from_date: string
  to_date: string
  reason: string
}

export interface StaffRegisterInput {
  username: string
  email: string
  password: string
  confirm_password: string
  role_id: number // 2 = reception, 3 = therapist
}

// Same endpoint as StaffRegisterInput (POST /users/register/ is public — this
// is the self-service sign-up screen, which also accepts role_id 1 = admin).
export type RegisterInput = StaffRegisterInput

export interface RoleOption {
  id: number
  role: Role
  title: string
  level: string
}

export interface StaffUpdateInput {
  username?: string
  email?: string
  role_id?: number
  phone?: string
  specialist_area?: string
  joining_date?: string
  years_of_experience?: number
}

// ─── Treatments / Rooms write payloads ───────────────────────────────────────

export interface TreatmentInput {
  name: string
  category_id: number
  description?: string
  duration: number
  price_plans?: { sessions: number; price: number }[]
  pre_care_instructions?: string
  post_care_instructions?: string
  contraindications?: string[]
  room_ids?: number[]
  staff_ids?: number[]
}

export interface RoomInput {
  name: string
  room_type_id: number
  description?: string
}

// ─── Leads ────────────────────────────────────────────────────────────────────

export type LeadStage = 'new_inquiries' | 'engaged' | 'consultation' | 'winning' | 'converted' | 'lost'
export type LeadSource = 'instagram' | 'web' | 'walk_in' | 'referral' | 'whatsapp' | 'other'

export interface Lead {
  id: number
  name: string
  phone: string
  email: string | null
  source: LeadSource
  marketing_source_id: number
  stage: LeadStage
  stage_id: number
  interest: string
  service_id: number | null
  service_detail: { id: number; name: string } | null
  notes: string
  value: string
  assigned_to: number | null
  assigned_to_name: string | null
  last_contacted: string | null
  created_at: string
  updated_at: string
}

export interface LeadPipelineColumn {
  stage: LeadStage
  stage_label: string
  count: number
  leads: Lead[]
}

export interface LeadStats {
  new_inquiries: number
  engaged: number
  consultation: number
  winning: number
  lost: number
  total_leads: number
  active: number
  valuation: number
}

export interface LeadMetaOption {
  id: number
  value: string
  label: string
}

export interface LeadMeta {
  marketing_sources: LeadMetaOption[]
  stages: LeadMetaOption[]
}

export interface LeadInput {
  name: string
  phone: string
  email?: string
  marketing_source_id: number
  stage_id?: number
  interest?: string
  notes?: string
  value?: number
  assigned_to?: number
}

// ─── Clinic hours / planned closures ──────────────────────────────────────────

export interface ClinicHoursDay {
  id: number | null
  day: WeekDay
  is_open: boolean
  open_time: string | null
  close_time: string | null
}

export interface PlannedClosure {
  id: number
  from_date: string
  to_date: string
  reason: string
  created_at: string
}

// ─── Patient sub-sections (Overview / History / Notes / Photos / Consent) ────

export interface PatientUpcomingAppointment {
  id: number
  date: string
  time: string
  treatment: string | null
  therapist: string | null
  duration: number
  status: AppointmentStatus
  session_number: number
  total_sessions: number
}

export interface PatientActivePackage {
  plan_id: number
  package_name: string
  therapist: string | null
  sessions_used: number
  total_sessions: number
  next_date: string | null
}

export interface PatientActivityEntry {
  type: 'treatment' | 'note' | 'consent' | 'payment'
  date: string
  title: string
  subtitle: string
  status?: AppointmentStatus
}

export interface PatientOverview {
  patient_id: string
  name: string
  category: string
  allergy_warning: string | null
  upcoming_appointment: PatientUpcomingAppointment | null
  active_packages: PatientActivePackage[]
  patient_activity: PatientActivityEntry[]
}

export interface PatientHistoryEntry {
  id: number
  date: string
  treatment: string | null
  therapist: string | null
  duration: number
  price: string
  package: string | null
  session_number: number
  total_sessions: number
  rating: number | null
  next_date: string | null
  status: AppointmentStatus
  cancellation_reason: string | null
}

export interface PatientHistory {
  stats: { total: number; completed: number; cancelled: number; scheduled: number }
  timeline: PatientHistoryEntry[]
}

export interface PatientNote {
  id: number
  treatment_name: string
  therapist: string | null
  date: string
  skin_observation: string
  session_notes: string
  products_used: string
  recommended_to_patient: string | null
  next_treatment: string | null
  before_photo: string | null
  after_photo: string | null
  appointment_status: AppointmentStatus | null
}

export interface PatientNotesResponse {
  stats: { total_notes: number; completed: number; with_photos: number }
  notes: PatientNote[]
}

export interface PatientNoteInput {
  appointment_id?: number
  treatment_name?: string
  skin_observation?: string
  session_notes?: string
  products_used?: string
  recommended_to_patient?: string
  next_treatment?: string
}

export interface PatientPhotoEntry {
  session_id: number
  treatment_name: string
  therapist: string | null
  date: string
  before_photo: string | null
  after_photo: string | null
}

export interface PatientPhotosResponse {
  photos: PatientPhotoEntry[]
  total: number
}

export interface ConsentRecord {
  id: number
  title: string
  file_name: string | null
  file_url: string | null
  status: 'pending' | 'signed'
  patient_signed: boolean
  therapist_signed: boolean
  signed_date: string | null
  created_at: string
}

export interface ConsentResponse {
  stats: { signed: number; pending: number }
  records: ConsentRecord[]
}

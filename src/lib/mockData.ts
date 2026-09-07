import type {
  Appointment,
  ChatMessage,
  DashboardStats,
  InventoryItem,
  Invoice,
  Patient,
  Room,
  Therapist,
  User,
} from './types'

export const mockUser: User = {
  id: 'u1',
  name: 'Deepak Hari',
  email: 'harideepak@krypsos.tech',
  role: 'admin',
}

export const therapists: Therapist[] = [
  { id: 't1', name: 'Dr. Elena Vargas', specialty: 'Dermatology', color: 'var(--color-forest-600)' },
  { id: 't2', name: 'Marc Dubois', specialty: 'Physiotherapy', color: 'var(--color-gold-600)' },
  { id: 't3', name: 'Dr. Isabel Roig', specialty: 'Aesthetic Medicine', color: 'var(--color-info)' },
  { id: 't4', name: 'Sofia Bianchi', specialty: 'Massage Therapy', color: 'var(--color-danger)' },
]

export const rooms: Room[] = [
  { id: 'r1', name: 'Room 1 — Sea View' },
  { id: 'r2', name: 'Room 2 — Garden' },
  { id: 'r3', name: 'Room 3 — Suite' },
]

export const patients: Patient[] = [
  { id: 'p1', name: 'Carmen Ortiz', email: 'carmen.ortiz@example.com', phone: '+34 611 223 344', memberSince: '2023-02-11', lastVisit: '2026-09-01', totalVisits: 18, tags: ['VIP', 'Skincare'], notes: 'Prefers afternoon slots.' },
  { id: 'p2', name: 'James Whitfield', email: 'j.whitfield@example.com', phone: '+34 622 998 112', memberSince: '2024-06-03', lastVisit: '2026-08-27', totalVisits: 6, tags: ['New client'] },
  { id: 'p3', name: 'Anaïs Moreau', email: 'anais.moreau@example.com', phone: '+33 6 12 34 56 78', memberSince: '2022-11-19', lastVisit: '2026-09-04', totalVisits: 32, tags: ['VIP', 'Physiotherapy'] },
  { id: 'p4', name: 'Lukas Bergström', email: 'lukas.b@example.com', phone: '+46 70 123 4567', memberSince: '2025-01-22', lastVisit: '2026-08-15', totalVisits: 3, tags: [] },
  { id: 'p5', name: 'Isabela Fernandes', email: 'isabela.f@example.com', phone: '+351 91 234 5678', memberSince: '2023-09-08', lastVisit: '2026-09-05', totalVisits: 21, tags: ['VIP'] },
  { id: 'p6', name: 'Thomas Keller', email: 'thomas.keller@example.com', phone: '+49 151 2345 6789', memberSince: '2024-12-01', lastVisit: '2026-07-30', totalVisits: 4, tags: ['Massage'] },
]

export const appointments: Appointment[] = [
  { id: 'a1', patientId: 'p1', patientName: 'Carmen Ortiz', therapistId: 't1', roomId: 'r1', service: 'Signature Facial', start: '2026-09-07T09:00:00', end: '2026-09-07T10:00:00', status: 'confirmed' },
  { id: 'a2', patientId: 'p2', patientName: 'James Whitfield', therapistId: 't2', roomId: 'r2', service: 'Sports Recovery', start: '2026-09-07T10:30:00', end: '2026-09-07T11:30:00', status: 'confirmed' },
  { id: 'a3', patientId: 'p3', patientName: 'Anaïs Moreau', therapistId: 't2', roomId: 'r2', service: 'Deep Tissue Physio', start: '2026-09-07T12:00:00', end: '2026-09-07T13:00:00', status: 'pending' },
  { id: 'a4', patientId: 'p5', patientName: 'Isabela Fernandes', therapistId: 't3', roomId: 'r3', service: 'Aesthetic Consultation', start: '2026-09-07T14:00:00', end: '2026-09-07T14:45:00', status: 'confirmed' },
  { id: 'a5', patientId: 'p6', patientName: 'Thomas Keller', therapistId: 't4', roomId: 'r1', service: 'Hot Stone Massage', start: '2026-09-07T15:30:00', end: '2026-09-07T16:30:00', status: 'confirmed' },
  { id: 'a6', patientId: 'p4', patientName: 'Lukas Bergström', therapistId: 't1', roomId: 'r1', service: 'Skin Consultation', start: '2026-09-07T17:00:00', end: '2026-09-07T17:30:00', status: 'cancelled' },
  { id: 'a7', patientId: 'p1', patientName: 'Carmen Ortiz', therapistId: 't3', roomId: 'r3', service: 'Botox Follow-up', start: '2026-09-08T09:30:00', end: '2026-09-08T10:00:00', status: 'confirmed' },
]

export const inventory: InventoryItem[] = [
  { id: 'i1', name: 'Hyaluronic Acid Serum 30ml', category: 'Skincare', sku: 'SK-HA-030', quantity: 42, reorderThreshold: 15, unit: 'units', status: 'in_stock', supplier: 'Derma Supply Co.', updatedAt: '2026-09-05' },
  { id: 'i2', name: 'Botulinum Toxin Vials', category: 'Injectables', sku: 'INJ-BTX-01', quantity: 6, reorderThreshold: 10, unit: 'vials', status: 'low', supplier: 'MedAesthetics Ltd.', updatedAt: '2026-09-06' },
  { id: 'i3', name: 'Massage Oil — Lavender', category: 'Spa', sku: 'SPA-OIL-LAV', quantity: 0, reorderThreshold: 8, unit: 'bottles', status: 'out_of_stock', supplier: 'Provence Naturals', updatedAt: '2026-09-02' },
  { id: 'i4', name: 'Disposable Face Towels', category: 'Consumables', sku: 'CON-TWL-100', quantity: 310, reorderThreshold: 100, unit: 'pcs', status: 'in_stock', supplier: 'Clinico Essentials', updatedAt: '2026-09-04' },
  { id: 'i5', name: 'Dermal Filler 1ml', category: 'Injectables', sku: 'INJ-FIL-1ML', quantity: 9, reorderThreshold: 12, unit: 'syringes', status: 'low', supplier: 'MedAesthetics Ltd.', updatedAt: '2026-09-06' },
  { id: 'i6', name: 'Sea Salt Body Scrub', category: 'Spa', sku: 'SPA-SCR-500', quantity: 27, reorderThreshold: 10, unit: 'jars', status: 'in_stock', supplier: 'Provence Naturals', updatedAt: '2026-09-01' },
]

export const invoices: Invoice[] = [
  { id: 'inv1', patientId: 'p1', patientName: 'Carmen Ortiz', service: 'Signature Facial', amountEur: 180, status: 'paid', issuedAt: '2026-09-01', paidAt: '2026-09-01', method: 'card' },
  { id: 'inv2', patientId: 'p3', patientName: 'Anaïs Moreau', service: 'Deep Tissue Physio', amountEur: 120, status: 'pending', issuedAt: '2026-09-06' },
  { id: 'inv3', patientId: 'p5', patientName: 'Isabela Fernandes', service: 'Aesthetic Consultation', amountEur: 90, status: 'paid', issuedAt: '2026-09-05', paidAt: '2026-09-05', method: 'sepa' },
  { id: 'inv4', patientId: 'p6', patientName: 'Thomas Keller', service: 'Hot Stone Massage', amountEur: 150, status: 'failed', issuedAt: '2026-09-04' },
  { id: 'inv5', patientId: 'p2', patientName: 'James Whitfield', service: 'Sports Recovery', amountEur: 110, status: 'paid', issuedAt: '2026-08-27', paidAt: '2026-08-27', method: 'card' },
  { id: 'inv6', patientId: 'p4', patientName: 'Lukas Bergström', service: 'Skin Consultation', amountEur: 60, status: 'refunded', issuedAt: '2026-08-15', paidAt: '2026-08-15', method: 'card' },
]

export const chatMessages: ChatMessage[] = [
  { id: 'c1', role: 'assistant', content: 'Hola! I\'m Aura, your clinic assistant. Ask me about today\'s schedule, patient history, or inventory levels.', createdAt: '2026-09-07T08:00:00' },
  { id: 'c2', role: 'user', content: 'How many appointments are booked for this afternoon?', createdAt: '2026-09-07T08:01:00' },
  { id: 'c3', role: 'assistant', content: 'You have 3 appointments after 14:00 today: Isabela Fernandes (Aesthetic Consultation, 14:00), Thomas Keller (Hot Stone Massage, 15:30), and one cancelled slot with Lukas Bergström at 17:00.', createdAt: '2026-09-07T08:01:04' },
]

export const dashboardStats: DashboardStats = {
  todayAppointments: 6,
  todayRevenueEur: 650,
  activePatients: 214,
  occupancyRate: 0.78,
  revenueTrend: [
    { date: 'Mon', revenueEur: 1240 },
    { date: 'Tue', revenueEur: 1580 },
    { date: 'Wed', revenueEur: 1120 },
    { date: 'Thu', revenueEur: 1740 },
    { date: 'Fri', revenueEur: 2010 },
    { date: 'Sat', revenueEur: 2450 },
    { date: 'Sun', revenueEur: 980 },
  ],
  appointmentsByService: [
    { service: 'Facials', count: 34 },
    { service: 'Physio', count: 28 },
    { service: 'Injectables', count: 19 },
    { service: 'Massage', count: 24 },
    { service: 'Consults', count: 12 },
  ],
}

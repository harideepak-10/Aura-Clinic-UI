import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { Appointments } from './pages/Appointments'
import { Patients } from './pages/Patients'
import { Inventory } from './pages/Inventory'
import { Billing } from './pages/Billing'
import { Assistant } from './pages/Assistant'
import { Staff } from './pages/Staff'
import { Treatments } from './pages/Treatments'
import { Rooms } from './pages/Rooms'
import { Leads } from './pages/Leads'
import { ClinicHours } from './pages/ClinicHours'
import { Settings } from './pages/Settings'
import { useAuth } from './lib/auth'
import { canAccessPage } from './lib/roles'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

// Guards a role-restricted page (Staff, Treatments, Rooms, Clinic hours,
// Inventory, Leads, Billing) — direct navigation to a URL the current role
// can't use bounces to the dashboard instead of rendering a page whose
// backend calls will just 403.
function RequireRole({ path, children }: { path: string; children: React.ReactNode }) {
  const role = useAuth((s) => s.user?.role)
  if (!canAccessPage(role, path)) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  const hydrate = useAuth((s) => s.hydrate)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/patients" element={<Patients />} />
        <Route
          path="/inventory"
          element={
            <RequireRole path="inventory">
              <Inventory />
            </RequireRole>
          }
        />
        <Route
          path="/billing"
          element={
            <RequireRole path="billing">
              <Billing />
            </RequireRole>
          }
        />
        <Route path="/assistant" element={<Assistant />} />
        <Route
          path="/staff"
          element={
            <RequireRole path="staff">
              <Staff />
            </RequireRole>
          }
        />
        <Route
          path="/treatments"
          element={
            <RequireRole path="treatments">
              <Treatments />
            </RequireRole>
          }
        />
        <Route
          path="/rooms"
          element={
            <RequireRole path="rooms">
              <Rooms />
            </RequireRole>
          }
        />
        <Route
          path="/leads"
          element={
            <RequireRole path="leads">
              <Leads />
            </RequireRole>
          }
        />
        <Route
          path="/clinic-hours"
          element={
            <RequireRole path="clinic-hours">
              <ClinicHours />
            </RequireRole>
          }
        />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

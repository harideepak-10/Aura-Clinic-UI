import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { Login } from './pages/Login'
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

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
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
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/treatments" element={<Treatments />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/clinic-hours" element={<ClinicHours />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

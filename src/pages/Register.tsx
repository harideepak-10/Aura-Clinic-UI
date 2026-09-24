import { type FormEvent, useEffect, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Mail, Lock, User, ArrowRight } from 'lucide-react'
import { Input, Label } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useAuth } from '../lib/auth'
import { AuthLayout } from '../components/layout/AuthLayout'
import { getRoles } from '../lib/dataSource'
import type { RoleOption } from '../lib/types'

export function Register() {
  const { register, isLoading, error, isAuthenticated } = useAuth()
  const [roles, setRoles] = useState<RoleOption[]>([])
  const [form, setForm] = useState({ username: '', email: '', roleId: 3, password: '', confirmPassword: '' })
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    getRoles()
      .then(setRoles)
      .catch(() => setRoles([{ id: 1, role: 'admin', title: 'Admin', level: 'LEVEL: EXECUTIVE' }, { id: 2, role: 'reception', title: 'Receptionist', level: 'LEVEL: OPERATIONS' }, { id: 3, role: 'therapist', title: 'Therapist', level: 'LEVEL: CLINICAL' }]))
  }, [])

  if (isAuthenticated) return <Navigate to="/" replace />

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setValidationError(null)
    if (form.password !== form.confirmPassword) {
      setValidationError('Passwords do not match.')
      return
    }
    register({ username: form.username, email: form.email, password: form.password, confirm_password: form.confirmPassword, role_id: form.roleId })
  }

  return (
    <AuthLayout>
          <div className="text-center">
          <h2 className="font-display text-3xl font-medium text-[var(--color-ink)]">Create your account</h2>
          <p className="mt-2 text-sm text-[var(--color-ink-faint)]">Set up professional access to the Aura clinic suite.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <Label htmlFor="username">Full name</Label>
              <Input
                id="username"
                icon={<User size={16} />}
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                placeholder="Alexandra Voss"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                icon={<Mail size={16} />}
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="you@clinic.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 text-sm outline-none focus:border-[var(--color-forest-600)]"
                value={form.roleId}
                onChange={(e) => setForm((f) => ({ ...f, roleId: Number(e.target.value) }))}
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                icon={<Lock size={16} />}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                icon={<Lock size={16} />}
                value={form.confirmPassword}
                onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                placeholder="••••••••"
                required
              />
            </div>

            {(validationError || error) && (
              <p className="rounded-[var(--radius-md)] bg-[var(--color-danger-soft)] px-3.5 py-2.5 text-sm text-[var(--color-danger)]">
                {validationError || error}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? 'Creating account…' : 'Create account'}
              {!isLoading && <ArrowRight size={16} />}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-[var(--color-ink-faint)]">
            Already have a professional account?{' '}
            <Link to="/login" className="font-medium text-[var(--color-forest-700)] hover:underline">
              Log in here
            </Link>
          </p>
    </AuthLayout>
  )
}

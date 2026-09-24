import { type FormEvent, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { Input, Label } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useAuth } from '../lib/auth'
import { AuthLayout } from '../components/layout/AuthLayout'

export function Login() {
  const { login, isLoading, error, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (isAuthenticated) return <Navigate to="/" replace />

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    login(email, password)
  }

  return (
    <AuthLayout>
          <div className="text-center">
          <h2 className="font-display text-3xl font-medium text-[var(--color-ink)]">Welcome back</h2>
          <p className="mt-2 text-sm text-[var(--color-ink-faint)]">Sign in to manage today's schedule.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                icon={<Mail size={16} />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@clinic.com"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="mb-1.5">Password</Label>
                <a href="#" className="mb-1.5 text-xs font-medium text-[var(--color-forest-700)] hover:underline">
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                icon={<Lock size={16} />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p className="rounded-[var(--radius-md)] bg-[var(--color-danger-soft)] px-3.5 py-2.5 text-sm text-[var(--color-danger)]">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? 'Signing in…' : 'Sign in'}
              {!isLoading && <ArrowRight size={16} />}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-[var(--color-ink-faint)]">
            Connects to your live Aura backend — sign in with your clinic account.
          </p>
          <p className="mt-3 text-center text-xs text-[var(--color-ink-faint)]">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-[var(--color-forest-700)] hover:underline">
              Sign up here
            </Link>
          </p>
    </AuthLayout>
  )
}

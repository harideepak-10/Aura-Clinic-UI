import { type FormEvent, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Leaf, Mail, Lock, ArrowRight } from 'lucide-react'
import { Input, Label } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useAuth } from '../lib/auth'

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
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Editorial side panel */}
      <div className="relative hidden overflow-hidden bg-[var(--color-forest-900)] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, var(--color-forest-700), transparent 45%), radial-gradient(circle at 80% 70%, var(--color-gold-700), transparent 40%)',
          }}
        />
        <div className="relative flex items-center gap-2.5 text-[var(--color-ivory)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-ivory)]/10 text-[var(--color-gold-500)]">
            <Leaf size={20} />
          </div>
          <span className="font-display text-xl">Aura Clinic Suite</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative max-w-md text-[var(--color-ivory)]"
        >
          <p className="font-display text-4xl font-light leading-tight">
            Calm, precise operations for a clinic that never rushes its guests.
          </p>
          <p className="mt-5 text-sm text-[var(--color-ivory)]/70">
            Scheduling, patient care, inventory, and billing — brought together in one
            quietly confident workspace.
          </p>
        </motion.div>

        <p className="relative text-xs text-[var(--color-ivory)]/50">© 2026 Aura Clinic · Krypsos</p>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center bg-[var(--color-ivory)] px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 lg:hidden">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-forest-800)] text-[var(--color-gold-500)]">
              <Leaf size={20} />
            </div>
          </div>

          <h2 className="font-display text-3xl font-medium text-[var(--color-ink)]">Welcome back</h2>
          <p className="mt-2 text-sm text-[var(--color-ink-faint)]">Sign in to manage today's schedule.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
        </motion.div>
      </div>
    </div>
  )
}

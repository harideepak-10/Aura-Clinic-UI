import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import auraMark from '../../assets/brand/aura-mark-cream.png'

// Shared centred layout for the Login and Register screens: a single card
// on the forest-green backdrop, with the Aura mark above it.
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-forest-900)] px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 15%, var(--color-forest-700), transparent 45%), radial-gradient(circle at 85% 85%, var(--color-gold-700), transparent 40%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-ivory)]/10 ring-1 ring-[var(--color-gold-500)]/30">
            <img src={auraMark} alt="Aura" className="h-7 w-auto" />
          </div>
          <p className="mt-3 font-display text-xl text-[var(--color-ivory)]">Aura Clinic Suite</p>
        </div>

        <div className="rounded-[var(--radius-xl)] bg-[var(--color-ivory)] p-7 shadow-lift sm:p-10">{children}</div>

        <p className="mt-6 text-center text-xs text-[var(--color-ivory)]/50">© 2026 Aura Clinic · Krypsos</p>
      </motion.div>
    </div>
  )
}

import type { ReactNode } from 'react'
import { Card } from './Card'
import { cn } from '../../lib/cn'

interface StatTileProps {
  label: string
  value: string
  delta?: string
  deltaTone?: 'up' | 'down' | 'neutral'
  icon?: ReactNode
}

export function StatTile({ label, value, delta, deltaTone = 'neutral', icon }: StatTileProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-faint)]">{label}</p>
          <p className="mt-2 font-display text-3xl font-medium text-[var(--color-ink)]">{value}</p>
        </div>
        {icon && (
          <div className="rounded-full bg-[var(--color-forest-50)] p-2.5 text-[var(--color-forest-700)]">{icon}</div>
        )}
      </div>
      {delta && (
        <p
          className={cn(
            'mt-3 text-xs font-medium',
            deltaTone === 'up' && 'text-[var(--color-success)]',
            deltaTone === 'down' && 'text-[var(--color-danger)]',
            deltaTone === 'neutral' && 'text-[var(--color-ink-faint)]',
          )}
        >
          {delta}
        </p>
      )}
    </Card>
  )
}

import { cn } from '../../lib/cn'

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function Avatar({ name, size = 36, className }: { name: string; size?: number; className?: string }) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-[var(--color-forest-800)] font-medium text-[var(--color-ivory)]',
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials(name)}
    </div>
  )
}

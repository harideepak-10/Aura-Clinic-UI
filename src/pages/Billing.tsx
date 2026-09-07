import { useEffect, useMemo, useState } from 'react'
import { Search, CreditCard, Download, Plus } from 'lucide-react'
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { StatTile } from '../components/ui/StatTile'
import { getInvoices } from '../lib/dataSource'
import type { Invoice, PaymentStatus } from '../lib/types'
import { formatDate, formatEur, paymentTone } from '../lib/format'

const statusFilters: (PaymentStatus | 'all')[] = ['all', 'paid', 'pending', 'failed', 'refunded']

export function Billing() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<PaymentStatus | 'all'>('all')

  useEffect(() => {
    getInvoices().then(setInvoices)
  }, [])

  const filtered = useMemo(
    () =>
      invoices.filter(
        (i) =>
          (status === 'all' || i.status === status) &&
          [i.patientName, i.service].join(' ').toLowerCase().includes(query.toLowerCase()),
      ),
    [invoices, query, status],
  )

  const totals = useMemo(() => {
    const paid = invoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + i.amountEur, 0)
    const pending = invoices.filter((i) => i.status === 'pending').reduce((sum, i) => sum + i.amountEur, 0)
    const failed = invoices.filter((i) => i.status === 'failed').length
    return { paid, pending, failed }
  }, [invoices])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Collected (paid)" value={formatEur(totals.paid)} deltaTone="up" delta="via Stripe" icon={<CreditCard size={18} />} />
        <StatTile label="Awaiting payment" value={formatEur(totals.pending)} deltaTone="neutral" delta="pending invoices" icon={<CreditCard size={18} />} />
        <StatTile label="Failed charges" value={String(totals.failed)} deltaTone="down" delta="need follow-up" icon={<CreditCard size={18} />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <Button size="sm">
            <Plus size={15} /> New invoice
          </Button>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="w-64">
              <Input placeholder="Search invoices…" icon={<Search size={16} />} value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {statusFilters.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${
                    status === s
                      ? 'bg-[var(--color-forest-800)] text-[var(--color-ivory)]'
                      : 'bg-[var(--color-surface)] text-[var(--color-ink-soft)] border border-[var(--color-line)] hover:border-[var(--color-forest-500)]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-[var(--color-line-soft)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-faint)]">
                  <th className="py-3 pr-4 font-medium">Patient</th>
                  <th className="py-3 pr-4 font-medium">Service</th>
                  <th className="py-3 pr-4 font-medium">Issued</th>
                  <th className="py-3 pr-4 font-medium">Method</th>
                  <th className="py-3 pr-4 font-medium text-right">Amount</th>
                  <th className="py-3 pl-4 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-line-soft)]">
                {filtered.map((inv) => (
                  <tr key={inv.id} className="transition-colors hover:bg-[var(--color-ivory-dim)]">
                    <td className="py-3.5 pr-4 font-medium text-[var(--color-ink)]">{inv.patientName}</td>
                    <td className="py-3.5 pr-4 text-[var(--color-ink-soft)]">{inv.service}</td>
                    <td className="py-3.5 pr-4 text-[var(--color-ink-faint)]">{formatDate(inv.issuedAt)}</td>
                    <td className="py-3.5 pr-4 text-[var(--color-ink-soft)] uppercase">{inv.method ?? '—'}</td>
                    <td className="py-3.5 pr-4 text-right font-medium text-[var(--color-ink)]">{formatEur(inv.amountEur)}</td>
                    <td className="py-3.5 pl-4 text-right">
                      <Badge tone={paymentTone(inv.status)}>{inv.status}</Badge>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-[var(--color-ink-faint)]">
                      No invoices match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <Button variant="secondary" size="sm">
              <Download size={14} /> Export CSV
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

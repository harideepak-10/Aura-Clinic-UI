import { useEffect, useMemo, useState } from 'react'
import { Search, CreditCard, RotateCcw, AlertTriangle } from 'lucide-react'
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { StatTile } from '../components/ui/StatTile'
import { getInvoiceDetail, getInvoices, markAppointmentPaid, refundAppointment } from '../lib/dataSource'
import { apiErrorMessage } from '../lib/api'
import type { PaymentListItem, PaymentsResponse, PaymentStatus } from '../lib/types'
import { formatDate, paymentTone } from '../lib/format'

const statusFilters: (PaymentStatus | 'all')[] = ['all', 'paid', 'pending', 'refunded']

export function Billing() {
  const [data, setData] = useState<PaymentsResponse | null>(null)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<PaymentStatus | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<PaymentListItem | null>(null)

  const load = (s?: PaymentStatus | 'all') => {
    setLoading(true)
    setError(null)
    getInvoices(s && s !== 'all' ? s : undefined)
      .then(setData)
      .catch((err) => setError(apiErrorMessage(err, 'Could not load billing data.')))
      .finally(() => setLoading(false))
  }

  useEffect(() => load(status), [status])

  const filtered = useMemo(() => {
    if (!data) return []
    return data.payments.filter((p) => [p.patient_name, p.treatment_name].join(' ').toLowerCase().includes(query.toLowerCase()))
  }, [data, query])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Collected (paid)" value={data?.stats.total_paid ?? '—'} deltaTone="up" delta="via Stripe" icon={<CreditCard size={18} />} />
        <StatTile label="Awaiting payment" value={data?.stats.total_pending ?? '—'} deltaTone="neutral" delta={`${data?.stats.pending_count ?? 0} pending invoices`} icon={<CreditCard size={18} />} />
        <StatTile label="Total invoices" value={String(data?.stats.total ?? 0)} deltaTone="neutral" delta={`${data?.stats.paid_count ?? 0} paid`} icon={<CreditCard size={18} />} />
      </div>

      {error && (
        <Card className="flex items-center justify-between gap-4 p-5">
          <p className="text-sm text-[var(--color-danger)]">{error}</p>
          <Button variant="secondary" size="sm" onClick={() => load(status)}>
            <RotateCcw size={14} /> Retry
          </Button>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
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
                    status === s ? 'bg-[var(--color-forest-800)] text-[var(--color-ivory)]' : 'bg-[var(--color-surface)] text-[var(--color-ink-soft)] border border-[var(--color-line)] hover:border-[var(--color-forest-500)]'
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
                  <th className="py-3 pr-4 font-medium">Treatment</th>
                  <th className="py-3 pr-4 font-medium">Date</th>
                  <th className="py-3 pr-4 font-medium">Method</th>
                  <th className="py-3 pr-4 font-medium text-right">Amount</th>
                  <th className="py-3 pl-4 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-line-soft)]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-[var(--color-ink-faint)]">
                      Loading invoices…
                    </td>
                  </tr>
                ) : (
                  filtered.map((inv) => (
                    <tr
                      key={inv.appointment_id}
                      onClick={() => setSelected(inv)}
                      className="cursor-pointer transition-colors hover:bg-[var(--color-ivory-dim)]"
                    >
                      <td className="py-3.5 pr-4 font-medium text-[var(--color-ink)]">{inv.patient_name}</td>
                      <td className="py-3.5 pr-4 text-[var(--color-ink-soft)]">{inv.treatment_name}</td>
                      <td className="py-3.5 pr-4 text-[var(--color-ink-faint)]">{formatDate(inv.date)}</td>
                      <td className="py-3.5 pr-4 text-[var(--color-ink-soft)] uppercase">{inv.payment_type}</td>
                      <td className="py-3.5 pr-4 text-right font-medium text-[var(--color-ink)]">{inv.amount}</td>
                      <td className="py-3.5 pl-4 text-right">
                        <Badge tone={paymentTone(inv.payment_status)}>{inv.payment_status}</Badge>
                      </td>
                    </tr>
                  ))
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-[var(--color-ink-faint)]">
                      No invoices match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <InvoiceModal invoice={selected} onClose={() => setSelected(null)} onChanged={() => load(status)} />
    </div>
  )
}

function InvoiceModal({ invoice, onClose, onChanged }: { invoice: PaymentListItem | null; onClose: () => void; onChanged: () => void }) {
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!invoice) return
    setDetail(null)
    setError(null)
    getInvoiceDetail(invoice.appointment_id)
      .then(setDetail)
      .catch((err) => setError(apiErrorMessage(err, 'Could not load this invoice.')))
  }, [invoice])

  if (!invoice) return null

  const markPaid = async () => {
    setBusy(true)
    setError(null)
    try {
      await markAppointmentPaid(invoice.appointment_id)
      onChanged()
      onClose()
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not mark this invoice as paid.'))
    } finally {
      setBusy(false)
    }
  }

  const refund = async () => {
    setBusy(true)
    setError(null)
    try {
      await refundAppointment(invoice.appointment_id)
      onChanged()
      onClose()
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not refund this invoice.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={!!invoice} onClose={onClose} title={invoice.patient_name} width="max-w-lg">
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-line-soft)] px-4 py-3">
          <div>
            <p className="font-medium text-[var(--color-ink)]">{invoice.treatment_name}</p>
            <p className="text-xs text-[var(--color-ink-faint)]">
              {formatDate(invoice.date)} · {invoice.payment_type.toUpperCase()}
            </p>
          </div>
          <div className="text-right">
            <p className="font-medium text-[var(--color-ink)]">{invoice.amount}</p>
            <Badge tone={paymentTone(invoice.payment_status)}>{invoice.payment_status}</Badge>
          </div>
        </div>

        {detail && (
          <div className="space-y-1.5 text-sm text-[var(--color-ink-soft)]">
            {Object.entries(detail)
              .filter(([key]) => !['patient_name', 'treatment_name', 'date', 'amount', 'payment_status', 'payment_type', 'appointment_id'].includes(key))
              .map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="capitalize text-[var(--color-ink-faint)]">{key.replace(/_/g, ' ')}</span>
                  <span>{typeof value === 'object' ? JSON.stringify(value) : String(value ?? '—')}</span>
                </div>
              ))}
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2.5 rounded-[var(--radius-md)] bg-[var(--color-danger-soft)] px-3.5 py-3 text-sm text-[var(--color-danger)]">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-2 border-t border-[var(--color-line-soft)] pt-4">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          {invoice.payment_status === 'pending' && (
            <Button onClick={markPaid} disabled={busy}>
              {busy ? 'Working…' : 'Mark as paid'}
            </Button>
          )}
          {invoice.payment_status === 'paid' && (
            <Button variant="danger" onClick={refund} disabled={busy}>
              {busy ? 'Working…' : 'Refund'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

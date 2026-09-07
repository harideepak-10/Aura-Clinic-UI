import { type FormEvent, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Send, Loader2 } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { getChatMessages, sendChatMessage } from '../lib/dataSource'
import type { ChatMessage } from '../lib/types'
import { cn } from '../lib/cn'

const suggestions = [
  "What's on the schedule this afternoon?",
  'Which items are low on stock?',
  'Show me overdue invoices',
  "Summarize Carmen Ortiz's visit history",
]

export function Assistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getChatMessages().then(setMessages)
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, sending])

  const submit = async (e?: FormEvent, forced?: string) => {
    e?.preventDefault()
    const content = forced ?? input
    if (!content.trim()) return
    const userMsg: ChatMessage = {
      id: `local-${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setSending(true)
    try {
      const reply = await sendChatMessage(content)
      setMessages((prev) => [...prev, reply])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-9.5rem)] max-w-3xl flex-col lg:h-[calc(100vh-7.5rem)]">
      <Card className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-[var(--color-line-soft)] px-6 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-forest-800)] text-[var(--color-gold-500)]">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="font-display text-base font-medium text-[var(--color-ink)]">Aura Assistant</p>
            <p className="text-xs text-[var(--color-ink-faint)]">Groq-backed · knows your schedule, patients &amp; stock</p>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[80%] rounded-[var(--radius-lg)] px-4 py-2.5 text-sm leading-relaxed',
                  m.role === 'user'
                    ? 'bg-[var(--color-forest-800)] text-[var(--color-ivory)]'
                    : 'bg-[var(--color-ivory-dim)] text-[var(--color-ink)]',
                )}
              >
                {m.content}
              </div>
            </motion.div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-[var(--radius-lg)] bg-[var(--color-ivory-dim)] px-4 py-2.5 text-sm text-[var(--color-ink-faint)]">
                <Loader2 size={14} className="animate-spin" /> Aura is thinking…
              </div>
            </div>
          )}
        </div>

        {messages.length <= 2 && (
          <div className="flex flex-wrap gap-2 px-6 pb-3">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => submit(undefined, s)}
                className="rounded-full border border-[var(--color-line)] px-3.5 py-1.5 text-xs text-[var(--color-ink-soft)] transition-colors hover:border-[var(--color-forest-500)] hover:text-[var(--color-forest-800)]"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={submit} className="flex items-center gap-3 border-t border-[var(--color-line-soft)] px-6 py-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about schedules, patients, inventory…"
            className="h-11 flex-1 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-4 text-sm outline-none focus:border-[var(--color-forest-600)] focus:ring-2 focus:ring-[var(--color-forest-100)]"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-forest-800)] text-[var(--color-ivory)] transition-opacity disabled:opacity-40"
          >
            <Send size={17} />
          </button>
        </form>
      </Card>
    </div>
  )
}

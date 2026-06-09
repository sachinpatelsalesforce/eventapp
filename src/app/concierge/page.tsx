'use client'

import { useState, useRef, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'

interface Message { role: 'user' | 'assistant'; content: string }

const suggestions = [
  "Which sessions should I attend if I focus on Agentforce?",
  "Where is the OMS session taking place?",
  "Who is speaking about AI commerce?",
  "What time does the networking lunch start?",
]

export default function ConciergePage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text: string) => {
    if (!text.trim() || streaming) return
    const userMsg: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setStreaming(true)

    const assistantPlaceholder: Message = { role: 'assistant', content: '' }
    setMessages(prev => [...prev, assistantPlaceholder])

    try {
      const res = await fetch('/api/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: newMessages.slice(-8).map(m => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.body) throw new Error('No stream')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setMessages(prev => [
          ...prev.slice(0, -1),
          { role: 'assistant', content: accumulated },
        ])
      }
    } catch {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again." },
      ])
    } finally {
      setStreaming(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-[#061528]">
      <Header title="AI Concierge" subtitle="Ask me anything about today's event" />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-4xl w-full mx-auto">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#0070D2] to-[#0B56A8] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#0070D2]/20">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-1">How can I help?</h2>
            <p className="text-white/50 text-sm mb-6">Ask me about sessions, speakers, rooms, or anything about today.</p>
            <div className="grid gap-2 max-w-sm mx-auto">
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left text-sm text-[#5EB3FF] bg-[#0070D2]/10 border border-[#0070D2]/20 rounded-xl px-4 py-2.5 hover:bg-[#0070D2]/20 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-[#0070D2] text-white rounded-br-sm'
                  : 'bg-[#0D2137] border border-white/[0.08] text-white/80 rounded-bl-sm'
              }`}
            >
              {msg.content || (msg.role === 'assistant' && streaming && (
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              ))}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-white/[0.06] bg-[#061528]/95 backdrop-blur-md px-4 py-3 max-w-4xl w-full mx-auto">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
            placeholder="Ask about sessions, speakers, rooms…"
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#0070D2] focus:outline-none focus:ring-1 focus:ring-[#0070D2]"
            disabled={streaming}
          />
          <Button onClick={() => send(input)} disabled={!input.trim() || streaming} size="md">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  )
}

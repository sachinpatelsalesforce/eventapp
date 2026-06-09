'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Question, AgendaItem } from '@/types'
import { QUESTION_TOPICS } from '@/lib/constants'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useContactId } from '@/hooks/useContactId'

export default function QuestionsPage() {
  const contactId = useContactId()
  const [questions, setQuestions] = useState<Question[]>([])
  const [sessions, setSessions] = useState<AgendaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [topicFilter, setTopicFilter] = useState('')
  const [form, setForm] = useState({ session_id: '', question_text: '', topic: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const fetchQuestions = async (topic?: string) => {
    const url = topic ? `/api/questions?topic=${topic}` : '/api/questions'
    const data = await fetch(url).then(r => r.json())
    setQuestions(data)
  }

  useEffect(() => {
    Promise.all([
      fetch('/api/agenda').then(r => r.json()),
      fetch('/api/questions').then(r => r.json()),
    ]).then(([ag, qs]) => {
      setSessions(ag.filter((a: AgendaItem) => a.speaker_id))
      setQuestions(qs)
      setLoading(false)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactId) return
    setSubmitting(true)
    await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, contact_id: contactId, topic: form.topic || null }),
    })
    setSubmitted(true)
    setForm({ session_id: '', question_text: '', topic: '' })
    await fetchQuestions(topicFilter || undefined)
    setSubmitting(false)
  }

  return (
    <div>
      <Header title="Q&A" subtitle="Submit questions for speakers" />
      <div className="max-w-4xl mx-auto px-4 py-5 space-y-5">

        {/* Submit form */}
        {contactId ? (
          <Card className="p-5">
            <h2 className="font-bold text-white mb-4">Submit a Question</h2>
            {submitted && (
              <div className="mb-4 p-3 bg-green-500/15 border border-green-500/25 rounded-xl text-sm text-green-400">
                Question submitted!
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-3">
              <Select
                label="Session" required id="session_id" value={form.session_id}
                onChange={e => setForm(f => ({ ...f, session_id: e.target.value }))}
              >
                <option value="">Select a session…</option>
                {sessions.map(s => (
                  <option key={s.id} value={s.id}>{s.session_title}</option>
                ))}
              </Select>
              <Select
                label="Topic (optional)" id="topic" value={form.topic}
                onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
              >
                <option value="">General question</option>
                {QUESTION_TOPICS.map(t => (
                  <option key={t.key} value={t.key}>{t.label}</option>
                ))}
              </Select>
              <Textarea
                label="Your question" required id="question_text" rows={3}
                value={form.question_text}
                onChange={e => setForm(f => ({ ...f, question_text: e.target.value }))}
                placeholder="What would you like to ask?"
              />
              <Button type="submit" loading={submitting} disabled={!form.session_id || !form.question_text}>
                Submit Question
              </Button>
            </form>
          </Card>
        ) : (
          <Card className="p-5 text-center">
            <p className="text-white/50 mb-3">Register to submit questions</p>
            <Link href="/contact"><Button>Register now</Button></Link>
          </Card>
        )}

        {/* Topic filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => { setTopicFilter(''); fetchQuestions() }}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border ${!topicFilter ? 'bg-[#0070D2] text-white border-[#0070D2]' : 'bg-white/[0.06] text-white/60 border-white/10 hover:border-white/20'}`}
          >
            All
          </button>
          {QUESTION_TOPICS.map(t => (
            <button
              key={t.key}
              onClick={() => { setTopicFilter(t.key); fetchQuestions(t.key) }}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border ${topicFilter === t.key ? 'bg-[#0070D2] text-white border-[#0070D2]' : 'bg-white/[0.06] text-white/60 border-white/10 hover:border-white/20'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Questions list */}
        {loading ? <LoadingSpinner /> : (
          <div className="space-y-3">
            {questions.map(q => (
              <Card key={q.id} className="p-4">
                <p className="text-sm text-white font-medium leading-snug">{q.question_text}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {q.topic && (
                    <Badge variant="purple">{QUESTION_TOPICS.find(t => t.key === q.topic)?.label ?? q.topic}</Badge>
                  )}
                  <span className="text-xs text-white/30">{q.session_title}</span>
                  <span className="text-xs text-white/30">· {q.contact_name}</span>
                </div>
              </Card>
            ))}
            {questions.length === 0 && (
              <p className="text-center text-white/30 py-8">No questions yet. Be the first to ask!</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

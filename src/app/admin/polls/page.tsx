'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Poll, PollOption } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

type PollWithVotes = Poll & { options: (PollOption & { vote_count: number })[] }

function PollForm({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    const validOpts = options.filter(o => o.trim())
    if (!question.trim()) { setError('Question is required'); return }
    if (validOpts.length < 2) { setError('At least 2 options required'); return }
    setSaving(true)
    setError('')
    const res = await fetch('/api/admin/polls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, options: validOpts }),
    })
    setSaving(false)
    if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Failed'); return }
    onSave()
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}
      <Input label="Poll Question *" value={question} onChange={e => setQuestion(e.target.value)} placeholder="What is your biggest deal blocker?" />
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Options</p>
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={i} className="flex gap-2">
              <Input value={opt} onChange={e => setOptions(prev => prev.map((o, j) => j === i ? e.target.value : o))} placeholder={`Option ${i + 1}`} />
              {options.length > 2 && <button onClick={() => setOptions(p => p.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-700 px-2">✕</button>}
            </div>
          ))}
        </div>
        <button onClick={() => setOptions(p => [...p, ''])} className="text-sm text-[#0070D2] hover:underline mt-2">+ Add option</button>
      </div>
      <div className="flex gap-2 pt-2">
        <Button variant="primary" onClick={handleSave} loading={saving}>Create Poll</Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  )
}

export default function AdminPollsPage() {
  const [polls, setPolls] = useState<PollWithVotes[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    const data = await fetch('/api/admin/polls').then(r => r.json())
    setPolls(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toggleActive = async (poll: PollWithVotes) => {
    await fetch(`/api/admin/polls/${poll.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !poll.is_active }),
    })
    load()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    await fetch(`/api/admin/polls/${deleteId}`, { method: 'DELETE' })
    setDeleteId(null)
    setDeleting(false)
    load()
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Polls</h1>
          <p className="text-sm text-gray-500 mt-1">{polls.length} polls · {polls.filter(p => p.is_active).length} active</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>New Poll</Button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          {polls.map(poll => {
            const totalVotes = poll.options.reduce((s, o) => s + (o.vote_count ?? 0), 0)
            return (
              <div key={poll.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant={poll.is_active ? 'green' : 'gray'}>{poll.is_active ? 'Active' : 'Closed'}</Badge>
                      <p className="font-semibold text-gray-900">{poll.question}</p>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{totalVotes} votes</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Link href={`/admin/polls/${poll.id}`}><Button variant="outline" size="sm">View</Button></Link>
                    <Button variant="secondary" size="sm" onClick={() => toggleActive(poll)}>{poll.is_active ? 'Close' : 'Open'}</Button>
                    <Button variant="danger" size="sm" onClick={() => setDeleteId(poll.id)}>Delete</Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {poll.options.map(opt => {
                    const pct = totalVotes > 0 ? Math.round(((opt.vote_count ?? 0) / totalVotes) * 100) : 0
                    return (
                      <div key={opt.id} className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 w-32 truncate">{opt.label}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div className="h-full bg-[#0070D2] rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 w-12 text-right">{opt.vote_count} ({pct}%)</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Poll">
        <PollForm onSave={() => { setShowCreate(false); load() }} onCancel={() => setShowCreate(false)} />
      </Modal>

      <Modal open={deleteId !== null} onClose={() => setDeleteId(null)} title="Delete Poll">
        <p className="text-gray-600 mb-4">This will permanently delete the poll and all votes.</p>
        <div className="flex gap-2">
          <Button variant="danger" onClick={handleDelete} loading={deleting}>Delete</Button>
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
        </div>
      </Modal>
    </div>
  )
}

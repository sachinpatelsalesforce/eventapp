'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Poll, PollOption } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

type PollWithVotes = Poll & { options: (PollOption & { vote_count: number })[] }

export default function AdminPollDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [poll, setPoll] = useState<PollWithVotes | null>(null)
  const [loading, setLoading] = useState(true)
  const [newOption, setNewOption] = useState('')
  const [addingOption, setAddingOption] = useState(false)

  const load = async () => {
    const data = await fetch(`/api/admin/polls`).then(r => r.json())
    const found = (data as PollWithVotes[]).find(p => String(p.id) === String(id))
    setPoll(found ?? null)
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  const addOption = async () => {
    if (!newOption.trim() || !poll) return
    setAddingOption(true)
    await fetch(`/api/admin/polls/${poll.id}/options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: newOption }),
    })
    setNewOption('')
    setAddingOption(false)
    load()
  }

  const deleteOption = async (oid: number) => {
    if (!poll) return
    await fetch(`/api/admin/polls/${poll.id}/options/${oid}`, { method: 'DELETE' })
    load()
  }

  if (loading) return <div className="p-6"><LoadingSpinner /></div>
  if (!poll) return <div className="p-6"><p className="text-gray-500">Poll not found.</p></div>

  const totalVotes = poll.options.reduce((s, o) => s + (o.vote_count ?? 0), 0)

  return (
    <div className="p-6 max-w-2xl">
      <button onClick={() => router.back()} className="text-sm text-[#0070D2] hover:underline mb-4 block">← Back to Polls</button>
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{poll.question}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={poll.is_active ? 'green' : 'gray'}>{poll.is_active ? 'Active' : 'Closed'}</Badge>
            <span className="text-sm text-gray-500">{totalVotes} total votes</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Options & Votes</h2>
        <div className="space-y-3">
          {poll.options.map(opt => {
            const pct = totalVotes > 0 ? Math.round(((opt.vote_count ?? 0) / totalVotes) * 100) : 0
            return (
              <div key={opt.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                    <span className="text-sm text-gray-500">{opt.vote_count} votes ({pct}%)</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div className="h-full bg-[#0070D2] rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <button onClick={() => deleteOption(opt.id)} className="text-red-400 hover:text-red-600 text-xs flex-shrink-0">Remove</button>
              </div>
            )
          })}
        </div>
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          <Input value={newOption} onChange={e => setNewOption(e.target.value)} placeholder="New option label" onKeyDown={e => e.key === 'Enter' && addOption()} />
          <Button variant="primary" size="sm" onClick={addOption} loading={addingOption}>Add</Button>
        </div>
      </div>
    </div>
  )
}

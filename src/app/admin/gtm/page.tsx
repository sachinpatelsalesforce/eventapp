'use client'

import { useState, useEffect } from 'react'
import { GtmIdea } from '@/types'
import { GTM_CATEGORIES } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { DataTable } from '@/components/admin/DataTable'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

type IdeaRow = GtmIdea & { contact_name: string; vote_count: number }

export default function AdminGtmPage() {
  const [ideas, setIdeas] = useState<IdeaRow[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('')

  const load = async (cat?: string) => {
    const url = cat ? `/api/gtm/ideas?category=${cat}` : '/api/gtm/ideas'
    const data = await fetch(url).then(r => r.json())
    setIdeas(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toggle = async (idea: IdeaRow) => {
    await fetch(`/api/admin/gtm/ideas/${idea.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_approved: !idea.is_approved }),
    })
    load(categoryFilter || undefined)
  }

  const del = async (id: number) => {
    if (!confirm('Delete this idea?')) return
    await fetch(`/api/admin/gtm/ideas/${id}`, { method: 'DELETE' })
    load(categoryFilter || undefined)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">GTM Idea Wall</h1>
          <p className="text-sm text-gray-500 mt-1">{ideas.length} ideas · {ideas.filter(i => i.is_approved).length} approved</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto mb-4">
        <button onClick={() => { setCategoryFilter(''); load() }} className={`flex-shrink-0 px-3 py-1 rounded-full text-xs border ${!categoryFilter ? 'bg-[#0070D2] text-white border-[#0070D2]' : 'bg-white text-gray-600 border-gray-200'}`}>All</button>
        {GTM_CATEGORIES.map(c => (
          <button key={c.key} onClick={() => { setCategoryFilter(c.key); load(c.key) }} className={`flex-shrink-0 px-3 py-1 rounded-full text-xs border ${categoryFilter === c.key ? 'bg-[#0070D2] text-white border-[#0070D2]' : 'bg-white text-gray-600 border-gray-200'}`}>{c.label}</button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <DataTable
          rows={ideas}
          columns={[
            { key: 'title', label: 'Title', render: (r) => <span className="font-medium">{r.title as string}</span> },
            { key: 'category', label: 'Category', render: (r) => <Badge variant="purple">{GTM_CATEGORIES.find(c => c.key === r.category)?.label ?? String(r.category)}</Badge> },
            { key: 'description', label: 'Description', render: (r) => <span className="line-clamp-1 max-w-xs text-sm text-gray-600">{r.description as string}</span> },
            { key: 'contact_name', label: 'Submitted By' },
            { key: 'vote_count', label: 'Votes', render: (r) => <span className="font-semibold">{String(r.vote_count)}</span> },
            { key: 'is_approved', label: 'Status', render: (r) => <Badge variant={r.is_approved ? 'green' : 'gray'}>{r.is_approved ? 'Approved' : 'Hidden'}</Badge> },
          ]}
          actions={(r) => (
            <div className="flex gap-2">
              <button onClick={() => toggle(r as IdeaRow)} className={`text-xs ${(r as IdeaRow).is_approved ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}`}>
                {(r as IdeaRow).is_approved ? 'Hide' : 'Approve'}
              </button>
              <button onClick={() => del(r.id as number)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
            </div>
          )}
        />
      )}
    </div>
  )
}

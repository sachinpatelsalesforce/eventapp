'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GtmIdea, GtmPlayTemplate } from '@/types'
import { GTM_CATEGORIES } from '@/lib/constants'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useContactId } from '@/hooks/useContactId'

export default function GtmPage() {
  const contactId = useContactId()
  const [ideas, setIdeas] = useState<GtmIdea[]>([])
  const [templates, setTemplates] = useState<GtmPlayTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', category: '', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const [tab, setTab] = useState<'template' | 'custom'>('template')

  const fetchIdeas = async (cat?: string) => {
    const url = cat ? `/api/gtm/ideas?contact_id=${contactId ?? 0}&category=${cat}` : `/api/gtm/ideas?contact_id=${contactId ?? 0}`
    const data = await fetch(url).then(r => r.json())
    setIdeas(data)
  }

  useEffect(() => {
    Promise.all([fetchIdeas(), fetch('/api/gtm/ideas/templates').then(r => r.json())])
      .then(([_, tmpl]) => { setTemplates(tmpl); setLoading(false) })
  }, [contactId])

  const vote = async (id: number) => {
    if (!contactId) return
    const res = await fetch(`/api/gtm/ideas/${id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact_id: contactId }),
    })
    const data = await res.json()
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, vote_count: data.vote_count, user_voted: data.voted } : i))
  }

  const submitIdea = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactId) return
    setSubmitting(true)
    await fetch('/api/gtm/ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, contact_id: contactId }),
    })
    setShowModal(false)
    setForm({ title: '', category: '', description: '' })
    await fetchIdeas(categoryFilter || undefined)
    setSubmitting(false)
  }

  const categoryMeta = (key: string) => GTM_CATEGORIES.find(c => c.key === key)

  return (
    <div>
      <Header
        title="GTM Idea Wall"
        subtitle="Submit and vote on GTM plays"
        action={
          contactId ? (
            <Button size="sm" onClick={() => setShowModal(true)}>+ Submit Idea</Button>
          ) : undefined
        }
      />

      <div className="max-w-4xl mx-auto px-4 py-5">
        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          <button
            onClick={() => { setCategoryFilter(''); fetchIdeas() }}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border ${!categoryFilter ? 'bg-[#0070D2] text-white border-[#0070D2]' : 'bg-white text-gray-600 border-gray-200'}`}
          >
            All
          </button>
          {GTM_CATEGORIES.map(c => (
            <button
              key={c.key}
              onClick={() => { setCategoryFilter(c.key); fetchIdeas(c.key) }}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border ${categoryFilter === c.key ? 'bg-[#0070D2] text-white border-[#0070D2]' : 'bg-white text-gray-600 border-gray-200'}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {!contactId && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-[#0070D2]">
            <Link href="/contact" className="font-semibold hover:underline">Register</Link> to vote and submit ideas.
          </div>
        )}

        {loading ? <LoadingSpinner /> : (
          <div className="space-y-3">
            {ideas.map(idea => (
              <Card key={idea.id} className="p-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => vote(idea.id)}
                    disabled={!contactId}
                    className={`flex-shrink-0 flex flex-col items-center justify-center w-12 h-14 rounded-xl border-2 transition-all ${
                      idea.user_voted
                        ? 'border-[#0070D2] bg-blue-50 text-[#0070D2]'
                        : 'border-gray-200 text-gray-400 hover:border-gray-300'
                    } ${!contactId ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <svg className="w-4 h-4" fill={idea.user_voted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                    </svg>
                    <span className="text-xs font-bold mt-0.5">{idea.vote_count}</span>
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {categoryMeta(idea.category) && (
                        <Badge variant="blue">{categoryMeta(idea.category)!.label}</Badge>
                      )}
                      <span className="text-xs text-gray-400">{idea.submitter_name}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm">{idea.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{idea.description}</p>
                  </div>
                </div>
              </Card>
            ))}
            {ideas.length === 0 && (
              <p className="text-center text-gray-400 py-8">No ideas yet — be the first!</p>
            )}
          </div>
        )}
      </div>

      {/* Submit modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Submit a GTM Idea" size="lg">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTab('template')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'template' ? 'bg-[#0070D2] text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            Use a Template
          </button>
          <button
            onClick={() => setTab('custom')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'custom' ? 'bg-[#0070D2] text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            Custom Idea
          </button>
        </div>

        {tab === 'template' && (
          <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
            {templates.map(t => (
              <button
                key={t.id}
                onClick={() => { setForm({ title: t.title, category: t.category, description: t.description }); setTab('custom') }}
                className="w-full text-left p-3 rounded-lg border border-gray-100 hover:border-[#0070D2] hover:bg-blue-50 transition-colors"
              >
                <p className="text-sm font-medium text-gray-900">{t.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{t.description}</p>
              </button>
            ))}
          </div>
        )}

        {tab === 'custom' && (
          <form onSubmit={submitIdea} className="space-y-4">
            <Input
              label="Title" required id="idea_title" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Compelling one-liner for your idea"
            />
            <Select
              label="Category" required id="idea_cat" value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            >
              <option value="">Select category…</option>
              {GTM_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </Select>
            <Textarea
              label="Description" required id="idea_desc" rows={4} value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What's the play? How does it work?"
            />
            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
              <Button type="submit" loading={submitting} className="flex-1">Submit Idea</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

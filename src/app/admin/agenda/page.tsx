'use client'

import { useState, useEffect } from 'react'
import { AgendaItem, Speaker } from '@/types'
import { PARTNER_TYPES } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatTimeRange } from '@/lib/utils'

type AgendaItemWithTags = AgendaItem & { partner_types: string[] }

function AgendaForm({ item, speakers, onSave, onCancel }: {
  item?: AgendaItemWithTags | null
  speakers: Speaker[]
  onSave: () => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    session_title: item?.session_title ?? '',
    start_time: item?.start_time ? new Date(item.start_time).toISOString().slice(0, 16) : '',
    end_time: item?.end_time ? new Date(item.end_time).toISOString().slice(0, 16) : '',
    speaker_id: item?.speaker_id ?? '',
    room: item?.room ?? '',
    description: item?.description ?? '',
    sort_order: item?.sort_order ?? 0,
    resource_url: item?.resource_url ?? '',
  })
  const [selectedTags, setSelectedTags] = useState<string[]>(item?.partner_types ?? [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const toggle = (key: string) => setSelectedTags(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])

  const handleSave = async () => {
    if (!form.session_title.trim() || !form.start_time || !form.end_time) { setError('Title, start and end time are required'); return }
    setSaving(true)
    setError('')
    try {
      const body = { ...form, speaker_id: form.speaker_id || null, partner_types: selectedTags }
      const res = item
        ? await fetch(`/api/agenda/${item.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        : await fetch('/api/agenda', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Failed to save'); return }
      onSave()
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}
      <Input label="Session Title *" value={form.session_title} onChange={e => setForm(p => ({ ...p, session_title: e.target.value }))} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Start Time *" type="datetime-local" value={form.start_time} onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))} />
        <Input label="End Time *" type="datetime-local" value={form.end_time} onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select label="Speaker" value={String(form.speaker_id)} onChange={e => setForm(p => ({ ...p, speaker_id: e.target.value }))}>
          <option value="">No speaker</option>
          {speakers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
        <Input label="Room" value={form.room} onChange={e => setForm(p => ({ ...p, room: e.target.value }))} placeholder="e.g. Main Stage" />
      </div>
      <Textarea label="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} />
      <Input label="Resource URL" value={form.resource_url} onChange={e => setForm(p => ({ ...p, resource_url: e.target.value }))} placeholder="https://..." />
      <Input label="Sort Order" type="number" value={String(form.sort_order)} onChange={e => setForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} />
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Partner Type Tags</p>
        <div className="flex flex-wrap gap-2">
          {PARTNER_TYPES.map(t => (
            <button key={t.key} type="button" onClick={() => toggle(t.key)}
              className={`px-2 py-1 rounded text-xs border transition-colors ${selectedTags.includes(t.key) ? 'bg-[#0070D2] text-white border-[#0070D2]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#0070D2]'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button variant="primary" onClick={handleSave} loading={saving}>{item ? 'Save Changes' : 'Create Session'}</Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  )
}

export default function AdminAgendaPage() {
  const [items, setItems] = useState<AgendaItemWithTags[]>([])
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [loading, setLoading] = useState(true)
  const [editItem, setEditItem] = useState<AgendaItemWithTags | null | undefined>(undefined)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    const [a, s] = await Promise.all([fetch('/api/agenda').then(r => r.json()), fetch('/api/speakers').then(r => r.json())])
    setItems(a)
    setSpeakers(s)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    await fetch(`/api/agenda/${deleteId}`, { method: 'DELETE' })
    setDeleteId(null)
    setDeleting(false)
    load()
  }

  const isFormOpen = editItem !== undefined

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-sm text-gray-500 mt-1">{items.length} sessions</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setEditItem(null)}>Add Session</Button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{item.session_title}</h3>
                    {item.resource_url && <Badge variant="green">Has Resource</Badge>}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {formatTimeRange(item.start_time, item.end_time)}
                    {item.room && ` · ${item.room}`}
                    {item.speaker_name && ` · ${item.speaker_name}`}
                  </p>
                  {item.description && <p className="text-sm text-gray-600 mt-1 line-clamp-1">{item.description}</p>}
                  {item.partner_types?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.partner_types.map(pt => {
                        const found = PARTNER_TYPES.find(p => p.key === pt)
                        return found ? <Badge key={pt} variant="blue" className="text-[10px]">{found.label}</Badge> : null
                      })}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => setEditItem(item)}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => setDeleteId(item.id)}>Delete</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={isFormOpen} onClose={() => setEditItem(undefined)} title={editItem ? 'Edit Session' : 'New Session'}>
        <AgendaForm item={editItem} speakers={speakers} onSave={() => { setEditItem(undefined); load() }} onCancel={() => setEditItem(undefined)} />
      </Modal>

      <Modal open={deleteId !== null} onClose={() => setDeleteId(null)} title="Delete Session">
        <p className="text-gray-600 mb-4">This will permanently delete the session and all associated data.</p>
        <div className="flex gap-2">
          <Button variant="danger" onClick={handleDelete} loading={deleting}>Delete</Button>
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
        </div>
      </Modal>
    </div>
  )
}

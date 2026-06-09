'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Speaker } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

function SpeakerForm({ speaker, onSave, onCancel }: { speaker?: Speaker | null; onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: speaker?.name ?? '',
    job_title: speaker?.job_title ?? '',
    company: speaker?.company ?? '',
    bio: speaker?.bio ?? '',
    photo_url: speaker?.photo_url ?? '',
    linkedin_url: speaker?.linkedin_url ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError('')
    try {
      const res = speaker
        ? await fetch(`/api/speakers/${speaker.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        : await fetch('/api/speakers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Failed to save'); return }
      onSave()
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}
      <Input label="Name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Job Title" value={form.job_title} onChange={e => setForm(p => ({ ...p, job_title: e.target.value }))} />
        <Input label="Company" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} />
      </div>
      <Textarea label="Bio" value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={3} />
      <Input label="Photo URL" value={form.photo_url} onChange={e => setForm(p => ({ ...p, photo_url: e.target.value }))} placeholder="https://..." />
      <Input label="LinkedIn URL" value={form.linkedin_url} onChange={e => setForm(p => ({ ...p, linkedin_url: e.target.value }))} placeholder="https://linkedin.com/in/..." />
      <div className="flex gap-2 pt-2">
        <Button variant="primary" onClick={handleSave} loading={saving}>{speaker ? 'Save Changes' : 'Add Speaker'}</Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  )
}

export default function AdminSpeakersPage() {
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [loading, setLoading] = useState(true)
  const [editSpeaker, setEditSpeaker] = useState<Speaker | null | undefined>(undefined)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    const data = await fetch('/api/speakers').then(r => r.json())
    setSpeakers(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    await fetch(`/api/speakers/${deleteId}`, { method: 'DELETE' })
    setDeleteId(null)
    setDeleting(false)
    load()
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Speakers</h1>
          <p className="text-sm text-gray-500 mt-1">{speakers.length} speakers</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setEditSpeaker(null)}>Add Speaker</Button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {speakers.map(s => (
            <div key={s.id} className="bg-white border border-gray-200 rounded-lg p-4 flex gap-3">
              <div className="flex-shrink-0">
                <Image
                  src={s.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&size=64&background=0070D2&color=fff`}
                  alt={s.name} width={48} height={48} className="rounded-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{s.name}</p>
                <p className="text-sm text-gray-500">{[s.job_title, s.company].filter(Boolean).join(' · ')}</p>
                {s.bio && <p className="text-xs text-gray-400 mt-1 line-clamp-1">{s.bio}</p>}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button variant="ghost" size="sm" onClick={() => setEditSpeaker(s)}>Edit</Button>
                <Button variant="danger" size="sm" onClick={() => setDeleteId(s.id)}>Del</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={editSpeaker !== undefined} onClose={() => setEditSpeaker(undefined)} title={editSpeaker ? 'Edit Speaker' : 'New Speaker'}>
        <SpeakerForm speaker={editSpeaker} onSave={() => { setEditSpeaker(undefined); load() }} onCancel={() => setEditSpeaker(undefined)} />
      </Modal>

      <Modal open={deleteId !== null} onClose={() => setDeleteId(null)} title="Delete Speaker">
        <p className="text-gray-600 mb-4">This will permanently delete the speaker and remove them from any sessions.</p>
        <div className="flex gap-2">
          <Button variant="danger" onClick={handleDelete} loading={deleting}>Delete</Button>
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
        </div>
      </Modal>
    </div>
  )
}

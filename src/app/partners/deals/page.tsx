'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Deal } from '@/types'
import { DEAL_STATUSES } from '@/lib/constants'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useContactId } from '@/hooks/useContactId'

const statusVariants: Record<string, 'green' | 'orange' | 'blue' | 'red'> = {
  active: 'green', stalled: 'orange', won: 'blue', lost: 'red'
}

const emptyForm = { target_account: '', opportunity_description: '', blockers: '', sf_support_needed: '', next_steps: '', status: 'active' }

export default function DealsPage() {
  const contactId = useContactId()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Deal | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchDeals = async () => {
    if (!contactId) return
    const data = await fetch(`/api/partners/deals?contact_id=${contactId}`).then(r => r.json())
    setDeals(data)
    setLoading(false)
  }

  useEffect(() => { fetchDeals() }, [contactId])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (deal: Deal) => {
    setEditing(deal)
    setForm({
      target_account: deal.target_account, opportunity_description: deal.opportunity_description,
      blockers: deal.blockers ?? '', sf_support_needed: deal.sf_support_needed ?? '',
      next_steps: deal.next_steps ?? '', status: deal.status,
    })
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, contact_id: contactId }
    if (editing) {
      await fetch(`/api/partners/deals/${editing.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
    } else {
      await fetch('/api/partners/deals', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
    }
    setShowModal(false)
    await fetchDeals()
    setSaving(false)
  }

  const handleDelete = async (deal: Deal) => {
    if (!confirm(`Delete deal: ${deal.target_account}?`)) return
    await fetch(`/api/partners/deals/${deal.id}`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contact_id: contactId }),
    })
    await fetchDeals()
  }

  if (!contactId) {
    return (
      <div>
        <Header title="Deal Board" back={{ href: '/partners', label: 'Partner Hub' }} />
        <div className="max-w-md mx-auto px-4 py-12 text-center">
          <p className="text-white/50 mb-4">Register to access your deal board.</p>
          <Link href="/contact"><Button>Register</Button></Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header
        title="Deal Board"
        subtitle="Your private deal tracker"
        back={{ href: '/partners', label: 'Partner Hub' }}
        action={<Button size="sm" onClick={openCreate}>+ Add Deal</Button>}
      />
      <div className="max-w-4xl mx-auto px-4 py-5">
        {loading ? <LoadingSpinner /> : (
          <div className="space-y-3">
            {deals.map(deal => (
              <Card key={deal.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={statusVariants[deal.status] ?? 'gray'}>
                        {DEAL_STATUSES.find(s => s.key === deal.status)?.label ?? deal.status}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-white">{deal.target_account}</h3>
                    <p className="text-sm text-white/60 mt-1 line-clamp-2">{deal.opportunity_description}</p>
                    {deal.blockers && <p className="text-xs text-red-400 mt-1">⚠ {deal.blockers}</p>}
                    {deal.next_steps && <p className="text-xs text-white/40 mt-1">→ {deal.next_steps}</p>}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => openEdit(deal)} className="p-1.5 text-white/30 hover:text-white/70 rounded-lg hover:bg-white/10">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(deal)} className="p-1.5 text-white/30 hover:text-red-400 rounded-lg hover:bg-red-500/10">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </Card>
            ))}
            {deals.length === 0 && (
              <div className="text-center py-12">
                <p className="text-white/30 mb-4">No deals logged yet.</p>
                <Button onClick={openCreate}>Add your first deal</Button>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Deal' : 'New Deal'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Target account" required id="account" value={form.target_account}
            onChange={e => setForm(f => ({ ...f, target_account: e.target.value }))} />
          <Textarea label="Opportunity description" required id="opp" rows={3} value={form.opportunity_description}
            onChange={e => setForm(f => ({ ...f, opportunity_description: e.target.value }))} />
          <Select label="Status" id="status" value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            {DEAL_STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </Select>
          <Textarea label="Blockers (optional)" id="blockers" rows={2} value={form.blockers}
            onChange={e => setForm(f => ({ ...f, blockers: e.target.value }))} />
          <Textarea label="Salesforce support needed (optional)" id="sf_support" rows={2} value={form.sf_support_needed}
            onChange={e => setForm(f => ({ ...f, sf_support_needed: e.target.value }))} />
          <Textarea label="Next steps (optional)" id="next_steps" rows={2} value={form.next_steps}
            onChange={e => setForm(f => ({ ...f, next_steps: e.target.value }))} />
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={saving} className="flex-1">Save Deal</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

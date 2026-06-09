'use client'

import { useState, useEffect } from 'react'
import { PassportStamp } from '@/types'
import { STAMP_LABELS, STAMP_ICONS, SELF_SERVICE_STAMPS } from '@/lib/passport-constants'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { DataTable } from '@/components/admin/DataTable'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Modal } from '@/components/ui/Modal'

type StampRow = PassportStamp & { contact_name: string; contact_email: string; si_name?: string }

export default function AdminPassportPage() {
  const [stamps, setStamps] = useState<StampRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showAward, setShowAward] = useState(false)
  const [awardForm, setAwardForm] = useState({ contact_id: '', stamp_type: '' })
  const [awarding, setAwarding] = useState(false)
  const [awardError, setAwardError] = useState('')

  const load = async () => {
    const data = await fetch('/api/admin/passport').then(r => r.json())
    setStamps(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleRevoke = async (id: number) => {
    await fetch(`/api/admin/passport/stamp/${id}`, { method: 'DELETE' })
    load()
  }

  const handleAward = async () => {
    if (!awardForm.contact_id || !awardForm.stamp_type) { setAwardError('All fields required'); return }
    setAwarding(true)
    setAwardError('')
    const res = await fetch('/api/admin/passport/stamp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact_id: parseInt(awardForm.contact_id), stamp_type: awardForm.stamp_type }),
    })
    setAwarding(false)
    if (!res.ok) { const d = await res.json(); setAwardError(d.error ?? 'Failed'); return }
    setShowAward(false)
    setAwardForm({ contact_id: '', stamp_type: '' })
    load()
  }

  const stampTypes = [...SELF_SERVICE_STAMPS, 'feedback_form'] as string[]

  const byContact = stamps.reduce<Record<string, StampRow[]>>((acc, s) => {
    const key = String(s.contact_id)
    if (!acc[key]) acc[key] = []
    acc[key].push(s)
    return acc
  }, {})

  const leaderboard = Object.entries(byContact)
    .map(([, rows]) => ({ name: rows[0].contact_name, si: rows[0].si_name, count: rows.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enablement Passport</h1>
          <p className="text-sm text-gray-500 mt-1">{stamps.length} stamps awarded · {Object.keys(byContact).length} participants</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowAward(true)}>Award Stamp</Button>
      </div>

      <div className="grid grid-cols-5 gap-3 mb-6">
        {stampTypes.map(st => {
          const count = stamps.filter(s => s.stamp_type === st).length
          return (
            <div key={st} className="bg-white border border-gray-200 rounded-lg p-3 text-center">
              <p className="text-2xl">{STAMP_ICONS[st as keyof typeof STAMP_ICONS]}</p>
              <p className="text-lg font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{STAMP_LABELS[st as keyof typeof STAMP_LABELS]}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          {loading ? <LoadingSpinner /> : (
            <DataTable
              rows={stamps}
              columns={[
                { key: 'stamp_type', label: 'Stamp', render: (r) => <span>{STAMP_ICONS[r.stamp_type as keyof typeof STAMP_ICONS]} {STAMP_LABELS[r.stamp_type as keyof typeof STAMP_LABELS]}</span> },
                { key: 'contact_name', label: 'Contact' },
                { key: 'si_name', label: 'SI', render: (r) => String(r.si_name ?? '-') },
                { key: 'awarded_by', label: 'By', render: (r) => <Badge variant={r.awarded_by === 'admin' ? 'orange' : r.awarded_by === 'system' ? 'green' : 'gray'}>{String(r.awarded_by)}</Badge> },
                { key: 'stamped_at', label: 'Awarded', render: (r) => new Date(r.stamped_at as string).toLocaleString() },
              ]}
              actions={(r) => <button onClick={() => handleRevoke(r.id as number)} className="text-red-500 hover:text-red-700 text-xs">Revoke</button>}
            />
          )}
        </div>
        <div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="font-semibold text-gray-900 mb-3">Leaderboard</h2>
            <div className="space-y-2">
              {leaderboard.map((entry, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-400 w-5">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{entry.name}</p>
                      {entry.si && <p className="text-xs text-gray-500">{entry.si}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {'⭐'.repeat(entry.count)}
                    <span className="text-xs text-gray-500 ml-1">({entry.count}/5)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal open={showAward} onClose={() => setShowAward(false)} title="Award Stamp">
        <div className="space-y-4">
          {awardError && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{awardError}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact ID</label>
            <input value={awardForm.contact_id} onChange={e => setAwardForm(p => ({ ...p, contact_id: e.target.value }))}
              placeholder="Enter contact ID" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <Select label="Stamp Type" value={awardForm.stamp_type} onChange={e => setAwardForm(p => ({ ...p, stamp_type: e.target.value }))}>
            <option value="">Select stamp…</option>
            {stampTypes.map(st => <option key={st} value={st}>{STAMP_ICONS[st as keyof typeof STAMP_ICONS]} {STAMP_LABELS[st as keyof typeof STAMP_LABELS]}</option>)}
          </Select>
          <div className="flex gap-2 pt-2">
            <Button variant="primary" onClick={handleAward} loading={awarding}>Award</Button>
            <Button variant="ghost" onClick={() => setShowAward(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

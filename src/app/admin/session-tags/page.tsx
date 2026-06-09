'use client'

import { useState, useEffect } from 'react'
import { AgendaItem } from '@/types'
import { PARTNER_TYPES } from '@/lib/constants'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

type AgendaItemWithTags = AgendaItem & { partner_types: string[] }

export default function AdminSessionTagsPage() {
  const [items, setItems] = useState<AgendaItemWithTags[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  const load = async () => {
    const data = await fetch('/api/agenda').then(r => r.json())
    setItems(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toggleTag = async (agendaItemId: number, partnerType: string, currentTags: string[]) => {
    const key = `${agendaItemId}-${partnerType}`
    setSaving(p => ({ ...p, [key]: true }))

    if (currentTags.includes(partnerType)) {
      const item = items.find(i => i.id === agendaItemId)
      const tagId = (item as AgendaItemWithTags & { tag_ids?: number[] })?.tag_ids?.[currentTags.indexOf(partnerType)]
      if (tagId) {
        await fetch(`/api/admin/session-tags/${tagId}`, { method: 'DELETE' })
      }
    } else {
      await fetch('/api/admin/session-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agenda_item_id: agendaItemId, partner_type: partnerType }),
      })
    }

    setSaving(p => ({ ...p, [key]: false }))
    load()
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Session Partner Tags</h1>
        <p className="text-sm text-gray-500 mt-1">Tag sessions to show up when partners filter by their type on the agenda.</p>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="mb-3">
                <h3 className="font-semibold text-gray-900">{item.session_title}</h3>
                <p className="text-sm text-gray-500">{new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{item.room ? ` · ${item.room}` : ''}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {PARTNER_TYPES.map(pt => {
                  const active = item.partner_types?.includes(pt.key)
                  const key = `${item.id}-${pt.key}`
                  return (
                    <button
                      key={pt.key}
                      disabled={saving[key]}
                      onClick={() => toggleTag(item.id, pt.key, item.partner_types ?? [])}
                      className={`px-2 py-1 rounded text-xs border transition-all disabled:opacity-50 ${active ? 'bg-[#0070D2] text-white border-[#0070D2]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#0070D2] hover:text-[#0070D2]'}`}
                    >
                      {saving[key] ? '…' : pt.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

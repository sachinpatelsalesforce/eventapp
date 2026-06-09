'use client'

import { useState, useEffect } from 'react'
import { FEATURE_FLAGS } from '@/lib/constants'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

const FLAG_DESCRIPTIONS: Record<string, string> = {
  agenda: 'Agenda page — session schedule and interests',
  speakers: 'Speakers directory',
  questions: 'Q&A submission page',
  feedback: 'Feedback form (also awards passport stamps)',
  partners: 'Partners hub and all partner sub-pages',
  polls: 'Live Partner Pulse polls',
  gtm: 'Joint GTM Idea Wall',
  concierge: 'AI Event Concierge chat',
  passport: 'Enablement Passport',
  deals: 'Deal Collaboration Board',
  action_plan: 'Post-Event Action Plan',
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(data => { setSettings(data); setLoading(false) })
  }, [])

  const toggle = async (key: string) => {
    const newVal = !settings[key]
    setSettings(p => ({ ...p, [key]: newVal }))
    setSaving(p => ({ ...p, [key]: true }))
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: newVal }),
    })
    setSaving(p => ({ ...p, [key]: false }))
    setSaved(p => ({ ...p, [key]: true }))
    setTimeout(() => setSaved(p => ({ ...p, [key]: false })), 1500)
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Feature Flags</h1>
        <p className="text-sm text-gray-500 mt-1">Toggle sections on and off for attendees. Changes take effect immediately.</p>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
          {FEATURE_FLAGS.map(flag => {
            const enabled = settings[flag] ?? true
            return (
              <div key={flag} className="flex items-center justify-between px-4 py-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 capitalize">{flag.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-gray-500">{FLAG_DESCRIPTIONS[flag] ?? ''}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {saved[flag] && <span className="text-xs text-green-600">Saved</span>}
                  <button
                    disabled={saving[flag]}
                    onClick={() => toggle(flag)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-[#0070D2]' : 'bg-gray-200'} ${saving[flag] ? 'opacity-50' : ''}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

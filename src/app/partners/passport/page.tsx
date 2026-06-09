'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PassportStamp } from '@/types'
import { STAMP_LABELS, STAMP_ICONS, SELF_SERVICE_STAMPS, StampType } from '@/lib/passport-constants'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useContactId } from '@/hooks/useContactId'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

const ALL_STAMPS: StampType[] = ['roadmap_session', 'demo_booth', 'agentforce_session', 'isv_sponsor_booth', 'feedback_form']

export default function PassportPage() {
  const contactId = useContactId()
  const [stamps, setStamps] = useState<PassportStamp[]>([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  const fetchStamps = async () => {
    if (!contactId) return
    const data = await fetch(`/api/partners/passport?contact_id=${contactId}`).then(r => r.json())
    setStamps(data)
    setLoading(false)
  }

  useEffect(() => { fetchStamps() }, [contactId])

  const checkIn = async (stampType: StampType) => {
    if (!contactId) return
    setChecking(stampType)
    const res = await fetch('/api/partners/passport/stamp', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact_id: contactId, stamp_type: stampType }),
    })
    const data = await res.json()
    if (data.already_stamped) setMsg('Already checked in!')
    else { setMsg('Stamp earned! 🎉'); await fetchStamps() }
    setChecking(null)
    setTimeout(() => setMsg(null), 3000)
  }

  const earnedSet = new Set(stamps.map(s => s.stamp_type))

  if (!contactId) {
    return (
      <div>
        <Header title="Enablement Passport" back={{ href: '/partners', label: 'Partner Hub' }} />
        <div className="max-w-md mx-auto px-4 py-12 text-center">
          <p className="text-gray-500 mb-4">Register to earn your passport stamps.</p>
          <Link href="/contact"><Button>Register</Button></Link>
        </div>
      </div>
    )
  }

  const progressPct = (stamps.length / 5) * 100

  return (
    <div>
      <Header title="Enablement Passport" back={{ href: '/partners', label: 'Partner Hub' }} />
      <div className="max-w-md mx-auto px-4 py-6 space-y-5">
        {/* Progress bar */}
        <Card className="p-5">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-gray-900">Your Passport</h2>
            <span className="text-sm font-bold text-[#0070D2]">{stamps.length}/5 stamps</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0070D2] rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {stamps.length === 5 && (
            <p className="text-sm text-green-600 font-medium mt-2">Full passport — well done! 🏆</p>
          )}
        </Card>

        {msg && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 text-center font-medium">
            {msg}
          </div>
        )}

        {loading ? <LoadingSpinner /> : (
          <div className="space-y-3">
            {ALL_STAMPS.map(stampType => {
              const earned = earnedSet.has(stampType)
              const isSelfService = (SELF_SERVICE_STAMPS as string[]).includes(stampType)
              const isChecking = checking === stampType

              return (
                <Card key={stampType} className={`p-4 ${earned ? 'border-green-200 bg-green-50/30' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0 border-2 ${
                      earned ? 'border-green-400 bg-green-100' : 'border-gray-200 bg-gray-50 opacity-40'
                    }`}>
                      {STAMP_ICONS[stampType]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${earned ? 'text-green-800' : 'text-gray-900'}`}>
                        {STAMP_LABELS[stampType]}
                      </p>
                      {earned ? (
                        <p className="text-xs text-green-600 mt-0.5 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Earned
                        </p>
                      ) : isSelfService ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="mt-1.5"
                          loading={isChecking}
                          onClick={() => checkIn(stampType)}
                        >
                          Check in
                        </Button>
                      ) : (
                        <p className="text-xs text-gray-400 mt-0.5">Auto-awarded on completion</p>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {stamps.length < 5 && (
          <p className="text-xs text-gray-400 text-center">
            Visit each activity and check in to earn your stamp.
            The Feedback Form stamp is awarded automatically when you submit feedback.
          </p>
        )}
      </div>
    </div>
  )
}

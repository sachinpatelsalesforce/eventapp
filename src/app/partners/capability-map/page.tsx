'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PartnerProfile } from '@/types'
import { CAPABILITIES, PARTNER_TIERS } from '@/lib/constants'
import { Header } from '@/components/layout/Header'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

const tierStyle: Record<string, string> = {
  summit: 'font-bold text-amber-600',
  platinum: 'font-semibold text-slate-600',
  gold: 'font-medium text-yellow-600',
  silver: 'text-gray-500',
}

export default function CapabilityMapPage() {
  const [profiles, setProfiles] = useState<PartnerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCapability, setActiveCapability] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/partners/profiles')
      .then(r => r.json())
      .then(data => { setProfiles(data); setLoading(false) })
  }, [])

  const filtered = activeCapability
    ? profiles.filter(p => p.capabilities.includes(activeCapability))
    : profiles

  const sorted = [...filtered].sort((a, b) => {
    const tierOrder = ['summit', 'platinum', 'gold', 'silver']
    const ai = tierOrder.indexOf(a.partner_tier), bi = tierOrder.indexOf(b.partner_tier)
    if (ai !== bi) return ai - bi
    return a.si_name.localeCompare(b.si_name)
  })

  return (
    <div>
      <Header title="Capability Map" subtitle="Partner strengths at a glance" back={{ href: '/partners', label: 'Partner Hub' }} />
      <div className="max-w-full px-4 py-5">
        {loading ? <LoadingSpinner /> : (
          <>
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <button
                onClick={() => setActiveCapability(null)}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${!activeCapability ? 'bg-[#0070D2] text-white border-[#0070D2]' : 'bg-white text-gray-600 border-gray-200'}`}
              >
                All Partners ({profiles.length})
              </button>
              {activeCapability && (
                <p className="text-sm text-gray-500">
                  Showing {sorted.length} partner{sorted.length !== 1 ? 's' : ''} with{' '}
                  <strong>{CAPABILITIES.find(c => c.key === activeCapability)?.label}</strong>
                </p>
              )}
            </div>

            <div className="overflow-x-auto -mx-4 px-4">
              <div className="min-w-max">
                {/* Header row */}
                <div className="flex">
                  <div className="w-48 flex-shrink-0" />
                  {CAPABILITIES.map(cap => (
                    <button
                      key={cap.key}
                      onClick={() => setActiveCapability(activeCapability === cap.key ? null : cap.key)}
                      className={`w-20 flex-shrink-0 text-center px-1 py-2 text-[11px] font-medium leading-tight transition-colors ${
                        activeCapability === cap.key
                          ? 'text-[#0070D2] bg-blue-50 rounded-t-lg'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {cap.label}
                    </button>
                  ))}
                </div>

                {/* Partner rows */}
                {sorted.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-sm">
                    No partner profiles yet.
                  </div>
                ) : (
                  sorted.map((partner, i) => (
                    <div
                      key={partner.id}
                      className={`flex items-center ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/30 transition-colors`}
                    >
                      <div className="w-48 flex-shrink-0 pr-3 py-2">
                        <Link href={`/partners/directory/${partner.id}`}>
                          <p className={`text-sm truncate hover:underline ${tierStyle[partner.partner_tier] ?? 'text-gray-700'}`}>
                            {partner.si_name}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {PARTNER_TIERS.find(t => t.key === partner.partner_tier)?.label}
                          </p>
                        </Link>
                      </div>
                      {CAPABILITIES.map(cap => (
                        <div
                          key={cap.key}
                          className={`w-20 flex-shrink-0 flex items-center justify-center py-2 ${activeCapability === cap.key ? 'bg-blue-50/60' : ''}`}
                        >
                          {partner.capabilities.includes(cap.key) ? (
                            <div className="w-5 h-5 rounded-full bg-[#0070D2] flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-gray-100 border border-gray-200" />
                          )}
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#0070D2]" />
                Has capability
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-gray-100 border border-gray-200" />
                Not listed
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

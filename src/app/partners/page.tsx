'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useContactId } from '@/hooks/useContactId'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface HubCard {
  href: string; icon: string; label: string; desc: string; badge?: string | number
}

export default function PartnersHubPage() {
  const contactId = useContactId()
  const [stamps, setStamps] = useState<number>(0)
  const [deals, setDeals] = useState<number>(0)
  const [hasProfile, setHasProfile] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!contactId) { setLoading(false); return }
    Promise.all([
      fetch(`/api/partners/passport?contact_id=${contactId}`).then(r => r.json()),
      fetch(`/api/partners/deals?contact_id=${contactId}`).then(r => r.json()),
      fetch(`/api/partners/profiles/me?contact_id=${contactId}`).then(r => r.json()),
    ]).then(([ps, ds, profile]) => {
      setStamps(Array.isArray(ps) ? ps.length : 0)
      setDeals(Array.isArray(ds) ? ds.length : 0)
      setHasProfile(profile !== null)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [contactId])

  const hubCards: HubCard[] = [
    {
      href: '/partners/profile',
      icon: '👤',
      label: 'My Profile',
      desc: hasProfile ? 'Edit your partner profile' : 'Build your SI profile',
      badge: hasProfile ? '✓' : undefined,
    },
    {
      href: '/partners/directory',
      icon: '🔍',
      label: 'Partner Directory',
      desc: 'Find & match with other partners',
    },
    {
      href: '/partners/capability-map',
      icon: '🗺️',
      label: 'Capability Map',
      desc: 'Visual partner strength matrix',
    },
    {
      href: '/partners/deals',
      icon: '💼',
      label: 'Deal Board',
      desc: 'Your private deal tracker',
      badge: deals > 0 ? deals : undefined,
    },
    {
      href: '/partners/passport',
      icon: '🎫',
      label: 'My Passport',
      desc: 'Earn stamps, climb the leaderboard',
      badge: stamps > 0 ? `${stamps}/5` : undefined,
    },
    {
      href: '/partners/action-plan',
      icon: '📋',
      label: 'Action Plan',
      desc: 'Leave with 3 targets & 2 plays',
    },
  ]

  return (
    <div>
      <Header title="Partner Hub" subtitle="Your GTM engine for today" />
      <div className="max-w-4xl mx-auto px-4 py-5">
        {!contactId && (
          <div className="mb-5 bg-[#0070D2]/10 border border-[#0070D2]/20 rounded-2xl p-4 text-sm">
            <Link href="/contact" className="text-[#5EB3FF] font-semibold hover:underline">Register your attendance</Link>
            <span className="text-white/60"> to unlock all partner features.</span>
          </div>
        )}
        {loading && contactId ? <LoadingSpinner /> : (
          <div className="grid grid-cols-2 gap-3">
            {hubCards.map(card => (
              <Link key={card.href} href={contactId ? card.href : '/contact'}>
                <Card hover className="p-4 h-full relative">
                  <span className="text-2xl block mb-2">{card.icon}</span>
                  <p className="font-bold text-white text-sm">{card.label}</p>
                  <p className="text-xs text-white/50 mt-0.5 leading-snug">{card.desc}</p>
                  {card.badge !== undefined && (
                    <span className="absolute top-3 right-3 bg-[#0070D2] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {card.badge}
                    </span>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Polls quick link */}
        <Link href="/polls" className="mt-4 block">
          <Card className="p-4 flex items-center gap-3 bg-[#0070D2]/15 border-[#0070D2]/25">
            <span className="text-2xl">📊</span>
            <div className="flex-1">
              <p className="font-bold text-white text-sm">Partner Pulse Polls</p>
              <p className="text-xs text-white/50">Live polls — vote now, see results instantly</p>
            </div>
            <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Card>
        </Link>
      </div>
    </div>
  )
}

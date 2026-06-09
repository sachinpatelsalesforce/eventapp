'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { AgendaItem } from '@/types'
import { PARTNER_TYPES } from '@/lib/constants'
import { formatTimeRange } from '@/lib/utils'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useInterests } from '@/hooks/useInterests'
import { useContactId } from '@/hooks/useContactId'

export default function AgendaPage() {
  const [sessions, setSessions] = useState<AgendaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const contactId = useContactId()
  const { isInterested, toggleInterest } = useInterests(contactId)

  useEffect(() => {
    const url = filter ? `/api/agenda?partner_type=${filter}` : '/api/agenda'
    setLoading(true)
    fetch(url)
      .then(r => r.json())
      .then(data => { setSessions(data); setLoading(false) })
  }, [filter])

  const toggleExpand = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div>
      <Header title="Agenda" subtitle="Commerce Summit 2026" />

      {/* Partner type filter pills */}
      <div className="sticky top-14 z-30 bg-[#061528]/95 backdrop-blur-md border-b border-white/[0.06] px-4 py-2.5">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          <button
            onClick={() => setFilter(null)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filter === null
                ? 'bg-[#0070D2] text-white border-[#0070D2]'
                : 'bg-white/[0.06] text-white/60 border-white/10 hover:border-white/20'
            }`}
          >
            All Sessions
          </button>
          {PARTNER_TYPES.map(pt => (
            <button
              key={pt.key}
              onClick={() => setFilter(filter === pt.key ? null : pt.key)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                filter === pt.key
                  ? 'bg-[#0070D2] text-white border-[#0070D2]'
                  : 'bg-white/[0.06] text-white/60 border-white/10 hover:border-white/20'
              }`}
            >
              {pt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-5 space-y-3">
        {loading ? (
          <LoadingSpinner />
        ) : sessions.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <p>No sessions found for this filter.</p>
          </div>
        ) : (
          sessions.map(session => {
            const interested = isInterested(session.id)
            const isOpen = expanded.has(session.id)

            return (
              <Card key={session.id} className="overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-semibold text-[#5EB3FF] bg-[#0070D2]/15 px-2 py-0.5 rounded-md">
                          {formatTimeRange(session.start_time, session.end_time)}
                        </span>
                        {session.room && (
                          <Badge variant="gray">{session.room}</Badge>
                        )}
                        {session.resource_url && (
                          <a
                            href={session.resource_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-[#5EB3FF] hover:underline"
                            onClick={e => e.stopPropagation()}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Resources
                          </a>
                        )}
                      </div>
                      <h3 className="font-bold text-white text-base leading-snug">{session.session_title}</h3>
                    </div>
                    <button
                      onClick={() => toggleInterest(session.id)}
                      className={`flex-shrink-0 p-1.5 rounded-full transition-colors ${interested ? 'text-[#5EB3FF]' : 'text-white/30 hover:text-white/60'}`}
                      aria-label={interested ? 'Remove from schedule' : 'Add to schedule'}
                    >
                      <svg className="w-5 h-5" fill={interested ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                      </svg>
                    </button>
                  </div>

                  {session.speaker_name && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                        <Image
                          src={session.speaker_photo ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(session.speaker_name)}&background=0070d2&color=fff&size=48&bold=true`}
                          alt={session.speaker_name}
                          width={24}
                          height={24}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-sm text-white/60">
                        <span className="font-medium text-white/80">{session.speaker_name}</span>
                        {session.speaker_company && ` · ${session.speaker_company}`}
                      </span>
                    </div>
                  )}

                  {session.description && (
                    <>
                      <p className={`text-sm text-white/50 mt-2 leading-relaxed ${isOpen ? '' : 'line-clamp-2'}`}>
                        {session.description}
                      </p>
                      <button
                        onClick={() => toggleExpand(session.id)}
                        className="text-xs text-[#5EB3FF] mt-1 hover:underline"
                      >
                        {isOpen ? 'Show less' : 'Read more'}
                      </button>
                    </>
                  )}

                  {session.partner_types && session.partner_types.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {session.partner_types.map(pt => {
                        const found = PARTNER_TYPES.find(p => p.key === pt)
                        return found ? (
                          <Badge key={pt} variant="blue" className="text-[10px]">
                            {found.label}
                          </Badge>
                        ) : null
                      })}
                    </div>
                  )}
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

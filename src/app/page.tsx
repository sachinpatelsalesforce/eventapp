import Link from 'next/link'
import { queryOne, query } from '@/lib/db'
import { Event } from '@/types'
import { EVENT_ID } from '@/lib/constants'

export const dynamic = 'force-dynamic'
import { formatDate } from '@/lib/utils'
import { Card } from '@/components/ui/Card'

async function getData() {
  const event = await queryOne<Event>('SELECT * FROM events WHERE id = $1', [EVENT_ID])
  const settings = await query<{ key: string; value: string }>('SELECT key, value FROM app_settings')
  const flagMap: Record<string, boolean> = {}
  for (const s of settings) flagMap[s.key] = s.value === 'true'
  return { event, flags: flagMap }
}

const navCards = [
  { href: '/agenda', label: 'Agenda', desc: 'Full schedule, session times & rooms', icon: '📅', flag: 'agenda', color: 'from-blue-50 to-blue-100 border-blue-200' },
  { href: '/speakers', label: 'Speakers', desc: 'Meet the speakers', icon: '🎤', flag: 'speakers', color: 'from-purple-50 to-purple-100 border-purple-200' },
  { href: '/partners', label: 'Partner Hub', desc: 'Profiles, deals, passport & more', icon: '🤝', flag: 'partners', color: 'from-emerald-50 to-emerald-100 border-emerald-200' },
  { href: '/polls', label: 'Partner Pulse', desc: 'Live polls — vote now', icon: '📊', flag: 'polls', color: 'from-orange-50 to-orange-100 border-orange-200' },
  { href: '/gtm', label: 'GTM Wall', desc: 'Submit & vote on GTM ideas', icon: '💡', flag: 'gtm', color: 'from-yellow-50 to-yellow-100 border-yellow-200' },
  { href: '/concierge', label: 'Ask AI', desc: 'Your AI event assistant', icon: '✨', flag: 'concierge', color: 'from-indigo-50 to-indigo-100 border-indigo-200' },
  { href: '/questions', label: 'Q&A', desc: 'Submit questions to speakers', icon: '❓', flag: 'questions', color: 'from-teal-50 to-teal-100 border-teal-200' },
  { href: '/feedback', label: 'Feedback', desc: 'Rate the event', icon: '⭐', flag: 'feedback', color: 'from-pink-50 to-pink-100 border-pink-200' },
]

export default async function HomePage() {
  const { event, flags } = await getData()

  const visibleCards = navCards.filter(c => flags[c.flag] !== false)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#032D60] via-[#0070D2] to-[#1589EE] text-white px-6 pt-14 pb-10">
        <div className="max-w-lg">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1 text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Live Today
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight mb-3">
            {event?.name ?? 'Commerce Connect'}
          </h1>
          {event && (
            <div className="flex flex-wrap gap-3 text-blue-100 text-sm mb-4">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(event.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {event.venue}
              </span>
            </div>
          )}
          {event?.welcome_message && (
            <p className="text-blue-100 text-sm leading-relaxed line-clamp-3">
              {event.welcome_message}
            </p>
          )}
        </div>
      </div>

      {/* Quick registration CTA */}
      {flags.contact !== false && (
        <div className="mx-4 -mt-5 mb-6">
          <Link href="/contact">
            <Card className="p-4 flex items-center gap-3 border-[#0070D2]/30 bg-white shadow-lg hover:shadow-card-hover transition-shadow">
              <div className="w-10 h-10 bg-[#0070D2] rounded-xl flex items-center justify-center flex-shrink-0 text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">Register your attendance</p>
                <p className="text-xs text-gray-500">Takes 30 seconds — unlock all partner features</p>
              </div>
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Card>
          </Link>
        </div>
      )}

      {/* Feature cards grid */}
      <div className="px-4 pb-8">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Quick access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {visibleCards.map(card => (
            <Link key={card.href} href={card.href}>
              <div className={`bg-gradient-to-br ${card.color} border rounded-xl p-4 h-full hover:shadow-md transition-shadow`}>
                <span className="text-2xl block mb-2">{card.icon}</span>
                <p className="font-semibold text-gray-900 text-sm leading-tight">{card.label}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">{card.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

import Link from 'next/link'
import { queryOne, query } from '@/lib/db'
import { Event } from '@/types'
import { EVENT_ID } from '@/lib/constants'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

async function getData() {
  const event = await queryOne<Event>('SELECT * FROM events WHERE id = $1', [EVENT_ID])
  const settings = await query<{ key: string; value: string }>('SELECT key, value FROM app_settings')
  const flagMap: Record<string, boolean> = {}
  for (const s of settings) flagMap[s.key] = s.value === 'true'
  return { event, flags: flagMap }
}

const navCards = [
  { href: '/agenda',    label: 'Agenda',        icon: '📅', flag: 'agenda',    accent: 'from-[#0070D2] to-[#004E9A]',   size: 'tall' },
  { href: '/partners',  label: 'Partner Hub',   icon: '🤝', flag: 'partners',  accent: 'from-[#032D60] to-[#061528]',   size: 'wide' },
  { href: '/gtm',       label: 'GTM Wall',      icon: '💡', flag: 'gtm',       accent: 'from-[#0D2137] to-[#0070D2]',   size: 'normal' },
  { href: '/polls',     label: 'Live Polls',    icon: '📊', flag: 'polls',     accent: 'from-[#053472] to-[#0D2137]',   size: 'normal' },
  { href: '/concierge', label: 'Ask AI',        icon: '✨', flag: 'concierge', accent: 'from-[#0070D2] to-[#0B56A8]',   size: 'normal' },
  { href: '/questions', label: 'Q&A',           icon: '❓', flag: 'questions', accent: 'from-[#032D60] to-[#0D2137]',   size: 'normal' },
  { href: '/feedback',  label: 'Feedback',      icon: '⭐', flag: 'feedback',  accent: 'from-[#0D2137] to-[#053472]',   size: 'normal' },
  { href: '/speakers',  label: 'Speakers',      icon: '🎤', flag: 'speakers',  accent: 'from-[#0070D2] to-[#032D60]',   size: 'normal' },
]

export default async function HomePage() {
  const { event, flags } = await getData()
  const visibleCards = navCards.filter(c => flags[c.flag] !== false)

  return (
    <div className="min-h-screen bg-[#061528]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-12 pb-6">
        <div>
          <p className="text-[#0070D2] text-xs font-semibold uppercase tracking-widest mb-1">
            {event ? formatDate(event.date) : 'Today'}
          </p>
          <h1 className="text-2xl font-black text-white leading-tight tracking-tight">
            {event?.name ?? 'Commerce Connect'}
          </h1>
          {event?.venue && (
            <p className="text-white/50 text-xs mt-0.5">{event.venue}</p>
          )}
        </div>
        {flags.contact !== false && (
          <Link href="/contact" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#0070D2] transition-colors flex-shrink-0 ml-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>
        )}
      </div>

      {/* Live badge */}
      <div className="px-5 mb-5">
        <span className="inline-flex items-center gap-2 bg-[#0070D2]/20 border border-[#0070D2]/30 text-[#5EB3FF] rounded-full px-3 py-1 text-xs font-semibold">
          <span className="w-1.5 h-1.5 bg-[#0070D2] rounded-full animate-pulse" />
          Live Now
        </span>
      </div>

      {/* Bento grid */}
      <div className="px-4 pb-8">
        <div className="grid grid-cols-2 gap-3">
          {visibleCards.map((card, i) => {
            const isFeatured = i === 0
            return (
              <Link
                key={card.href}
                href={card.href}
                className={isFeatured ? 'col-span-2' : 'col-span-1'}
              >
                <div className={`relative bg-gradient-to-br ${card.accent} rounded-2xl border border-white/[0.08] overflow-hidden ${isFeatured ? 'p-6 min-h-[140px]' : 'p-4 min-h-[110px]'} flex flex-col justify-between hover:border-white/20 transition-all active:scale-[0.98]`}>
                  {/* subtle grid pattern */}
                  <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff,#fff 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#fff,#fff 1px,transparent 1px,transparent 40px)' }} />
                  <div className="relative">
                    <span className={isFeatured ? 'text-4xl' : 'text-2xl'}>{card.icon}</span>
                  </div>
                  <div className="relative">
                    <p className={`font-bold text-white ${isFeatured ? 'text-xl' : 'text-sm'} leading-tight`}>
                      {card.label}
                    </p>
                    {isFeatured && (
                      <p className="text-white/50 text-sm mt-1">Full schedule, session times & rooms</p>
                    )}
                  </div>
                  {/* arrow */}
                  <div className="absolute top-4 right-4">
                    <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" />
                    </svg>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Welcome message */}
      {event?.welcome_message && (
        <div className="px-4 pb-8">
          <div className="bg-[#0D2137] border border-white/[0.08] rounded-2xl p-5">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">Welcome</p>
            <p className="text-white/80 text-sm leading-relaxed">{event.welcome_message}</p>
          </div>
        </div>
      )}
    </div>
  )
}

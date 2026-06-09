'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const navGroups = [
  {
    label: 'Event',
    items: [
      { href: '/admin/agenda', label: 'Agenda', icon: '📅' },
      { href: '/admin/speakers', label: 'Speakers', icon: '🎤' },
      { href: '/admin/session-tags', label: 'Session Tags', icon: '🏷️' },
    ],
  },
  {
    label: 'Engagement',
    items: [
      { href: '/admin/contacts', label: 'Contacts', icon: '👥' },
      { href: '/admin/questions', label: 'Questions', icon: '❓' },
      { href: '/admin/feedback', label: 'Feedback', icon: '⭐' },
      { href: '/admin/polls', label: 'Polls', icon: '📊' },
    ],
  },
  {
    label: 'Partners',
    items: [
      { href: '/admin/partners', label: 'Profiles', icon: '🤝' },
      { href: '/admin/passport', label: 'Passport', icon: '🎫' },
      { href: '/admin/gtm', label: 'GTM Wall', icon: '💡' },
      { href: '/admin/action-plans', label: 'Action Plans', icon: '📋' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { href: '/admin/settings', label: 'Feature Flags', icon: '🔧' },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  if (pathname === '/admin/login') return null

  return (
    <aside className="w-56 bg-[#032D60] text-white flex flex-col h-full shrink-0 hidden md:flex">
      <div className="px-4 py-5 border-b border-white/10">
        <p className="text-xs font-bold text-blue-300 uppercase tracking-widest">Commerce Connect</p>
        <p className="text-white font-semibold mt-0.5">Admin Portal</p>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 space-y-4 px-2">
        {navGroups.map(group => (
          <div key={group.label}>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest px-2 mb-1">{group.label}</p>
            {group.items.map(item => {
              const active = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                    active ? 'bg-white/15 text-white font-medium' : 'text-blue-200 hover:text-white hover:bg-white/10'
                  )}
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-white/10">
        <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-blue-200 hover:text-white hover:bg-white/10 mb-1">
          <span>🏠</span> View Site
        </Link>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-blue-200 hover:text-white hover:bg-white/10 w-full text-left"
        >
          <span>🚪</span> Log out
        </button>
      </div>
    </aside>
  )
}

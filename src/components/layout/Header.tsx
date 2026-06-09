import Link from 'next/link'

interface HeaderProps {
  title?: string
  subtitle?: string
  back?: { href: string; label: string }
  action?: React.ReactNode
  transparent?: boolean
}

export function Header({ title, subtitle, back, action, transparent }: HeaderProps) {
  return (
    <header className={`sticky top-0 z-40 ${transparent ? 'bg-transparent' : 'bg-[#061528]/95 backdrop-blur-md border-b border-white/[0.06]'}`}>
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
        {back && (
          <Link href={back.href} className="p-1.5 -ml-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        )}
        <div className="flex-1 min-w-0">
          {title && <h1 className="text-base font-bold text-white truncate">{title}</h1>}
          {subtitle && <p className="text-xs text-white/50 truncate">{subtitle}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </header>
  )
}

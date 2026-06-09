import Link from 'next/link'

interface HeaderProps {
  title?: string
  subtitle?: string
  back?: { href: string; label: string }
  action?: React.ReactNode
}

export function Header({ title, subtitle, back, action }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
        {back && (
          <Link href={back.href} className="p-1.5 -ml-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        )}
        <div className="flex-1 min-w-0">
          {title && <h1 className="text-lg font-bold text-gray-900 truncate">{title}</h1>}
          {subtitle && <p className="text-xs text-gray-500 truncate">{subtitle}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </header>
  )
}

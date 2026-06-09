import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0070D2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#061528] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]'

    const variants = {
      primary:   'bg-[#0070D2] hover:bg-[#0080F0] text-white shadow-lg shadow-[#0070D2]/25',
      secondary: 'bg-white/10 hover:bg-white/15 text-white border border-white/15',
      ghost:     'hover:bg-white/10 text-white/70 hover:text-white',
      danger:    'bg-red-600 hover:bg-red-500 text-white',
      outline:   'border-2 border-[#0070D2] text-[#0070D2] hover:bg-[#0070D2]/10',
    }

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-5 py-2.5 gap-2',
      lg: 'text-base px-6 py-3 gap-2',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

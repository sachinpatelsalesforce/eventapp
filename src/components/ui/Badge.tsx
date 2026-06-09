import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray' | 'gold' | 'teal'
}

const variants = {
  blue:   'bg-[#0070D2]/20 text-[#5EB3FF] border-[#0070D2]/30',
  green:  'bg-green-500/15 text-green-400 border-green-500/25',
  orange: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  red:    'bg-red-500/15 text-red-400 border-red-500/25',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  gray:   'bg-white/10 text-white/60 border-white/10',
  gold:   'bg-amber-500/15 text-amber-400 border-amber-500/25',
  teal:   'bg-teal-500/15 text-teal-400 border-teal-500/25',
}

export function Badge({ className, variant = 'blue', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray' | 'gold' | 'teal'
}

const variants = {
  blue:   'bg-blue-50 text-blue-700 border-blue-100',
  green:  'bg-green-50 text-green-700 border-green-100',
  orange: 'bg-orange-50 text-orange-700 border-orange-100',
  red:    'bg-red-50 text-red-700 border-red-100',
  purple: 'bg-purple-50 text-purple-700 border-purple-100',
  gray:   'bg-gray-50 text-gray-600 border-gray-100',
  gold:   'bg-amber-50 text-amber-700 border-amber-100',
  teal:   'bg-teal-50 text-teal-700 border-teal-100',
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

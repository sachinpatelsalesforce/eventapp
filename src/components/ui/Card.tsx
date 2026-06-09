import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-[#0D2137] rounded-2xl border border-white/[0.08]',
        hover && 'transition-all hover:border-white/20 hover:bg-[#122844] cursor-pointer active:scale-[0.99]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
Card.displayName = 'Card'

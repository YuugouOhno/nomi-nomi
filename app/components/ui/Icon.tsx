import { cn } from '@/app/lib/utils'
import * as OutlineIcons from '@heroicons/react/24/outline'
import * as SolidIcons from '@heroicons/react/24/solid'

type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type IconName = keyof typeof OutlineIcons

interface IconProps {
  name: IconName
  size?: IconSize
  solid?: boolean
  className?: string
}

const sizeClasses: Record<IconSize, string> = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8'
}

export function Icon({ name, size = 'md', solid = false, className }: IconProps) {
  const IconComponent = solid ? SolidIcons[name] : OutlineIcons[name]
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`)
    return null
  }

  return (
    <IconComponent
      className={cn(sizeClasses[size], className)}
      aria-hidden="true"
    />
  )
}
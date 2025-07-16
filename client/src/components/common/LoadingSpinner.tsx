import type { ReactNode } from 'react'
import SpinningIcon from './SpinningIcon'

interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  children?: ReactNode
}

export default function LoadingSpinner({ message, size = 'md', children }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <SpinningIcon sizeClasses={sizeClasses[size]} className="text-blue-600 mx-auto mb-4" />
      {message && <div className="text-gray-600 text-sm">{message}</div>}
      {children}
    </div>
  )
}

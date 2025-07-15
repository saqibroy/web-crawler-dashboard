// client/src/components/common/ErrorAlert.tsx
import { XCircle } from 'lucide-react'

interface ErrorAlertProps {
  message: string | null
  onDismiss: () => void
}

export default function ErrorAlert({ message, onDismiss }: ErrorAlertProps) {
  if (!message) return null

  return (
    <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-800">{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={onDismiss}
            className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100"
            aria-label="Dismiss error"
          >
            <XCircle className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}

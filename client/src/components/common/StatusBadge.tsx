import { getStatusDisplay } from '../../utils'
import type { AnalysisStatus } from '../../types'

const StatusBadge = ({ status }: { status: AnalysisStatus }) => {
  const { icon, className, text } = getStatusDisplay(status)
  return (
    <span className={className}>
      {icon}
      {text}
    </span>
  )
}

export default StatusBadge

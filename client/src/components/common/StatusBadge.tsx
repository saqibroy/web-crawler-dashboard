import { CheckCircle, XCircle, Hourglass, Info } from 'lucide-react';
import type { StatusDisplay, AnalysisStatus } from '../../types';

const getStatusDisplay = (status: AnalysisStatus): StatusDisplay => {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  switch (status) {
    case 'completed':
      return {
        icon: (<CheckCircle className="mr-1 h-3 w-3" />),
        className: `${baseClasses} bg-green-100 text-green-800`,
        text: 'Completed'
      };
    case 'failed':
      return {
        icon: (<XCircle className="mr-1 h-3 w-3" />),
        className: `${baseClasses} bg-red-100 text-red-800`,
        text: 'Failed'
      };
    case 'processing':
      return {
        icon: (
          <svg className="mr-1 h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ),
        className: `${baseClasses} bg-yellow-100 text-yellow-800`,
        text: 'Processing'
      };
    case 'queued':
      return {
        icon: (<Hourglass className="mr-1 h-3 w-3" />),
        className: `${baseClasses} bg-gray-100 text-gray-800`,
        text: 'Queued'
      };
    case 'cancelled':
      return {
        icon: (<XCircle className="mr-1 h-3 w-3" />),
        className: `${baseClasses} bg-orange-100 text-orange-800`,
        text: 'Cancelled'
      };
    default:
      return {
        icon: (<Info className="mr-1 h-3 w-3" />),
        className: `${baseClasses} bg-blue-100 text-blue-800`,
        text: String(status).charAt(0).toUpperCase() + String(status).slice(1)
      };
  }
};

const StatusBadge = ({ status }: { status: AnalysisStatus }) => {
  const { icon, className, text } = getStatusDisplay(status);
  return (
    <span className={className}>
      {icon}
      {text}
    </span>
  );
};

export default StatusBadge;

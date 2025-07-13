// client/src/pages/Dashboard/StatsCards.tsx
import { BarChart2, CheckCircle, Hourglass, XOctagon, XCircle } from 'lucide-react';

interface Stats {
  total: number;
  completed: number;
  processing: number;
  queued: number;
  failed: number;
  cancelled: number;
}

interface StatCardProps {
  icon: React.ElementType;
  bgColor: string;
  textColor: string;
  title: string;
  value: number;
}

const StatCard = ({ icon: Icon, bgColor, textColor, title, value }: StatCardProps) => (
  <div className="rounded-lg shadow-sm p-6 border border-gray-200">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <div className={`w-8 h-8 ${bgColor} rounded-full flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${textColor}`} />
        </div>
      </div>
      <div className="ml-5 w-0 flex-1">
        <dl>
          <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
          <dd className="text-lg font-semibold text-gray-900">{value}</dd>
        </dl>
      </div>
    </div>
  </div>
);

interface DashboardStatsProps {
  stats: Stats;
  activeStatus?: string;
  onStatusClick?: (status: string) => void;
  onTotalClick?: () => void;
}

export default function DashboardStats({ stats, activeStatus, onStatusClick, onTotalClick }: DashboardStatsProps) {
  const statusList = [
    { key: 'completed', title: 'Completed' },
    { key: 'processing', title: 'Processing' },
    { key: 'queued', title: 'Queued' },
    { key: 'failed', title: 'Failed' },
    { key: 'cancelled', title: 'Cancelled' },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
      {/* Total card (clickable to clear filter) */}
      <div
        className={`${!activeStatus ? 'bg-blue-50' : 'bg-white'} ${activeStatus ? 'cursor-pointer' : ''} rounded-lg transition-colors`}
        onClick={onTotalClick}
      >
        <StatCard
          icon={BarChart2}
          bgColor="bg-transparent"
          textColor="text-blue-600"
          title="Total"
          value={stats.total}
        />
      </div>
      {/* Status filter cards */}
      {statusList.map(({ key, title }) => {
        const isActive = activeStatus === key;
        return (
          <div
            key={key}
            className={`${isActive ? getBgColorForStatus(key) : 'bg-white'} ${!isActive ? 'cursor-pointer' : ''} rounded-lg transition-colors`}
            onClick={() => onStatusClick && onStatusClick(key)}
          >
            <StatCard
              icon={getIconForStatus(key)}
              bgColor="bg-transparent"
              textColor={getTextColorForStatus(key)}
              title={title}
              value={stats[key as keyof Stats]}
            />
          </div>
        );
      })}
    </div>
  );
}

function getIconForStatus(status: string) {
  switch (status) {
    case 'completed': return CheckCircle;
    case 'processing': return Hourglass;
    case 'queued': return Hourglass;
    case 'failed': return XOctagon;
    case 'cancelled': return XCircle;
    default: return Hourglass;
  }
}

function getTextColorForStatus(status: string) {
  switch (status) {
    case 'completed': return 'text-green-600';
    case 'processing': return 'text-yellow-600';
    case 'queued': return 'text-gray-600';
    case 'failed': return 'text-red-600';
    case 'cancelled': return 'text-orange-600';
    default: return 'text-gray-600';
  }
}

function getBgColorForStatus(status: string) {
  switch (status) {
    case 'completed': return 'bg-green-50';
    case 'processing': return 'bg-yellow-50';
    case 'queued': return 'bg-gray-50';
    case 'failed': return 'bg-red-50';
    case 'cancelled': return 'bg-orange-50';
    default: return 'bg-white';
  }
}

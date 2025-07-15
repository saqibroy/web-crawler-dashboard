// client/src/components/Dashboard/DashboardStats.tsx
import { BarChart2, CheckCircle, Hourglass, XOctagon, XCircle } from 'lucide-react';
import type { DashboardStatsData } from '../../types';

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: number;
  status?: string;
  isActive?: boolean;
  onClick?: () => void;
}

const StatCard = ({ icon: Icon, title, value, status, isActive, onClick }: StatCardProps) => {
  const bgColor = isActive && status ? getBgColorForStatus(status) : 'bg-white';
  const textColor = status ? getTextColorForStatus(status) : 'text-blue-600';
  
  return (
    <div 
      className={`${bgColor} ${onClick ? 'cursor-pointer' : ''} rounded-lg shadow-sm p-6 border border-gray-200 transition-colors`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-transparent rounded-full flex items-center justify-center">
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
};

interface DashboardStatsProps {
  stats: DashboardStatsData;
  activeStatus?: string;
  onStatusClick?: (status: string) => void;
  onTotalClick?: () => void;
}

export default function DashboardStats({ stats, activeStatus, onStatusClick, onTotalClick }: DashboardStatsProps) {
  const statusList = [
    { key: 'completed', title: 'Completed', icon: CheckCircle },
    { key: 'processing', title: 'Processing', icon: Hourglass },
    { key: 'queued', title: 'Queued', icon: Hourglass },
    { key: 'failed', title: 'Failed', icon: XOctagon },
    { key: 'cancelled', title: 'Cancelled', icon: XCircle },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
      {/* Total card */}
      <StatCard
        icon={BarChart2}
        title="Total"
        value={stats.total}
        isActive={!activeStatus}
        onClick={onTotalClick}
      />

      {/* Status filter cards */}
      {statusList.map(({ key, title, icon }) => (
        <StatCard
          key={key}
          icon={icon}
          title={title}
          value={stats[key as keyof DashboardStatsData]}
          status={key}
          isActive={activeStatus === key}
          onClick={() => onStatusClick?.(key)}
        />
      ))}
    </div>
  );
}

function getTextColorForStatus(status: string) {
  const colors = {
    completed: 'text-green-600',
    processing: 'text-yellow-600',
    queued: 'text-gray-600',
    failed: 'text-red-600',
    cancelled: 'text-orange-600',
  };
  return colors[status as keyof typeof colors] || 'text-gray-600';
}

function getBgColorForStatus(status: string) {
  const colors = {
    completed: 'bg-green-50',
    processing: 'bg-yellow-50',
    queued: 'bg-gray-50',
    failed: 'bg-red-50',
    cancelled: 'bg-orange-50',
  };
  return colors[status as keyof typeof colors] || 'bg-white';
}
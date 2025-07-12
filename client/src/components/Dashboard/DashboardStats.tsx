// client/src/pages/Dashboard/StatsCards.tsx
import { BarChart2, CheckCircle, Hourglass, XOctagon } from 'lucide-react';

interface Stats {
  total: number;
  completed: number;
  processing: number;
  queued: number;
  failed: number;
}

interface StatCardProps {
  icon: React.ElementType;
  bgColor: string;
  textColor: string;
  title: string;
  value: number;
}

const StatCard = ({ icon: Icon, bgColor, textColor, title, value }: StatCardProps) => (
  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
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
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
      <StatCard
        icon={BarChart2}
        bgColor="bg-blue-100"
        textColor="text-blue-600"
        title="Total"
        value={stats.total}
      />
      <StatCard
        icon={CheckCircle}
        bgColor="bg-green-100"
        textColor="text-green-600"
        title="Completed"
        value={stats.completed}
      />
      <StatCard
        icon={Hourglass} // Changed to Hourglass for Processing
        bgColor="bg-yellow-100"
        textColor="text-yellow-600"
        title="Processing"
        value={stats.processing}
      />
      <StatCard
        icon={Hourglass} // Keeping Hourglass for Queued
        bgColor="bg-gray-100"
        textColor="text-gray-600"
        title="Queued"
        value={stats.queued}
      />
      <StatCard
        icon={XOctagon}
        bgColor="bg-red-100"
        textColor="text-red-600"
        title="Failed"
        value={stats.failed}
      />
    </div>
  );
}

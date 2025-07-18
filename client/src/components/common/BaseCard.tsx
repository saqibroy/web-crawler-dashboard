interface BaseCardProps {
  icon: React.ElementType
  title: string
  value: string | number
  bgColor?: string
  iconBgColor?: string
  iconTextColor?: string
  onClick?: () => void
  hoverBgColor?: string
}

export default function BaseCard({
  icon: Icon,
  title,
  value,
  bgColor = 'bg-white',
  iconBgColor = 'bg-gray-100',
  iconTextColor = 'text-blue-600',
  onClick,
  hoverBgColor = 'hover:bg-gray-50',
}: BaseCardProps) {
  return (
    <div
      className={`${bgColor} rounded-lg shadow-sm p-6 border border-gray-200 transition-colors ${
        onClick ? `cursor-pointer ${hoverBgColor}` : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div
          className={`w-8 h-8 ${iconBgColor} rounded-full flex items-center justify-center flex-shrink-0`}
        >
          <Icon className={`w-5 h-5 ${iconTextColor}`} />
        </div>
        <div className="ml-5 flex-1">
          <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
          <dd className="text-lg font-semibold text-gray-900">{value}</dd>
        </div>
      </div>
    </div>
  )
}

import { Card } from 'antd';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  };
  color?: 'green' | 'blue' | 'gold' | 'earth';
  delay?: number;
}

const colorMap = {
  green: {
    bg: 'from-forest-50 to-forest-100',
    iconBg: 'bg-gradient-to-br from-forest-400 to-forest-600',
    text: 'text-forest-600',
  },
  blue: {
    bg: 'from-sky-50 to-sky-100',
    iconBg: 'bg-gradient-to-br from-sky-400 to-sky-600',
    text: 'text-sky-600',
  },
  gold: {
    bg: 'from-gold-50 to-gold-100',
    iconBg: 'bg-gradient-to-br from-gold-400 to-gold-600',
    text: 'text-gold-600',
  },
  earth: {
    bg: 'from-earth-50 to-earth-100',
    iconBg: 'bg-gradient-to-br from-earth-400 to-earth-600',
    text: 'text-earth-600',
  },
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  color = 'green',
  delay = 0,
}) => {
  const colors = colorMap[color];

  return (
    <Card
      className="stagger-item card-hover border-none overflow-hidden"
      style={{
        animationDelay: `${delay}s`,
      }}
      styles={{
        body: {
          padding: 0,
        },
      }}
    >
      <div className={`bg-gradient-to-br ${colors.bg} p-6`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-forest-600/70 mb-2 font-medium">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold font-serif ${colors.text} count-value`}>
                {value}
              </span>
              {unit && <span className="text-sm text-forest-600/60">{unit}</span>}
            </div>
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                {trend.isUp ? (
                  <TrendingUp size={14} className="text-forest-600" />
                ) : (
                  <TrendingDown size={14} className="text-red-500" />
                )}
                <span
                  className={`text-xs font-medium ${trend.isUp ? 'text-forest-600' : 'text-red-500'}`}
                >
                  {trend.isUp ? '+' : ''}
                  {trend.value}%
                </span>
                <span className="text-xs text-forest-600/50">较上季度</span>
              </div>
            )}
          </div>
          <div className={`w-14 h-14 rounded-2xl ${colors.iconBg} flex items-center justify-center shadow-lg`}>
            <Icon size={28} className="text-white" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatCard;

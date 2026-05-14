import { TrendingUp, Package, Truck, AlertTriangle, DollarSign, Users, Clock } from 'lucide-react';

interface NeonKPIProps {
  title: string;
  value: string | number;
  icon: 'trending' | 'package' | 'truck' | 'alert' | 'dollar' | 'users' | 'clock';
  color: 'cyan' | 'green' | 'yellow' | 'magenta' | 'purple' | 'blue';
  trend?: number;
  subtitle?: string;
}

const COLOR_MAP = {
  cyan: {
    bg: 'bg-dark-card',
    border: 'border-neon-cyan',
    text: 'text-neon-cyan',
    glow: 'shadow-neon-cyan',
    icon: 'text-neon-cyan',
  },
  green: {
    bg: 'bg-dark-card',
    border: 'border-neon-green',
    text: 'text-neon-green',
    glow: 'shadow-neon-green',
    icon: 'text-neon-green',
  },
  yellow: {
    bg: 'bg-dark-card',
    border: 'border-neon-yellow',
    text: 'text-neon-yellow',
    glow: 'shadow-neon-yellow',
    icon: 'text-neon-yellow',
  },
  magenta: {
    bg: 'bg-dark-card',
    border: 'border-neon-magenta',
    text: 'text-neon-magenta',
    glow: 'shadow-neon-magenta',
    icon: 'text-neon-magenta',
  },
  purple: {
    bg: 'bg-dark-card',
    border: 'border-neon-purple',
    text: 'text-neon-purple',
    glow: 'shadow-neon-cyan',
    icon: 'text-neon-purple',
  },
  blue: {
    bg: 'bg-dark-card',
    border: 'border-neon-blue',
    text: 'text-neon-blue',
    glow: 'shadow-neon-cyan',
    icon: 'text-neon-blue',
  },
};

const ICON_MAP = {
  trending: TrendingUp,
  package: Package,
  truck: Truck,
  alert: AlertTriangle,
  dollar: DollarSign,
  users: Users,
  clock: Clock,
};

export function NeonKPI({ title, value, icon, color, trend, subtitle }: NeonKPIProps) {
  const colors = COLOR_MAP[color];
  const IconComponent = ICON_MAP[icon];
  
  return (
    <div 
      className={`
        ${colors.bg} 
        border ${colors.border} 
        rounded-xl p-4 
        hover:scale-[1.02] transition-transform duration-300
        ${colors.glow}
      `}
      style={{ 
        boxShadow: `0 0 20px rgba(0,0,0,0.3), inset 0 0 20px rgba(0,0,0,0.1)` 
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-gray-400 text-sm font-medium">{title}</span>
        <div className={`${colors.icon}`}>
          <IconComponent size={20} />
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div className={`${colors.text} text-3xl font-bold font-mono`}>
          {value}
        </div>
        
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${trend >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
            <TrendingUp size={14} className={trend < 0 ? 'rotate-180' : ''} />
            <span className="font-mono">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      
      {subtitle && (
        <div className="text-gray-500 text-xs mt-1">{subtitle}</div>
      )}
    </div>
  );
}

interface NeonKPIGridProps {
  children: React.ReactNode;
}

export function NeonKPIGrid({ children }: NeonKPIGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {children}
    </div>
  );
}
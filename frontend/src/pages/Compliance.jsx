import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Clock,
  Timer,
  Coffee,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  Info,
} from 'lucide-react';
import { TripContext } from '../App';

export default function Compliance() {
  const { tripData } = useContext(TripContext);
  const navigate = useNavigate();

  if (!tripData) {
    return (
      <div className="fade-in flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 rounded-full bg-surface-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <ShieldCheck className="w-10 h-10 text-gray-300 dark:text-gray-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-400 mb-2">No Compliance Data</h3>
        <p className="text-sm text-gray-300 dark:text-gray-500 mb-6 text-center max-w-xs">
          Generate a trip to view your compliance overview.
        </p>
        <button onClick={() => navigate('/')} className="btn-primary flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Go to Dashboard
        </button>
      </div>
    );
  }

  // Calculate compliance metrics from the first day log
  const firstLog = tripData.log_sheets_data?.[0] || {};
  const totalDriving = firstLog.total_driving || 0;
  const totalOnDutyRaw = (firstLog.total_on_duty || 0) + totalDriving;
  const cycleUsed = tripData.current_cycle_used || 0;
  const totalTripDriving = tripData.estimated_driving_hours || 0;
  const cycleRemaining = tripData.remaining_cycle_hours || 0;
  const cycleUsedTotal = 70 - cycleRemaining;

  // Determine the longest driving stretch without a break
  let longestStretchWithoutBreak = 0;
  let currentStretch = 0;
  const timeline = tripData.timeline_data || [];
  for (const event of timeline) {
    if (event.type === 'driving') {
      const hours = parseFloat(event.duration) || 0;
      currentStretch += hours;
      if (currentStretch > longestStretchWithoutBreak) {
        longestStretchWithoutBreak = currentStretch;
      }
    } else if (event.type === 'break' || event.type === 'rest') {
      currentStretch = 0;
    }
  }

  const complianceCards = [
    {
      title: '11-Hour Driving Limit',
      icon: Timer,
      description: 'May drive a maximum of 11 hours after 10 consecutive hours off duty.',
      limit: 11,
      used: Math.min(totalDriving, 11),
      remaining: Math.max(11 - totalDriving, 0),
      unit: 'hours',
      getStatus: (used) => {
        if (used <= 8) return 'good';
        if (used <= 10) return 'warning';
        return 'danger';
      },
    },
    {
      title: '14-Hour Duty Window',
      icon: Clock,
      description: 'Cannot drive beyond the 14th consecutive hour after coming on duty.',
      limit: 14,
      used: Math.min(totalOnDutyRaw, 14),
      remaining: Math.max(14 - totalOnDutyRaw, 0),
      unit: 'hours',
      getStatus: (used) => {
        if (used <= 10) return 'good';
        if (used <= 13) return 'warning';
        return 'danger';
      },
    },
    {
      title: '30-Minute Break Rule',
      icon: Coffee,
      description: 'Must take a 30-minute break after 8 cumulative hours of driving.',
      limit: 8,
      used: Math.min(longestStretchWithoutBreak, 8),
      remaining: Math.max(8 - longestStretchWithoutBreak, 0),
      unit: 'hours until break',
      getStatus: (used) => {
        if (used <= 5) return 'good';
        if (used <= 7) return 'warning';
        return 'danger';
      },
    },
    {
      title: '70-Hour / 8-Day Cycle',
      icon: CalendarDays,
      description: 'Cannot drive after 70 hours on-duty in 8 consecutive days.',
      limit: 70,
      used: Math.min(cycleUsedTotal, 70),
      remaining: cycleRemaining,
      unit: 'hours',
      getStatus: (used) => {
        if (used <= 50) return 'good';
        if (used <= 65) return 'warning';
        return 'danger';
      },
    },
  ];

  const statusConfig = {
    good: {
      badge: 'badge-success',
      badgeText: 'Compliant',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
      barColor: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
    },
    warning: {
      badge: 'badge-warning',
      badgeText: 'Approaching Limit',
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
      barColor: 'bg-amber-500',
      bgColor: 'bg-amber-50',
    },
    danger: {
      badge: 'badge-danger',
      badgeText: 'At Limit',
      icon: XCircle,
      iconColor: 'text-red-500',
      barColor: 'bg-red-500',
      bgColor: 'bg-red-50',
    },
  };

  return (
    <div className="fade-in space-y-6">
      {/* Overall Status */}
      <div className="card p-4 sm:p-6">
        <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="section-title text-base sm:text-lg">Overall HOS Compliance</h3>
              <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-0.5">Property-Carrying Driver (70hr/8day)</p>
            </div>
          </div>
          <span className="badge-success text-sm py-1.5 px-4">
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            All Rules Compliant
          </span>
        </div>
      </div>

      {/* Compliance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {complianceCards.map((card, i) => {
          const Icon = card.icon;
          const status = card.getStatus(card.used);
          const config = statusConfig[status];
          const StatusIcon = config.icon;
          const pct = Math.min((card.used / card.limit) * 100, 100);

          return (
            <div key={i} className="card-hover p-4 sm:p-6 fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              {/* Header */}
              <div className="flex items-start justify-between mb-3 sm:mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${config.iconColor}`} />
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100">{card.title}</h4>
                </div>
                <span className={`${config.badge} text-[10px] sm:text-xs`}>
                  <StatusIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                  {config.badgeText}
                </span>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {card.used.toFixed(1)} / {card.limit} {card.unit}
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {card.remaining.toFixed(1)}h remaining
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${config.barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="flex items-start gap-2 bg-surface-50 dark:bg-gray-700/50 rounded-lg p-3">
                <Info className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{card.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

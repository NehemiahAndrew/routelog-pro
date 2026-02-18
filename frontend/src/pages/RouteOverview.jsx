import { useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Route,
  Timer,
  CalendarDays,
  Clock,
  Truck,
  Fuel,
  Coffee,
  BedDouble,
  Package,
  Flag,
  MapPin,
  ClipboardCheck,
  ArrowLeft,
} from 'lucide-react';
import { TripContext } from '../App';

// Icon mapping for timeline events
const iconMap = {
  truck: Truck,
  fuel: Fuel,
  coffee: Coffee,
  bed: BedDouble,
  package: Package,
  flag: Flag,
  clipboard: ClipboardCheck,
};

const typeColors = {
  driving: 'bg-blue-500',
  on_duty: 'bg-amber-500',
  break: 'bg-purple-500',
  rest: 'bg-gray-500',
};

const typeBg = {
  driving: 'bg-blue-50 border-blue-100',
  on_duty: 'bg-amber-50 border-amber-100',
  break: 'bg-purple-50 border-purple-100',
  rest: 'bg-gray-50 border-gray-100',
};

export default function RouteOverview() {
  const { tripData } = useContext(TripContext);
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!tripData || !mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([39.8283, -98.5795], 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    // Draw route polyline
    if (tripData.route_data && tripData.route_data.length > 0) {
      const polyline = L.polyline(tripData.route_data, {
        color: '#1E3A8A',
        weight: 4,
        opacity: 0.8,
        smoothFactor: 1,
      }).addTo(map);
      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    }

    // Add markers for stops
    if (tripData.stops_data) {
      tripData.stops_data.forEach((stop) => {
        const markerColors = {
          start: '#1E3A8A',
          pickup: '#F59E0B',
          dropoff: '#10B981',
          fuel: '#EF4444',
          rest: '#8B5CF6',
        };

        const markerIcons = {
          start: '📍',
          pickup: '📦',
          dropoff: '🏁',
          fuel: '⛽',
          rest: '🛏️',
        };

        const color = markerColors[stop.type] || '#6B7280';
        const emoji = markerIcons[stop.type] || '📍';

        const icon = L.divIcon({
          html: `<div style="
            background: ${color};
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            border: 3px solid white;
          ">${emoji}</div>`,
          className: '',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        L.marker([stop.lat, stop.lng], { icon })
          .addTo(map)
          .bindPopup(
            `<div style="font-family: Inter, sans-serif; padding: 4px;">
              <strong style="font-size: 13px;">${stop.label}</strong><br/>
              <span style="color: #6B7280; font-size: 11px;">Day ${stop.day} • ${stop.time}</span>
            </div>`
          );
      });
    }

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [tripData]);

  if (!tripData) {
    return (
      <div className="fade-in flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 rounded-full bg-surface-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <Route className="w-10 h-10 text-gray-300 dark:text-gray-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-400 mb-2">No Route Available</h3>
        <p className="text-sm text-gray-300 dark:text-gray-500 mb-6 text-center max-w-xs">
          Generate a trip from the Dashboard to view the route overview.
        </p>
        <button onClick={() => navigate('/')} className="btn-primary flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Go to Dashboard
        </button>
      </div>
    );
  }

  // Group timeline by day
  const timelineByDay = {};
  tripData.timeline_data?.forEach((event) => {
    const day = event.day || 1;
    if (!timelineByDay[day]) timelineByDay[day] = [];
    timelineByDay[day].push(event);
  });

  const statCards = [
    { label: 'Distance', value: `${tripData.total_distance?.toLocaleString()} mi`, icon: Route, color: 'text-primary-800', bg: 'bg-blue-50' },
    { label: 'Days', value: tripData.total_days, icon: CalendarDays, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Driving Hours', value: `${tripData.estimated_driving_hours} hrs`, icon: Timer, color: 'text-accent-600', bg: 'bg-teal-50' },
    { label: 'Cycle Remaining', value: `${tripData.remaining_cycle_hours} hrs`, icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="fade-in space-y-6">
      {/* Stat Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="stat-card">
              <div className={`w-11 h-11 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Map and Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="section-title flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-800" />
                Route Map
              </h3>
            </div>
            <div
              ref={mapRef}
              className="w-full"
              style={{ height: '500px' }}
            />
            {/* Map Legend */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-4">
              {[
                { color: 'bg-primary-800', label: 'Start' },
                { color: 'bg-amber-500', label: 'Pickup' },
                { color: 'bg-emerald-500', label: 'Dropoff' },
                { color: 'bg-red-500', label: 'Fuel' },
                { color: 'bg-purple-500', label: 'Rest' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="lg:col-span-1">
          <div className="card p-5 max-h-[620px] overflow-y-auto">
            <h3 className="section-title mb-4">Trip Timeline</h3>

            {Object.entries(timelineByDay).map(([day, events]) => (
              <div key={day} className="mb-6 last:mb-0">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-primary-800 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{day}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Day {day}</span>
                </div>

                <div className="ml-3.5 border-l-2 border-gray-200 dark:border-gray-600 pl-5 space-y-3">
                  {events.map((event, i) => {
                    const IconComponent = iconMap[event.icon] || MapPin;
                    const dotColor = typeColors[event.type] || 'bg-gray-400';
                    const cardBg = typeBg[event.type] || 'bg-gray-50 border-gray-100';

                    return (
                      <div key={i} className="relative slide-in" style={{ animationDelay: `${i * 50}ms` }}>
                        {/* Timeline dot */}
                        <div className={`absolute -left-[29px] top-3 w-3 h-3 rounded-full ${dotColor} border-2 border-white shadow-sm`} />

                        <div className={`p-3 rounded-lg border ${cardBg}`}>
                          <div className="flex items-start gap-2.5">
                            <IconComponent className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{event.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500 dark:text-gray-400">{event.duration}</span>
                              <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
                                <span className="text-xs text-gray-400">{event.time_range}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

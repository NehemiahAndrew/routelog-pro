import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Navigation,
  Package,
  Flag,
  Clock,
  Truck,
  Route,
  Fuel,
  Timer,
  CalendarDays,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { TripContext } from '../App';
import { generateTrip } from '../api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { tripData, setTripData, loading, setLoading } = useContext(TripContext);
  const [formData, setFormData] = useState({
    current_location: '',
    pickup_location: '',
    dropoff_location: '',
    current_cycle_used: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.current_location || !formData.pickup_location || !formData.dropoff_location) {
      setError('Please fill in all location fields.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await generateTrip({
        ...formData,
        current_cycle_used: parseFloat(formData.current_cycle_used) || 0,
      });
      setTripData(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate route. Please check the backend server.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = tripData
    ? [
        { label: 'Total Distance', value: `${tripData.total_distance?.toLocaleString()} mi`, icon: Route, color: 'text-primary-800', bg: 'bg-blue-50' },
        { label: 'Driving Hours', value: `${tripData.estimated_driving_hours} hrs`, icon: Timer, color: 'text-accent-600', bg: 'bg-teal-50' },
        { label: 'Total Days', value: `${tripData.total_days} day${tripData.total_days > 1 ? 's' : ''}`, icon: CalendarDays, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Fuel Stops', value: tripData.fuel_stops, icon: Fuel, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Remaining Cycle', value: `${tripData.remaining_cycle_hours} hrs`, icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      ]
    : [];

  return (
    <div className="fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ─── Left Column: Trip Form ─── */}
        <div className="lg:col-span-3">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary-800 flex items-center justify-center">
                <Navigation className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="section-title">Plan New Trip</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Enter your trip details to generate route and logs</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Current Location */}
              <div>
                <label className="label mb-1.5 block">Current Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="current_location"
                    value={formData.current_location}
                    onChange={handleChange}
                    placeholder="e.g., Chicago, IL"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Pickup Location */}
              <div>
                <label className="label mb-1.5 block">Pickup Location</label>
                <div className="relative">
                  <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="pickup_location"
                    value={formData.pickup_location}
                    onChange={handleChange}
                    placeholder="e.g., Indianapolis, IN"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Dropoff Location */}
              <div>
                <label className="label mb-1.5 block">Dropoff Location</label>
                <div className="relative">
                  <Flag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="dropoff_location"
                    value={formData.dropoff_location}
                    onChange={handleChange}
                    placeholder="e.g., Los Angeles, CA"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Current Cycle Used */}
              <div>
                <label className="label mb-1.5 block">Current Cycle Used (Hours)</label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    name="current_cycle_used"
                    value={formData.current_cycle_used}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    max="70"
                    step="0.5"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Route & Logs...
                  </>
                ) : (
                  <>
                    <Truck className="w-5 h-5" />
                    Generate Route & Logs
                  </>
                )}
              </button>

              <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2">
                System applies <span className="font-semibold text-gray-500 dark:text-gray-400">70hr / 8day</span> HOS rules automatically.
              </p>
            </form>
          </div>
        </div>

        {/* ─── Right Column: Trip Summary ─── */}
        <div className="lg:col-span-2">
          <div className="card p-6 h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-accent-500 flex items-center justify-center">
                <Route className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="section-title">Trip Summary</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Route calculation results</p>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="skeleton w-12 h-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-4 w-24" />
                      <div className="skeleton h-6 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : tripData ? (
              <div className="space-y-3 fade-in">
                {statCards.map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-surface-50 dark:bg-gray-700/50 border border-gray-50 dark:border-gray-600">
                      <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                      </div>
                    </div>
                  );
                })}

                {/* Quick Nav */}
                <div className="pt-4 space-y-2">
                  <button
                    onClick={() => navigate('/route')}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-primary-50 text-primary-800 hover:bg-primary-100 transition-colors"
                  >
                    <span className="text-sm font-semibold">View Route Map</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate('/logs')}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-accent-50 text-accent-700 hover:bg-accent-100 transition-colors"
                  >
                    <span className="text-sm font-semibold">View ELD Logs</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-24 h-24 rounded-full bg-surface-50 dark:bg-gray-700 flex items-center justify-center mb-4">
                  <Truck className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                </div>
                <h4 className="text-base font-semibold text-gray-400 mb-1">No Trip Generated Yet</h4>
                <p className="text-sm text-gray-300 dark:text-gray-500 max-w-[220px]">
                  Fill in your trip details and click generate to see route calculations.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

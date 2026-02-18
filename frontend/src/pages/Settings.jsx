import { useState, useContext } from 'react';
import {
  User,
  Building2,
  ShieldCheck,
  Moon,
  Sun,
  Save,
  CheckCircle2,
  Truck,
} from 'lucide-react';
import { DarkModeContext } from '../App';

function InputField({ label, name, value, type = 'text', placeholder, disabled = false, onChange }) {
  return (
    <div>
      <label className="label mb-1.5 block">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="input-field disabled:bg-gray-50 disabled:text-gray-400 dark:disabled:bg-gray-700 dark:disabled:text-gray-500"
      />
    </div>
  );
}

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const { darkMode, setDarkMode } = useContext(DarkModeContext);

  const [profile, setProfile] = useState({
    driver_name: 'John Doe',
    license_number: 'CDL-2024-8847',
    phone: '(555) 123-4567',
    email: 'john.doe@abctrucking.com',
    carrier_name: 'ABC Trucking Co.',
    carrier_dot: 'DOT-1234567',
    mc_number: 'MC-987654',
    home_terminal: 'Chicago, IL',
    truck_number: 'T-1001',
    trailer_number: 'TR-5502',
    cycle_rule: '70hr/8day',
    avg_speed: '55',
    fuel_interval: '1000',
    break_interval: '8',
  });

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Would POST to API in production
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="fade-in max-w-4xl space-y-4 sm:space-y-6">
      <form onSubmit={handleSave} className="space-y-6">
        {/* Driver Profile */}
        <div className="card p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary-800 flex items-center justify-center">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h3 className="section-title text-base sm:text-lg">Driver Profile</h3>
              <p className="text-xs text-gray-400 mt-0.5">Personal and license information</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Full Name" name="driver_name" value={profile.driver_name} onChange={handleChange} />
            <InputField label="CDL Number" name="license_number" value={profile.license_number} onChange={handleChange} />
            <InputField label="Phone" name="phone" value={profile.phone} type="tel" onChange={handleChange} />
            <InputField label="Email" name="email" value={profile.email} type="email" onChange={handleChange} />
          </div>
        </div>

        {/* Carrier Info */}
        <div className="card p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-accent-500 flex items-center justify-center">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h3 className="section-title text-base sm:text-lg">Carrier Information</h3>
              <p className="text-xs text-gray-400 mt-0.5">Company and equipment details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Carrier Name" name="carrier_name" value={profile.carrier_name} onChange={handleChange} />
            <InputField label="USDOT Number" name="carrier_dot" value={profile.carrier_dot} onChange={handleChange} />
            <InputField label="MC Number" name="mc_number" value={profile.mc_number} onChange={handleChange} />
            <InputField label="Home Terminal" name="home_terminal" value={profile.home_terminal} onChange={handleChange} />
            <InputField label="Truck Number" name="truck_number" value={profile.truck_number} onChange={handleChange} />
            <InputField label="Trailer Number" name="trailer_number" value={profile.trailer_number} onChange={handleChange} />
          </div>
        </div>

        {/* HOS Assumptions */}
        <div className="card p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h3 className="section-title text-base sm:text-lg">HOS Assumptions</h3>
              <p className="text-xs text-gray-400 mt-0.5">Defaults used for route calculations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label mb-1.5 block">Cycle Rule</label>
              <select
                name="cycle_rule"
                value={profile.cycle_rule}
                onChange={handleChange}
                className="input-field"
              >
                <option value="70hr/8day">70-Hour / 8-Day (Property)</option>
                <option value="60hr/7day">60-Hour / 7-Day (Property)</option>
              </select>
            </div>
            <InputField label="Avg Speed (mph)" name="avg_speed" value={profile.avg_speed} type="number" onChange={handleChange} />
            <InputField label="Fuel Interval (miles)" name="fuel_interval" value={profile.fuel_interval} type="number" onChange={handleChange} />
            <InputField label="Break After (hours)" name="break_interval" value={profile.break_interval} type="number" onChange={handleChange} />
          </div>

          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Truck className="w-4 h-4 text-primary-800 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-gray-600 space-y-1">
                <p><span className="font-semibold">Property-carrying driver</span> — 70hrs/8days, no adverse driving conditions</p>
                <p>Fueling at least once every <span className="font-semibold">1,000 miles</span></p>
                <p><span className="font-semibold">1 hour</span> for pickup and drop-off each</p>
              </div>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="card p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gray-800 flex items-center justify-center">
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h3 className="section-title text-base sm:text-lg">Appearance</h3>
              <p className="text-xs text-gray-400 mt-0.5">Customize your display preferences</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-surface-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="w-5 h-5 text-blue-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Dark Mode</p>
                <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">Switch between light and dark theme</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = !darkMode;
                setDarkMode(next);
                document.documentElement.classList.toggle('dark', next);
                localStorage.setItem('darkMode', JSON.stringify(next));
              }}
              className={`
                relative w-12 h-6 rounded-full transition-colors duration-200
                ${darkMode ? 'bg-primary-800' : 'bg-gray-300'}
              `}
            >
              <div
                className={`
                  absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm
                  transition-transform duration-200
                  ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}
                `}
              />
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3">
          {saved && (
            <span className="badge-success flex items-center gap-1.5 fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Settings saved
            </span>
          )}
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}

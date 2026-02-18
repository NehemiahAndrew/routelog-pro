import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect, createContext } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RouteOverview from './pages/RouteOverview';
import ELDLogs from './pages/ELDLogs';
import Compliance from './pages/Compliance';
import Settings from './pages/Settings';

export const TripContext = createContext(null);
export const DarkModeContext = createContext(null);

function App() {
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('darkMode');
    return stored ? JSON.parse(stored) : false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <DarkModeContext.Provider value={{ darkMode, setDarkMode }}>
      <TripContext.Provider value={{ tripData, setTripData, loading, setLoading }}>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/route" element={<RouteOverview />} />
              <Route path="/logs" element={<ELDLogs />} />
              <Route path="/compliance" element={<Compliance />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        </Router>
      </TripContext.Provider>
    </DarkModeContext.Provider>
  );
}

export default App;

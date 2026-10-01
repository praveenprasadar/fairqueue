import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { AdminLayout } from './components/layout/AdminLayout';

// Admin Page Imports
import { AdminLogin } from './pages/admin/Login';
import { Overview } from './pages/admin/Overview';
import { Events } from './pages/admin/Events';
import { Inventory } from './pages/admin/Inventory';
import { WaitingRoom } from './pages/admin/WaitingRoom';
import { AdmissionControl } from './pages/admin/AdmissionControl';
import { BotMonitoring } from './pages/admin/BotMonitoring';
import { ActiveHolds } from './pages/admin/ActiveHolds';
import { Orders } from './pages/admin/Orders';
import { Concurrency } from './pages/admin/Concurrency';
import { LoadTesting } from './pages/admin/LoadTesting';
import { Alerts } from './pages/admin/Alerts';
import { Settings } from './pages/admin/Settings';

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Admin Authentication Route */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Admin Dashboard Shell */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Overview />} />
              <Route path="events" element={<Events />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="waiting-room" element={<WaitingRoom />} />
              <Route path="admission-control" element={<AdmissionControl />} />
              <Route path="bot-monitoring" element={<BotMonitoring />} />
              <Route path="active-holds" element={<ActiveHolds />} />
              <Route path="orders" element={<Orders />} />
              <Route path="concurrency" element={<Concurrency />} />
              <Route path="load-testing" element={<LoadTesting />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Root Fallback Redirect to Admin */}
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;

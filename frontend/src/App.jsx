import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Resources from './pages/Resources';
import Scans from './pages/Scans';
import Compliance from './pages/Compliance';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import RiskPage from './pages/RiskPage';
import ThreatSurface from './pages/ThreatSurface';
import ResourceSphere from './pages/ResourceSphere';
import Sitemap from './pages/Sitemap';


const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <div className="relative mb-8">
      <h1 className="text-9xl font-black text-rose-500/10 skew-x-12 select-none pointer-events-none">404</h1>
      <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-black text-rose-500 uppercase tracking-widest whitespace-nowrap">Access Denied</h2>
    </div>
    <p className="text-slate-500 text-xs font-black mb-10 max-w-sm uppercase tracking-tighter">
      The intelligence sector you requested does not exist or has been retracted from the platform.
    </p>
    <a href="/dashboard" className="premium-button">Recalibrate</a>
  </div>
);


import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0f172a',
              color: '#f8fafc',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '1rem',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: '600',
              backdropFilter: 'blur(10px)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />

        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="threat-surface" element={<ThreatSurface />} />
                <Route path="resource-sphere" element={<ResourceSphere />} />
                <Route path="resources" element={<Resources />} />
                <Route path="scans" element={<Scans />} />
                <Route path="compliance" element={<Compliance />} />
                <Route path="settings" element={<Settings />} />
                <Route path="reports" element={<Reports />} />
                <Route path="sitemap" element={<Sitemap />} />
                <Route path="risk" element={<RiskPage />} />

              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}


export default App;

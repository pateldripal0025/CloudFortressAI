import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Risks from './pages/Risks';
import Resources from './pages/Resources';
import Scans from './pages/Scans';
import Compliance from './pages/Compliance';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="risks" element={<Risks />} />
          <Route path="resources" element={<Resources />} />
          <Route path="scans" element={<Scans />} />
          <Route path="compliance" element={<Compliance />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

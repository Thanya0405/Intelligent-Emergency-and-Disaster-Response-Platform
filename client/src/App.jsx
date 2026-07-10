import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import AccidentDetection from './pages/AccidentDetection';
import SOS from './pages/SOS';
import FirstAid from './pages/FirstAid';
import Disasters from './pages/Disasters';
import Hospitals from './pages/Hospitals';
import Family from './pages/Family';
import VoiceAssistant from './pages/VoiceAssistant';
import Reports from './pages/Reports';
import CommandCenter from './pages/CommandCenter';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Onboarding - Protected but bypass onboarding-complete check inside ProtectedRoute */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />

        {/* Private Dashboard Console Routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/accident-detection" element={<AccidentDetection />} />
          <Route path="/sos" element={<SOS />} />
          <Route path="/first-aid" element={<FirstAid />} />
          <Route path="/disasters" element={<Disasters />} />
          <Route path="/hospitals" element={<Hospitals />} />
          <Route path="/family" element={<Family />} />
          <Route path="/voice-assistant" element={<VoiceAssistant />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/command-center" element={<CommandCenter />} />
          
          {/* Admin role gate */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roleRequired="admin">
                <Admin />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { ToastProvider } from './context/ToastProvider';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import VerifyPage from './pages/VerifyPage';
import DashboardPage from './pages/DashboardPage';
import ScansPage from './pages/ScansPage';
import MindPage from './pages/MindPage';
import SolacePage from './pages/SolacePage';
import InsightsPage from './pages/InsightsPage';
import DailyReportPage from './pages/DailyReportPage';

export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Marketing */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/hero" element={<Navigate to="/" replace />} />

            {/* Auth */}
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />

            {/* Public report verification (for doctors — no sign-in) */}
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/verify/:reportId" element={<VerifyPage />} />

            {/* App (requires sign-in) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/scans" element={<ScansPage />} />
              <Route path="/mind" element={<MindPage />} />
              <Route path="/solace" element={<SolacePage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/report/daily" element={<DailyReportPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;

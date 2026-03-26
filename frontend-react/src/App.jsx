import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EventsPage from './pages/EventsPage';
import CreateEventPage from './pages/CreateEventPage';
import UserManagementPage from './pages/UserManagementPage';
import AddUserPage from './pages/AddUserPage';
import ConflictResolutionPage from './pages/ConflictResolutionPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Login — no navbar */}
          <Route path="/login" element={<LoginPage />} />

          {/* All other pages — with navbar */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/create" element={<CreateEventPage />} />
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/users/add" element={<AddUserPage />} />
            <Route path="/conflict" element={<ConflictResolutionPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

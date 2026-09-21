import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminResetPassword from './pages/AdminResetPassword';
import { getToken, getUser } from './utils/auth';

// Guard: wajib sudah login untuk mengakses halaman dalamnya.
function Protected({ children }) {
  if (!getToken()) {
    return <Navigate to="/" replace />;
  }
  return children;
}

// Guard: khusus admin (id_role = 1).
function RequireAdmin() {
  const user = getUser();
  if (!getToken()) {
    return <Navigate to="/" replace />;
  }
  if (!user || user.id_role !== 1) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}

function App() {
  return (
    <Routes>
      {/* Root langsung menampilkan halaman Login (Warm Split-Screen) */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/demo/dashboard" element={<Dashboard demo />} />

      {/* Halaman yang butuh login */}
      <Route
        path="/dashboard"
        element={
          <Protected>
            <Dashboard />
          </Protected>
        }
      />

      {/* Khusus admin */}
      <Route path="/admin" element={<RequireAdmin />}>
        <Route path="reset-password" element={<AdminResetPassword />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

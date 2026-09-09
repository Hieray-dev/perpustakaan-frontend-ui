import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Routes>
      {/* Rute Halaman Login */}
      <Route path="/" element={<Login />} />
      
      {/* Rute Halaman Dashboard */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Rute fallback ke Login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

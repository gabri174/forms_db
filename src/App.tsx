// src/App.tsx
import { useState, useEffect } from 'react';
import './styles/app.css';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PublicFormPage from './pages/PublicFormPage';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="loading-screen">Cargando...</div>;
  }

  // Ruta pública para el formulario de registro
  const path = window.location.pathname;
  if (path === '/registro' || path === '/formulario' || path === '/register') {
    return <PublicFormPage />;
  }

  return token ? (
    <DashboardPage token={token} onLogout={() => {
      localStorage.removeItem('token');
      setToken(null);
    }} />
  ) : (
    <LoginPage onLogin={(token) => {
      localStorage.setItem('token', token);
      setToken(token);
    }} />
  );
}

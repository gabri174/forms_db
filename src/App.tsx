// src/App.tsx
import { useState, useEffect } from 'react';
import './styles/App.css';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="loading-screen">Cargando...</div>;
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

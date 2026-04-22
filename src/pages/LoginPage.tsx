// src/pages/LoginPage.tsx
import { useState } from 'react';
import '../styles/login.css';

export default function LoginPage({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const payload = isRegister 
        ? { email, password, name }
        : { email, password };

      const response = await fetch(`${apiBase}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error en la autenticación');
        return;
      }

      if (isRegister) {
        setError('');
        setIsRegister(false);
        setEmail('');
        setPassword('');
        setName('');
        alert('Usuario SuperAdmin creado. Inicia sesión');
      } else {
        onLogin(data.token);
      }
    } catch (err: any) {
      setError('Error de conexión. Verifica que el backend está activo');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>Empresas BD</h1>
          <p>Gestión centralizada de datos empresariales</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          {isRegister && (
            <div className="form-group">
              <label>Nombre Completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Procesando...' : isRegister ? 'Crear SuperAdmin' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isRegister ? '¿Ya tienes cuenta? ' : '¿Primera vez? '}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="link-btn"
            >
              {isRegister ? 'Inicia sesión' : 'Crear SuperAdmin'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

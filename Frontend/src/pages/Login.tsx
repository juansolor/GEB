import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user, login } = useAuth();

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-600">GEB</h1>
          <h2 className="header-title mt-6 text-3xl">
            Iniciar Sesión
          </h2>
          <p className="card-text mt-2 text-sm">
            Sistema de Gestión Empresarial
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message-high-contrast">
                {error}
              </div>
            )}

            <div className="form-group-high-contrast">
              <label htmlFor="username" className="label-high-contrast label-required">
                Usuario
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-high-contrast w-full"
                  placeholder="Ingresa tu usuario"
                />
              </div>
            </div>

            <div className="form-group-high-contrast">
              <label htmlFor="password" className="label-high-contrast label-required">
                Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-high-contrast w-full"
                  placeholder="Ingresa tu contraseña"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isLoading ? 'btn-disabled-high-contrast' : 'btn-high-contrast-blue'
                }`}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="card-text text-sm">
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-500 font-medium">
                Regístrate aquí
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center text-sm">
            <p className="card-text">Usuario de prueba: admin</p>
            <p className="card-text">Contraseña: la que configuraste</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

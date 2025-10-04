import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: 'admin' | 'manager' | 'employee';
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'employee'
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.username.trim()) {
      newErrors.push('El nombre de usuario es requerido');
    }

    if (!formData.email.trim()) {
      newErrors.push('El email es requerido');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.push('El email no tiene un formato válido');
    }

    if (!formData.password) {
      newErrors.push('La contraseña es requerida');
    } else if (formData.password.length < 6) {
      newErrors.push('La contraseña debe tener al menos 6 caracteres');
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.push('Las contraseñas no coinciden');
    }

    if (!formData.first_name.trim()) {
      newErrors.push('El nombre es requerido');
    }

    if (!formData.last_name.trim()) {
      newErrors.push('El apellido es requerido');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      const { confirmPassword, ...dataToSend } = formData;
      
      const response = await axios.post('http://localhost:8000/api/users/register/', dataToSend);
      
      if (response.status === 201) {
        alert('Usuario registrado exitosamente. Ahora puedes iniciar sesión.');
        navigate('/login');
      }
    } catch (err: any) {
      if (err.response?.data) {
        const errorMessages: string[] = [];
        
        Object.keys(err.response.data).forEach(key => {
          if (Array.isArray(err.response.data[key])) {
            errorMessages.push(...err.response.data[key]);
          } else {
            errorMessages.push(err.response.data[key]);
          }
        });
        
        setErrors(errorMessages);
      } else {
        setErrors(['Error al registrar usuario. Intenta de nuevo.']);
      }
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
            Crear Cuenta
          </h2>
          <p className="card-text mt-2 text-sm">
            Sistema de Gestión Empresarial
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errors.length > 0 && (
              <div className="error-message-high-contrast">
                <ul className="list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="form-group-high-contrast">
                <label htmlFor="first_name" className="label-high-contrast">
                  Nombre
                </label>
                <div className="mt-1">
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                    className="input-high-contrast"
                    placeholder="Tu nombre"
                  />
                </div>
              </div>

              <div className="form-group-high-contrast">
                <label htmlFor="last_name" className="label-high-contrast">
                  Apellido
                </label>
                <div className="mt-1">
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={handleChange}
                    className="input-high-contrast"
                    placeholder="Tu apellido"
                  />
                </div>
              </div>
            </div>

            <div className="form-group-high-contrast">
              <label htmlFor="username" className="label-high-contrast">
                Nombre de Usuario
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="input-high-contrast"
                  placeholder="Nombre de usuario único"
                />
              </div>
            </div>

            <div className="form-group-high-contrast">
              <label htmlFor="email" className="label-high-contrast">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-high-contrast"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div className="form-group-high-contrast">
              <label htmlFor="phone" className="label-high-contrast">
                Teléfono
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-high-contrast"
                  placeholder="Número de teléfono"
                />
              </div>
            </div>

            <div className="form-group-high-contrast">
              <label htmlFor="role" className="label-high-contrast">
                Rol
              </label>
              <div className="mt-1">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="select-high-contrast"
                >
                  <option value="employee">Empleado</option>
                  <option value="manager">Gerente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>

            <div className="form-group-high-contrast">
              <label htmlFor="password" className="label-high-contrast">
                Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-high-contrast"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>

            <div className="form-group-high-contrast">
              <label htmlFor="confirmPassword" className="label-high-contrast">
                Confirmar Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-high-contrast"
                  placeholder="Repite tu contraseña"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`${
                  isLoading ? 'btn-high-contrast-gray' : 'btn-high-contrast-primary'
                } w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? 'Registrando...' : 'Crear Cuenta'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="card-text text-sm">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-500 font-medium">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

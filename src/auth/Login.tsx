import React, { useEffect, useState } from 'react';
import { api } from '../Users/user';
import { useNavigate } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';

const SESSION_KEY = 'authSession';

type LoginFormProps = {
  onLogin?: () => void;
};

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [configuration, setConfiguration] = useState({ logo_primary_base64: '', institution_name: 'RIS System' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(api + '/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo, contrasena }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || 'Credenciales incorrectas');
        setLoading(false);
        return;
      }

      const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 horas
      localStorage.setItem(
        'usuario',
        JSON.stringify({
          token: data.token,
          user: data.user,
        })
      );
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          token: data.token,
          user: data.user,
          expiresAt,
        })
      );
      if (onLogin) onLogin();
      navigate('/');
    } catch (error) {
      console.error('Error de login:', error);
      alert('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const config = async () => {
      try {
        const response = await fetch(api + '/api/settings');
        const data = await response.json();
        setConfiguration(data);
      } catch (error) {
        console.error(error);
      }
    }
    config();
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-dark/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-dark/30 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="flex flex-col items-center justify-center z-10 w-full px-4">
        <div className="mb-8 flex flex-col items-center animate-fade-in-up">
          {configuration.logo_primary_base64 ? (
            <img
              src={configuration.logo_primary_base64}
              alt="Logo"
              className="py-2 h-20 object-contain drop-shadow-[0_0_15px_rgba(6,105,82,0.5)]"
            />
          ) : (
            <img
              src="/ris_logo.svg"
              alt="Radiant RIS Logo"
              className="w-24 h-24 object-contain drop-shadow-[0_0_20px_rgba(74,254,240,0.3)] mb-2"
            />
          )}
          <h1 className="text-3xl font-bold text-white tracking-wide mt-2">
            {configuration.institution_name || 'Sistema RIS'}
          </h1>
          <p className="text-gray-400 text-sm mt-2">Plataforma Radiológica Integral</p>
        </div>

        <form
          className="w-full max-w-md rounded-2xl border border-white/10 bg-primary-dark/30 backdrop-blur-xl p-8 shadow-2xl animate-fade-in-up transition-all hover:border-primary-main/50"
          onSubmit={handleSubmit}
        >
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white">Iniciar Sesión</h2>
            <p className="text-gray-400 text-sm mt-1">Ingresa tus credenciales para continuar</p>
          </div>

          <div className="mb-5">
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              placeholder="usuario@institucion.com"
              value={correo}
              onChange={e => setCorreo(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 p-3.5 text-white placeholder-gray-500 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="mb-8">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={contrasena}
              onChange={e => setContrasena(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 p-3.5 text-white placeholder-gray-500 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-primary-main to-secondary-main p-4 text-lg font-bold text-white shadow-[0_4px_14px_0_rgba(6,105,82,0.39)] hover:shadow-[0_6px_20px_rgba(6,105,82,0.23)] hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-primary-light disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Autenticando...
              </span>
            ) : (
              'Ingresar al Sistema'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;

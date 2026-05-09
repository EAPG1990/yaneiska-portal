import React, { useState } from 'react';
import { User, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await authService.login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Usuario o contraseña incorrectos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex items-center justify-center p-4 arabic-pattern-bg">
      <main className="w-full max-w-[440px] px-8 py-12 relative z-10">
        
        {/* Branding Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 rounded-full border-2 border-secondary-container flex items-center justify-center bg-primary-container shadow-md overflow-hidden p-2">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain brightness-110" />
            </div>
          </div>
          <h1 className="font-serif text-2xl md:text-2xl text-primary mb-2 leading-tight px-4">
            Estudio de Danza del Vientre y Artes Corporales Jimena González
          </h1>
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-on-surface-variant font-bold">
            Portal de Gestión Administrativa
          </p>
        </div>

        {/* Central Form Card */}
        <section className="bg-white rounded-xl p-6 golden-border-detail silk-shadow relative overflow-hidden">
          {/* Decorative Accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-primary-container"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded text-sm text-center font-bold border border-red-100">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-secondary font-bold" htmlFor="username">
                Identificación de Usuario
              </label>
              <div className="relative">
                <User className="absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
                <input
                  className="input-elegant w-full pl-8 py-2 text-on-surface placeholder-on-surface-variant/50"
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-secondary font-bold" htmlFor="password">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
                <input
                  className="input-elegant w-full pl-8 py-2 text-on-surface placeholder-on-surface-variant/50"
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300 text-primary-container focus:ring-secondary" 
                />
                <span className="text-sm text-on-surface-variant group-hover:text-primary transition-colors">
                  Recordarme
                </span>
              </label>
              <a href="#" className="text-sm text-primary-container hover:text-primary underline-offset-4 hover:underline transition-colors">
                ¿Olvidó su contraseña?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-container text-gold uppercase tracking-widest text-xs font-bold py-4 rounded hover:bg-primary transition-all duration-300 shadow-md flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Acceder al Portal</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Note */}
          <div className="mt-12 pt-6 border-t border-surface-container-highest text-center">
            <p className="text-sm text-on-surface-variant">
              ¿Dificultades para ingresar? <br />
              <a href="#" className="text-secondary font-bold hover:text-primary transition-colors">
                Contactar Soporte
              </a>
            </p>
          </div>
        </section>

        <footer className="mt-8 text-center">
          <p className="text-[10px] text-on-surface-variant tracking-[0.2em] font-bold">
            PRECISIÓN • DISCIPLINA • ARTE
          </p>
        </footer>
      </main>

      {/* Background Decorations */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute -top-24 -left-24 w-96 h-96 transform rotate-12">
          <div className="w-full h-full rounded-full bg-primary-container mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>
        <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px]">
          <div className="w-full h-full rounded-full bg-secondary-container mix-blend-multiply filter blur-3xl opacity-10"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;

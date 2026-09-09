import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface RegistroProps {
  onRegisterSuccess: (user: any) => void;
  onGoToLogin: () => void;
}

export default function Registro({ onRegisterSuccess, onGoToLogin }: RegistroProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Intentar insertar el nuevo usuario
      const { data, error: supaError } = await supabase
        .from('usuarios')
        .insert([{ username, password }])
        .select()
        .single();

      if (supaError) {
        if (supaError.code === '23505') { // Unique violation
          throw new Error('El nombre de usuario ya está en uso. Elige otro.');
        }
        throw new Error('Error al registrar el usuario.');
      }

      // Éxito
      onRegisterSuccess(data);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-card">
        <h2>Crear Cuenta</h2>
        <p className="subtitle">Únete y empieza a registrar tus figuras</p>
        
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Nombre de Usuario</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej: nuevo_coleccionista"
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
              minLength={4}
            />
          </div>
          
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="auth-link">
          ¿Ya tienes cuenta? <span onClick={onGoToLogin}>Inicia Sesión</span>
        </div>
      </div>
    </div>
  );
}

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import { useNavigate } from 'react-router-dom';

// Define the User interface based on what the API returns
export interface User {
  id_usuario: number;
  carnet: string;
  nombre_completo: string;
  correo: string;
  rol: 'PACIENTE' | 'MEDICO' | 'ADMIN';
  pais: string;
  estado: string;
  id_paciente?: number;
  id_medico?: number;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (carnet: string, pass: string) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  logout: () => void;
  pais: string;
  setPais: (pais: string) => void;
  switchRole: (role: 'PACIENTE' | 'MEDICO' | 'ADMIN') => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [pais, setPais] = useState<string>('NI'); // Default to Nicaragua

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        } catch (err) {
          console.error('Auth check failed', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else {
        // Intento de Login via Portal (Single Sign On)
        try {
          const res = await api.get('/auth/session-portal');
          if (res.data?.authenticated) {
             console.log('Portal session detected, logging in...');
             const { access_token, user } = res.data;
             localStorage.setItem('token', access_token);
             localStorage.setItem('user', JSON.stringify(user));
             setUser(user);
             if (user.pais) setPais(user.pais);
             
             // Redirigir si estamos en la página de login
             if (window.location.pathname.includes('/login')) {
               navigate(getDashboardUrl(user.rol));
             }
          }
        } catch (err) {
          console.warn('Silent portal SSO check failed or no session:', err);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const getDashboardUrl = (rol: string) => {
    switch (rol) {
      case 'PACIENTE': return '/paciente/dashboard';
      case 'MEDICO': return '/medico/dashboard';
      case 'ADMIN': return '/admin/dashboard';
      default: return '/dashboard';
    }
  };

  const login = async (carnet: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { carnet, password: pass });
      const { access_token, user } = response.data;

      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      const redirectUrl = getDashboardUrl(user.rol);
      navigate(redirectUrl);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Error al iniciar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithToken = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/sso-login', { token });
      const { access_token, user } = response.data;

      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      const redirectUrl = getDashboardUrl(user.rol);
      navigate(redirectUrl);
    } catch (err: any) {
      console.error('SSO Login failure DETAILS:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      setError(err.response?.data?.message || 'Error en autenticación SSO');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const switchRole = (newRole: 'PACIENTE' | 'MEDICO' | 'ADMIN') => {
    if (user) {
      const updatedUser = { ...user, rol: newRole };
      setUser(updatedUser);
      // In a real app, you might want to validate if the user HAS this role
      // For now, we just switch the UI context
      const redirectUrl = getDashboardUrl(newRole);
      navigate(redirectUrl);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, loginWithToken, logout, pais, setPais, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

// Export useAuth here as well for convenience, though existing code might use the hook file
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

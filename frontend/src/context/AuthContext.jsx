import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, TOKEN_KEY } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelado = false;

    async function recuperarSesion() {
      const tokenGuardado = localStorage.getItem(TOKEN_KEY);

      if (!tokenGuardado) {
        if (!cancelado) setCargando(false);
        return;
      }

      try {
        const respuesta = await api.get('/auth/me');
        if (!cancelado) setUsuario(respuesta.usuario);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        if (!cancelado) {
          setToken(null);
          setUsuario(null);
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    recuperarSesion();

    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    function cerrarSesion() {
      setToken(null);
      setUsuario(null);
    }

    window.addEventListener('auth:expirada', cerrarSesion);
    return () => window.removeEventListener('auth:expirada', cerrarSesion);
  }, []);

  const iniciarSesion = useCallback(async (email, password) => {
    const respuesta = await api.post('/auth/login', { email, password }, { auth: false });
    localStorage.setItem(TOKEN_KEY, respuesta.token);
    setToken(respuesta.token);
    setUsuario(respuesta.usuario);
    return respuesta.usuario;
  }, []);

  const registrarse = useCallback(async (datos) => {
    const respuesta = await api.post('/auth/register', datos, { auth: false });
    localStorage.setItem(TOKEN_KEY, respuesta.token);
    setToken(respuesta.token);
    setUsuario(respuesta.usuario);
    return respuesta.usuario;
  }, []);

  const cerrarSesion = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({
      usuario,
      token,
      cargando,
      iniciarSesion,
      registrarse,
      cerrarSesion,
    }),
    [usuario, token, cargando, iniciarSesion, registrarse, cerrarSesion]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }

  return contexto;
}

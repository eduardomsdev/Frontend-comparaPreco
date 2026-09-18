import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setAuthToken, setUnauthorizedHandler } from '../services/api/client';
import { getCurrentUser, login as loginRequest, register as registerRequest } from '../services/api/authApi';
import { clearSession, loadSession, saveSession } from '../utils/tokenStorage';
import type { LoginRequest, RegisterRequest, UserResponse } from '../schemas/api';

type AuthStatus = 'loading' | 'signedIn' | 'signedOut';

interface AuthContextValue {
  status: AuthStatus;
  user: UserResponse | null;
  signIn: (payload: LoginRequest) => Promise<void>;
  signUp: (payload: RegisterRequest) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<UserResponse | null>(null);

  const signOut = useCallback(async () => {
    setAuthToken(null);
    await clearSession();
    setUser(null);
    setStatus('signedOut');
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void signOut();
    });
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  useEffect(() => {
    (async () => {
      try {
        const session = await loadSession();

        if (!session || session.expiresAt <= Date.now()) {
          if (session) {
            await clearSession();
          }
          setStatus('signedOut');
          return;
        }

        setAuthToken(session.token);
        try {
          const me = await getCurrentUser();
          setUser(me);
          setStatus('signedIn');
        } catch {
          // Token pode ter sido revogado/expirado no servidor mesmo com data local válida.
          setAuthToken(null);
          await clearSession();
          setStatus('signedOut');
        }
      } catch {
        // Falha ao ler o storage local (ex: indisponível na plataforma atual):
        // não deixa o app preso em "carregando", trata como deslogado.
        setStatus('signedOut');
      }
    })();
  }, []);

  const signIn = useCallback(async (payload: LoginRequest) => {
    const auth = await loginRequest(payload);
    setAuthToken(auth.token);
    await saveSession(auth.token, auth.expiresInMs);
    const me = await getCurrentUser();
    setUser(me);
    setStatus('signedIn');
  }, []);

  const signUp = useCallback(async (payload: RegisterRequest) => {
    await registerRequest(payload);
    await loginRequest({ email: payload.email, password: payload.password }).then(async (auth) => {
      setAuthToken(auth.token);
      await saveSession(auth.token, auth.expiresInMs);
    });
    const me = await getCurrentUser();
    setUser(me);
    setStatus('signedIn');
  }, []);

  const value = useMemo(
    () => ({ status, user, signIn, signUp, signOut }),
    [status, user, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

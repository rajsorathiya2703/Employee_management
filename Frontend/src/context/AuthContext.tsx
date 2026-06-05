import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import axiosInstance from '../service/axios';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Storage helpers ───────────────────────────────────────────────────────────

const TOKEN_KEY = 'emp_access_token';
const USER_KEY  = 'emp_user';

const persist = (token: string, user: AuthUser) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const clear = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const loadStored = (): { token: string | null; user: AuthUser | null } => {
  const token = localStorage.getItem(TOKEN_KEY);
  const raw   = localStorage.getItem(USER_KEY);
  try {
    return { token, user: raw ? (JSON.parse(raw) as AuthUser) : null };
  } catch {
    return { token: null, user: null };
  }
};

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = loadStored();

  const [state, setState] = useState<AuthState>({
    user:            stored.user,
    accessToken:     stored.token,
    isAuthenticated: !!(stored.token && stored.user),
    isLoading:       false,
  });

  // Silently refresh the access token on mount if we have a stored session
  const tryRefresh = useCallback(async () => {
    if (!state.accessToken) return;
    try {
      const res = await axiosInstance.post('/auth/refresh-token');
      const newToken: string = res.data.data.accessToken;
      localStorage.setItem(TOKEN_KEY, newToken);
      setState((s) => ({ ...s, accessToken: newToken, isAuthenticated: true }));
    } catch {
      // Refresh failed — clear session and force re-login
      clear();
      setState({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    tryRefresh();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Login ──────────────────────────────────────────────────────────────────

  const login = async (email: string, password: string) => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      const res = await axiosInstance.post('/auth/login', { email, password });
      const { accessToken, employee } = res.data.data as {
        accessToken: string;
        employee: AuthUser;
      };
      persist(accessToken, employee);
      setState({
        user: employee,
        accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      setState((s) => ({ ...s, isLoading: false }));
      throw err;
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────────

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch {
      // Best-effort
    }
    clear();
    setState({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
  };

  // ── Register ───────────────────────────────────────────────────────────────

  const register = async (
    name: string,
    email: string,
    password: string,
    phone?: string
  ) => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      await axiosInstance.post('/auth/register', { name, email, password, phone });
    } finally {
      setState((s) => ({ ...s, isLoading: false }));
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

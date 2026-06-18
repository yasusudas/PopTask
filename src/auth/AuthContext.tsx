import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { authErrorMessage } from "./authErrors";
import { auth, isAuthEnabled } from "../lib/firebase";

interface AuthContextValue {
  enabled: boolean;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isAuthEnabled);

  useEffect(() => {
    if (!isAuthEnabled || !auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (next) => {
      setUser(next);
      setLoading(false);
    });
    return unsub;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!auth) throw new Error("Auth is not initialized");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      const code = (err as { code?: string }).code ?? "unknown";
      throw new Error(authErrorMessage(code));
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!auth) throw new Error("Auth is not initialized");
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      const code = (err as { code?: string }).code ?? "unknown";
      throw new Error(authErrorMessage(code));
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!auth) throw new Error("Auth is not initialized");
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err) {
      const code = (err as { code?: string }).code ?? "unknown";
      throw new Error(authErrorMessage(code));
    }
  }, []);

  const logout = useCallback(async () => {
    if (!auth) return;
    await signOut(auth);
  }, []);

  const value = useMemo(
    () => ({
      enabled: isAuthEnabled,
      user,
      loading,
      signIn,
      signUp,
      resetPassword,
      logout,
    }),
    [user, loading, signIn, signUp, resetPassword, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

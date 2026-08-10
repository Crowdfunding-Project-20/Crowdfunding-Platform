"use client";

/**
 * AuthContext — global auth state for the app.
 *
 * - Rehydrates the session from localStorage on mount (no flash of "logged out")
 * - login() hits /api/auth/login via the shared api helper and stores the JWT
 * - logout() clears the token and user state
 * - Role/email come from the AuthResponse body, not re-derived from the raw JWT
 *   in multiple places. The JWT payload is only read on rehydration as a fallback.
 */

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, TOKEN_KEY, ApiError } from "@/lib/api";

type Role = "USER" | "ADMIN";

type User = {
  email: string;
  username: string;
  role: Role;
};

type AuthSession = { token: string; email: string; username: string; role: Role };

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  /** identifier may be an email or a username */
  login: (identifier: string, password: string) => Promise<void>;
  /** Persist a session obtained outside login() (e.g. from register). */
  setSession: (session: AuthSession) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Decode a JWT payload client-side. Returns null if the token is malformed. */
function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    // base64url → base64, then atob
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(TOKEN_KEY);
      if (stored) {
        const payload = decodeJwt(stored);
        if (payload) {
          // Prefer the backend's AuthResponse shape; fall back to JWT claims
          const email = (payload.email as string) || (payload.sub as string) || "";
          const username = (payload.username as string) || "";
          const role = (payload.role as Role) || "USER";
          if (email) {
            setUser({ email, username, role });
            setToken(stored);
          } else {
            // No usable identity — drop it
            localStorage.removeItem(TOKEN_KEY);
          }
        } else {
          // Malformed token — drop it
          localStorage.removeItem(TOKEN_KEY);
        }
      }
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }, []);

  const setSession = useCallback((session: AuthSession) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, session.token);
    }
    setToken(session.token);
    setUser({ email: session.email, username: session.username, role: session.role });
  }, []);

  const login = useCallback(
    async (identifier: string, password: string) => {
      const data = await api.post<AuthSession>("/api/auth/login", { identifier, password });
      setSession(data);
    },
    [setSession],
  );

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
    }
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, setSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

export { ApiError };

import * as React from "react";
import type { Role, User } from "@/types";
import { users } from "@/data/seed";

interface AuthContextValue {
  user: User;
  role: Role;
  isAuthenticated: boolean;
  login: (role: Role) => void;
  logout: () => void;
  switchRole: (role: Role) => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

/** Representative demo account for each role, used by the role switcher. */
const DEMO_BY_ROLE: Record<Role, User> = {
  owner: users.find((u) => u.role === "owner")!,
  admin: users.find((u) => u.role === "admin")!,
  editor: users.find((u) => u.role === "editor")!,
  writer: users.find((u) => u.role === "writer")!,
};

const STORAGE_KEY = "trinance.auth.role";

function loadPersistedRole(): Role | null {
  try {
    const r = localStorage.getItem(STORAGE_KEY) as Role | null;
    return r && ["owner", "admin", "editor", "writer"].includes(r) ? r : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Start signed-out so the login screen (with role selection) is the entry point,
  // but rehydrate the session from localStorage so a refresh keeps you signed in.
  const [user, setUser] = React.useState<User | null>(() => {
    const r = loadPersistedRole();
    return r ? DEMO_BY_ROLE[r] : null;
  });

  const persist = (role: Role | null) => {
    try {
      if (role) localStorage.setItem(STORAGE_KEY, role);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable — session stays in memory only */
    }
  };

  const login = (role: Role) => { setUser(DEMO_BY_ROLE[role]); persist(role); };
  const logout = () => { setUser(null); persist(null); };
  const switchRole = (role: Role) => { setUser(DEMO_BY_ROLE[role]); persist(role); };

  const value: AuthContextValue = {
    user: user ?? DEMO_BY_ROLE.owner,
    role: (user ?? DEMO_BY_ROLE.owner).role,
    isAuthenticated: user !== null,
    login,
    logout,
    switchRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

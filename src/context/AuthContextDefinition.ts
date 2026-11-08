import { createContext, useContext } from "react";
import type { User, Session } from "@supabase/supabase-js";

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  isDemo: boolean;
}

export interface AuthContextType {
  user: User | DemoUser | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null; user?: User | null }>;
  signOut: () => Promise<void>;
  signInAsDemo: (name?: string, email?: string) => void;
  openAuthModal: (promptReason?: string) => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  authModalPrompt: string;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};


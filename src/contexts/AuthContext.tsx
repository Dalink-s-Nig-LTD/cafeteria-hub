import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { UserRole } from "@/types/cafeteria";
import type { Id } from "../../convex/_generated/dataModel";

interface AuthContextType {
  role: UserRole;
  isLoading: boolean;
  isAuthenticated: boolean;
  code: string | null;
  userName: string | null;
  login: (code: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(null);
  const [code, setCode] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const useCodeMutation = useMutation(api.accessCodes.useCode);
  const signOutMutation = useMutation(api.adminAuth.signOut);

  // Check for existing session on mount
  useEffect(() => {
    const sessionId = localStorage.getItem("sessionId");
    const storedRole = localStorage.getItem("userRole");
    const storedName = localStorage.getItem("userName");

    if (sessionId && storedRole) {
      // Check session expiration (24 hours)
      const sessionCreated = parseInt(
        localStorage.getItem("sessionCreated") || "0",
      );
      const sessionExpiry = sessionCreated + 24 * 60 * 60 * 1000;

      if (Date.now() > sessionExpiry) {
        // Session expired, clear storage
        localStorage.removeItem("sessionId");
        localStorage.removeItem("userRole");
        localStorage.removeItem("cashierCode");
        localStorage.removeItem("userName");
        localStorage.removeItem("sessionCreated");
        return;
      }

      setRole(storedRole as UserRole);
      setUserName(storedName);
      if (storedRole === "cashier") {
        setCode(localStorage.getItem("cashierCode"));
      }
    }
  }, []);

  const login = async (
    inputCode: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Validate the code via Convex
      const result = await useCodeMutation({ code: inputCode });

      if (result && result.role) {
        setRole(result.role);
        setCode(inputCode);
        localStorage.setItem("userRole", result.role);
        localStorage.setItem("cashierCode", inputCode);
        return { success: true };
      }

      return { success: false, error: "Incorrect Access Code" };
    } catch (error) {
      console.error("Login error:", error);
      let errorMsg = "Incorrect Access Code";
      if (error instanceof Error) {
        errorMsg = error.message;
      }
      return {
        success: false,
        error: errorMsg,
      };
    }
  };

  const logout = async () => {
    const sessionId = localStorage.getItem("sessionId");

    if (sessionId && role === "admin") {
      try {
        await signOutMutation({ sessionId: sessionId as Id<"sessions"> });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }

    setRole(null);
    setCode(null);
    setUserName(null);
    localStorage.removeItem("sessionId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("cashierCode");
    localStorage.removeItem("userName");
  };

  const isAuthenticated = role !== null;
  const isLoading = false;

  return (
    <AuthContext.Provider
      value={{
        role,
        isLoading,
        isAuthenticated,
        code,
        userName,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

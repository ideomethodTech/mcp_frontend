"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check for token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setUser({ token });
    }
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUserInfo(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signOut = () => {
    localStorage.removeItem("token");
    // localStorage.removeItem("user");
    setUser(null);
    setUserInfo(null);
    router.push("/login");
  };

  return <AuthContext.Provider value={{ user, loading, signOut ,userInfo }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

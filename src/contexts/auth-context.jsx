"use client";

import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api/queryFunctions";
import { toast } from "react-toastify";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const signInWithEmail = async (email, password) => {
    try {
      const response = await loginUser({ email, password });
      setUser(response);
      toast.success("Successfully signed in!");
      return response;
    } catch (error) {
      toast.error(error.message || "Failed to sign in");
      throw error;
    }
  };

  const signUpWithEmail = async (email, password) => {
    try {
      const response = await loginUser({ email, password });
      setUser(response);
      toast.success("Account created!");
      return response;
    } catch (error) {
      toast.error(error.message || "Failed to sign up");
      throw error;
    }
  };

  const signOut = async () => {
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signInWithEmail, signUpWithEmail, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

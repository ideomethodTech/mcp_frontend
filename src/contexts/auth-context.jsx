"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import api from "@/lib/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const fakeUser = {
        uid: "dev-user-123",
        email: "dev@example.com",
        username: "Dev User",
      };
      console.log("🚀 Development mode: Auto-login active");
      setUser(fakeUser);
      setLoading(false);
      return;
    }

    // Check for existing session
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signInWithEmail = async (email, password) => {
    try {
      const response = await api({
        url: "/login",
        method: "POST",
        data: {
          email: email,
          password: password,
        },
      });

      const userData = response.data;

      localStorage.setItem("user", JSON.stringify(userData));
      if (userData.access_token) {
        localStorage.setItem("access_token", userData.access_token);
      }

      setUser(userData);
      toast.success("Successfully signed in!");
      return userData;
    } catch (error) {
      console.error("Login error:", error);

      if (error.response?.status === 401) {
        toast.error("Invalid email or password.");
      } else if (error.response?.status === 404) {
        toast.error("No account found with this email.");
      } else {
        toast.error(error.message || "Failed to sign in. Please try again.");
      }

      throw error;
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

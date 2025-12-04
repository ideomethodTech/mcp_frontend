"use client";

import { useLogin } from "@/lib/api/queries";
import { toast } from "react-toastify";
import { AuthForm } from "@/components/ui/AuthForm";

export default function LoginPage() {
  const loginMutation = useLogin({
    onSuccess: (data) => {
      console.log("Login successful, data:", data);

      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
      }
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      localStorage.setItem("user", JSON.stringify(data));

      toast.success("Welcome back! Successfully logged in");

      window.location.href = "/";
    },
    onError: (error) => {
      console.error("Login failed:", error);
      toast.error(error.response?.data?.message  || "Invalid email or password");
    },
  });

  function onSubmit(values) {
    loginMutation.mutate({
      email: values.email,
      password: values.password,
    });
  }

  return (
    <AuthForm
      type="login"
      onSubmit={onSubmit}
      mutation={loginMutation}
      title="Welcome Back"
      description="Enter your credentials to access your account."
      allowSignup={false}
    />
  );
}

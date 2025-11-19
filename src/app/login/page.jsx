"use client";

import { useLoginOrganization } from "@/lib/api/queries";
import { toast } from "react-toastify";
import { AuthForm } from "@/components/ui/AuthForm";

export default function LoginPage() {
  const loginMutation = useLoginOrganization();

  async function onSubmit(values) {
    try {
      await loginMutation.mutateAsync({
        org_name: values.org_name,
        name: values.name,
        email: values.email,
        password: values.password,
      });
      toast.success("Welcome back! Successfully logged in");
      window.location.href = "/";
    } catch (error) {
      console.error("Login failed:", error);

      // Check if it's a pending approval error
      if (error.response?.data?.detail?.includes("Pending") || error.response?.data?.message?.includes("Pending")) {
        // Redirect to pending approval page
        window.location.href = "/pending-approval";
      } else {
        toast.error(error.response?.data?.message || "Invalid email or password");
      }
    }
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

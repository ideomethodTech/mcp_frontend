"use client";

import { useLoginOrganization } from "@/lib/api/queries";
import { toast } from "react-toastify";
import { AuthForm } from "@/components/ui/AuthForm";

export default function AdminLoginPage() {
  const loginMutation = useLoginOrganization();

  async function onSubmit(values) {
    try {
      await loginMutation.mutateAsync({
        org_name: values.org_name,
        name: values.name,
        email: values.email,
        password: values.password,
      });

      toast.success("Admin access granted! Welcome to admin dashboard");
      window.location.href = "/admin";
    } catch (error) {
      console.error("Admin login failed:", error);
      toast.error(error.response?.data?.message || "Invalid admin credentials");
    }
  }

  return (
    <AuthForm
      type="login"
      onSubmit={onSubmit}
      mutation={loginMutation}
      title="Admin Login"
      description="Enter your credentials to access the dashboard."
      showFooter={false}
      allowSignup={false}
    />
  );
}

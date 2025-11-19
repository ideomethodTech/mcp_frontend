"use client";

import { useRegisterOrganization } from "@/lib/api/queries";
import { toast } from "react-toastify";
import { AuthForm } from "@/components/ui/AuthForm";

export default function SignupPage() {
  const registerMutation = useRegisterOrganization();

  async function onSubmit(values) {
    try {
      await registerMutation.mutateAsync({
        org_name: values.org_name,
        name: values.name,
        email: values.email,
        password: values.password,
      });

      toast.success("Organization created! Welcome admin");
      window.location.href = "/admin"; 
    } catch (error) {
      console.error("Sign up failed:", error);
      let errorMessage = "Failed to create account";
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
    }
  }

  return (
    <AuthForm
      type="signup"
      onSubmit={onSubmit}
      mutation={registerMutation}
      title="Create Organization"
      description="Register your organization to get started."
      linkText="Already have an organization?"
      linkHref="/login"
    />
  );
}

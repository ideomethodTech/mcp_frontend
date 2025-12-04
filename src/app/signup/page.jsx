"use client";

import { useToast } from "@/hooks/use-toast";
import { useRegister } from "@/lib/api/queries";
import { AuthForm } from "@/components/ui/AuthForm";

export default function SignupPage() {
  const { toast } = useToast();

  const registerMutation = useRegister({
    onSuccess: () => {
      toast({
        title: "Account created!",
        description: "Please login with your credentials.",
      });
      window.location.href = "/login";
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.response?.data?.detail || "Failed to create account";

      toast({
        title: "Signup failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (values) => {
    registerMutation.mutate({
      email: values.email,
      password: values.password,
      username: values.username,
      role: "user",
      profile_details: {},
    });
  };

  return (
    <AuthForm
      type="signup"
      onSubmit={handleSubmit}
      mutation={registerMutation}
      title="Create Account"
      description="Register to get started."
      showFooter={true}
    />
  );
}

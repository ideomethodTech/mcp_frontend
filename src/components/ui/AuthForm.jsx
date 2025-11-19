"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/icons";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  org_name: z.string().min(2, "Organization name required."),
  name: z.string().min(2, "Name required."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export function AuthForm({
  type = "login",
  onSubmit,
  mutation,
  title,
  description,
  linkText,
  linkHref,
  showFooter = true,
  allowSignup = false,
}) {
  const storedUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      org_name: storedUser.org_name || "",
      name: storedUser.name || "",
      email: "",
      password: "",
    },
  });

  const defaultTitle = type === "login" ? "Welcome Back" : "Create an Account";
  const defaultDescription =
    type === "login" ? "Enter your credentials to access your account." : "Enter your details to get started.";
  const buttonText = type === "login" ? "Log In" : "Create Account";
  const defaultLinkText = type === "login" ? "Don't have an account?" : "Already have an account?";
  const defaultLinkHref = type === "login" ? "/signup" : "/login";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="font-headline text-2xl">{title || defaultTitle}</CardTitle>
          <CardDescription>{description || defaultDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="org_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Organization" {...field} autoComplete="organization" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{type === "login" ? "Your Name" : "Name"}</FormLabel>
                    <FormControl>
                      <Input placeholder={type === "login" ? "John Doe" : "Your Name"} {...field} autoComplete="name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {buttonText}
              </Button>
            </form>
          </Form>
        </CardContent>
        {showFooter && allowSignup && (
          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              {linkText || defaultLinkText}{" "}
              <Button variant="link" asChild className="p-0">
                <Link href={linkHref || defaultLinkHref}>{type === "login" ? "Sign up" : "Log in"}</Link>
              </Button>
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

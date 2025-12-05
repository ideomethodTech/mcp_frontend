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

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

const signupSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export function AuthForm({ type = "login", onSubmit, mutation, title, description, showFooter = true }) {
  const schema = type === "login" ? loginSchema : signupSchema;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: type === "login" ? { email: "", password: "" } : { username: "", email: "", password: "" },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="font-headline text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {type === "signup" && (
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Choose a username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
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
              <Button type="submit" className="w-full" disabled={mutation?.isPending}>
                {mutation?.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {type === "login" ? "Sign In" : "Create Account"}
              </Button>
            </form>
          </Form>
        </CardContent>
        {showFooter && (
          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              {type === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <Button variant="link" asChild className="p-0">
                <Link href={type === "login" ? "/signup" : "/login"}>{type === "login" ? "Sign up" : "Log in"}</Link>
              </Button>
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

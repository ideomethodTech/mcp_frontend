"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Lock, Loader2, Mail, Key, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    rememberMe: z.boolean().optional(),
});

const signupSchema = z.object({
    username: z.string().min(2, "Username must be at least 2 characters."),
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(6, "Password must be at least 6 characters."),
});

export function ModernAuthForm({ type = "login", onSubmit, mutation }) {
    const router = useRouter();
    const schema = type === "login" ? loginSchema : signupSchema;

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues:
            type === "login"
                ? { email: "", password: "", rememberMe: false }
                : { username: "", email: "", password: "" },
    });

    return (
        <div className="w-full">
            {/* Top Header */}
            <div className="flex flex-col items-center mb-8 text-center">
                <div className="w-12 h-12 bg-[#6366f1] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
                    <Lock className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                    {type === "login" ? "Welcome Back" : "Join Us"}
                </h2>
                <p className="text-gray-500 mt-1">
                    {type === "login"
                        ? "Sign in to your account or create a new one."
                        : "Create an account to start your journey."}
                </p>
            </div>

            {/* Tab Switcher */}
            <div className="bg-gray-100 p-1 rounded-xl flex mb-8">
                <button
                    onClick={() => router.push("/login")}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${type === "login"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Sign In
                </button>
                <button
                    onClick={() => router.push("/signup")}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${type === "signup"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Sign Up
                </button>
            </div>

            {/* Main Form Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900">
                        {type === "login" ? "Login" : "Create Account"}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {type === "login"
                            ? "Enter your credentials to access your account"
                            : "Fill in the details below to create your account"}
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        {type === "signup" && (
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold text-gray-700">Username</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input
                                                    placeholder="Choose a username"
                                                    className="pl-10 h-11 border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                                                    {...field}
                                                />
                                            </div>
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
                                    <FormLabel className="text-sm font-semibold text-gray-700">Email</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <Input
                                                placeholder="Example@email.com"
                                                className="pl-10 h-11 border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                                                {...field}
                                            />
                                        </div>
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
                                    <div className="flex items-center justify-between">
                                        <FormLabel className="text-sm font-semibold text-gray-700">Password</FormLabel>
                                        {type === "login" && (
                                            <Link
                                                href="/forgot-password"
                                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                                            >
                                                Forgot Password?
                                            </Link>
                                        )}
                                    </div>
                                    <FormControl>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <Input
                                                type="password"
                                                placeholder="At least 8 characters"
                                                className="pl-10 h-11 border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {type === "login" && (
                            <FormField
                                control={form.control}
                                name="rememberMe"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="border-gray-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                            />
                                        </FormControl>
                                        <div className="leading-none">
                                            <FormLabel className="text-sm font-medium text-gray-600 cursor-pointer">
                                                Remember me
                                            </FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        )}

                        <Button
                            type="submit"
                            className="w-full h-11 bg-black hover:bg-gray-900 text-white font-bold rounded-lg transition-all"
                            disabled={mutation?.isPending}
                        >
                            {mutation?.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Please wait...
                                </>
                            ) : (
                                type === "login" ? "Sign in" : "Create Account"
                            )}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}

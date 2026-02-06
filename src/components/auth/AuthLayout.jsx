"use client";

import React from "react";
import { Sparkles, BookOpen, Users, Brain } from "lucide-react";

export function AuthLayout({ children }) {
    return (
        <div className="flex flex-col lg:flex-row min-h-screen w-full bg-white">
            {/* Left Side - Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative">
                <div className="w-full max-w-md mx-auto flex flex-col">
                    {children}
                </div>

                {/* Footer */}
                <div className="absolute bottom-6 text-center w-full px-6">
                    <p className="text-xs text-muted-foreground">
                        By signing in, you agree to our{" "}
                        <a href="#" className="text-primary hover:underline font-medium">Terms of Services</a>
                        {" "}and{" "}
                        <a href="#" className="text-primary hover:underline font-medium">Privacy Policy</a>
                    </p>
                </div>
            </div>

            {/* Right Side - Feature Showcase */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#a855f7] p-16 flex-col justify-center text-white relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl -ml-48 -mb-48"></div>

                <div className="relative z-10 max-w-lg">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium mb-8 backdrop-blur-sm">
                        <Sparkles className="w-4 h-4 text-yellow-300" />
                        <span>AI-Powered Learning Platform</span>
                    </div>

                    <h1 className="text-5xl font-bold leading-tight mb-6">
                        Transform Your Learning Journey
                    </h1>

                    <p className="text-lg text-white/80 mb-12 leading-relaxed">
                        Join thousands of educators and students using AI-powered tools to create, learn, and grow together.
                    </p>

                    <div className="space-y-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-1">Smart Content Creation</h3>
                                <p className="text-white/70">Generate lesson plans, worksheets, and study materials in seconds.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-1">For Everyone</h3>
                                <p className="text-white/70">Perfect for teachers, students, and lifelong learners.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                                <Brain className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-1">AI-Powered Intelligence</h3>
                                <p className="text-white/70">Advanced AI helps you learn and teach more effectively</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

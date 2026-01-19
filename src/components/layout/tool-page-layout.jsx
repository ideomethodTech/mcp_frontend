"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import History from "@/app/componentsV2/ui/history";

export const ToolPageLayout = ({
    title,
    description,
    icon: Icon,
    historyProps,
    isLoading,
    loadingTitle = "Loading...",
    loadingDescription = "Please wait a moment.",
    children,
}) => {
    return (
        <div className="max-w-7xl mx-auto my-5 space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 p-8 shadow-[var(--shadow-lg)]">
                <div className="relative flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-glow)]">
                        <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            {title}
                        </h1>
                        <p className="text-muted-foreground mt-1 text-lg">{description}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* History Sidebar */}
                <History {...historyProps} />

                {/* Content Area */}
                <div className="lg:col-span-3">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center min-h-[500px]">
                            <div className="w-full max-w-2xl text-center">
                                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
                                <h3 className="text-lg font-medium text-foreground">{loadingTitle}</h3>
                                <p className="text-sm text-muted-foreground">{loadingDescription}</p>
                            </div>
                        </div>
                    ) : (
                        children
                    )}
                </div>
            </div>
        </div>
    );
};

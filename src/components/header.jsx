"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { LogOut } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import React from "react";
import { usePathname } from "next/navigation";
import { Logo } from "./icons";

export function Header() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  const userInitials = user?.user?.username
    ? user.user.username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
    : user?.user?.email?.[0]?.toUpperCase() || "U";
  return (
    <header className="flex h-16 items-center justify-between  border-b bg-white px-6">
      {/* Logo and Branding */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded flex items-center justify-center">
          <Logo className="w-8 h-8 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg leading-tight">AI Learning Hub</span>
          <span className="text-xs text-gray-500 leading-tight">Educational Intelligence</span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        {/* Navigation */}
        <TooltipProvider delayDuration={100}>
          <div className="flex-1 flex items-right  ml-4">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 p-2 rounded-md transition-colors ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-900 hover:bg-gray-50"
                        }`}
                    >
                      <item.icon className="w-4 h-4" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={6}>
                    <p className="text-sm font-medium">{item.title}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-gray-900">{user?.user.username || "Demo User"}</span>
            <span className="text-xs text-gray-500">{user?.user.email || "demo@aihub.com"}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-10 w-10 cursor-pointer bg-blue-600">
                <AvatarImage src={user?.photoURL} alt={user?.displayName || "User"} />
                <AvatarFallback className="bg-blue-600 text-white">{userInitials}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.displayName || "User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

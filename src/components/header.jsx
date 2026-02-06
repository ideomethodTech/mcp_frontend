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
import { LogOut, Shield } from "lucide-react";
import { NAV_ITEMS, ADMIN_NAV_ITEM } from "@/lib/constants.jsx";
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

  const userInitials = user
    ? user?.user.username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
    : user?.user.email[0]?.toUpperCase() || "U";

  return (
    <header className="flex h-20 items-center justify-between bg-white px-12 border-none">
      {/* Logo and Branding */}
      <Link href="/" className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#6366f1] rounded-lg flex items-center justify-center text-white font-bold text-xs">
          AI
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg leading-tight text-gray-900 tracking-tight">AI Learning Hub</span>
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider leading-none">Educational Intelligence</span>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="hidden md:flex items-center gap-8">
        {NAV_ITEMS.map((item) => {
          if (item.href === "/") return null;
          const isActive = pathname === item.href;
          // Shorten titles for header if needed or use as is
          const displayTitle = item.title.replace(" Generator", "").replace(" with Book", "");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-semibold transition-colors ${isActive ? "text-indigo-600 border-b-2 border-indigo-600 -mb-[2px]" : "text-gray-600 hover:text-gray-900"
                } pb-1`}
            >
              {displayTitle}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-10 w-10 cursor-pointer border-2 border-transparent hover:border-indigo-100 transition-all">
              <AvatarImage src={user?.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"} alt={user?.displayName || "User"} />
              <AvatarFallback className="bg-indigo-600 text-white">{userInitials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold leading-none">{user?.user.username || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin" className="flex items-center cursor-pointer">
                <Shield className="mr-2 h-4 w-4" />
                Admin Panel
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

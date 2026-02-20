"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { LogOut, Shield, Menu, X, Settings as SettingsIcon, CircleHelp } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants.jsx";
import { usePathname } from "next/navigation";

export function Header() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try { await signOut(); } catch (error) { console.error("Error logging out:", error); }
  };

  const userInitials = user?.user?.username
    ? user.user.username.split(" ").map((n) => n[0]).join("").toUpperCase()
    : user?.user?.email?.[0]?.toUpperCase() || "U";

  const navLinks = NAV_ITEMS.filter((item) => item.href !== "/").map((item) => ({
    ...item,
    displayTitle: item.title.replace(" Generator", "").replace(" with Book", ""),
  }));

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto flex h-20 items-center justify-between px-6 md:px-10">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xs">
              AI
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-base text-gray-900 tracking-tight whitespace-nowrap">
                AI Learning Hub
              </span>
              <span className="hidden sm:block text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                Educational Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-bold transition-colors pb-0.5 whitespace-nowrap ${isActive
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-900"
                    }`}
                >
                  {item.displayTitle}
                </Link>
              );
            })}
          </nav>

          {/* Right — hamburger + avatar */}
          <div className="flex items-center gap-4">
            {/* Hamburger — mobile only */}
            <button
              className="md:hidden p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Avatar dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-10 w-10 cursor-pointer border-2 border-transparent hover:border-indigo-200 transition-all flex-shrink-0">
                  <AvatarImage src={user?.photoURL || undefined} alt={user?.user?.username || "User"} />
                  <AvatarFallback className="bg-indigo-600 text-white text-sm font-bold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 p-1.5 rounded-2xl border-gray-100 shadow-xl shadow-indigo-100/20">
                <DropdownMenuLabel className="px-3 py-2">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-bold text-gray-900 leading-tight">{user?.user?.username || "Admin"}</p>
                    <p className="text-[10px] font-medium text-gray-400 truncate">{user?.user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-50 mx-1 my-0.5" />
                <div className="flex flex-col gap-0.5">
                  <DropdownMenuItem className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl cursor-pointer text-sm font-bold text-gray-600 focus:bg-indigo-50 focus:text-indigo-600 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center transition-colors">
                      <SettingsIcon className="w-3.5 h-3.5" />
                    </div>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl cursor-pointer text-sm font-bold text-gray-600 focus:bg-indigo-50 focus:text-indigo-600 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center transition-colors">
                      <CircleHelp className="w-3.5 h-3.5" />
                    </div>
                    Support
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="bg-gray-50 mx-1 my-0.5" />
                <div className="flex flex-col gap-0.5">
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl cursor-pointer text-sm font-bold text-gray-600 focus:bg-indigo-50 focus:text-indigo-600 transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center transition-colors">
                        <Shield className="w-3.5 h-3.5" />
                      </div>
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="bg-gray-50 mx-1 my-0.5" />
                <div className="flex flex-col gap-0.5">
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl cursor-pointer text-sm font-bold text-red-500 focus:bg-red-50 focus:text-red-600 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center transition-colors">
                      <LogOut className="w-3.5 h-3.5" />
                    </div>
                    Logout
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile drawer — OUTSIDE header so fixed positioning works */}
      {/* Backdrop */}
      <div
        className={`md:hidden fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ease-in-out ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Drawer — 50vw, full screen height */}
      <div
        className={`md:hidden fixed top-0 left-0 h-screen w-1/2 bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-[10px]">
              AI
            </div>
            <span className="font-bold text-xs text-gray-900 tracking-tight">AI Learning Hub</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <nav className="flex-1 px-3 pt-4 flex flex-col gap-1 overflow-y-auto">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center px-3 py-3 rounded-xl text-sm font-semibold transition-colors ${isActive
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                {item.displayTitle}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}


'use client';

import { SidebarMenuButton, SidebarMenuItem, SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-context';
import { LogOut } from 'lucide-react';
import { Separator } from '@radix-ui/react-separator';
import { NAV_ITEMS } from '@/lib/constants';
import React from 'react';
import { usePathname } from 'next/navigation';
import { Logo } from './icons';

export function Header() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const userInitials = user?.displayName
    ? user.displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background/60 backdrop-blur-sm px-4 lg:h-[60px] lg:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex-1">
        {/* This is a spacer */}
        <div style={{ display: "flex", height: 20, alignItems: "center", listStyleType: "none" }}>
          <div className="flex items-center gap-2 p-2">
            <Logo className="w-8 h-8 text-primary" />
            <span className="font-headline text-lg font-semibold">AI Hub</span>
          </div>
          <Separator orientation="vertical" className="mx-8" />

          {NAV_ITEMS.map((item, index) => (
            <React.Fragment key={index}>
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.title}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {index !== NAV_ITEMS.length - 1 && (
                <Separator orientation="vertical" className="mx-4" />
              )}
            </React.Fragment>
          ))}
        </div>

      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarImage src={user?.photoURL} alt={user?.displayName || 'User'} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.displayName || 'User'}</p>
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
    </header>
  );
}

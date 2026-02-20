"use client";

import Link from 'next/link';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-context';
import { useUserInitials } from '@/hooks/use-user-initials';


export default function AdminLayout({ children }) {
  const { user } = useAuth();
  const userInitials = useUserInitials(user);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
          <Logo className="h-6 w-6" />
          <span className="font-headline">Admin Panel</span>
        </Link>
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-9 w-9 cursor-pointer">
                {user?.photoURL ? (
                  <AvatarImage src={user.photoURL} alt={user?.displayName || user?.user?.username || user?.user?.name} />
                ) : null}
                <AvatarFallback className="bg-indigo-600 text-white">{userInitials}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold leading-none">{user?.user?.username || user?.user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/">Go to App</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/admin/login">Logout</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex-1 bg-muted/40 p-4 md:p-8">{children}</main>
    </div>
  );
}

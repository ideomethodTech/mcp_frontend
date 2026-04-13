
'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import { MainNav } from '@/components/main-nav';
import { Header } from '@/components/header';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function AppLayout({
  children,
}) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        {/* <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2">
              <Logo className="w-8 h-8 text-primary" />
              <span className="font-headline text-lg font-semibold">AI Hub</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <MainNav />
          </SidebarContent>
        </Sidebar> */}
        <SidebarInset>
          <div className="flex flex-col h-screen print:h-auto print:block">
            <div className="print:hidden">
              <Header />
            </div>
            <main className="flex-1 overflow-auto print:overflow-visible print:block print:w-full">{children}</main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}

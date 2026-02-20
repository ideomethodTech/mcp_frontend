'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { Header } from '@/components/header';

export default function AppLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
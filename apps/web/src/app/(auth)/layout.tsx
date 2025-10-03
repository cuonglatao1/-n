"use client"

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useAuthStore } from '@/stores/auth.store';

interface AuthSectionLayoutProps {
  children: React.ReactNode;
}

export default function AuthSectionLayout({ children }: AuthSectionLayoutProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [hydrated, setHydrated] = React.useState(
    (useAuthStore as any).persist?.hasHydrated?.() ?? false
  );

  React.useEffect(() => {
    const unsub = (useAuthStore as any).persist?.onFinishHydration?.(() => {
      setHydrated(true);
    });
    if (!(useAuthStore as any).persist) {
      setHydrated(true);
    }
    return () => {
      unsub?.();
    };
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [hydrated, isAuthenticated, router]);

  // Avoid flashing the auth forms until hydration status is known
  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}



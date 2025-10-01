
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export default function Home() {
  const { session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [session, router]);

  return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
  );
}

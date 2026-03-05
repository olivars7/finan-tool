
"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange } from '@/lib/auth';
import FinantoMain from '@/components/FinantoMain';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        setAuthenticated(true);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-white font-bold tracking-widest uppercase text-xs">Cargando Sesión...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) return null;

  return <FinantoMain />;
}

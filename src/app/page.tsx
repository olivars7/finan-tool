"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange } from '@/lib/auth';
import FinantoMain from '@/components/FinantoMain';
import Image from 'next/image';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [exitAnimation, setExitAnimation] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const startTime = Date.now();
    
    const unsubscribe = onAuthChange((user) => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const minLoadingTime = 1800; // Un poco más de un segundo y medio para estética
      const remainingTime = Math.max(0, minLoadingTime - elapsed);

      setTimeout(() => {
        if (user) {
          setAuthenticated(true);
          // Iniciar animación de salida antes de quitar el loader
          setExitAnimation(true);
          setTimeout(() => setLoading(false), 400);
        } else {
          router.push('/login');
        }
      }, remainingTime);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-slate-950 transition-all duration-500 ease-in-out ${exitAnimation ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}>
        <div className="flex flex-col items-center gap-8 max-w-xs w-full">
          {/* Logo animado */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
            <div className="relative bg-slate-900 border border-white/10 p-6 rounded-[2rem] shadow-2xl animate-in zoom-in duration-700 flex items-center justify-center">
              <Image 
                src="/favicon.ico" 
                alt="Logo" 
                width={48} 
                height={48} 
                className="animate-[bounce_3s_infinite] object-contain"
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 w-full">
            <div className="space-y-1 text-center">
              <h2 className="text-white font-black tracking-[0.3em] uppercase text-sm">Finanto</h2>
              <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px]">Iniciando Sesión Segura</p>
            </div>
            
            {/* Barra de progreso estética */}
            <div className="w-48 h-[2px] bg-white/5 rounded-full overflow-hidden relative">
              <div className="absolute inset-0 bg-primary/40 animate-[loading-bar_2s_infinite_ease-in-out]" style={{ width: '40%' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!authenticated) return null;

  return <FinantoMain />;
}
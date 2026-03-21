
"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginWithGoogle } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ShieldCheck, Zap, Globe, Sparkles, TrendingUp, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast({
        title: "Sesión iniciada",
        description: "Bienvenido de nuevo a Finanto.",
      });
      router.push('/');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error de autenticación",
        description: "No se pudo iniciar sesión con Google.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent/15 blur-[140px] rounded-full animate-pulse delay-1000" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.15]" 
          style={{ 
            backgroundImage: `linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} 
        />
        
        {/* Grainy overlay for texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="container max-w-6xl relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center px-6">
        {/* Left Side: Brand Story */}
        <div className="hidden lg:flex flex-col space-y-10 animate-in slide-in-from-left duration-1000">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-primary text-[10px] font-black uppercase tracking-[0.2em]">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Finanto Cloud v2.0
            </div>
            <h1 className="text-7xl font-black tracking-tighter text-white leading-[0.85]">
              LA NUEVA <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-accent">ERA DEL <br /> CIERRE.</span>
            </h1>
            <p className="text-slate-400 text-xl max-w-lg leading-relaxed font-medium">
              Sincronización en tiempo real, inteligencia financiera y gestión de prospectos diseñada para la élite inmobiliaria.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 max-w-md">
            {[
              { icon: Zap, title: "Velocidad Extrema", desc: "Cálculos financieros en milisegundos." },
              { icon: TrendingUp, title: "Inteligencia Pro", desc: "Monitorea tu flujo de cobro semanal." },
              { icon: ShieldCheck, title: "Seguridad Militar", desc: "Tus datos protegidos por Firebase Cloud." }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-5 p-5 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all group">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-black text-white uppercase tracking-tight">{item.title}</p>
                  <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Access Card */}
        <div className="flex justify-center lg:justify-end animate-in zoom-in duration-700">
          <div className="relative w-full max-w-md group">
            {/* Animated border glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-accent to-primary rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
            
            <Card className="relative bg-slate-950/60 backdrop-blur-3xl border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden rounded-[2.5rem]">
              <CardContent className="p-10 sm:p-14 space-y-12">
                <div className="text-center space-y-6">
                  <div className="mx-auto relative">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 animate-pulse" />
                    <div className="relative bg-gradient-to-br from-slate-800 to-slate-950 p-[1px] rounded-[2rem] w-24 h-24 mx-auto">
                      <div className="bg-slate-950 w-full h-full rounded-[1.9rem] flex items-center justify-center">
                        <Image 
                          src="/favicon.ico" 
                          alt="Finanto" 
                          width={48} 
                          height={48} 
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-4xl font-black tracking-tighter text-white uppercase">Acceso</h2>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Panel de Control Profesional</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <Button 
                    onClick={handleLogin} 
                    disabled={loading}
                    className="w-full h-16 text-lg font-black bg-white text-slate-950 hover:bg-slate-100 rounded-[1.5rem] gap-4 transition-all active:scale-[0.97] shadow-[0_20px_40px_rgba(255,255,255,0.1)] group/btn"
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <div className="bg-slate-100 p-2 rounded-xl group-hover/btn:scale-110 transition-transform">
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                        </div>
                        Entrar con Google
                      </>
                    )}
                  </Button>
                  
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sistemas OK</span>
                    </div>
                    <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1">
                      Ayuda <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <footer className="text-center pt-4 border-t border-white/5">
                  <p className="text-[9px] text-slate-600 font-black tracking-[0.4em] uppercase">
                    Finanto Cloud Security Verified
                  </p>
                </footer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

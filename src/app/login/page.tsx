"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginWithGoogle } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ShieldCheck, Zap, Globe, Sparkles } from 'lucide-react';
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
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full animate-pulse delay-700" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="container max-w-6xl relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-6">
        {/* Left Side: Brand & Social Proof */}
        <div className="hidden lg:flex flex-col space-y-8 animate-in slide-in-from-left duration-1000">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3 h-3" /> CRM Inmobiliario v2.0
            </div>
            <h1 className="text-6xl font-black tracking-tighter text-white leading-[0.9]">
              DOMINA EL <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">MERCADO</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed">
              La plataforma definitiva para ejecutivos de alto rendimiento. Gestión de prospectos, simulaciones financieras e IA en un solo lugar.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-4">
            {[
              { icon: Zap, label: "Simulador Pro", desc: "Cálculos en tiempo real" },
              { icon: ShieldCheck, label: "Seguridad Cloud", desc: "Datos protegidos" },
              { icon: Globe, label: "Multi-dispositivo", desc: "Acceso universal" },
              { icon: Loader2, label: "Sincronización", desc: "Tiempo real" }
            ].map((item, i) => (
              <div key={i} className="flex flex-col gap-2 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors group">
                <div className="p-2 rounded-xl bg-primary/10 w-fit group-hover:scale-110 transition-transform">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white uppercase tracking-tight">{item.label}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="flex justify-center lg:justify-end animate-in zoom-in duration-700">
          <Card className="w-full max-w-md bg-slate-900/40 backdrop-blur-2xl border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-[loading-bar_3s_linear_infinite]" />
            <CardContent className="p-8 sm:p-12 space-y-10">
              <div className="text-center space-y-4">
                <div className="mx-auto bg-gradient-to-br from-primary to-accent p-[1px] rounded-3xl w-20 h-20 shadow-[0_0_30px_rgba(24,119,242,0.3)]">
                  <div className="bg-slate-950 w-full h-full rounded-[23px] flex items-center justify-center">
                    <Image 
                      src="/favicon.ico" 
                      alt="Finanto" 
                      width={40} 
                      height={40} 
                      className="object-contain"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <h2 className="text-3xl font-black tracking-tighter text-white uppercase">Bienvenido</h2>
                  <p className="text-slate-400 text-sm font-medium">Inicia sesión para acceder a tu panel profesional</p>
                </div>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={handleLogin} 
                  disabled={loading}
                  className="w-full h-14 text-base font-bold bg-white text-slate-900 hover:bg-slate-100 rounded-2xl gap-3 transition-all active:scale-[0.98] shadow-xl"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
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
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continuar con Google
                    </>
                  )}
                </Button>
                
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
                  <div className="relative flex justify-center text-xs uppercase font-bold text-slate-600"><span className="bg-slate-900 px-4">Solo miembros autorizados</span></div>
                </div>
              </div>

              <footer className="text-center">
                <p className="text-[10px] text-slate-500 font-bold tracking-[0.3em] uppercase">
                  Acceso Seguro • Finanto Cloud
                </p>
              </footer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

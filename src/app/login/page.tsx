"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginWithGoogle } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Loader2, ShieldCheck, Zap, Globe, Sparkles, TrendingUp, 
  ChevronRight, BarChart3, CalendarClock, Smartphone, 
  Users, CheckCircle2, Star, Target, Lightbulb, ArrowDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [scrolled, setSetScrolled] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      setSetScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const features = [
    {
      icon: TrendingUp,
      title: "Inteligencia Financiera",
      desc: "Algoritmos avanzados que calculan comisiones netas y proyecciones de cobro al instante.",
      gradient: "from-blue-500 to-cyan-400"
    },
    {
      icon: Globe,
      title: "Sincronización Cloud",
      desc: "Tus datos siempre disponibles en todos tus dispositivos gracias a la tecnología de Firebase.",
      gradient: "from-purple-500 to-indigo-400"
    },
    {
      icon: Users,
      title: "Gestión de Prospectos",
      desc: "CRM especializado para el seguimiento de citas, cierres y prospectores externos.",
      gradient: "from-emerald-500 to-green-400"
    }
  ];

  const advantages = [
    { title: "Seguridad Militar", icon: ShieldCheck, text: "Encriptación de datos de grado bancario." },
    { title: "Velocidad Extrema", icon: Zap, text: "Interfaz optimizada para máxima fluidez." },
    { title: "Multiplataforma", icon: Smartphone, text: "Accede desde móvil, tablet o PC sin límites." },
    { title: "Reportes Pro", icon: BarChart3, text: "Gráficas de rendimiento y monitor operativo." }
  ];

  const tips = [
    { title: "Confirma siempre", text: "Usa el botón de confirmación el día de la cita para aumentar tu tasa de asistencia en un 40%." },
    { title: "Notas de Cierre", text: "Registra los acuerdos inmediatamente después de la cita para no perder detalles clave del expediente." },
    { title: "Ciclo de Pagos", text: "Vigila tu monitor de flujo para saber exactamente qué viernes cae cada una de tus comisiones." }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-primary/30 font-sans">
      {/* Navbar Estática/Pegajosa */}
      <nav className={cn(
        "fixed top-0 inset-x-0 z-[100] transition-all duration-300 px-6 h-20 flex items-center justify-between",
        scrolled ? "bg-slate-950/80 backdrop-blur-xl border-b border-white/5 shadow-2xl" : "bg-transparent"
      )}>
        <div className="flex items-center gap-3">
          <div className="bg-primary p-1.5 rounded-lg">
            <Image src="/favicon.ico" alt="Finanto" width={24} height={24} className="object-contain" />
          </div>
          <span className="font-black tracking-tighter text-xl uppercase">Finanto <span className="text-primary">Cloud</span></span>
        </div>
        <Button 
          variant="outline" 
          onClick={handleLogin}
          className="border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest h-10 px-6 rounded-full hidden sm:flex"
        >
          Acceso Rápido
        </Button>
      </nav>

      {/* Hero Section / Login Protagonist */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-12 overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-primary/20 blur-[160px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-accent/15 blur-[160px] rounded-full animate-pulse delay-1000" />
          <div className="absolute inset-0 opacity-[0.1]" 
            style={{ 
              backgroundImage: `linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)`,
              backgroundSize: '80px 80px'
            }} 
          />
        </div>

        <div className="container max-w-6xl relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center px-6">
          {/* Left Side: Brand Value */}
          <div className="space-y-10 animate-in slide-in-from-left duration-1000">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(24,119,242,0.2)]">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" /> El Estándar de la Élite Inmobiliaria
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85]">
                CIERRA <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-accent animate-gradient-x">MÁS VENTAS</span> <br />
                SIN ESFUERZO.
              </h1>
              <p className="text-slate-400 text-xl max-w-lg leading-relaxed font-medium border-l-2 border-primary/30 pl-6">
                Finanto es la plataforma de control financiero y gestión de citas diseñada para maximizar la productividad de ejecutivos de alto rendimiento.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Sincronización Real</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-300">IA de Seguimiento</span>
              </div>
            </div>
          </div>

          {/* Right Side: Login Card */}
          <div className="flex justify-center lg:justify-end animate-in zoom-in duration-700">
            <div className="relative w-full max-w-md group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-blue-500 to-accent rounded-[3rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000" />
              
              <Card className="relative bg-slate-900/40 backdrop-blur-3xl border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden rounded-[2.5rem]">
                <CardContent className="p-10 sm:p-14 space-y-12">
                  <div className="text-center space-y-6">
                    <div className="mx-auto relative">
                      <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 animate-pulse" />
                      <div className="relative bg-gradient-to-br from-slate-800 to-slate-950 p-[1px] rounded-[2rem] w-24 h-24 mx-auto">
                        <div className="bg-slate-950 w-full h-full rounded-[1.9rem] flex items-center justify-center">
                          <Image src="/favicon.ico" alt="Finanto" width={48} height={48} className="object-contain" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">Bienvenido</h2>
                      <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Inicia sesión en tu terminal pro</p>
                    </div>
                  </div>

                  <Button 
                    onClick={handleLogin} 
                    disabled={loading}
                    className="w-full h-16 text-lg font-black bg-white text-slate-950 hover:bg-slate-100 rounded-[1.5rem] gap-4 transition-all active:scale-[0.97] shadow-[0_20px_40px_rgba(255,255,255,0.1)] group/btn overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <div className="bg-slate-100 p-2 rounded-xl group-hover/btn:scale-110 transition-transform">
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                          </svg>
                        </div>
                        Entrar con Google
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-between px-2 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sistemas OK</span>
                    </div>
                    <span className="text-[9px] text-slate-600 font-black tracking-[0.4em] uppercase">Security Verified</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce hidden lg:block opacity-40">
          <ArrowDown className="w-6 h-6" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 relative bg-slate-950">
        <div className="container max-w-6xl mx-auto space-y-20">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-xs font-black text-primary uppercase tracking-[0.4em]">Características Principales</h2>
            <p className="text-4xl md:text-5xl font-black tracking-tighter">TODO LO QUE NECESITAS PARA <span className="italic">DOMINAR</span> EL MERCADO.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all group relative overflow-hidden">
                <div className={cn("absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 group-hover:opacity-30 transition-opacity bg-gradient-to-br", f.gradient)} />
                <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 w-fit mb-6 group-hover:scale-110 transition-transform">
                  <f.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 uppercase tracking-tighter">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits / Advantages */}
      <section className="py-32 px-6 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="container max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative aspect-square rounded-[3rem] overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-accent/40 mix-blend-overlay group-hover:opacity-0 transition-opacity duration-700" />
            <Image 
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
              alt="Real Estate Success" 
              fill 
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
              data-ai-hint="real estate office"
            />
            <div className="absolute bottom-8 left-8 right-8 p-8 bg-slate-950/60 backdrop-blur-2xl rounded-3xl border border-white/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2 bg-primary rounded-lg text-white"><Target className="w-5 h-5" /></div>
                <span className="font-black uppercase tracking-widest text-sm">Meta Mensual</span>
              </div>
              <p className="text-lg font-bold leading-tight">"Desde que uso Finanto, mi tiempo de cierre se redujo a la mitad y mi efectividad subió un 35%."</p>
              <div className="flex items-center gap-1 mt-4">
                {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
              </div>
            </div>
          </div>

          <div className="space-y-12">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter">VENTAJAS DE NIVEL CORPORATIVO.</h2>
              <p className="text-slate-400 font-medium text-lg leading-relaxed">No es solo una agenda, es tu asistente personal de alto rendimiento que trabaja 24/7 para ti.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {advantages.map((a, i) => (
                <div key={i} className="flex flex-col gap-4 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                  <a.icon className="w-6 h-6 text-primary" />
                  <div>
                    <h4 className="font-bold uppercase tracking-tight text-sm mb-1">{a.title}</h4>
                    <p className="text-xs text-slate-500 font-medium">{a.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pro Tips Section */}
      <section className="py-32 px-6 bg-slate-900/50">
        <div className="container max-w-4xl mx-auto space-y-12">
          <div className="flex items-center gap-4">
            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-primary/30" />
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20"><Lightbulb className="w-6 h-6 text-primary" /></div>
            <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-primary/30" />
          </div>
          
          <div className="text-center space-y-12">
            <h2 className="text-4xl font-black tracking-tighter uppercase italic">Dominio Maestro Finanto</h2>
            <div className="grid grid-cols-1 gap-6">
              {tips.map((t, i) => (
                <div key={i} className="p-8 rounded-[2rem] bg-gradient-to-r from-slate-900 to-slate-950 border border-white/5 flex items-start gap-6 text-left group hover:border-primary/20 transition-colors">
                  <div className="text-4xl font-black text-slate-800 group-hover:text-primary/40 transition-colors">{i+1}</div>
                  <div className="space-y-2">
                    <h4 className="font-black uppercase tracking-widest text-primary text-sm">{t.title}</h4>
                    <p className="text-slate-400 font-medium leading-relaxed">{t.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer / Final CTA */}
      <footer className="py-20 px-6 bg-slate-950 border-t border-white/5 text-center">
        <div className="container max-w-6xl mx-auto space-y-12">
          <div className="space-y-6">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">ÚNETE A LA <br /><span className="text-primary">ÉLITE.</span></h2>
            <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-sm">Comienza hoy mismo tu nueva era de éxito.</p>
          </div>
          
          <Button 
            onClick={handleLogin}
            className="h-20 px-12 bg-white text-slate-950 hover:bg-slate-100 rounded-[2rem] text-xl font-black uppercase tracking-widest transition-transform active:scale-[0.98] shadow-[0_30px_60px_rgba(255,255,255,0.1)] gap-4"
          >
            Empezar Ahora <ChevronRight className="w-6 h-6" />
          </Button>

          <div className="pt-20 flex flex-col md:flex-row items-center justify-between gap-8 border-t border-white/5">
            <div className="flex items-center gap-3 opacity-50">
              <div className="bg-white p-1 rounded">
                <Image src="/favicon.ico" alt="Finanto" width={16} height={16} />
              </div>
              <span className="font-black tracking-tighter text-sm uppercase">Finanto CRM v2.0</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">© 2026 Reservados todos los derechos por Olivares.</p>
            <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <span className="hover:text-white cursor-pointer transition-colors">Términos</span>
              <span className="hover:text-white cursor-pointer transition-colors">Privacidad</span>
              <span className="hover:text-white cursor-pointer transition-colors">Soporte</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

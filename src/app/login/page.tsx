
"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { loginWithGoogle } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Loader2, ShieldCheck, Zap, Sparkles, TrendingUp, 
  ChevronRight, BarChart3, CalendarClock, Smartphone, 
  Users, CheckCircle2, Target, ArrowDown,
  Calculator, Receipt, Coins, MessageSquare, Phone, User, Clock, X,
  MapPin, Briefcase, Calendar as CalendarIcon, FileText
} from 'lucide-react';
import { 
  Bar, CartesianGrid, XAxis, YAxis, ResponsiveContainer, 
  ComposedChart, LineChart, Line, Tooltip as RechartsTooltip
} from "recharts";
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// --- COMPONENTE DE REVELADO POR SCROLL ---
const ScrollReveal = ({ children, className, animation = "fade-in", delay = 0 }: { children: React.ReactNode, className?: string, animation?: string, delay?: number }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const animationClasses = {
    "fade-in": "animate-in fade-in duration-1000",
    "slide-up": "animate-in fade-in slide-in-from-bottom-10 duration-1000",
    "slide-left": "animate-in fade-in slide-in-from-left-10 duration-1000",
    "slide-right": "animate-in fade-in slide-in-from-right-10 duration-1000",
    "zoom-in": "animate-in fade-in zoom-in-95 duration-1000",
  };

  return (
    <div 
      ref={ref} 
      className={cn(
        isVisible ? animationClasses[animation as keyof typeof animationClasses] : "opacity-0",
        className
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      {children}
    </div>
  );
};

// --- DATOS DE DEMOSTRACIÓN ENRIQUECIDOS ---
const DEMO_OPERATIVO = [
  { day: 'Lun', agendadas: 4, atendidas: 3, cierres: 0 },
  { day: 'Mar', agendadas: 6, atendidas: 5, cierres: 1 },
  { day: 'Mie', agendadas: 3, atendidas: 3, cierres: 0 },
  { day: 'Jue', agendadas: 8, atendidas: 6, cierres: 2 },
  { day: 'Vie', agendadas: 5, atendidas: 5, cierres: 1 },
];

const DEMO_FLUJO = [
  { week: 'Sem 1', income: 8500 },
  { week: 'Sem 2', income: 12400 },
  { week: 'Sem 3', income: 9800 },
  { week: 'Sem 4', income: 15600 },
];

const DEMO_APPS = [
  { 
    id: '1', 
    name: 'Roberto Martínez', 
    time: '10:30 AM', 
    date: '15 Oct 2026',
    type: '1ra consulta', 
    product: 'Casa Habitación', 
    phone: '664 123 4567', 
    status: 'Pendiente',
    notes: 'Interesado en zona dorada, presupuesto 2.5M. Requiere perfilamiento bancario para crédito tradicional. Muy interesado en el plan de 192 meses.',
    prospector: 'Marketing Facebook',
    executive: 'Marco Olivares'
  },
  { 
    id: '2', 
    name: 'Elena Guajardo', 
    time: '01:00 PM', 
    date: '15 Oct 2026',
    type: 'Cierre', 
    product: 'Terreno Comercial', 
    phone: '664 987 6543', 
    status: 'Cerrado',
    notes: 'Firma de contrato y entrega de enganche. Ya se validó el documento de identidad. Pago de comisión proyectado para el viernes de la siguiente semana.',
    prospector: 'Directo / Recomendación',
    executive: 'Brenda Solis'
  },
  { 
    id: '3', 
    name: 'Carlos Slim (Prospecto)', 
    time: '04:30 PM', 
    date: '16 Oct 2026',
    type: 'Seguimiento', 
    product: 'Departamento', 
    phone: '664 555 0000', 
    status: 'En Proceso',
    notes: 'Dudas sobre la tabla de amortización y plazos de entrega. Enviar PDF por WhatsApp con el resumen de gastos operativos (escrituración y avalúo).',
    prospector: 'Lona en propiedad',
    executive: 'Kevin Castro'
  },
];

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [scrolled, setSetScrolled] = useState(false);
  const [demoAmount, setDemoAmount] = useState('1,200,000');
  const [selectedDemoApp, setSelectedDemoApp] = useState<any>(null);
  
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
      toast({ title: "Sesión iniciada", description: "Bienvenido a Finanto Cloud." });
      router.push('/');
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo conectar con Google." });
    } finally {
      setLoading(false);
    }
  };

  const formatWithCommas = (val: string) => {
    const num = val.replace(/[^0-9]/g, '');
    if (!num) return '';
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handlePriceInputChange = (val: string) => {
    setDemoAmount(formatWithCommas(val));
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(val);
  };

  const calcMonthly = (Number(demoAmount.replace(/,/g, '')) || 0) * 0.006982;

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-primary/30 font-sans">
      {/* Navbar Pegajosa */}
      <nav className={cn(
        "fixed top-0 inset-x-0 z-[100] transition-all duration-300 px-6 h-20 flex items-center justify-between",
        scrolled ? "bg-slate-950/80 backdrop-blur-xl border-b border-white/5 shadow-2xl" : "bg-transparent"
      )}>
        <div className="flex items-center gap-3">
          <div className="bg-primary p-1.5 rounded-lg">
            <Image src="/favicon.ico" alt="Finanto" width={24} height={24} className="object-contain" />
          </div>
          <span className="font-black tracking-tighter text-xl uppercase">Finanto <span className="text-primary">CRM</span></span>
        </div>
        <Button 
          variant="outline" 
          onClick={handleLogin}
          className="border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest h-10 px-6 rounded-full"
        >
          Iniciar Sesión
        </Button>
      </nav>

      {/* Hero Section: Protagonista Login */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-12 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-primary/20 blur-[160px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-blue-500/10 blur-[160px] rounded-full animate-pulse delay-1000" />
        </div>

        <div className="container max-w-6xl relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center px-6">
          <div className="space-y-10 animate-in slide-in-from-left duration-1000">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(24,119,242,0.2)]">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Gestión de Élite Inmobiliaria
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85]">
                EL CONTROL <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-cyan-400 animate-gradient-x">DEFINITIVO</span> <br />
                DE TU AGENDA.
              </h1>
              <p className="text-slate-400 text-xl max-w-lg leading-relaxed font-medium border-l-2 border-primary/30 pl-6">
                Finanto centraliza tu CRM, proyecciones de comisiones y simulaciones financieras en una sola terminal sincronizada.
              </p>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end animate-in zoom-in duration-700">
            <div className="relative w-full max-w-md group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-blue-500 to-cyan-500 rounded-[3rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000" />
              <Card className="relative bg-slate-900/40 backdrop-blur-3xl border-white/10 shadow-2xl rounded-[2.5rem]">
                <CardContent className="p-10 sm:p-14 space-y-12">
                  <div className="text-center space-y-6">
                    <div className="relative bg-gradient-to-br from-slate-800 to-slate-950 p-[1px] rounded-[2rem] w-24 h-24 mx-auto">
                      <div className="bg-slate-950 w-full h-full rounded-[1.9rem] flex items-center justify-center">
                        <Image src="/favicon.ico" alt="Finanto" width={48} height={48} className="object-contain" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">Bienvenido</h2>
                      <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Accede a tu cuenta profesional</p>
                    </div>
                  </div>

                  <Button 
                    onClick={handleLogin} 
                    disabled={loading}
                    className="w-full h-16 text-lg font-black bg-white text-slate-950 hover:bg-slate-100 rounded-[1.5rem] gap-4 transition-all active:scale-[0.97] shadow-xl group/btn overflow-hidden relative"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>
                      <div className="bg-slate-100 p-2 rounded-xl group-hover/btn:scale-110 transition-transform">
                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                      </div>
                      Entrar con Google
                    </>}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-40"><ArrowDown className="w-6 h-6" /></div>
      </section>

      {/* Sección: Inteligencia de Datos (Gráficas Demo) */}
      <section className="py-32 px-6 bg-slate-950 relative overflow-hidden">
        <div className="container max-w-6xl mx-auto space-y-20">
          <ScrollReveal animation="slide-up">
            <div className="text-center space-y-4">
              <h2 className="text-xs font-black text-primary uppercase tracking-[0.4em]">Panel de Inteligencia</h2>
              <p className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Visualiza tu éxito con <span className="text-primary italic">precisión.</span></p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ScrollReveal animation="slide-left" delay={200} className="h-full">
              <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 space-y-6 h-full">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl"><BarChart3 className="text-primary w-5 h-5" /></div>
                  <h3 className="font-bold uppercase tracking-widest text-sm">Monitor Operativo (Demo)</h3>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={DEMO_OPERATIVO}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                      <YAxis hide />
                      <RechartsTooltip contentStyle={{backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff'}} />
                      <Bar dataKey="agendadas" fill="#1877F240" radius={[4, 4, 0, 0]} barSize={20} />
                      <Bar dataKey="atendidas" fill="#1877F2" radius={[4, 4, 0, 0]} barSize={20} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-slate-500 italic text-center">Gráficas dinámicas que comparan tus citas agendadas vs asistencias reales.</p>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="slide-right" delay={400} className="h-full">
              <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 space-y-6 h-full">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-xl"><TrendingUp className="text-blue-500 w-5 h-5" /></div>
                  <h3 className="font-bold uppercase tracking-widest text-sm">Flujo de Cobro Semanal</h3>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={DEMO_FLUJO}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                      <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                      <YAxis hide />
                      <RechartsTooltip formatter={(val) => formatCurrency(val as number)} contentStyle={{backgroundColor: '#0f172a', borderRadius: '12px', border: 'none'}} />
                      <Line type="monotone" dataKey="income" stroke="#1877F2" strokeWidth={3} dot={{r: 4, fill: '#1877F2'}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-slate-500 italic text-center">Proyección de ingresos netos basada en tus cierres registrados.</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Sección: Características */}
      <section className="py-32 px-6 bg-[#020617]">
        <div className="container max-w-6xl mx-auto space-y-20">
          <ScrollReveal animation="slide-up">
            <div className="text-center space-y-4">
              <h2 className="text-xs font-black text-primary uppercase tracking-[0.4em]">Características Élite</h2>
              <p className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Todo lo que necesitas para <span className="text-primary italic">dominar el mercado.</span></p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Smartphone, title: "Sincronización Total", desc: "Tus datos siempre disponibles en móvil, tablet o PC. Sin pérdida de información.", color: "bg-blue-500/10", text: "text-blue-500" },
              { icon: Target, title: "Cálculos de Comisión", desc: "Deducciones de ISR automáticas y cálculo de participación neto al instante.", color: "bg-emerald-500/10", text: "text-emerald-500" },
              { icon: Users, title: "Gestión de Prospectos", desc: "Organiza tus citas por motivo (1ra, 2da consulta o Cierre) con un solo clic.", color: "bg-primary/10", text: "text-primary" },
              { icon: CalendarClock, title: "Ciclos de Pago", desc: "Visualiza exactamente qué viernes recibirás tu liquidación según el día de cierre.", color: "bg-amber-500/10", text: "text-amber-500" },
              { icon: BarChart3, title: "KPIs en Tiempo Real", desc: "Monitoriza tu tasa de conversión y crecimiento mensual con analítica integrada.", color: "bg-purple-500/10", text: "text-purple-500" },
              { icon: ShieldCheck, title: "Seguridad Cloud", desc: "Tus expedientes protegidos con infraestructura de Google Cloud para máxima confiabilidad.", color: "bg-cyan-500/10", text: "text-cyan-500" }
            ].map((f, i) => (
              <ScrollReveal key={i} animation="zoom-in" delay={i * 100}>
                <div className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all hover:bg-white/[0.04] group h-full">
                  <div className={cn(f.color, "p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform")}>
                    <f.icon className={cn(f.text, "w-6 h-6")} />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight mb-3 italic">{f.title}</h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Sección: Finanto vs Otros */}
      <section className="py-32 px-6 bg-slate-950">
        <div className="container max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <ScrollReveal animation="slide-left">
            <div className="space-y-10">
              <div className="space-y-4">
                <h2 className="text-4xl font-black tracking-tighter uppercase">¿Por qué <span className="text-primary">Finanto</span>?</h2>
                <p className="text-slate-400 font-medium text-lg leading-relaxed italic">
                  Superamos al Excel y a las libretas tradicionales con una interfaz diseñada para el campo de batalla inmobiliario.
                </p>
              </div>
              
              <div className="space-y-6">
                {[
                  { title: "No más errores manuales", desc: "Olvídate de fórmulas de Excel rotas. Finanto automatiza cada cálculo financiero." },
                  { title: "Movilidad absoluta", desc: "Actualiza el estatus de tu cita mientras caminas al auto, no esperes a llegar a tu escritorio." },
                  { title: "Ficha técnica instantánea", desc: "Copia resúmenes de crédito para WhatsApp en 2 segundos, no en 10 minutos de redacción." }
                ].map((item, i) => (
                  <ScrollReveal key={i} animation="fade-in" delay={i * 200}>
                    <div className="flex gap-4">
                      <div className="bg-green-500/20 p-1.5 rounded-full h-fit mt-1"><CheckCircle2 className="text-green-500 w-4 h-4" /></div>
                      <div>
                        <h4 className="font-bold uppercase text-sm tracking-widest">{item.title}</h4>
                        <p className="text-slate-500 text-sm font-medium">{item.desc}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="slide-right">
            <div className="relative group">
              <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full opacity-50" />
              <Card className="relative bg-slate-900 border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
                <div className="space-y-8">
                  <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                    <div className="p-3 bg-red-500/10 rounded-xl"><X className="text-red-500 w-6 h-6" /></div>
                    <h3 className="text-xl font-black uppercase text-slate-500 line-through">El método tradicional</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl opacity-50 grayscale">
                      <span className="text-sm font-bold uppercase">Excel / Papel</span>
                      <span className="text-[10px] font-black text-red-500">INEFICIENTE</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl opacity-50 grayscale">
                      <span className="text-sm font-bold uppercase">Calculadora de Mano</span>
                      <span className="text-[10px] font-black text-red-500">LENTO</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl opacity-50 grayscale">
                      <span className="text-sm font-bold uppercase">WhatsApp Manual</span>
                      <span className="text-[10px] font-black text-red-500">PROpenso a ERRORES</span>
                    </div>
                  </div>
                  <div className="pt-6 text-center italic text-xs text-slate-600 font-bold uppercase tracking-[0.2em]">Evoluciona a la era digital con Finanto</div>
                </div>
              </Card>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Sección: Calculadora Demo */}
      <section className="py-32 px-6 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="container max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <ScrollReveal animation="slide-left">
            <div className="space-y-8">
              <h2 className="text-4xl font-black tracking-tighter uppercase italic">Simulador <span className="text-primary">Instantáneo.</span></h2>
              <p className="text-slate-400 font-medium leading-relaxed">
                No hagas esperar al cliente. Ingresa un monto y obtén la mensualidad proyectada en segundos mientras estás en la llamada.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <CheckCircle2 className="text-primary w-5 h-5" />
                  <span className="text-sm font-bold uppercase tracking-widest">Retención ISR calculada (9%)</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <CheckCircle2 className="text-primary w-5 h-5" />
                  <span className="text-sm font-bold uppercase tracking-widest">Escrituración estimada (5%)</span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="zoom-in">
            <div className="p-8 bg-slate-900 border border-primary/20 rounded-[2.5rem] shadow-2xl space-y-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Monto del Crédito</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-primary">$</span>
                  <Input 
                    value={demoAmount} 
                    onChange={e => handlePriceInputChange(e.target.value)}
                    className="h-14 pl-10 bg-primary/5 border-primary/20 text-2xl font-black text-white"
                  />
                </div>
              </div>
              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Mensualidad Est.</span>
                  <p className="text-3xl font-black text-white">{formatCurrency(calcMonthly)}</p>
                </div>
                <Button size="icon" variant="ghost" className="h-12 w-12 rounded-full bg-primary/10 text-primary">
                  <Calculator className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Sección: CRM Table Demo (Agenda Enriquecida) */}
      <section className="py-32 px-6 bg-slate-950">
        <div className="container max-w-5xl mx-auto space-y-16">
          <ScrollReveal animation="slide-up">
            <div className="text-center space-y-4">
              <h2 className="text-xs font-black text-primary uppercase tracking-[0.4em]">Gestión Profesional</h2>
              <p className="text-4xl font-black tracking-tighter uppercase">Tu agenda siempre <span className="text-primary">organizada.</span></p>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="zoom-in">
            <div className="border border-white/10 rounded-[2.5rem] overflow-hidden bg-white/[0.02] backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Cliente / Registro</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Motivo</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Producto</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Hora</th>
                      <th className="p-6 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {DEMO_APPS.map((app, i) => (
                      <tr 
                        key={app.id} 
                        className="group hover:bg-white/5 transition-all cursor-pointer" 
                        onClick={() => setSelectedDemoApp(app)}
                      >
                        <td className="p-6">
                          <div className="font-bold text-sm text-white">{app.name}</div>
                          <div className="text-[10px] text-primary font-bold uppercase tracking-tighter flex items-center gap-1.5 mt-1">
                            <Phone className="w-2.5 h-2.5" /> {app.phone}
                          </div>
                        </td>
                        <td className="p-6">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-black uppercase border",
                            app.type === 'Cierre' ? "bg-green-500/10 text-green-500 border-green-500/20" : 
                            app.type === 'Seguimiento' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                            "bg-primary/10 text-primary border-primary/20"
                          )}>{app.type}</span>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                            <Briefcase className="w-3.5 h-3.5 text-blue-400" /> {app.product}
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                            <Clock className="w-3.5 h-3.5" /> {app.time}
                          </div>
                        </td>
                        <td className="p-6 text-right">
                          <Button variant="ghost" size="icon" className="group-hover:text-primary transition-colors group-hover:translate-x-1 duration-300"><ChevronRight className="w-5 h-5" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 bg-[#01040d] border-t border-white/5 text-center">
        <ScrollReveal animation="slide-up">
          <div className="container max-w-6xl mx-auto space-y-12">
            <div className="space-y-6">
              <h2 className="text-5xl font-black tracking-tighter uppercase leading-none">DOMINA TU <br /><span className="text-primary">MERCADO.</span></h2>
              <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-sm">Finanto CRM: La herramienta del ejecutivo moderno.</p>
            </div>
            
            <Button 
              onClick={handleLogin}
              className="h-20 px-12 bg-white text-slate-950 hover:bg-slate-100 rounded-[2rem] text-xl font-black uppercase tracking-widest transition-transform active:scale-[0.98] shadow-2xl gap-4"
            >
              Comenzar Gratis <ChevronRight className="w-6 h-6" />
            </Button>

            <div className="pt-20 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-3 opacity-50">
                <div className="bg-white p-1 rounded"><Image src="/favicon.ico" alt="Finanto" width={16} height={16} /></div>
                <span className="font-black tracking-tighter text-sm uppercase">Finanto Cloud v2.0</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">© 2026 Reservados todos los derechos por Olivares.</p>
            </div>
          </div>
        </ScrollReveal>
      </footer>

      {/* Demo Modal Enriquecido */}
      <Dialog open={!!selectedDemoApp} onOpenChange={() => setSelectedDemoApp(null)}>
        <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-lg p-0 overflow-hidden rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="bg-primary/10 p-8 border-b border-white/5">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-4 bg-primary text-white rounded-2xl shadow-lg"><User className="w-8 h-8" /></div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-white leading-none">{selectedDemoApp?.name}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-white/10 rounded text-[9px] font-black uppercase text-primary border border-primary/20">Demo Mode</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedDemoApp?.status}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><CalendarIcon className="w-3 h-3" /> Fecha Programada</Label>
                  <p className="text-sm font-bold text-white">{selectedDemoApp?.date} • {selectedDemoApp?.time}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Briefcase className="w-3 h-3" /> Tipo de Inmueble</Label>
                  <p className="text-sm font-bold text-white">{selectedDemoApp?.product}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Phone className="w-3 h-3" /> Teléfono de Contacto</Label>
                  <p className="text-sm font-bold text-primary">{selectedDemoApp?.phone}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><MapPin className="w-3 h-3" /> Prospectado vía</Label>
                  <p className="text-sm font-bold text-white">{selectedDemoApp?.prospector}</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-3">
              <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" /> Acuerdos y Notas del Cliente
              </Label>
              <p className="text-sm leading-relaxed text-slate-200 font-medium italic">
                "{selectedDemoApp?.notes}"
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-bold">
                  {selectedDemoApp?.executive?.charAt(0)}
                </div>
                <div className="text-[10px] font-bold">
                  <span className="text-slate-500 uppercase block leading-none mb-1">Atiende:</span>
                  <span className="text-white">{selectedDemoApp?.executive}</span>
                </div>
              </div>
              <Button onClick={() => setSelectedDemoApp(null)} className="bg-primary hover:bg-primary/80 font-black uppercase text-[10px] tracking-widest px-8 h-12 rounded-2xl shadow-xl">
                Cerrar Expediente
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

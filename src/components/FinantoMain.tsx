"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react';
import CreditCalculator from '@/components/calculator/CreditCalculator';
import AppointmentsDashboard from '@/components/appointments/AppointmentsDashboard';
import AdvancedStats from '@/components/stats/AdvancedStats';
import TrashDialog from '@/components/appointments/TrashDialog';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Wallet, CalendarDays, Users, CheckCircle2, ShieldCheck, RotateCcw,
  Palette, Moon, Sun, Cpu, BookOpen, Calculator, Maximize2, Sparkles,
  ClipboardList, Copy, Crown, Snowflake, MessageSquare, 
  CalendarClock, HandCoins, CheckCircle, BadgeAlert, 
  MoreHorizontal, ArrowUpRight, ArrowDownRight, Coins, Star, Trophy, PartyPopper,
  TrendingUp, Trash2, Target, History as HistoryIcon, User, CalendarPlus,
  Receipt, BarChart3, PartyPopper as PartyIcon, ArrowRight
} from 'lucide-react';
import { useAppointments } from '@/hooks/use-appointments';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import * as Service from '@/services/appointment-service';
import { isBefore } from 'date-fns';

type Theme = 'tranquilo' | 'moderno' | 'discreto' | 'olivares' | 'corporativo-v2';

const APP_TIPS = [
  { icon: Calculator, title: "Calculadora Rápida", color: "text-primary", text: "Usa la calculadora rapida en caso de tener una llamada con un interesado que pregunte montos aproximados." },
  { icon: ClipboardList, title: "Gestión Eficiente", color: "text-accent", text: "Nunca olvides registrar todas tus citas en el gestionador de citas, para tener un orden eficiente de fechas y datos en un solo lugar." },
  { icon: ShieldCheck, title: "Seguridad de Datos", color: "text-destructive", text: "Recuerda, tus citas se guardan localmente para tu privacidad." },
  { icon: Sparkles, title: "IA Integrada", color: "text-yellow-500", text: "IA para automatización de mensajes personalizados y seguimiento de cierres." },
  { icon: Maximize2, title: "Modo Presentación", color: "text-primary", text: "Usa el icono de expansión para mostrar los números al cliente de forma limpia y profesional." },
  { icon: Palette, title: "Imagen Corporativa", color: "text-accent", text: "Usa el tema <<Corporativo V2>> para mostrar pantalla a tus clientes presenciales." },
  { icon: Copy, title: "Envío a WhatsApp", color: "text-green-500", text: "Copia los datos de cada cliente para mandarlos por el grupo de WhatsApp rápidamente." }
];

export interface FinantoMainProps {
  initialSection?: 'guia' | 'simulador' | 'gestor' | 'stats';
}

export default function FinantoMain({ initialSection }: FinantoMainProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  
  const [showHelp, setShowHelp] = useState(false);
  const [isSimulatorExpanded, setIsSimulatorExpanded] = useState(false);
  const [isGestorExpanded, setIsGestorExpanded] = useState(false);
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);
  
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>('corporativo-v2');
  const [api, setApi] = useState<CarouselApi>();
  const [timerKey, setTimerKey] = useState(0);
  
  const [pendingCommissionApp, setPendingCommissionApp] = useState<Service.Appointment | null>(null);
  const [celebrationApp, setCelebrationApp] = useState<Service.Appointment | null>(null);

  const shownCommissionIds = useRef<Set<string>>(new Set());
  const overdueQueue = useRef<Service.Appointment[]>([]);
  const lastClosedTimeRef = useRef<number>(0); 
  const pendingAppRef = useRef<Service.Appointment | null>(null);

  const appointmentState = useAppointments();

  const { 
    appointments, stats, isLoaded, resetData, clearAll, 
    editAppointment, unarchiveAppointment, deletePermanent
  } = appointmentState;

  const onSelectAppId = (id: string | null) => setSelectedAppId(id);
  
  const { toast } = useToast();

  const statsRef = useRef(stats);
  const appointmentsRef = useRef(appointments);

  useEffect(() => {
    if (!isLoaded) return;
    statsRef.current = stats;
    appointmentsRef.current = appointments;
  }, [stats, appointments, isLoaded]);

  useEffect(() => {
    pendingAppRef.current = pendingCommissionApp;
  }, [pendingCommissionApp]);

  const syncUrl = useCallback((path: string) => {
    if (typeof window === 'undefined') return;
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  }, []);

  const handleToggleHelp = (open: boolean) => {
    setShowHelp(open);
    if (open) { syncUrl('/guia'); document.title = "Manual - Finanto"; }
    else if (!isSimulatorExpanded && !isGestorExpanded && !isStatsExpanded) { syncUrl('/'); document.title = "Finanto"; }
  };

  const handleToggleSimulator = (open: boolean) => {
    setIsSimulatorExpanded(open);
    if (open) { syncUrl('/simulador'); document.title = "Simulador - Finanto"; }
    else if (!showHelp && !isGestorExpanded && !isStatsExpanded) { syncUrl('/'); document.title = "Finanto"; }
  };

  const handleToggleGestor = (open: boolean) => {
    setIsGestorExpanded(open);
    if (open) { syncUrl('/gestor'); document.title = "Gestor - Finanto"; }
    else if (!showHelp && !isSimulatorExpanded && !isStatsExpanded) { syncUrl('/'); document.title = "Finanto"; }
  };

  const handleToggleStats = (open: boolean) => {
    setIsStatsExpanded(open);
    if (open) { syncUrl('/stats'); document.title = "Stats - Finanto"; }
    else if (!showHelp && !isSimulatorExpanded && !isGestorExpanded) { syncUrl('/'); document.title = "Finanto"; }
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setShowHelp(path === '/guia');
      setIsSimulatorExpanded(path === '/simulador');
      setIsGestorExpanded(path === '/gestor');
      setIsStatsExpanded(path === '/stats');
      
      if (path === '/') document.title = "Finanto - Gestión Inmobiliaria";
      else if (path === '/guia') document.title = "Manual - Finanto";
      else if (path === '/simulador') document.title = "Simulador - Finanto";
      else if (path === '/gestor') document.title = "Gestor - Finanto";
      else if (path === '/stats') document.title = "Stats - Finanto";
    };

    window.addEventListener('popstate', handlePopState);
    handlePopState(); 

    const savedTheme = localStorage.getItem('finanto-theme') as Theme;
    if (savedTheme) applyTheme(savedTheme);
    else applyTheme('corporativo-v2');

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!api) return;
    const intervalId = setInterval(() => api.scrollNext(), 18000);
    return () => clearInterval(intervalId);
  }, [api, timerKey]);

  useEffect(() => {
    if (!isLoaded) return;

    const welcomeTimer = setTimeout(() => {
      toast({
        title: "¡Bienvenido a Finanto!",
        description: "Listo para el éxito inmobiliario. Tu agenda y herramientas están sincronizadas.",
      });
    }, 4000);

    const checkConfirmations = () => {
      const currentStats = statsRef.current;
      const unconfirmed = currentStats.todayCount - currentStats.todayConfirmed;
      if (unconfirmed > 0) {
        toast({
          variant: "warning",
          title: "Acción Requerida",
          description: `Faltan ${unconfirmed} ${unconfirmed === 1 ? 'cita' : 'citas'} de hoy por confirmar asistencia.`,
        });
      }
    };

    const initialTimer = setTimeout(checkConfirmations, 20000);
    const intervalTimer = setInterval(checkConfirmations, 1200000);

    return () => {
      clearTimeout(welcomeTimer);
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [isLoaded, toast]);

  useEffect(() => {
    if (!isLoaded) return;

    const performCommissionSearch = () => {
      const currentApps = appointmentsRef.current.filter(a => !a.isArchived);
      const today = new Date();

      const overdueCommissions = currentApps.filter(app => {
        const isSalesStatus = app.status === 'Cierre' || app.status === 'Apartado';
        const isPending = (app.commissionStatus || 'Pendiente') === 'Pendiente';
        const notShownYet = !shownCommissionIds.current.has(app.id);
        
        if (!isSalesStatus || !isPending || !notShownYet) return false;

        const paymentDate = Service.getCommissionPaymentDate(app.date);
        return isBefore(paymentDate, today);
      });

      overdueQueue.current = overdueCommissions;
    };

    const showNextPending = () => {
      const now = Date.now();
      if (pendingAppRef.current) return;
      if (lastClosedTimeRef.current > 0 && (now - lastClosedTimeRef.current < 30000)) return;

      if (overdueQueue.current.length === 0) {
        performCommissionSearch();
      }

      if (overdueQueue.current.length > 0) {
        const nextApp = overdueQueue.current.shift();
        if (nextApp) {
          shownCommissionIds.current.add(nextApp.id);
          setPendingCommissionApp(nextApp);
          
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");
          audio.volume = 0.4;
          audio.play().catch(() => {});
        }
      }
    };

    const startTimer = setTimeout(() => {
      showNextPending();
      const intervalId = setInterval(showNextPending, 5000);
      return () => clearInterval(intervalId);
    }, 15000);

    return () => clearTimeout(startTimer);
  }, [isLoaded]);

  const resetTimer = useCallback(() => setTimerKey(prev => prev + 1), []);
  const handleNext = useCallback(() => { if (api) { api.scrollNext(); resetTimer(); } }, [api, resetTimer]);
  const handlePrev = useCallback(() => { if (api) { api.scrollPrev(); resetTimer(); } }, [api, resetTimer]);

  const applyTheme = (themeId: Theme) => {
    setTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    if (themeId === 'corporativo-v2') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  const handleThemeChange = (themeId: Theme) => {
    applyTheme(themeId);
    localStorage.setItem('finanto-theme', themeId);
    toast({ title: "Tema actualizado", description: `Tema ${themeId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} aplicado.` });
  };

  const handleConfirmCommissionPayment = () => {
    if (pendingCommissionApp) {
      const updates: Partial<Service.Appointment> = { commissionStatus: 'Pagada' };
      if (pendingCommissionApp.status === 'Apartado') {
        updates.status = 'Cierre';
      }
      editAppointment(pendingCommissionApp.id, updates);
      toast({
        title: updates.status === 'Cierre' ? "¡Venta Cerrada!" : "Comisión Conciliada",
        description: updates.status === 'Cierre' 
          ? `El apartado de ${pendingCommissionApp.name} se ha convertido en Cierre tras el pago.`
          : `Se ha registrado el pago de ${pendingCommissionApp.name}.`,
      });
      setPendingCommissionApp(null);
      lastClosedTimeRef.current = Date.now();
    }
  };

  const handleCelebration = (app: Service.Appointment) => {
    setCelebrationApp(app);
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");
    audio.volume = 0.6;
    audio.play().catch(() => {});
  };

  const handleGlobalReset = () => {
    resetData(); 
    setShowResetConfirm(false);
    toast({ title: "Datos restaurados", description: "La agenda ha vuelto a su estado inicial." });
  };

  const handleGlobalClear = () => {
    clearAll(); 
    setShowClearConfirm(false);
    toast({ title: "Base de datos limpia", description: "Toda la información ha sido eliminada permanentemente.", variant: "destructive" });
  };

  if (!isLoaded) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(Math.round(val));
  };

  const statsCards = [
    { 
      label: 'Citas hoy', 
      value: stats.todayCount.toString(), 
      icon: CalendarDays, 
      color: 'text-primary',
      tooltip: (
        <div className="flex flex-col gap-1 text-[10px] leading-tight">
          <div className="flex justify-between items-center gap-4">
            <span className="text-muted-foreground uppercase font-medium">Mañana:</span>
            <span className="text-primary font-bold">{stats.tomorrowTotal}</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-muted-foreground uppercase font-medium">Confirmadas:</span>
            <span className="text-green-500 font-bold">{stats.todayConfirmed}</span>
          </div>
        </div>
      )
    },
    { 
      label: 'Pendientes', 
      value: stats.pendingCount.toString(), 
      icon: Wallet, 
      color: 'text-primary',
      tooltip: (
        <div className="flex flex-col gap-1 text-[10px] leading-tight">
          <div className="flex justify-between items-center gap-4">
            <span className="text-muted-foreground uppercase font-medium">Total próximos:</span>
            <span className="text-primary font-bold">{stats.pendingCount}</span>
          </div>
        </div>
      )
    },
    { 
      label: 'Prospectos Mes', 
      value: stats.currentMonthProspects.toString(), 
      icon: Users, 
      color: 'text-accent',
      comparison: stats.lastMonthProspects,
      tooltip: (
        <div className="flex flex-col gap-1 text-[10px] leading-tight">
          <div className="flex justify-between items-center gap-4">
            <span className="text-muted-foreground uppercase font-medium">Este mes:</span>
            <span className="text-accent font-bold">{stats.currentMonthProspects}</span>
          </div>
          <div className="flex justify-between items-center gap-4 border-t border-border/10 pt-1">
            <span className="text-muted-foreground uppercase font-medium">Mes pasado:</span>
            <span className="text-muted-foreground/60 font-bold">{stats.lastMonthProspects}</span>
          </div>
        </div>
      )
    },
    { 
      label: 'Ventas Mes', 
      value: stats.currentMonthSales.toString(), 
      icon: CheckCircle2, 
      color: 'text-green-500',
      comparison: stats.lastMonthSales,
      tooltip: (
        <div className="flex flex-col gap-1 text-[10px] leading-tight">
          <div className="flex justify-between items-center gap-4">
            <span className="text-muted-foreground uppercase font-medium">Cierres:</span>
            <span className="text-green-500 font-bold">{stats.currentMonthOnlyCierre}</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-muted-foreground uppercase font-medium">Apartados:</span>
            <span className="text-blue-500 font-bold">{stats.currentMonthApartados}</span>
          </div>
          <div className="flex justify-between items-center gap-4 border-t border-border/10 pt-1">
            <span className="text-muted-foreground uppercase font-medium">Mes pasado:</span>
            <span className="text-muted-foreground/60 font-bold">{stats.lastMonthSales}</span>
          </div>
        </div>
      )
    },
    { 
      label: 'Comisiones Mes', 
      value: formatCurrency(stats.currentMonthCommission), 
      icon: Coins, 
      color: 'text-yellow-500',
      comparison: stats.lastMonthCommission,
      isCurrency: true,
      tooltip: (
        <div className="flex flex-col gap-1 text-[10px] leading-tight">
          <div className="flex justify-between items-center gap-4">
            <span className="text-muted-foreground uppercase font-medium">Ingreso Neto Recibido:</span>
            <span className="text-primary font-bold">{formatCurrency(stats.currentMonthPaidCommission)}</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-muted-foreground uppercase font-medium">Cobro este viernes:</span>
            <span className="text-yellow-500 font-bold">{formatCurrency(stats.thisFridayCommission)}</span>
          </div>
          <div className="flex justify-between items-center gap-4 border-t border-border/10 pt-1">
            <span className="text-muted-foreground uppercase font-medium">Pendiente neto:</span>
            <span className="text-destructive font-bold">{formatCurrency(stats.overdueCommission)}</span>
          </div>
        </div>
      )
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border/40 sticky top-0 z-50 backdrop-blur-[12px] bg-card/10 shrink-0">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-1.5 rounded-lg border border-primary/30">
              <ShieldCheck className="text-primary w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-headline font-bold tracking-tight text-foreground leading-none">
                  Finanto <span className="text-primary">BETA</span>
                </h1>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-[10px] font-bold uppercase border border-primary/20" 
                  onClick={() => handleToggleHelp(true)}
                >
                  <BookOpen className="w-3.5 h-3.5 mr-1" /> Tutorial
                </Button>
              </div>
              <span className="text-[10px] text-muted-foreground font-medium opacity-60 mt-1">Por Olivares</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="w-9 h-9 rounded-full bg-muted border border-border overflow-hidden">
                  {theme === 'moderno' ? <Cpu className="w-5 h-5 text-primary" /> : theme === 'discreto' ? <Moon className="w-5 h-5 text-primary" /> : theme === 'olivares' ? <Crown className="w-5 h-5 text-primary" /> : theme === 'corporativo-v2' ? <MessageSquare className="w-5 h-5 text-primary" /> : <Palette className="w-5 h-5 text-primary" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 backdrop-blur-lg">
                <DropdownMenuLabel>Temas Visuales</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {[
                  { id: 'corporativo-v2', label: 'Corporativo V2', icon: MessageSquare, color: 'bg-[#1877F2]' },
                  { id: 'tranquilo', label: 'Tranquilo', icon: Palette, color: 'bg-primary' },
                  { id: 'moderno', label: 'Moderno', icon: Cpu, color: 'bg-cyan-500' },
                  { id: 'discreto', label: 'Discreto', icon: Moon, color: 'bg-slate-700' },
                  { id: 'olivares', label: 'Olivares', icon: Crown, color: 'bg-yellow-600' },
                ].map((t) => (
                  <DropdownMenuItem key={t.id} onClick={() => handleThemeChange(t.id as Theme)} className="cursor-pointer">
                    <t.icon className="w-4 h-4 text-muted-foreground mr-2" />
                    <div className={cn("w-2 h-2 rounded-full mr-2", t.color)} /> {t.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {statsCards.map((stat, i) => {
            const isTargetCommission = stat.label === 'Comisiones Mes' && stats.currentMonthCommission > 5000;
            const cardContent = (
              <Card 
                key={i}
                className="bg-card/30 backdrop-blur-md border-none hover:bg-card/50 cursor-default h-full transition-colors duration-300 relative overflow-hidden"
              >
                <div 
                  className="absolute inset-0 pointer-events-none animate-periodic-glow" 
                  style={{ animationDelay: `${i * 0.25}s` }}
                />
                <CardContent className="p-4 flex items-center gap-3 relative z-10">
                  <div className={cn("p-2 rounded-full bg-muted/50", stat.color)}><stat.icon className="w-5 h-5" /></div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground truncate">{stat.label}</p>
                    <div className="flex items-baseline gap-2">
                      <p className={cn(
                        "text-lg font-bold truncate",
                        isTargetCommission && "bg-gradient-to-r from-[#00F5FF] via-[#7B61FF] to-[#FF00D6] bg-clip-text text-transparent"
                      )}>
                        {stat.value}
                      </p>
                      {stat.comparison !== undefined && (
                        <div className="flex flex-col">
                          <span className="text-[8px] font-bold flex items-center whitespace-nowrap text-muted-foreground/40">
                            {stat.isCurrency ? (
                               <>
                                 {stats.currentMonthCommission >= stats.lastMonthCommission ? <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" /> : <ArrowDownRight className="w-2.5 h-2.5 mr-0.5" />}
                                 {formatCurrency(stat.comparison)}
                               </>
                            ) : (
                              <>
                                {parseInt(stat.value) > stat.comparison ? <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" /> : parseInt(stat.value) < stat.comparison ? <ArrowDownRight className="w-2.5 h-2.5 mr-0.5" /> : null}
                                {stat.comparison}
                              </>
                            )}
                          </span>
                          <span className="text-[7px] uppercase font-bold text-muted-foreground/30">Mes pasado</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );

            if (stat.tooltip) {
              return (
                <TooltipProvider key={i}>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      {cardContent}
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={1} className="bg-card border-border shadow-xl z-[100] p-3">
                      {stat.tooltip}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            }

            return <div key={i}>{cardContent}</div>;
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          <section className="xl:col-span-5 space-y-6">
            <CreditCalculator 
              isExpanded={isSimulatorExpanded} 
              onExpandedChange={handleToggleSimulator}
            />
            <div className="p-6 border rounded-xl border-primary/20 bg-primary/5">
              <Carousel setApi={setApi} className="w-full" opts={{ loop: true }}>
                <CarouselContent>
                  {APP_TIPS.map((tip, index) => (
                    <CarouselItem key={index}>
                      <div className="space-y-1">
                        <h3 className={cn("text-xs font-bold flex items-center gap-2", tip.color)}>
                          <tip.icon className="w-3.5 h-3.5" /> {tip.title}
                        </h3>
                        <p className="text-[11px] text-muted-foreground">{tip.text}</p>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="flex justify-end gap-1 mt-3">
                  <CarouselPrevious onClick={handlePrev} className="static h-6 w-6 border-primary/20 bg-transparent" />
                  <CarouselNext onClick={handleNext} className="static h-6 w-6 border-primary/20 bg-transparent" />
                </div>
              </Carousel>
            </div>
            <AdvancedStats 
              stats={stats} 
              isExpanded={isStatsExpanded}
              onExpandedChange={handleToggleStats}
            />
          </section>
          <section className="xl:col-span-7 pb-10 space-y-6">
            <AppointmentsDashboard 
              isExpanded={isGestorExpanded}
              onExpandedChange={handleToggleGestor}
              selectedAppId={selectedAppId}
              onSelectAppId={onSelectAppId}
              theme={theme}
              appointments={appointmentState.appointments} 
              activeAppointments={appointmentState.activeAppointments}
              upcoming={appointmentState.upcoming} 
              past={appointmentState.past} 
              addAppointment={appointmentState.addAppointment} 
              editAppointment={appointmentState.editAppointment} 
              archiveAppointment={appointmentState.archiveAppointment}
              unarchiveAppointment={appointmentState.unarchiveAppointment}
              formatFriendlyDate={appointmentState.formatFriendlyDate} 
              format12hTime={appointmentState.format12hTime} 
              stats={appointmentState.stats}
              onCelebrate={handleCelebration}
            />
          </section>
        </div>
      </main>

      <footer className="border-t border-border/40 py-6 bg-card/10 backdrop-blur-md">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="font-bold text-foreground">Finanto v1.1</span>
            <span>© 2026 - Sistema de Gestión Inmobiliaria</span>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowTrash(true)} 
              className="text-muted-foreground hover:text-destructive gap-2 h-8 px-3"
            >
              <Trash2 className="w-4 h-4" /> Papelera ({appointments.filter(a => a.isArchived).length})
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 backdrop-blur-lg">
                <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground">Administración</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowResetConfirm(true)} className="cursor-pointer gap-2 py-2">
                  <RotateCcw className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold">Reiniciar Seed</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowClearConfirm(true)} className="cursor-pointer gap-2 py-2 text-destructive focus:text-destructive">
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-xs font-semibold">Limpiar Datos</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </footer>

      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar reinicio?</AlertDialogTitle>
            <AlertDialogDescription>Se borrará tu información actual para restaurar los datos de prueba iniciales en la Agenda.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowResetConfirm(false)} type="button">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleGlobalReset} type="button">Sí, reiniciar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar todo?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción borrará todas tus citas permanentemente. No se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowClearConfirm(false)} type="button">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleGlobalClear} className="bg-destructive hover:bg-destructive/90 text-white" type="button">
              Eliminar Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TrashDialog 
        open={showTrash} 
        onOpenChange={setShowTrash}
        archivedAppointments={appointments.filter(a => a.isArchived)}
        onRestore={unarchiveAppointment}
        onDelete={deletePermanent}
        formatDate={appointmentState.formatFriendlyDate}
        format12hTime={appointmentState.format12hTime}
      />

      <Dialog open={showHelp} onOpenChange={handleToggleHelp}>
        <DialogContent 
          onInteractOutside={(e) => {
            if ((e.target as HTMLElement).closest('[role="status"]')) e.preventDefault();
          }}
          className="sm:max-w-[750px] h-[85vh] flex flex-col p-0 overflow-hidden bg-card shadow-2xl"
        >
          <DialogHeader className="p-6 border-b bg-primary/5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-3 border border-primary/30 rounded-xl bg-primary/10">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold font-headline">Guía de Inicio Rápido v1.1</DialogTitle>
                <DialogDescription className="text-xs">Domina Finanto y maximiza tus cierres inmobiliarios</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-12 pb-20">
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Calculator className="w-5 h-5" />
                  <h3 className="text-lg font-bold">1. Calculadora y Simulador Profesional</h3>
                </div>
                <div className="pl-7 space-y-3 text-sm text-muted-foreground border-l-4 border-primary/40 bg-primary/5 p-4 rounded-r-xl">
                  <p>Finanto ofrece dos niveles de análisis para tus clientes:</p>
                  <ul className="list-disc pl-4 space-y-2">
                    <li><strong>Calculadora Rápida:</strong> Ideal para llamadas telefónicas. Ingresa solo el monto del crédito para obtener mensualidad al instante.</li>
                    <li><strong>Simulador Expandido:</strong> Usa el icono <Maximize2 className="inline w-3 h-3" /> para entrar en modo profesional. Aquí podrás ajustar:
                      <ul className="pl-4 mt-1 list-circle space-y-1">
                        <li><strong>Enganche adicional:</strong> Para clientes que desean abonar más del 3% base.</li>
                        <li><strong>Plazos personalizados:</strong> Ajusta de 192 meses a lo que el cliente necesite.</li>
                        <li><strong>Gastos Operativos:</strong> Proyecta automáticamente escrituración (5%) y avalúos.</li>
                      </ul>
                    </li>
                    <li><strong>Cotizaciones:</strong> Usa el botón <strong>"Copiar Resumen"</strong> para generar una ficha técnica súper simple, impecable y lista para enviar por WhatsApp.</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-blue-500">
                  <CalendarClock className="w-5 h-5" />
                  <h3 className="text-lg font-bold">2. Gestión de Agenda Dinámica</h3>
                </div>
                <div className="pl-7 space-y-3 text-sm text-muted-foreground border-l-4 border-blue-500/40 bg-blue-500/5 p-4 rounded-r-xl">
                  <p>Organiza tus prospectos mediante las pestañas de navegación:</p>
                  <ul className="list-disc pl-4 space-y-2">
                    <li><strong>Pestaña Próximas:</strong> Tu centro de operaciones. Aquí verás tus citas de hoy y futuros días.
                      <ul className="pl-4 mt-1 list-circle space-y-1">
                        <li><strong>Confirmación:</strong> Usa el indicador de hoy para validar la asistencia del cliente.</li>
                        <li><strong>Reporte Diario:</strong> Un solo clic para copiar tus métricas de éxito del día.</li>
                      </ul>
                    </li>
                    <li><strong>Pestaña Historial:</strong> Tu CRM histórico. Consulta todos los resultados anteriores y cierres logrados.</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-accent">
                  <User className="w-5 h-5" />
                  <h3 className="text-lg font-bold">3. Expediente del Cliente y Productividad</h3>
                </div>
                <div className="pl-7 space-y-3 text-sm text-muted-foreground border-l-4 border-accent/40 bg-accent/5 p-4 rounded-r-xl">
                  <p>Cada registro es un expediente completo con herramientas de copiado rápido:</p>
                  <ul className="list-disc pl-4 space-y-2">
                    <li><strong>Copiado Inteligente:</strong> Botones rápidos para copiar el nombre del cliente o la ficha completa.</li>
                    <li><strong>Re-agendado:</strong> ¿El cliente no asistió o necesita otra cita? Usa el botón "Agendar 2da cita".</li>
                    <li><strong>Prospectadores Externos:</strong> Registra si la cita viene de un ejecutivo externo.</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-green-500">
                  <Coins className="w-5 h-5" />
                  <h3 className="text-lg font-bold">4. Ciclo de Cierres y Comisiones</h3>
                </div>
                <div className="pl-7 space-y-3 text-sm text-muted-foreground border-l-4 border-green-500/40 bg-green-500/5 p-4 rounded-r-xl">
                  <p>Control financiero total de tus ventas:</p>
                  <ul className="list-disc pl-4 space-y-2">
                    <li><strong>Apartado vs Cierre:</strong> Marca como "Apartado" mientras se formaliza y "Cierre" al finalizar.</li>
                    <li><strong>Regla de Pago:</strong> Finanto calcula automáticamente tu fecha de pago.</li>
                    <li><strong>Verificación de Pago:</strong> El sistema te alertará automáticamente cuando una comisión esté vencida.</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Target className="w-5 h-5" />
                  <h3 className="text-lg font-bold">5. Monitor de Rendimiento (Stats)</h3>
                </div>
                <div className="pl-7 space-y-3 text-sm text-muted-foreground border-l-4 border-primary/40 bg-primary/5 p-4 rounded-r-xl">
                  <p>Indicadores superiores para medir tu éxito en tiempo real:</p>
                  <ul className="list-disc pl-4 space-y-2">
                    <li><strong>Tooltips Inteligentes:</strong> Pasa el mouse sobre cualquier estadística para ver desgloses avanzados.</li>
                    <li><strong>Indicadores de Tendencia:</strong> Visualiza iconos <TrendingUp className="inline w-3 h-3 text-green-500" /> que te indican si estás superando tus números.</li>
                  </ul>
                </div>
              </section>
            </div>
          </ScrollArea>
          <DialogFooter className="p-4 border-t bg-muted/20">
            <Button onClick={() => handleToggleHelp(false)} className="w-full h-11 font-bold rounded-xl shadow-lg" type="button">
              ¡Entendido, a cerrar ventas!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!pendingCommissionApp} onOpenChange={(open) => { if (!open) { setPendingCommissionApp(null); lastClosedTimeRef.current = Date.now(); } }}>
        <DialogContent 
          onInteractOutside={(e) => {
            if ((e.target as HTMLElement).closest('[role="status"]')) e.preventDefault();
          }}
          className="sm:max-w-[450px] border-none bg-gradient-to-br from-blue-700 to-indigo-900 shadow-2xl text-white p-0 overflow-hidden"
        >
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="bg-white/10 p-3 rounded-full w-fit">
                <HandCoins className="w-8 h-8 text-blue-200" />
              </div>
              <div className="bg-red-500/20 px-3 py-1 rounded-full border border-red-400/30">
                <span className="text-[10px] font-bold text-red-100 uppercase tracking-widest flex items-center gap-1">
                  <BadgeAlert className="w-3 h-3" /> Pago Vencido
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-headline font-bold text-white">Verificación de Pago</DialogTitle>
              <DialogDescription className="text-sm text-blue-100/70">Confirmación de recepción de comisión para trámite finalizado.</DialogDescription>
            </div>
            
            {pendingCommissionApp && (
              <div className="space-y-4">
                <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-4 backdrop-blur-sm">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[10px] font-bold uppercase text-blue-200 tracking-widest">Cliente</span>
                    <span className="text-base font-bold text-white">{pendingCommissionApp.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase text-blue-200 tracking-widest">Comisión Neta (9% Tax Inc.)</span>
                    <span className="text-xl font-black text-blue-300">
                      {formatCurrency(Math.round(((pendingCommissionApp.finalCreditAmount || 0) * 0.007 * ((pendingCommissionApp.commissionPercent || 0) / 100)) * 0.91))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase text-blue-200 tracking-widest">Fecha de Pago</span>
                    <span className="text-sm font-bold text-blue-100">
                      {new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(Service.getCommissionPaymentDate(pendingCommissionApp.date))}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-center text-blue-100/60 font-medium px-4 leading-relaxed">¿Confirmas que esta comisión ya fue liquidada y el monto neto está disponible en tu cuenta?</p>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => { setPendingCommissionApp(null); lastClosedTimeRef.current = Date.now(); }} className="flex-1 h-12 text-xs font-bold uppercase text-blue-100 hover:bg-white/10" type="button">Aún no</Button>
              <Button onClick={handleConfirmCommissionPayment} className="flex-1 h-12 bg-white text-blue-700 hover:bg-blue-50 font-bold shadow-lg gap-2" type="button">
                <CheckCircle className="w-4 h-4" /> Ya se pagó
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!celebrationApp} onOpenChange={(o) => {
        if (!o) {
          const app = celebrationApp;
          setCelebrationApp(null);
          if (app) onSelectAppId(app.id);
        }
      }}>
        <DialogContent 
          onInteractOutside={(e) => {
            if ((e.target as HTMLElement).closest('[role="status"]')) e.preventDefault();
          }}
          className="sm:max-w-[480px] border-none bg-gradient-to-br from-green-600 to-emerald-800 shadow-2xl text-white p-0 overflow-hidden"
        >
          <div className="relative p-8 space-y-6">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <PartyIcon className="w-32 h-32 rotate-12" />
            </div>
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="bg-white/20 p-4 rounded-2xl shadow-inner">
                <Trophy className="w-10 h-10 text-yellow-300 animate-bounce" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-3xl font-headline font-black text-white tracking-tight">¡CIERRE EXITOSO!</DialogTitle>
                <DialogDescription className="text-green-100/80 font-medium">Felicidades por concretar esta venta, {celebrationApp?.name} es ahora tu cierre oficial.</DialogDescription>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="p-5 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md space-y-4">
                <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                  <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                  <span className="text-xs font-bold uppercase tracking-widest">Próximos Pasos Recomendados</span>
                </div>
                <ul className="space-y-3">
                  {[
                    "Asegúrate de que el contrato esté completo y llegue a gerencia hoy mismo.",
                    "Registra todos los datos útiles en las notas de la cita para el seguimiento.",
                    "¡Cuidado con el manejo del dinero! Verifica siempre los comprobantes de depósito.",
                    "Registra las comisiones pactadas en el área financiera del expediente."
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 group">
                      <div className="mt-1 bg-green-400 rounded-full p-0.5 group-hover:scale-110 transition-transform">
                        <ArrowRight className="w-3 h-3 text-green-900" />
                      </div>
                      <span className="text-xs font-medium text-green-50 leading-tight">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Button onClick={() => {
              const app = celebrationApp;
              setCelebrationApp(null);
              if (app) onSelectAppId(app.id);
            }} className="w-full h-14 bg-white text-green-700 hover:bg-blue-50 font-black text-lg rounded-2xl shadow-2xl gap-2 relative z-10" type="button">
              <PartyIcon className="w-5 h-5" /> ¡A POR EL SIGUIENTE CIERRE!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

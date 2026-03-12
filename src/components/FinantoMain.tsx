"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react';
import CreditCalculator from '@/components/calculator/CreditCalculator';
import AppointmentsDashboard from '@/components/appointments/AppointmentsDashboard';
import AppointmentForm from '@/components/appointments/AppointmentForm';
import AdvancedStats from '@/components/stats/AdvancedStats';
import TrashDialog from '@/components/appointments/TrashDialog';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { 
  Wallet, CalendarDays, Users, CheckCircle2, RotateCcw,
  Palette, Moon, Sun, Cpu, BookOpen, Calculator, Maximize2, Sparkles,
  ClipboardList, Copy, Crown, MessageSquare, 
  CalendarClock, HandCoins, CheckCircle, BadgeAlert, 
  MoreHorizontal, ArrowUpRight, ArrowDownRight, Coins, Star, Trophy,
  TrendingUp, Trash2, User, Receipt, BarChart3, PartyPopper as PartyIcon, ArrowRight,
  LogOut, UserPlus, X, Search, Bell
} from 'lucide-react';
import { useAppointments } from '@/hooks/use-appointments';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { logout } from '@/lib/auth';
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
  DialogClose
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import * as Service from '@/services/appointment-service';
import { isBefore } from 'date-fns';

type Theme = 'tranquilo' | 'moderno' | 'discreto' | 'olivares' | 'corporativo-v2';

const APP_TIPS = [
  { icon: Calculator, title: "Calculadora Rápida", color: "text-primary", text: "Usa la calculadora rapida en caso de tener una llamada con un interesado que pregunte montos aproximados." },
  { icon: ClipboardList, title: "Gestión Eficiente", color: "text-accent", text: "Nunca olvides registrar todas tus citas en el gestionador de citas, para tener un orden eficiente de fechas y datos en un solo lugar." },
  { icon: Sparkles, title: "Seguridad Cloud", color: "text-destructive", text: "Tus datos están ahora sincronizados en Firebase para tu máxima seguridad." },
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
  const [isNewAppExpanded, setIsNewAppExpanded] = useState(false);
  
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
    editAppointment, unarchiveAppointment, deletePermanent, user, profile
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
    else if (!isSimulatorExpanded && !isGestorExpanded && !isStatsExpanded && !isNewAppExpanded) { syncUrl('/'); document.title = "Finanto"; }
  };

  const handleToggleSimulator = (open: boolean) => {
    setIsSimulatorExpanded(open);
    if (open) { syncUrl('/simulador'); document.title = "Simulador - Finanto"; }
    else if (!showHelp && !isGestorExpanded && !isStatsExpanded && !isNewAppExpanded) { syncUrl('/'); document.title = "Finanto"; }
  };

  const handleToggleGestor = (open: boolean) => {
    setIsGestorExpanded(open);
    if (open) { syncUrl('/gestor'); document.title = "Agenda - Finanto"; }
    else if (!showHelp && !isSimulatorExpanded && !isStatsExpanded && !isNewAppExpanded) { syncUrl('/'); document.title = "Finanto"; }
  };

  const handleToggleStats = (open: boolean) => {
    setIsStatsExpanded(open);
    if (open) { syncUrl('/stats'); document.title = "Stats - Finanto"; }
    else if (!showHelp && !isSimulatorExpanded && !isGestorExpanded && !isNewAppExpanded) { syncUrl('/'); document.title = "Finanto"; }
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
      else if (path === '/gestor') document.title = "Agenda - Finanto";
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
        description: `Listo para el éxito inmobiliario, ${user?.displayName || 'Ejecutivo'}.`,
      });
    }, 4000);

    const checkConfirmations = () => {
      const currentStats = statsRef.current;
      const unconfirmed = (currentStats.todayCount || 0) - (currentStats.todayConfirmed || 0);
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
  }, [isLoaded, toast, user]);

  useEffect(() => {
    if (!isLoaded) return;

    const performCommissionSearch = () => {
      const currentApps = appointmentsRef.current.filter(a => !a.isArchived);
      const today = new Date();

      const overdueCommissions = currentApps.filter(app => {
        const isSalesStatus = app.status === 'Cierre';
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
  };

  const handleGlobalReset = () => {
    resetData(); 
    setShowResetConfirm(false);
    toast({ title: "Datos restaurados", description: "La agenda ha vuelto a su estado inicial. Sincronizando..." });
  };

  const handleGlobalClear = () => {
    clearAll(); 
    setShowClearConfirm(false);
    toast({ title: "Base de datos limpia", description: "Toda la información ha sido eliminada de este equipo.", variant: "destructive" });
  };

  const handleLogout = async () => {
    await logout();
    window.location.reload();
  };

  if (!isLoaded) return null;

  const formatCurrency = (val: number) => {
    if (isNaN(val) || val === null || val === undefined) return "$0";
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(Math.round(val));
  };

  const getDynamicGradient = (val: number) => {
    if (val < 2000) return "";
    if (val < 5000) return "text-gradient-aqua-blue";
    if (val < 10000) return "text-gradient-aqua-violet";
    return "text-gradient-lima-blue";
  };

  const statsCards = [
    { 
      label: 'Citas hoy', 
      value: (stats.todayCount || 0).toString(), 
      icon: CalendarDays, 
      color: 'text-primary',
      tooltip: (
        <div className="flex flex-col gap-1 text-[10px] leading-tight">
          <div className="flex justify-between items-center gap-4">
            <span className="uppercase font-medium">Mañana:</span>
            <span className="text-primary font-bold">{stats.tomorrowTotal || 0}</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="uppercase font-medium">Confirmadas:</span>
            <span className="text-green-500 font-bold">{stats.todayConfirmed || 0}</span>
          </div>
        </div>
      )
    },
    { 
      label: 'Pendientes', 
      value: (stats.pendingCount || 0).toString(), 
      icon: Wallet, 
      color: 'text-primary',
      tooltip: (
        <div className="flex flex-col gap-1 text-[10px] leading-tight">
          <div className="flex justify-between items-center gap-4">
            <span className="uppercase font-medium">Total próximos:</span>
            <span className="text-primary font-bold">{stats.pendingCount || 0}</span>
          </div>
        </div>
      )
    },
    { 
      label: 'Prospectos Mes', 
      value: (stats.currentMonthProspects || 0).toString(), 
      icon: Users, 
      color: 'text-accent',
      comparison: stats.lastMonthProspects || 0,
      tooltip: (
        <div className="flex flex-col gap-1 text-[10px] leading-tight">
          <div className="flex justify-between items-center gap-4">
            <span className="uppercase font-medium">Este mes:</span>
            <span className="text-accent font-bold">{stats.currentMonthProspects || 0}</span>
          </div>
          <div className="flex justify-between items-center gap-4 border-t border-border/10 pt-1">
            <span className="uppercase font-medium opacity-60">Mes pasado:</span>
            <span className="font-bold opacity-60">{stats.lastMonthProspects || 0}</span>
          </div>
        </div>
      )
    },
    { 
      label: 'Ventas Mes', 
      value: (stats.currentMonthSales || 0).toString(), 
      icon: CheckCircle2, 
      color: 'text-green-500',
      comparison: stats.lastMonthSales || 0,
      tooltip: (
        <div className="flex flex-col gap-1 text-[10px] leading-tight">
          <div className="flex justify-between items-center gap-4">
            <span className="uppercase font-medium">Cierres:</span>
            <span className="text-green-500 font-bold">{stats.currentMonthOnlyCierre || 0}</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="uppercase font-medium">Apartados:</span>
            <span className="text-blue-500 font-bold">{stats.currentMonthApartados || 0}</span>
          </div>
          <div className="flex justify-between items-center gap-4 border-t border-border/10 pt-1">
            <span className="uppercase font-medium opacity-60">Mes pasado:</span>
            <span className="font-bold opacity-60">{stats.lastMonthSales || 0}</span>
          </div>
        </div>
      )
    },
    { 
      label: 'Comisiones Mes', 
      value: formatCurrency(stats.currentMonthCommission || 0), 
      icon: Coins, 
      color: 'text-yellow-500',
      comparison: stats.lastMonthCommission || 0,
      isCurrency: true,
      tooltip: (
        <div className="flex flex-col gap-1 text-[10px] leading-tight">
          <div className="flex justify-between items-center gap-4">
            <span className="uppercase font-medium">Ingreso Neto Recibido:</span>
            <span className="text-primary font-bold">{formatCurrency(stats.currentMonthPaidCommission || 0)}</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="uppercase font-medium">Cobro este viernes:</span>
            <span className="text-yellow-500 font-bold">{formatCurrency(stats.thisFridayCommission || 0)}</span>
          </div>
          <div className="flex justify-between items-center gap-4 border-t border-border/10 pt-1">
            <span className="uppercase font-medium text-destructive">Pendiente neto:</span>
            <span className="text-destructive font-bold">{formatCurrency(stats.overdueCommission || 0)}</span>
          </div>
        </div>
      )
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border/40 sticky top-0 z-50 backdrop-blur-[12px] bg-card/10 shrink-0 animate-in slide-in-from-top duration-700">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-1.5 rounded-lg border border-primary/30 flex items-center justify-center overflow-hidden">
              <Image 
                src="/favicon.ico" 
                alt="Finanto Logo" 
                width={24} 
                height={24} 
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-headline font-bold tracking-tight text-foreground leading-none">
                  FINANTO <span className="text-accent">CRM</span>
                </h1>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-[10px] font-bold uppercase border border-primary/20 hidden sm:flex" 
                  onClick={() => handleToggleHelp(true)}
                >
                  <BookOpen className="w-3.5 h-3.5 mr-1" /> Tutorial
                </Button>
              </div>
              <span className="text-[10px] text-muted-foreground font-medium opacity-60 mt-1">Por Olivares</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {profile?.role && (
              <Badge variant="outline" className="hidden sm:flex text-[9px] font-bold uppercase tracking-tighter bg-primary/5 text-primary border-primary/20 px-2 py-0.5 rounded-full">
                {profile.role}
              </Badge>
            )}
            
            <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full overflow-hidden border border-border/50">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.photoURL || ''} />
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                      {user?.displayName?.charAt(0) || 'E'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 backdrop-blur-lg">
                <DropdownMenuLabel className="flex flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-foreground truncate">{user?.displayName}</span>
                    <Badge className="text-[8px] h-4 px-1.5 font-black uppercase bg-primary/10 text-primary border-none">{profile?.role || 'Prospectador'}</Badge>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium truncate">{user?.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground">Temas Visuales</DropdownMenuLabel>
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
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-2 sm:px-4 py-4 md:py-12">
        {/* Micro Stats Row (Horizontal Scroll on Mobile) */}
        <div className="flex overflow-x-auto pb-4 md:pb-0 md:grid md:grid-cols-5 gap-2 sm:gap-4 mb-6 sm:mb-8 scrollbar-thin">
          {statsCards.map((stat, i) => {
            const isTargetCommission = stat.label === 'Comisiones Mes';
            const cardContent = (
              <Card 
                key={i}
                className={cn(
                  "bg-card/30 backdrop-blur-md border-none hover:bg-card/50 cursor-default h-full transition-all duration-300 relative overflow-hidden animate-finanto-reveal opacity-0 min-w-[150px] md:min-w-0",
                  i === 0 ? "delay-100" : i === 1 ? "delay-200" : i === 2 ? "delay-300" : i === 3 ? "delay-400" : i === 4 ? "delay-500" : ""
                )}
              >
                <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3 relative z-10">
                  <div className={cn("p-1.5 sm:p-2 rounded-full bg-muted/50", stat.color)}><stat.icon className="w-4 h-4 sm:w-5 sm:h-5" /></div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[8px] sm:text-[9px] uppercase font-bold text-muted-foreground truncate">{stat.label}</p>
                    <div className="flex items-baseline gap-1 sm:gap-2">
                      <p className={cn(
                        "text-sm sm:text-lg font-bold truncate",
                        isTargetCommission ? getDynamicGradient(stats.currentMonthCommission || 0) : ""
                      )}>
                        {stat.value}
                      </p>
                      {stat.comparison !== undefined && (
                        <div className="flex flex-col hidden sm:flex">
                          <span className={cn(
                            "text-[8px] font-bold flex items-center whitespace-nowrap",
                            (parseFloat(stat.value.replace(/[^0-9.-]+/g,"")) >= stat.comparison) ? "text-green-500" : "text-destructive"
                          )}>
                            {stat.isCurrency ? (
                               <>
                                 {(stats.currentMonthCommission || 0) >= (stats.lastMonthCommission || 0) ? <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" /> : <ArrowDownRight className="w-2.5 h-2.5 mr-0.5" />}
                                 {formatCurrency(stat.comparison)}
                               </>
                            ) : (
                              <>
                                {parseInt(stat.value) >= stat.comparison ? <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" /> : <ArrowDownRight className="w-2.5 h-2.5 mr-0.5" />}
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
                    <TooltipContent side="bottom" sideOffset={1}>
                      {stat.tooltip}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            }

            return <div key={i}>{cardContent}</div>;
          })}
        </div>

        {/* MOBILE MOSAIC VIEW */}
        <div className="md:hidden space-y-6 px-2 animate-finanto-reveal opacity-0 delay-200">
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tighter text-foreground">Hola, {user?.displayName?.split(' ')[0]}</h2>
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Sincronizado en la nube
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              onClick={() => handleToggleSimulator(true)}
              className="h-40 flex flex-col items-center justify-center gap-4 bg-primary/[0.03] border-primary/10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(var(--primary)/0.05)] active:scale-[0.98] active:bg-primary/[0.06] transition-all group overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-full opacity-50 group-active:scale-125 transition-transform" />
              <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-inner"><Calculator className="w-8 h-8" /></div>
              <div className="space-y-1 text-center">
                <span className="text-[11px] font-black uppercase tracking-widest block">Calculadora</span>
                <span className="text-[8px] font-bold text-muted-foreground/60 uppercase">Financiera</span>
              </div>
            </Button>

            <Button 
              variant="outline" 
              onClick={() => setIsNewAppExpanded(true)}
              className="h-40 flex flex-col items-center justify-center gap-4 bg-accent/[0.03] border-accent/10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(var(--accent)/0.05)] active:scale-[0.98] active:bg-accent/[0.06] transition-all group overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-accent/10 rounded-bl-full opacity-50 group-active:scale-125 transition-transform" />
              <div className="p-4 bg-accent/10 rounded-2xl text-accent shadow-inner"><UserPlus className="w-8 h-8" /></div>
              <div className="space-y-1 text-center">
                <span className="text-[11px] font-black uppercase tracking-widest block">Nueva Cita</span>
                <span className="text-[8px] font-bold text-muted-foreground/60 uppercase">Registro</span>
              </div>
            </Button>

            <Button 
              variant="outline" 
              onClick={() => handleToggleGestor(true)}
              className="h-40 flex flex-col items-center justify-center gap-4 bg-blue-600/[0.03] border-blue-600/10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(37,99,235,0.05)] active:scale-[0.98] active:bg-blue-600/[0.06] transition-all group overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-600/10 rounded-bl-full opacity-50 group-active:scale-125 transition-transform" />
              <div className="p-4 bg-blue-600/10 rounded-2xl text-blue-600 shadow-inner"><CalendarClock className="w-8 h-8" /></div>
              <div className="space-y-1 text-center">
                <span className="text-[11px] font-black uppercase tracking-widest block">Agenda</span>
                <span className="text-[8px] font-bold text-muted-foreground/60 uppercase">CRM Clientes</span>
              </div>
            </Button>

            <Button 
              variant="outline" 
              onClick={() => handleToggleStats(true)}
              className="h-40 flex flex-col items-center justify-center gap-4 bg-yellow-500/[0.03] border-yellow-500/10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(234,179,8,0.05)] active:scale-[0.98] active:bg-yellow-500/[0.06] transition-all group overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/10 rounded-bl-full opacity-50 group-active:scale-125 transition-transform" />
              <div className="p-4 bg-yellow-500/10 rounded-2xl text-yellow-600 shadow-inner"><BarChart3 className="w-8 h-8" /></div>
              <div className="space-y-1 text-center">
                <span className="text-[11px] font-black uppercase tracking-widest block">Stats Pro</span>
                <span className="text-[8px] font-bold text-muted-foreground/60 uppercase">Inteligencia</span>
              </div>
            </Button>
          </div>

          <div className="p-6 border border-border/40 bg-card/20 rounded-[2rem] backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl"><Bell className="w-4 h-4 text-primary" /></div>
              <span className="text-xs font-bold uppercase tracking-tight">Actividad de hoy</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase">Confirmadas</span>
                <p className="text-xl font-black text-green-500">{stats.todayConfirmed || 0}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase">Total Citas</span>
                <p className="text-xl font-black text-primary">{stats.todayCount || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* DESKTOP LAYOUT & MAIN GRID */}
        <div className="hidden md:grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-8 items-start">
          <section className="xl:col-span-5 space-y-4 sm:space-y-6 animate-finanto-reveal opacity-0 delay-300">
            <CreditCalculator 
              isExpanded={isSimulatorExpanded} 
              onExpandedChange={handleToggleSimulator}
            />
            <div className="p-4 sm:p-6 border rounded-xl border-primary/20 bg-primary/5 animate-finanto-reveal opacity-0 delay-400">
              <Carousel setApi={setApi} className="w-full" opts={{ loop: true }}>
                <CarouselContent>
                  {APP_TIPS.map((tip, index) => (
                    <CarouselItem key={index}>
                      <div className="space-y-1">
                        <h3 className={cn("text-xs font-bold flex items-center gap-2", tip.color)}>
                          <tip.icon className="w-3.5 h-3.5" /> {tip.title}
                        </h3>
                        <p className="text-[10px] sm:text-[11px] text-muted-foreground">{tip.text}</p>
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
          <section className="xl:col-span-7 pb-10 space-y-4 sm:space-y-6 animate-finanto-reveal opacity-0 delay-500">
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

      <footer className="border-t border-border/40 py-4 sm:py-6 bg-card/10 backdrop-blur-md animate-in fade-in slide-in-from-bottom duration-700">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="font-bold text-foreground">Finanto v2.0</span>
            <span className="hidden sm:inline">© 2026 - Sincronizado en Firebase</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowTrash(true)} 
              className="text-muted-foreground hover:text-destructive gap-2 h-8 px-2 sm:px-3"
            >
              <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Papelera</span> ({appointments.filter(a => a.isArchived).length})
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
                  <span className="text-xs font-semibold">Reiniciar Semilla</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowClearConfirm(true)} className="cursor-pointer gap-2 py-2 text-destructive focus:text-destructive">
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-xs font-semibold">Limpiar Local</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </footer>

      {/* NEW APPOINTMENT DIALOG (MOBILE MOSAIC) */}
      <Dialog open={isNewAppExpanded} onOpenChange={setIsNewAppExpanded}>
        <DialogContent data-appointments-dialog="true" className="max-w-none w-screen h-screen m-0 rounded-none bg-background border-none p-0 flex flex-col overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b border-border/40 flex flex-row items-center justify-between bg-card/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-accent/20 p-2 rounded-xl border border-accent/30"><UserPlus className="text-accent w-6 h-6" /></div>
              <div>
                <DialogTitle className="text-xl font-bold">Nueva Cita</DialogTitle>
                <DialogDescription className="text-xs">Registro rápido de prospecto comercial.</DialogDescription>
              </div>
            </div>
            <DialogClose asChild><Button variant="ghost" size="icon" className="rounded-full hover:bg-destructive/10 h-10 w-10"><X className="w-5 h-5" /></Button></DialogClose>
          </DialogHeader>
          <div className="flex-1 p-4 overflow-y-auto bg-muted/5 scrollbar-thin">
            <div className="max-w-2xl mx-auto py-6">
              <AppointmentForm onAdd={(data) => { appointmentState.addAppointment(data); setIsNewAppExpanded(false); }} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar reinicio?</AlertDialogTitle>
            <AlertDialogDescription>Se borrará tu información actual para restaurar los datos de prueba iniciales en la nube.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleGlobalReset} type="button">Sí, reiniciar</AlertDialogAction>
            <AlertDialogCancel onClick={() => setShowResetConfirm(false)} type="button">Cancelar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar todo local?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción borrará el cache local de tus citas. Los datos en la nube no se verán afectados.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleGlobalClear} className="bg-destructive hover:bg-destructive/90 text-white" type="button">
              Limpiar Local
            </AlertDialogAction>
            <AlertDialogCancel onClick={() => setShowClearConfirm(false)} type="button">Cancelar</AlertDialogCancel>
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
          className="sm:max-w-[750px] h-screen sm:h-[85vh] flex flex-col p-0 overflow-hidden bg-card shadow-2xl border-none"
        >
          <DialogHeader className="p-6 sm:p-8 border-b bg-primary/5 shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-3 sm:p-4 border-2 border-primary/30 rounded-2xl bg-primary/10 shadow-inner">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary animate-pulse" />
              </div>
              <div>
                <DialogTitle className="text-2xl sm:text-3xl font-black font-headline tracking-tight">Guía Maestra Finanto</DialogTitle>
                <DialogDescription className="text-xs sm:text-sm font-medium text-muted-foreground">Tu arsenal profesional para dominar el cierre inmobiliario.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <ScrollArea className="flex-1">
            <div className="p-6 sm:p-8 space-y-10 pb-24">
              <section className="space-y-4">
                <div className="flex items-center gap-3 text-primary">
                  <div className="bg-primary/10 p-2 rounded-lg"><Calculator className="w-5 h-5" /></div>
                  <h3 className="text-xl font-black uppercase tracking-tight">1. Calculadora y Simulador</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 border-l-4 border-primary bg-primary/5 rounded-r-2xl space-y-2">
                    <p className="font-bold text-primary text-sm">Vista Rápida</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">Perfecta para llamadas de primer contacto. Solo ingresa el crédito y obtén la mensualidad base al instante.</p>
                  </div>
                  <div className="p-5 border-l-4 border-primary/40 bg-card border border-border/40 rounded-r-2xl space-y-2">
                    <p className="font-bold text-foreground text-sm">Escenarios Pro</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">Ajusta plazos, enganches extra y visualiza <strong>gastos notariales (5%)</strong> y avalúos para un perfilamiento real.</p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 text-blue-600">
                  <div className="bg-blue-600/10 p-2 rounded-lg"><CalendarClock className="w-5 h-5" /></div>
                  <h3 className="text-xl font-black uppercase tracking-tight">2. El Motor de la Agenda</h3>
                </div>
                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-200 dark:border-blue-800 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-600 text-white p-1 rounded-full shrink-0 mt-1"><ArrowRight className="w-3 h-3" /></div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold">Pestaña Próximas</p>
                      <p className="text-xs text-muted-foreground">Usa el indicador de <strong>Confirmación</strong> antes de tu cita. Al finalizar, registra el resultado para alimentar tus estadísticas.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-600 text-white p-1 rounded-full shrink-0 mt-1"><ArrowRight className="w-3 h-3" /></div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold">Sincronización Cloud</p>
                      <p className="text-xs text-muted-foreground">Tus citas se guardan automáticamente en tu cuenta de Google. Accede desde cualquier lugar.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 text-accent">
                  <div className="bg-accent/10 p-2 rounded-lg"><User className="w-5 h-5" /></div>
                  <h3 className="text-xl font-black uppercase tracking-tight">3. El Expediente CRM</h3>
                </div>
                <div className="p-6 border-2 border-dashed border-accent/30 rounded-3xl bg-accent/5 space-y-4">
                  <p className="text-sm font-medium text-accent-foreground/80 leading-relaxed italic">"Cada cliente es un activo. No dejes que la información se pierda en libretas."</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-bold uppercase tracking-wide">
                    <li className="flex items-center gap-2 text-accent"><CheckCircle className="w-3.5 h-3.5" /> Re-agenda en un clic</li>
                    <li className="flex items-center gap-2 text-accent"><CheckCircle className="w-3.5 h-3.5" /> Prospectadores Externos</li>
                    <li className="flex items-center gap-2 text-accent"><CheckCircle className="w-3.5 h-3.5" /> Notas de Seguimiento</li>
                    <li className="flex items-center gap-2 text-accent"><CheckCircle className="w-3.5 h-3.5" /> Ficha Técnica a WhatsApp</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 text-green-600">
                  <div className="bg-green-600/10 p-2 rounded-lg"><Coins className="w-5 h-5" /></div>
                  <h3 className="text-xl font-black uppercase tracking-tight">4. Cierres y Comisiones</h3>
                </div>
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-2 border-green-200 dark:border-green-800 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-green-200 dark:border-green-800">
                    <span className="text-xs font-black uppercase text-green-700">Lógica de Pago</span>
                    <BadgeAlert className="w-4 h-4 text-orange-500" />
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground font-medium">
                    Al marcar <strong>Cierre</strong>, el sistema calcula automáticamente tu comisión neta (0.7% con retención del 9%). <br /><br />
                    Recuerda el ciclo: <span className="text-green-700 font-bold">Dom-Mar</span> se paga el próximo viernes. <span className="text-green-700 font-bold">Mié-Sáb</span> se paga al subsiguiente. El sistema te avisará cuando un pago esté vencido.
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 text-primary">
                  <div className="bg-primary/10 p-2 rounded-lg"><BarChart3 className="w-5 h-5" /></div>
                  <h3 className="text-xl font-black uppercase tracking-tight">5. Panel de Inteligencia</h3>
                </div>
                <div className="p-6 border border-border bg-muted/20 rounded-3xl space-y-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    <p className="text-sm font-bold">Monitor de Rendimiento</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Entra a <strong>Stats</strong> para ver tus gráficos de actividad. Busca los gradientes de color: si tus números brillan en <span className="text-blue-500 font-bold">Azul</span>, <span className="text-purple-500 font-bold">Violeta</span> o <span className="text-green-500 font-bold">Lima</span>, significa que estás superando tus metas del mes.
                  </p>
                </div>
              </section>
            </div>
          </ScrollArea>
          <DialogFooter className="p-6 border-t bg-muted/10 shrink-0">
            <Button onClick={() => handleToggleHelp(false)} className="w-full h-14 text-lg font-black rounded-2xl shadow-xl hover:scale-[1.02] transition-transform bg-primary text-white" type="button">
              ¡ENTENDIDO, A CERRAR VENTAS!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!pendingCommissionApp} onOpenChange={(open) => { if (!open) { setPendingCommissionApp(null); lastClosedTimeRef.current = Date.now(); } }}>
        <DialogContent 
          onInteractOutside={(e) => {
            if ((e.target as HTMLElement).closest('[role="status"]')) e.preventDefault();
          }}
          className="sm:max-w-[450px] border-none bg-gradient-to-br from-blue-700 to-indigo-900 shadow-2xl text-white p-0 overflow-hidden h-screen sm:h-auto"
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
                      {formatCurrency(Math.round(((Number(pendingCommissionApp.finalCreditAmount) || 0) * 0.007 * ((Number(pendingCommissionApp.commissionPercent) || 0) / 100)) * 0.91))}
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
          className="sm:max-w-[480px] border-none bg-gradient-to-br from-green-600 to-emerald-800 shadow-2xl text-white p-0 overflow-hidden h-screen sm:h-auto"
        >
          <div className="relative p-6 sm:p-8 space-y-6">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <PartyIcon className="w-24 h-24 sm:w-32 sm:h-32 rotate-12" />
            </div>
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="bg-white/20 p-3 sm:p-4 rounded-2xl shadow-inner">
                <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-300 animate-bounce" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-2xl sm:text-3xl font-headline font-black text-white tracking-tight">¡CIERRE EXITOSO!</DialogTitle>
                <DialogDescription className="text-green-100/80 font-medium">Felicidades por concretar esta venta, {celebrationApp?.name} es ahora tu cierre oficial.</DialogDescription>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="p-4 sm:p-5 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md space-y-4">
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

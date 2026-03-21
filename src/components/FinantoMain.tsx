
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

type Theme = 'tranquilo' | 'moderno' | 'discreto' | 'olivares' | 'corporativo' | 'corporativo-oscuro';

const APP_TIPS = [
  { icon: Calculator, title: "Calculadora Rápida", color: "text-primary", text: "Usa la calculadora rapida en caso de tener una llamada con un interesado que pregunte montos aproximados." },
  { icon: ClipboardList, title: "Gestión Eficiente", color: "text-accent", text: "Nunca olvides registrar todas tus citas en el gestionador de citas, para tener un orden eficiente de fechas y datos en un solo lugar." },
  { icon: Sparkles, title: "Seguridad Cloud", color: "text-destructive", text: "Tus datos están ahora sincronizados en Firebase para tu máxima seguridad." },
  { icon: Maximize2, title: "Modo Presentación", color: "text-primary", text: "Usa el icono de expansión para mostrar los números al cliente de forma limpia y profesional." },
  { icon: Palette, title: "Imagen Corporativa", color: "text-accent", text: "Usa el tema <<Corporativo>> para mostrar pantalla a tus clientes presenciales." },
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
  const [theme, setTheme] = useState<Theme>('corporativo');
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
    else applyTheme('corporativo');

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
    if (themeId === 'corporativo') {
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
                  { id: 'corporativo', label: 'Corporativo', icon: MessageSquare, color: 'bg-[#1877F2]' },
                  { id: 'corporativo-oscuro', label: 'Corporativo Oscuro', icon: Sparkles, color: 'bg-slate-900' },
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
                  <div className={cn("p-1.5 sm:p-2 rounded-full bg-muted/5", stat.color)}><stat.icon className="w-4 h-4 sm:w-5 sm:h-5" /></div>
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

        <div className="hidden md:grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-8 items-start">
          <section className="xl:col-span-5 space-y-4 sm:space-y-6 animate-finanto-reveal opacity-0 delay-300">
            <CreditCalculator 
              isExpanded={isSimulatorExpanded} 
              onExpandedChange={handleToggleSimulator}
            />
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
          </div>
        </div>
      </footer>
    </div>
  );
}

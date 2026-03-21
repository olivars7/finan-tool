"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react';
import CreditCalculator from '@/components/calculator/CreditCalculator';
import AppointmentsDashboard from '@/components/appointments/AppointmentsDashboard';
import AdvancedStats from '@/components/stats/AdvancedStats';
import TrashDialog from '@/components/appointments/TrashDialog';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { 
  Wallet, CalendarDays, Users, CheckCircle2, 
  Palette, Moon, Sun, Cpu, Calculator, Maximize2, Sparkles,
  ClipboardList, Copy, Crown, MessageSquare, 
  CalendarClock, HandCoins, CheckCircle, BadgeAlert, 
  MoreHorizontal, ArrowUpRight, ArrowDownRight, Coins, Star, Trophy,
  TrendingUp, Trash2, User, Receipt, BarChart3, PartyPopper as PartyIcon, ArrowRight,
  LogOut, UserPlus, X, Search, Bell, Construction
} from 'lucide-react';
import { useAppointments } from '@/hooks/use-appointments';
import { Button } from '@/components/ui/button';
import { logout } from '@/lib/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

export interface FinantoMainProps {
  initialSection?: 'simulador' | 'gestor' | 'stats';
}

export default function FinantoMain({ initialSection }: FinantoMainProps) {
  const [showTrash, setShowTrash] = useState(false);
  const [isSimulatorExpanded, setIsSimulatorExpanded] = useState(false);
  const [isGestorExpanded, setIsGestorExpanded] = useState(false);
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>('corporativo');
  
  const appointmentState = useAppointments();

  const { 
    appointments, stats, isLoaded, resetData, clearAll, 
    editAppointment, unarchiveAppointment, deletePermanent, user, profile
  } = appointmentState;

  const onSelectId = (id: string | null) => setSelectedId(id);
  
  const { toast } = useToast();

  const statsRef = useRef(stats);

  useEffect(() => {
    if (!isLoaded) return;
    statsRef.current = stats;
  }, [stats, isLoaded]);

  const syncUrl = useCallback((path: string) => {
    if (typeof window === 'undefined') return;
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  }, []);

  const handleToggleSimulator = (open: boolean) => {
    setIsSimulatorExpanded(open);
    if (open) { syncUrl('/simulador'); document.title = "Simulador - Finanto"; }
    else { syncUrl('/'); document.title = "Finanto"; }
  };

  const handleToggleGestor = (open: boolean) => {
    setIsGestorExpanded(open);
    if (open) { syncUrl('/gestor'); document.title = "Agenda - Finanto"; }
    else { syncUrl('/'); document.title = "Finanto"; }
  };

  const handleToggleStats = (open: boolean) => {
    setIsStatsExpanded(open);
    if (open) { syncUrl('/stats'); document.title = "Stats - Finanto"; }
    else { syncUrl('/'); document.title = "Finanto"; }
  };

  useEffect(() => {
    if (initialSection === 'simulador') setIsSimulatorExpanded(true);
    if (initialSection === 'gestor') setIsGestorExpanded(true);
    if (initialSection === 'stats') setIsStatsExpanded(true);
  }, [initialSection]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setIsSimulatorExpanded(path === '/simulador');
      setIsGestorExpanded(path === '/gestor');
      setIsStatsExpanded(path === '/stats');
      
      if (path === '/') document.title = "Finanto - Gestión Inmobiliaria";
      else if (path === '/simulador') document.title = "Simulador - Finanto";
      else if (path === '/gestor') document.title = "Agenda - Finanto";
      else if (path === '/stats') document.title = "Stats - Finanto";
    };

    window.addEventListener('popstate', handlePopState);
    
    const savedTheme = localStorage.getItem('finanto-theme') as Theme;
    if (savedTheme) applyTheme(savedTheme);
    else applyTheme('corporativo');

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
      {/* Mobile Construction Banner */}
      <div className="md:hidden fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="bg-yellow-500/10 p-10 rounded-[3rem] border border-yellow-500/20 animate-in fade-in zoom-in duration-700">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-yellow-500/20 blur-2xl rounded-full animate-pulse" />
            <Construction className="w-20 h-20 text-yellow-500 mx-auto relative z-10" />
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-tight">
            EN CONSTRUCCIÓN
          </h2>
          <p className="text-yellow-500/80 text-[11px] font-black uppercase tracking-[0.3em] mt-3">
            LA VERSIÓN MÓVIL POR EL MOMENTO
          </p>
        </div>
        <p className="text-slate-400 text-sm font-medium max-w-[280px] leading-relaxed italic">
          "Estamos optimizando la terminal táctil para ofrecerte la experiencia de gestión inmobiliaria más potente del mercado."
        </p>
        <div className="pt-12 flex items-center gap-3 opacity-30">
          <div className="bg-white p-1.5 rounded-lg">
            <Image src="/favicon.ico" alt="Finanto" width={24} height={24} className="object-contain" />
          </div>
          <span className="font-black tracking-tighter text-sm uppercase text-white">Finanto CRM v2.0</span>
        </div>
      </div>

      <header className="border-b border-border/40 sticky top-0 z-50 backdrop-blur-[12px] bg-card/10 shrink-0 animate-in slide-in-from-top duration-700 hidden md:block">
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

      <main className="flex-1 container mx-auto px-2 sm:px-4 py-4 md:py-12 hidden md:block">
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

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-8 items-start">
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
              selectedAppId={selectedId}
              onSelectAppId={onSelectId}
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
            />
          </section>
        </div>
      </main>

      <footer className="border-t border-border/40 py-4 sm:py-6 bg-card/10 backdrop-blur-md animate-in fade-in slide-in-from-bottom duration-700 hidden md:block">
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

      {/* DIÁLOGOS DE APOYO */}
      <TrashDialog 
        open={showTrash} 
        onOpenChange={setShowTrash} 
        archivedAppointments={appointments.filter(a => a.isArchived)}
        onRestore={unarchiveAppointment}
        onDelete={deletePermanent}
        formatDate={appointmentState.formatFriendlyDate}
        format12hTime={appointmentState.format12hTime}
      />
    </div>
  );
}

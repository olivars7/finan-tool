
"use client"

import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  PlusCircle, 
  Calendar, 
  BarChart3, 
  Cloud,
  ChevronRight,
  Phone,
  CalendarDays,
  Wallet,
  CheckCircle2,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  X,
  CheckCircle,
  AlertCircle,
  Save,
  Receipt,
  RotateCcw,
  ClipboardList
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Appointment, AppointmentStatus } from '@/services/appointment-service';
import { parseISO, isToday, isTomorrow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface MobileDashboardProps {
  userName: string;
  appointments: Appointment[];
  stats: any;
  onOpenCalculator: () => void;
  onOpenNewAppointment: () => void;
  onOpenAgenda: () => void;
  onOpenStats: () => void;
  onSelectApp: (id: string) => void;
  onEditApp: (id: string, data: Partial<Appointment>) => void;
  format12hTime: (time: string) => string;
}

export default function MobileDashboard({ 
  userName, 
  appointments,
  stats,
  onOpenCalculator, 
  onOpenNewAppointment, 
  onOpenAgenda, 
  onOpenStats,
  onSelectApp,
  onEditApp,
  format12hTime
}: MobileDashboardProps) {
  const [visibleCount, setVisibleCount] = useState(4);
  
  // States for Quick Actions
  const [confirmingApp, setConfirmingApp] = useState<Appointment | null>(null);
  const [unconfirmingApp, setUnconfirmingApp] = useState<Appointment | null>(null);
  const [finalizingApp, setFinalizingApp] = useState<Appointment | null>(null);
  
  // Finalization form states
  const [finalStatus, setFinalStatus] = useState<AppointmentStatus>('Asistencia');
  const [finalNotes, setFinalNotes] = useState('');
  const [finalCreditAmount, setFinalCreditAmount] = useState<number>(0);
  const [creditInput, setCreditInput] = useState('');
  const [finalCommissionPercent, setFinalCommissionPercent] = useState<number>(100);
  
  const { toast } = useToast();

  // Hoy ordenado por prioridad: 1. Confirmadas, 2. Por confirmar, 3. Finalizadas
  const todayApps = useMemo(() => {
    return appointments
      .filter(a => !a.isArchived && isToday(parseISO(a.date)))
      .sort((a, b) => {
        const getPriority = (app: Appointment) => {
          if (app.status) return 3; // Finalizadas (Abajo)
          if (app.isConfirmed) return 1; // Confirmadas (Arriba)
          return 2; // Por confirmar (En medio)
        };

        const priorityA = getPriority(a);
        const priorityB = getPriority(b);

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        // Si tienen la misma prioridad, ordenar por hora
        return a.time.localeCompare(b.time);
      });
  }, [appointments]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(Math.round(val));
  };

  const formatWithCommas = (val: string) => {
    const num = val.replace(/[^0-9]/g, '');
    if (!num) return '';
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const getDynamicGradient = (val: number) => {
    if (val < 5000) return "";
    return "text-gradient-aqua-blue";
  };

  const handleOpenFinalize = (e: React.MouseEvent, app: Appointment) => {
    e.stopPropagation();
    setFinalizingApp(app);
    setFinalStatus('Asistencia');
    setFinalNotes(app.notes || '');
    const amount = app.finalCreditAmount || 0;
    setFinalCreditAmount(amount);
    setCreditInput(amount > 0 ? amount.toLocaleString('en-US') : '');
    setFinalCommissionPercent(app.commissionPercent || 100);
  };

  const handleCreditChange = (val: string) => {
    const formatted = formatWithCommas(val);
    setCreditInput(formatted);
    setFinalCreditAmount(parseInt(formatted.replace(/,/g, '')) || 0);
  };

  const handleSaveFinalization = () => {
    if (finalizingApp) {
      const isCierre = finalStatus === 'Cierre';
      
      const appDate = parseISO(finalizingApp.date);
      let finalDate = finalizingApp.date;
      
      if (!isToday(appDate)) {
        finalDate = new Date().toISOString();
      }

      onEditApp(finalizingApp.id, {
        status: finalStatus,
        notes: finalNotes,
        date: finalDate,
        isConfirmed: true,
        finalCreditAmount: isCierre ? finalCreditAmount : undefined,
        commissionPercent: isCierre ? finalCommissionPercent : undefined,
        commissionStatus: isCierre ? 'Pendiente' : undefined
      });
      
      toast({
        title: "Cita Finalizada",
        description: `Resultado "${finalStatus}" guardado para ${finalizingApp.name}.`
      });
      setFinalizingApp(null);
    }
  };

  const handleCopyPhone = (e: React.MouseEvent, phone: string, name: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone).then(() => {
      toast({
        title: "Número copiado",
        description: `${name}: ${phone} listo para usar.`,
      });
    });
  };

  const formatAppointmentForClipboard = (app: Appointment) => {
    const dateObj = parseISO(app.date);
    const dateFormatted = format(dateObj, "EEEE d 'de' MMMM yyyy", { locale: es });
    const capitalizedDate = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);
    const timeFormatted = format12hTime(app.time);

    return `Cita: *${capitalizedDate}*\n` +
           `Nombre: *${app.name}*\n` +
           `Teléfono: *${app.phone || 'N/A'}*\n` +
           `Producto: *${app.product || 'N/A'}*\n` +
           `Hora: *${timeFormatted}*`;
  };

  const copyTodayAppointments = () => {
    const apps = appointments
      .filter(a => !a.isArchived && isToday(parseISO(a.date)))
      .sort((a, b) => a.time.localeCompare(b.time));

    if (apps.length === 0) {
      toast({ title: "Sin citas", description: "No hay citas registradas para hoy." });
      return;
    }

    const text = apps.map(app => formatAppointmentForClipboard(app)).join('\n\n');
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "Citas de hoy copiadas", description: "Listado listo para WhatsApp." });
    });
  };

  const copyTomorrowAppointments = () => {
    const apps = appointments
      .filter(a => !a.isArchived && isTomorrow(parseISO(a.date)))
      .sort((a, b) => a.time.localeCompare(b.time));

    if (apps.length === 0) {
      toast({ title: "Sin citas", description: "No hay citas registradas para mañana." });
      return;
    }

    const text = apps.map(app => formatAppointmentForClipboard(app)).join('\n\n');
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "Citas de mañana copiadas", description: "Listado listo para WhatsApp." });
    });
  };

  const getCardStyles = (status?: AppointmentStatus) => {
    if (!status) return "bg-muted/5 border-white/5 shadow-none";
    switch (status) {
      case 'Cierre': return "bg-green-500/10 border-green-500/10 shadow-none";
      case 'Apartado': return "bg-blue-500/10 border-blue-500/10 shadow-none";
      case 'No asistencia': return "bg-destructive/10 border-destructive/10 shadow-none opacity-90";
      case 'Asistencia': return "bg-primary/10 border-primary/10 shadow-none";
      case 'Reagendó': return "bg-muted/20 border-white/5 shadow-none";
      case 'Continuación en 2da cita': return "bg-indigo-500/10 border-indigo-500/10 shadow-none";
      case 'Reembolso': return "bg-orange-500/10 border-orange-500/10 shadow-none";
      default: return "bg-muted/5 border-white/5 shadow-none";
    }
  };

  const microStats = [
    { 
      label: 'Citas hoy', 
      value: stats.todayCount.toString(), 
      icon: CalendarDays, 
      color: 'text-primary',
      tip: (
        <div className="space-y-1.5 py-0.5 text-[10px]">
          <p className="flex justify-between gap-4 border-b border-white/5 pb-1">Confirmadas: <span className="text-green-500 font-bold">{stats.todayConfirmed}</span></p>
          <p className="flex justify-between gap-4">Total: <span className="text-blue-400 font-bold">{stats.todayCount}</span></p>
        </div>
      )
    },
    { 
      label: 'Pendientes', 
      value: stats.pendingCount.toString(), 
      icon: Wallet, 
      color: 'text-primary',
      tip: (
        <div className="space-y-1.5 py-0.5 text-[10px]">
          <p className="text-muted-foreground uppercase text-[8px] font-black tracking-widest mb-1">Estatus Operativo</p>
          <p className="flex justify-between gap-4">Por atender: <span className="text-blue-400 font-bold">{stats.pendingCount}</span></p>
        </div>
      )
    },
    { 
      label: 'Prospectos Mes', 
      value: stats.currentMonthProspects.toString(), 
      icon: Users, 
      color: 'text-accent', 
      comparison: stats.lastMonthProspects,
      tip: (
        <div className="space-y-1.5 py-0.5 text-[10px]">
          <p className="flex justify-between gap-4 border-b border-white/5 pb-1">Registros: <span className="text-blue-400 font-bold">{stats.currentMonthProspects}</span></p>
          <p className="flex justify-between gap-4">Mes anterior: <span className="text-muted-foreground font-bold">{stats.lastMonthProspects}</span></p>
        </div>
      )
    },
    { 
      label: 'Ventas Mes', 
      value: stats.currentMonthSales.toString(), 
      icon: CheckCircle2, 
      color: 'text-green-500', 
      comparison: stats.lastMonthSales,
      tip: (
        <div className="space-y-1.5 py-0.5 text-[10px]">
          <p className="flex justify-between gap-4 border-b border-white/5 pb-1">Cierres: <span className="text-green-500 font-bold">{stats.currentMonthOnlyCierre}</span></p>
          <p className="flex justify-between gap-4">Apartados: <span className="text-blue-400 font-bold">{stats.currentMonthApartados}</span></p>
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
      tip: (
        <div className="space-y-1.5 py-0.5 text-[10px]">
          <p className="flex justify-between gap-4 border-b border-white/5 pb-1">Este viernes: <span className="text-yellow-500 font-bold">{formatCurrency(stats.thisFridayCommission)}</span></p>
          <p className="flex justify-between gap-4">Siguiente: <span className="text-blue-400 font-bold">{formatCurrency(stats.nextFridayCommission)}</span></p>
        </div>
      )
    },
  ];

  const quadrants = [
    {
      id: 'calc',
      title: 'SIMULADOR',
      sub: 'CRÉDITO',
      icon: Calculator,
      iconColor: 'text-blue-500',
      circleColor: 'bg-blue-500/10',
      activeStyles: 'active:bg-blue-500/20 active:border-blue-500/30',
      action: onOpenCalculator
    },
    {
      id: 'new',
      title: 'NUEVA CITA',
      sub: 'REGISTRO',
      icon: PlusCircle,
      iconColor: 'text-emerald-500',
      circleColor: 'bg-emerald-500/10',
      activeStyles: 'active:bg-emerald-500/20 active:border-emerald-500/30',
      action: onOpenNewAppointment
    },
    {
      id: 'agenda',
      title: 'AGENDA',
      sub: 'PRÓXIMAS',
      icon: Calendar,
      iconColor: 'text-indigo-500',
      circleColor: 'bg-indigo-500/10',
      activeStyles: 'active:bg-indigo-500/20 active:border-indigo-500/30',
      action: onOpenAgenda
    },
    {
      id: 'stats',
      title: 'STATS PRO',
      sub: 'KPIs',
      icon: BarChart3,
      iconColor: 'text-amber-500',
      circleColor: 'bg-amber-500/10',
      activeStyles: 'active:bg-amber-500/20 active:border-amber-500/30',
      action: onOpenStats
    }
  ];

  const calculatedCommission = (finalCreditAmount * 0.007 * (finalCommissionPercent / 100)) * 0.91;

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in duration-700 pb-32 overflow-x-hidden">
      
      <div className="w-full overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
        <div className="flex gap-3 min-w-max">
          {microStats.map((s, i) => (
            <TooltipProvider key={i}>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <div className="bg-card/30 backdrop-blur-md rounded-[2rem] p-5 flex items-center gap-4 min-w-[200px] shadow-sm border-none cursor-help">
                    <div className={cn("p-2.5 rounded-2xl bg-muted/5", s.color)}><s.icon size={18} /></div>
                    <div className="flex flex-col flex-1 overflow-hidden">
                      <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest truncate">{s.label}</span>
                      <div className="flex items-baseline gap-2">
                        <span className={cn("text-lg font-black text-foreground truncate", s.label === 'Comisiones Mes' ? getDynamicGradient(stats.currentMonthCommission) : "")}>{s.value}</span>
                        {s.comparison !== undefined && (
                          <span className={cn(
                            "text-[9px] font-bold flex items-center",
                            (parseFloat(s.value.replace(/[^0-9.-]+/g,"")) >= s.comparison) ? "text-green-500" : "text-destructive"
                          )}>
                            {s.comparison >= 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                            {s.isCurrency ? formatCurrency(s.comparison) : s.comparison}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="p-2 min-w-[140px] border-border/40">
                  {s.tip}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>

      <div className="space-y-2 px-1">
        <h2 className="text-5xl font-black tracking-tighter text-foreground uppercase italic leading-none">
          Hola, <br /> <span className="text-primary">{userName.split(' ')[0]}</span>
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
            Terminal Activa <Cloud className="w-3 h-3" />
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 px-1">
        {quadrants.map((q) => (
          <button
            key={q.id}
            onClick={q.action}
            className={cn(
              "relative aspect-square overflow-hidden flex flex-col items-center justify-center rounded-[3.5rem] border transition-all duration-300 active:scale-95 shadow-xl group backdrop-blur-2xl",
              "bg-white/[0.05] border-white/5",
              q.activeStyles
            )}
          >
            <div className={cn(
              "absolute -top-12 -right-12 w-40 h-40 rounded-full transition-all duration-700 group-active:scale-125 group-active:-translate-x-10 group-active:translate-y-10 group-hover:scale-110",
              q.circleColor
            )} />

            <q.icon className={cn("absolute opacity-[0.02] w-32 h-32 -bottom-8 -left-8 transition-transform duration-700 group-active:scale-110", q.iconColor)} />

            <div className={cn("p-4 rounded-[2rem] bg-white/5 mb-3 relative z-10 shadow-2xl backdrop-blur-sm transition-all duration-300 group-active:scale-110 group-active:brightness-125 group-hover:brightness-110", q.iconColor)}>
              <q.icon size={32} />
            </div>
            
            <div className="text-center space-y-0.5 relative z-10 px-2">
              <span className="block text-lg font-black tracking-tighter text-foreground uppercase leading-none">
                {q.title}
              </span>
              <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                {q.sub}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Copy Report Actions */}
      <div className="flex gap-3 px-1">
        <Button 
          onClick={copyTodayAppointments}
          variant="outline" 
          className="flex-1 h-12 rounded-2xl bg-blue-500/5 border-blue-500/20 text-blue-500 font-bold uppercase text-[9px] tracking-widest gap-2 active:bg-blue-500/10"
        >
          <ClipboardList size={14} /> Citas Hoy
        </Button>
        <Button 
          onClick={copyTomorrowAppointments}
          variant="outline" 
          className="flex-1 h-12 rounded-2xl bg-cyan-500/5 border-cyan-500/20 text-cyan-500 font-bold uppercase text-[9px] tracking-widest gap-2 active:bg-cyan-500/10"
        >
          <ClipboardList size={14} /> Citas Mañana
        </Button>
      </div>

      <div className="space-y-5 pt-4 px-1 pb-24">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-2">
            Actividad Hoy
          </h3>
          <Badge variant="outline" className="text-[9px] font-black uppercase border-border/10 bg-muted/5 text-muted-foreground/60 rounded-full px-2 py-0.5">
            {todayApps.length} REGISTROS
          </Badge>
        </div>

        <div className="space-y-3">
          {todayApps.length === 0 ? (
            <div className="p-12 border border-dashed border-border/10 rounded-[3rem] text-center bg-muted/5">
              <p className="text-[10px] font-bold uppercase text-muted-foreground/20 italic tracking-widest">Sin actividad programada</p>
            </div>
          ) : (
            todayApps.slice(0, visibleCount).map((app) => (
              <div 
                key={app.id} 
                onClick={() => onSelectApp(app.id)}
                className={cn(
                  "p-5 border rounded-[2rem] flex flex-col gap-4 group transition-all duration-300 active:scale-[0.98] relative",
                  getCardStyles(app.status)
                )}
              >
                <div className="flex items-center justify-between w-full relative">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center text-[10px] font-black",
                      app.status ? "bg-background/20 text-muted-foreground" : "bg-primary/5 text-primary"
                    )}>
                      {format12hTime(app.time)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-black uppercase tracking-tight text-foreground truncate max-w-[160px] leading-none mb-1">{app.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold uppercase text-muted-foreground/40 tracking-wider">{app.type}</span>
                        <div className="w-1 h-1 rounded-full bg-muted-foreground/20" />
                        <span className="text-[10px] font-black text-primary/60 flex items-center gap-1 uppercase tracking-tighter">{app.phone}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => handleCopyPhone(e, app.phone, app.name)}
                      className="h-10 w-10 rounded-full bg-primary/10 text-primary border border-primary/5 active:bg-primary/20"
                    >
                      <Phone size={18} />
                    </Button>
                    
                    {app.status ? (
                      <Badge variant="outline" className="text-[8px] font-black uppercase rounded-full px-2 py-0.5 border-none bg-background/20 text-foreground/60">
                        {app.status}
                      </Badge>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground/20 group-active:text-primary transition-colors" />
                    )}
                  </div>
                </div>

                {!app.status && (
                  <div className="flex items-center gap-2 pt-3 border-t border-border/5">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={cn(
                        "h-9 text-[9px] font-black uppercase flex-1 rounded-full transition-all",
                        app.isConfirmed 
                          ? "bg-green-500/10 text-green-600 border-green-500/20" 
                          : "bg-muted/10 text-muted-foreground/60 border-transparent"
                      )}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        if (app.isConfirmed) setUnconfirmingApp(app);
                        else setConfirmingApp(app);
                      }}
                    >
                      {app.isConfirmed ? <CheckCircle size={14} className="mr-1.5" /> : <AlertCircle size={14} className="mr-1.5" />}
                      {app.isConfirmed ? 'Confirmado' : 'Confirmar'}
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="h-9 text-[9px] font-black uppercase flex-1 rounded-full bg-foreground text-background border-none"
                      onClick={(e) => handleOpenFinalize(e, app)}
                    >
                      <CheckCircle2 size={14} className="mr-1.5" /> Finalizar
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
          {todayApps.length > visibleCount && (
            <button 
              onClick={() => setVisibleCount(prev => prev + 10)}
              className="w-full h-14 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center justify-center gap-2 rounded-[1.5rem] border border-border/5 bg-muted/5 active:bg-muted/10 transition-all mt-2"
            >
              Ver {todayApps.length - visibleCount} más <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="pt-8 border-t border-border/5 text-center opacity-20 pb-32">
        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground">
          Finanto Terminal v2.6 • Minimal CRM
        </p>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmingApp} onOpenChange={(o) => !o && setConfirmingApp(null)}>
        <AlertDialogContent className="w-[90%] rounded-[2rem] bg-background border-border text-foreground">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-primary/20 rounded-2xl"><AlertCircle className="w-6 h-6 text-primary" /></div>
              <AlertDialogTitle className="text-xl font-black uppercase tracking-tighter">Asistencia</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-muted-foreground font-medium">
              ¿Confirmas que el cliente <strong>{confirmingApp?.name}</strong> asistirá hoy?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-4">
            <AlertDialogCancel className="rounded-full h-12 text-xs font-bold uppercase">No</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (confirmingApp) {
                onEditApp(confirmingApp.id, { isConfirmed: true });
                toast({ title: "Asistencia Confirmada", description: "Cita validada correctamente." });
                setConfirmingApp(null);
              }
            }} className="bg-primary rounded-full h-12 text-xs font-black uppercase shadow-lg text-white border-none">
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unconfirmation Dialog */}
      <AlertDialog open={!!unconfirmingApp} onOpenChange={(o) => !o && setUnconfirmingApp(null)}>
        <AlertDialogContent className="w-[90%] rounded-[2rem] bg-background border-border text-foreground">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-muted/20 rounded-2xl"><RotateCcw className="w-6 h-6 text-muted-foreground" /></div>
              <AlertDialogTitle className="text-xl font-black uppercase tracking-tighter">Cancelar Marca</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-muted-foreground font-medium">
              ¿Deseas quitar la confirmación de asistencia para <strong>{unconfirmingApp?.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-4">
            <AlertDialogCancel className="rounded-full h-12 text-xs font-bold uppercase">No</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (unconfirmingApp) {
                onEditApp(unconfirmingApp.id, { isConfirmed: false });
                toast({ title: "Confirmación Removida", description: "La cita ha vuelto a estado pendiente." });
                setUnconfirmingApp(null);
              }
            }} className="bg-destructive text-destructive-foreground rounded-full h-12 text-xs font-black uppercase border-none">
              Quitar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Finalization Dialog */}
      <Dialog open={!!finalizingApp} onOpenChange={(o) => !o && setFinalizingApp(null)}>
        <DialogContent className="w-[94%] max-w-[450px] rounded-[3rem] p-0 overflow-hidden border-none bg-background shadow-2xl z-[200]">
          <DialogHeader className="bg-green-500/5 p-8 border-b border-green-500/10">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-green-600 text-white rounded-2xl shadow-xl">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-foreground leading-none">Finalizar Cita</DialogTitle>
                  <DialogDescription className="text-[10px] font-bold uppercase text-green-600 tracking-widest mt-1">{finalizingApp?.name}</DialogDescription>
                </div>
              </div>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full bg-muted/20 text-foreground"><X size={20}/></Button>
              </DialogClose>
            </div>
          </DialogHeader>
          <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto pb-32 scrollbar-thin">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block text-center">Resultado de la Consulta</Label>
              <Select value={finalStatus} onValueChange={(v) => setFinalStatus(v as AppointmentStatus)}>
                <SelectTrigger className="h-14 rounded-2xl font-bold text-lg border-border/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asistencia">👤 Asistencia</SelectItem>
                  <SelectItem value="Cierre">💰 Cierre (Venta)</SelectItem>
                  <SelectItem value="Apartado">📑 Apartado</SelectItem>
                  <SelectItem value="No asistencia">❌ No asistencia</SelectItem>
                  <SelectItem value="Reagendó">📅 Reagendó</SelectItem>
                  <SelectItem value="Continuación en 2da cita">🔄 Continuación en 2da cita</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {finalStatus === 'Cierre' && (
              <div className="p-6 bg-green-500/5 border-2 border-green-500/20 rounded-[2.5rem] space-y-6">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <Receipt size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Liquidación de Venta</span>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-bold uppercase text-muted-foreground">Monto Crédito Final</Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600 font-bold">$</span>
                      <Input 
                        type="text" 
                        value={creditInput} 
                        onChange={e => handleCreditChange(e.target.value)}
                        className="h-12 pl-8 font-black text-xl bg-background rounded-xl border-green-500/20"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-bold uppercase text-muted-foreground">Participación %</Label>
                      <div className="relative">
                        <Input 
                          type="number"
                          value={finalCommissionPercent || ''} 
                          onChange={e => setFinalCommissionPercent(parseFloat(e.target.value) || 0)}
                          className="h-11 pr-8 font-bold bg-background rounded-xl border-green-500/20"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-green-600">%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-bold uppercase text-muted-foreground">Ingreso Neto (91%)</Label>
                      <div className="h-11 flex items-center px-3 bg-green-500/10 rounded-xl border border-green-500/20">
                        <span className="text-sm font-black text-green-600 truncate">{formatCurrency(calculatedCommission)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Notas y Acuerdos</Label>
              <Textarea 
                className="rounded-2xl min-h-[120px] bg-muted/10 resize-none text-sm font-medium border-border/40" 
                placeholder="Escribe detalles del seguimiento..." 
                value={finalNotes}
                onChange={e => setFinalNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="p-8 border-t bg-muted/5 flex flex-row gap-4">
            <Button variant="ghost" onClick={() => setFinalizingApp(null)} className="flex-1 h-12 rounded-full font-bold uppercase text-[10px]">Cancelar</Button>
            <Button onClick={handleSaveFinalization} className="flex-[2] h-12 rounded-full bg-green-600 hover:bg-green-700 font-black uppercase text-[10px] text-white shadow-xl shadow-green-600/20 gap-2 border-none">
              <Save size={16} /> Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

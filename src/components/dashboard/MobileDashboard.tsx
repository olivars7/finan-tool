
"use client"

import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  PlusCircle, 
  Calendar, 
  BarChart3, 
  Cloud,
  ChevronRight,
  Clock,
  Phone,
  CalendarDays,
  Wallet,
  CheckCircle2,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Construction,
  X,
  CheckCircle,
  AlertCircle,
  Save,
  CheckCircle as CheckIcon
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Appointment, AppointmentStatus } from '@/services/appointment-service';
import { parseISO, isToday } from 'date-fns';
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  const [showWelcome, setShowWelcome] = useState(false);
  
  // States for Quick Actions
  const [confirmingApp, setConfirmingApp] = useState<Appointment | null>(null);
  const [finalizingApp, setFinalizingApp] = useState<Appointment | null>(null);
  
  // Finalization form states
  const [finalStatus, setFinalStatus] = useState<AppointmentStatus>('Asistencia');
  const [finalNotes, setFinalNotes] = useState('');
  
  const { toast } = useToast();

  useEffect(() => {
    const seen = localStorage.getItem('finanto_mobile_welcome_v2');
    if (!seen) {
      const timer = setTimeout(() => setShowWelcome(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseWelcome = () => {
    localStorage.setItem('finanto_mobile_welcome_v2', 'true');
    setShowWelcome(false);
  };

  const todayApps = appointments
    .filter(a => !a.isArchived && isToday(parseISO(a.date)))
    .sort((a, b) => a.time.localeCompare(b.time));

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(Math.round(val));
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
  };

  const handleSaveFinalization = () => {
    if (finalizingApp) {
      onEditApp(finalizingApp.id, {
        status: finalStatus,
        notes: finalNotes,
        isConfirmed: true
      });
      toast({
        title: "Cita Finalizada",
        description: `Resultado "${finalStatus}" guardado para ${finalizingApp.name}.`
      });
      setFinalizingApp(null);
    }
  };

  const getCardStyles = (status?: AppointmentStatus) => {
    if (!status) return "bg-card border-border/40 shadow-sm";
    switch (status) {
      case 'Cierre': return "bg-green-500/5 border-green-500/20 shadow-none";
      case 'Apartado': return "bg-blue-500/5 border-blue-500/20 shadow-none";
      case 'No asistencia': return "bg-destructive/5 border-destructive/20 opacity-80 shadow-none";
      default: return "bg-muted/30 border-border/40 shadow-none";
    }
  };

  const getStatusBadgeStyles = (status?: AppointmentStatus) => {
    switch (status) {
      case 'Cierre': return "bg-green-500/10 text-green-600 border-green-500/20";
      case 'Apartado': return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case 'No asistencia': return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-primary/10 text-primary border-primary/20";
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
      activeStyles: 'active:shadow-blue-500/40 active:bg-blue-500/20 active:border-blue-500/30',
      action: onOpenCalculator
    },
    {
      id: 'new',
      title: 'NUEVA CITA',
      sub: 'REGISTRO',
      icon: PlusCircle,
      iconColor: 'text-emerald-500',
      circleColor: 'bg-emerald-500/10',
      activeStyles: 'active:shadow-emerald-500/40 active:bg-emerald-500/20 active:border-emerald-500/30',
      action: onOpenNewAppointment
    },
    {
      id: 'agenda',
      title: 'AGENDA',
      sub: 'PRÓXIMAS',
      icon: Calendar,
      iconColor: 'text-indigo-500',
      circleColor: 'bg-indigo-500/10',
      activeStyles: 'active:shadow-indigo-500/40 active:bg-indigo-500/20 active:border-indigo-500/30',
      action: onOpenAgenda
    },
    {
      id: 'stats',
      title: 'STATS PRO',
      sub: 'KPIs',
      icon: BarChart3,
      iconColor: 'text-amber-500',
      circleColor: 'bg-amber-500/10',
      activeStyles: 'active:shadow-amber-500/40 active:bg-amber-500/20 active:border-amber-500/30',
      action: onOpenStats
    }
  ];

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
              "bg-white/[0.05] border-white/10",
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

      <div className="space-y-5 pt-4 px-1 pb-24">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Actividad Hoy
          </h3>
          <Badge variant="outline" className="text-[10px] font-black uppercase border-primary/20 bg-primary/5 text-primary rounded-full px-3 py-1">
            {todayApps.length} CITAS
          </Badge>
        </div>

        <div className="space-y-4">
          {todayApps.length === 0 ? (
            <div className="p-12 border border-dashed border-border/40 rounded-[3rem] text-center bg-muted/5">
              <p className="text-[10px] font-bold uppercase text-muted-foreground/40 italic tracking-widest">Sin actividad para hoy</p>
            </div>
          ) : (
            todayApps.slice(0, visibleCount).map((app) => (
              <div 
                key={app.id} 
                onClick={() => onSelectApp(app.id)}
                className={cn(
                  "p-6 border rounded-[2.5rem] flex flex-col gap-4 group active:bg-muted/50 transition-all active:scale-[0.98]",
                  getCardStyles(app.status)
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center text-[11px] font-black shadow-inner",
                      app.status ? "bg-muted/20 text-muted-foreground" : "bg-primary/10 text-primary"
                    )}>
                      {format12hTime(app.time)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-black uppercase tracking-tight text-foreground truncate max-w-[160px]">{app.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-wider">{app.type}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                        <span className="text-[10px] font-black text-primary flex items-center gap-1.5 uppercase tracking-tighter"><Phone size={10} /> {app.phone}</span>
                      </div>
                    </div>
                  </div>
                  {app.status ? (
                    <Badge variant="outline" className={cn("text-[9px] font-black uppercase rounded-full px-3 py-1 border", getStatusBadgeStyles(app.status))}>
                      {app.status}
                    </Badge>
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground/20 group-active:text-primary transition-colors" />
                  )}
                </div>

                {!app.status && (
                  <div className="flex items-center gap-2 pt-2 border-t border-border/5">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={cn(
                        "h-10 text-[10px] font-bold uppercase flex-1 rounded-full border-dashed",
                        app.isConfirmed ? "bg-green-500/10 text-green-600 border-green-500/30" : "bg-orange-500/10 text-orange-600 border-orange-500/30"
                      )}
                      onClick={(e) => { e.stopPropagation(); setConfirmingApp(app); }}
                    >
                      {app.isConfirmed ? <CheckCircle size={14} className="mr-1.5" /> : <AlertCircle size={14} className="mr-1.5" />}
                      {app.isConfirmed ? 'Confirmado' : 'Confirmar'}
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="h-10 text-[10px] font-bold uppercase flex-1 rounded-full bg-muted/20 border border-border/50 text-foreground"
                      onClick={(e) => handleOpenFinalize(e, app)}
                    >
                      <CheckCircle2 size={14} className="mr-1.5 text-green-600" /> Finalizar
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
          {todayApps.length > visibleCount && (
            <button 
              onClick={() => setVisibleCount(prev => prev + 10)}
              className="w-full h-16 text-[11px] font-black uppercase tracking-[0.3em] text-primary flex items-center justify-center gap-3 rounded-[2rem] border border-primary/10 bg-primary/5 active:bg-primary/10 transition-all"
            >
              Ver {todayApps.length - visibleCount} más <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="pt-8 border-t border-border/40 text-center opacity-30 pb-32">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground">
          Finanto Terminal v2.5 • Elite CRM
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
            }} className="bg-primary rounded-full h-12 text-xs font-black uppercase shadow-lg text-white">
              Confirmar
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
                <SelectTrigger className="h-14 rounded-2xl font-bold text-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asistencia">👤 Asistencia</SelectItem>
                  <SelectItem value="Cierre">💰 Cierre (Venta)</SelectItem>
                  <SelectItem value="Apartado">📑 Apartado</SelectItem>
                  <SelectItem value="No asistencia">❌ No asistencia</SelectItem>
                  <SelectItem value="Reagendó">📅 Reagendó</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Notas y Acuerdos</Label>
              <Textarea 
                className="rounded-2xl min-h-[120px] bg-muted/10 resize-none text-sm font-medium" 
                placeholder="Escribe detalles del seguimiento..." 
                value={finalNotes}
                onChange={e => setFinalNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="p-8 border-t bg-muted/5 flex flex-row gap-4">
            <Button variant="ghost" onClick={() => setFinalizingApp(null)} className="flex-1 h-12 rounded-full font-bold uppercase text-[10px]">Cancelar</Button>
            <Button onClick={handleSaveFinalization} className="flex-[2] h-12 rounded-full bg-green-600 hover:bg-green-700 font-black uppercase text-[10px] text-white shadow-xl shadow-green-600/20 gap-2">
              <Save size={16} /> Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="w-[94%] max-w-[420px] rounded-[3rem] p-0 overflow-hidden border-none bg-background shadow-2xl z-[200]">
          <DialogHeader className="sr-only">
            <DialogTitle>Bienvenido a la Terminal Móvil</DialogTitle>
            <DialogDescription>Mensaje inicial de bienvenida para usuarios móviles.</DialogDescription>
          </DialogHeader>
          
          <div className="bg-primary p-12 flex flex-col items-center text-center gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-16 -mb-16 blur-2xl" />
            
            <div className="bg-white/20 p-8 rounded-[3rem] backdrop-blur-md relative z-10 shadow-2xl border border-white/20">
              <Construction size={64} className="text-white animate-bounce" />
            </div>
            
            <div className="space-y-3 relative z-10">
              <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter leading-none">¡HOLA!</h2>
              <p className="text-white/90 font-bold text-sm uppercase tracking-[0.3em] leading-tight">
                TERMINAL MÓVIL ACTIVA
              </p>
            </div>
          </div>

          <div className="p-12 space-y-10 text-center bg-background pb-32">
            <div className="space-y-6">
              <p className="text-foreground font-black text-lg leading-snug uppercase italic tracking-tight">
                "Estamos transformando tu productividad inmobiliaria con herramientas de élite."
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="h-1.5 w-8 bg-primary rounded-full" />
                <div className="h-1.5 w-1.5 bg-primary/30 rounded-full" />
                <div className="h-1.5 w-1.5 bg-primary/30 rounded-full" />
              </div>
              <p className="text-muted-foreground text-xs font-black uppercase tracking-[0.2em]">
                OPTIMIZADO PARA GESTIÓN TÁCTICA
              </p>
            </div>

            <Button 
              onClick={handleCloseWelcome}
              className="w-full h-20 rounded-full bg-primary hover:bg-primary/90 text-white font-black text-lg uppercase tracking-[0.25em] shadow-2xl shadow-primary/30 active:scale-95 transition-all"
            >
              ¡COMENZAR!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

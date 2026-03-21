
"use client"

import React, { useState } from 'react';
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
  Users
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Appointment } from '@/services/appointment-service';
import { parseISO, isToday } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MobileDashboardProps {
  userName: string;
  appointments: Appointment[];
  stats: any;
  onOpenCalculator: () => void;
  onOpenNewAppointment: () => void;
  onOpenAgenda: () => void;
  onOpenStats: () => void;
  onSelectApp: (id: string) => void;
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
  format12hTime
}: MobileDashboardProps) {
  const [visibleCount, setVisibleCount] = useState(4);
  
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

  const microStats = [
    { label: 'Citas hoy', value: stats.todayCount.toString(), icon: CalendarDays, color: 'text-primary' },
    { label: 'Pendientes', value: stats.pendingCount.toString(), icon: Wallet, color: 'text-primary' },
    { label: 'Prospectos Mes', value: stats.currentMonthProspects.toString(), icon: Users, color: 'text-accent', comparison: stats.lastMonthProspects },
    { label: 'Ventas Mes', value: stats.currentMonthSales.toString(), icon: CheckCircle2, color: 'text-green-500', comparison: stats.lastMonthSales },
    { label: 'Comisiones Mes', value: formatCurrency(stats.currentMonthCommission), icon: Coins, color: 'text-yellow-500', comparison: stats.lastMonthCommission, isCurrency: true },
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
    <div className="flex flex-col space-y-8 animate-in fade-in duration-700 pb-24 overflow-x-hidden">
      
      {/* Micro Stats Superiores (Scroll Horizontal Limpio) */}
      <div className="w-full overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
        <div className="flex gap-3 min-w-max">
          {microStats.map((s, i) => (
            <div key={i} className="bg-card/30 backdrop-blur-md rounded-[2rem] p-5 flex items-center gap-4 min-w-[200px] shadow-sm border-none">
              <div className={cn("p-2.5 rounded-2xl bg-muted/5 shadow-inner", s.color)}><s.icon size={20} /></div>
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
          ))}
        </div>
      </div>

      {/* Saludo y Estado */}
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

      {/* Mosaico Futurista 2x2 Cuadrado */}
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
            {/* Círculo decorativo GIGANTE animado */}
            <div className={cn(
              "absolute -top-12 -right-12 w-40 h-40 rounded-full transition-all duration-700 group-active:scale-125 group-active:-translate-x-10 group-active:translate-y-10 group-hover:scale-110",
              q.circleColor
            )} />

            {/* Icono de fondo con opacidad ultra-baja */}
            <q.icon className={cn("absolute opacity-[0.02] w-36 h-36 -bottom-8 -left-8 transition-transform duration-700 group-active:scale-110", q.iconColor)} />

            {/* Icono Principal Centrado GIGANTE */}
            <div className={cn("p-6 rounded-[2.2rem] bg-white/5 mb-4 relative z-10 shadow-2xl backdrop-blur-sm transition-all duration-300 group-active:scale-110 group-active:brightness-125 group-hover:brightness-110", q.iconColor)}>
              <q.icon size={48} />
            </div>
            
            <div className="text-center space-y-1 relative z-10 px-2">
              <span className="block text-xl font-black tracking-tighter text-foreground uppercase leading-none">
                {q.title}
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                {q.sub}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Actividad Hoy (Feed Interactivo) */}
      <div className="space-y-5 pt-4 px-1">
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
                className="p-6 bg-card border border-border/40 rounded-[2.5rem] flex items-center justify-between group active:bg-muted/50 transition-all active:scale-[0.98] shadow-sm"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-[11px] font-black shadow-inner">
                    {format12hTime(app.time)}
                  </div>
                  <div>
                    <p className="text-base font-black uppercase tracking-tight text-foreground truncate max-w-[160px]">{app.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-wider">{app.type}</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                      <span className="text-[10px] font-black text-primary flex items-center gap-1.5 uppercase tracking-tighter"><Phone size={10} /> {app.phone}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/20 group-active:text-primary transition-colors" />
              </div>
            ))
          )}
          {todayApps.length > visibleCount && (
            <Button 
              variant="ghost" 
              onClick={() => setVisibleCount(prev => prev + 10)}
              className="w-full h-16 text-[11px] font-black uppercase tracking-[0.3em] text-primary gap-3 rounded-[2rem] border border-primary/10 bg-primary/5 active:bg-primary/10 transition-all"
            >
              Ver {todayApps.length - visibleCount} más <ChevronRight size={16} />
            </Button>
          )}
        </div>
      </div>

      {/* Footer Mobile Info */}
      <div className="pt-8 border-t border-border/40 text-center opacity-30">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground">
          Finanto Terminal v2.5 • Elite CRM
        </p>
      </div>
    </div>
  );
}

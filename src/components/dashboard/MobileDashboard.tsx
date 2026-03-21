"use client"

import React from 'react';
import { 
  Calculator, 
  PlusCircle, 
  Calendar, 
  BarChart3, 
  Cloud,
  ChevronRight,
  Clock,
  Phone
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Appointment } from '@/services/appointment-service';
import { parseISO, isToday } from 'date-fns';

interface MobileDashboardProps {
  userName: string;
  appointments: Appointment[];
  onOpenCalculator: () => void;
  onOpenNewAppointment: () => void;
  onOpenAgenda: () => void;
  onOpenStats: () => void;
}

export default function MobileDashboard({ 
  userName, 
  appointments,
  onOpenCalculator, 
  onOpenNewAppointment, 
  onOpenAgenda, 
  onOpenStats 
}: MobileDashboardProps) {
  
  const todayApps = appointments
    .filter(a => !a.isArchived && isToday(parseISO(a.date)))
    .sort((a, b) => a.time.localeCompare(b.time));

  const quadrants = [
    {
      id: 'calc',
      title: 'CALCULADORA',
      sub: 'Simulador',
      icon: Calculator,
      color: 'from-blue-600/20 to-blue-600/5',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-500',
      shadow: 'shadow-blue-500/20',
      action: onOpenCalculator
    },
    {
      id: 'new',
      title: 'NUEVA CITA',
      sub: 'Registro',
      icon: PlusCircle,
      color: 'from-emerald-600/20 to-emerald-600/5',
      borderColor: 'border-emerald-500/30',
      iconColor: 'text-emerald-500',
      shadow: 'shadow-emerald-500/20',
      action: onOpenNewAppointment
    },
    {
      id: 'agenda',
      title: 'AGENDA',
      sub: 'Próximas',
      icon: Calendar,
      color: 'from-indigo-600/20 to-indigo-600/5',
      borderColor: 'border-indigo-500/30',
      iconColor: 'text-indigo-500',
      shadow: 'shadow-indigo-500/20',
      action: onOpenAgenda
    },
    {
      id: 'stats',
      title: 'STATS PRO',
      sub: 'Inteligencia',
      icon: BarChart3,
      color: 'from-amber-600/20 to-amber-600/5',
      borderColor: 'border-amber-500/30',
      iconColor: 'text-amber-500',
      shadow: 'shadow-amber-500/20',
      action: onOpenStats
    }
  ];

  return (
    <div className="flex flex-col p-6 space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Saludo y Estado */}
      <div className="space-y-2">
        <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic leading-none">
          Hola, <br /> <span className="text-primary">{userName.split(' ')[0]}</span>
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
            Sincronizado <Cloud className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Mosaico 2x2 Cuadrado */}
      <div className="grid grid-cols-2 gap-4">
        {quadrants.map((q) => (
          <button
            key={q.id}
            onClick={q.action}
            className={cn(
              "relative aspect-square overflow-hidden flex flex-col items-center justify-center rounded-[2.5rem] border bg-gradient-to-br transition-all active:scale-95 shadow-lg group",
              q.color,
              q.borderColor,
              q.shadow
            )}
          >
            {/* Círculo decorativo en esquina superior derecha */}
            <div className={cn(
              "absolute -top-4 -right-4 w-12 h-12 rounded-full opacity-20 transition-transform duration-500 group-hover:scale-125 group-hover:-translate-x-2 group-hover:translate-y-2",
              q.iconColor.replace('text-', 'bg-')
            )} />

            {/* Icono de fondo con baja opacidad */}
            <q.icon className={cn("absolute opacity-[0.03] w-24 h-24 -bottom-4 -left-4", q.iconColor)} />

            <div className={cn("p-4 rounded-2xl bg-background/50 mb-3 relative z-10", q.iconColor)}>
              <q.icon size={28} />
            </div>
            
            <div className="text-center space-y-0.5 relative z-10">
              <span className="block text-xs font-black tracking-tight text-foreground uppercase">
                {q.title}
              </span>
              <span className="block text-[9px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">
                {q.sub}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Actividad Hoy */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> Actividad Hoy
          </h3>
          <Badge variant="outline" className="text-[9px] font-bold uppercase border-primary/20 bg-primary/5 text-primary">
            {todayApps.length} Pendientes
          </Badge>
        </div>

        <div className="space-y-3">
          {todayApps.length === 0 ? (
            <div className="p-8 border border-dashed rounded-[2rem] text-center bg-muted/5">
              <p className="text-[10px] font-bold uppercase text-muted-foreground/40 italic">No hay citas para hoy</p>
            </div>
          ) : (
            todayApps.slice(0, 3).map((app) => (
              <div 
                key={app.id} 
                onClick={onOpenAgenda}
                className="p-5 bg-card border border-border/40 rounded-[2rem] flex items-center justify-between group active:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">
                    {app.time}
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight text-foreground truncate max-w-[150px]">{app.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-bold uppercase text-muted-foreground/60">{app.type}</span>
                      <div className="w-1 h-1 rounded-full bg-border" />
                      <span className="text-[9px] font-bold text-primary flex items-center gap-1"><Phone size={8} /> {app.phone}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
              </div>
            ))
          )}
          {todayApps.length > 3 && (
            <Button 
              variant="ghost" 
              onClick={onOpenAgenda}
              className="w-full h-12 text-[10px] font-black uppercase tracking-widest text-primary gap-2 rounded-full"
            >
              Ver {todayApps.length - 3} más <ChevronRight size={14} />
            </Button>
          )}
        </div>
      </div>

      {/* Footer Mobile Info */}
      <div className="pt-4 border-t border-border/40 text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
          Finanto Terminal v2.1 • CRM Élite
        </p>
      </div>
    </div>
  );
}

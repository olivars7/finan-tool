"use client"

import React from 'react';
import { 
  Calculator, 
  PlusCircle, 
  Calendar, 
  BarChart3, 
  Cloud
} from 'lucide-react';
import { cn } from "@/lib/utils";

interface MobileDashboardProps {
  userName: string;
  onOpenCalculator: () => void;
  onOpenNewAppointment: () => void;
  onOpenAgenda: () => void;
  onOpenStats: () => void;
}

export default function MobileDashboard({ 
  userName, 
  onOpenCalculator, 
  onOpenNewAppointment, 
  onOpenAgenda, 
  onOpenStats 
}: MobileDashboardProps) {
  
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
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-6 space-y-8 animate-in fade-in duration-700">
      {/* Saludo y Estado */}
      <div className="space-y-2">
        <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic">
          Hola, <span className="text-primary">{userName.split(' ')[0]}</span>
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
            Sincronizado en la nube <Cloud className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Mosaico 2x2 */}
      <div className="grid grid-cols-2 gap-4 flex-1 items-stretch">
        {quadrants.map((q) => (
          <button
            key={q.id}
            onClick={q.action}
            className={cn(
              "relative overflow-hidden flex flex-col items-center justify-center rounded-[2.5rem] border bg-gradient-to-br transition-all active:scale-95 shadow-lg group",
              q.color,
              q.borderColor,
              q.shadow
            )}
          >
            {/* Detalle decorativo del círculo */}
            <div className={cn(
              "absolute -top-6 -right-6 w-16 h-16 rounded-full opacity-20 transition-transform group-active:scale-110",
              q.iconColor.replace('text-', 'bg-')
            )} />

            <div className={cn("p-4 rounded-2xl bg-background/50 mb-3", q.iconColor)}>
              <q.icon size={32} />
            </div>
            
            <div className="text-center space-y-0.5">
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

      {/* Footer Mobile Info */}
      <div className="pt-4 border-t border-border/40 text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
          Finanto Terminal v2.0.5 • CRM Élite
        </p>
      </div>
    </div>
  );
}

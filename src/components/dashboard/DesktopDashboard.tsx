"use client"

import React from 'react';
import CreditCalculator from '@/components/calculator/CreditCalculator';
import AppointmentsDashboard from '@/components/appointments/AppointmentsDashboard';
import AdvancedStats from '@/components/stats/AdvancedStats';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CalendarDays, Wallet, Users, CheckCircle2, Coins,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface DesktopDashboardProps {
  stats: any;
  appointments: any[];
  activeAppointments: any[];
  upcoming: any[];
  past: any[];
  addAppointment: (app: any) => void;
  editAppointment: (id: string, data: any) => void;
  archiveAppointment: (id: string) => void;
  unarchiveAppointment: (id: string) => void;
  formatFriendlyDate: (date: string) => string;
  format12hTime: (time: string) => string;
  isSimulatorExpanded: boolean;
  onToggleSimulator: (open: boolean) => void;
  isGestorExpanded: boolean;
  onToggleGestor: (open: boolean) => void;
  isStatsExpanded: boolean;
  onToggleStats: (open: boolean) => void;
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
  theme: string;
}

export default function DesktopDashboard({
  stats,
  appointments,
  activeAppointments,
  upcoming,
  past,
  addAppointment,
  editAppointment,
  archiveAppointment,
  unarchiveAppointment,
  formatFriendlyDate,
  format12hTime,
  isSimulatorExpanded,
  onToggleSimulator,
  isGestorExpanded,
  onToggleGestor,
  isStatsExpanded,
  onToggleStats,
  selectedId,
  onSelectId,
  theme
}: DesktopDashboardProps) {

  const formatCurrency = (val: number) => {
    if (isNaN(val)) return "$0";
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

  const statsCards = [
    { 
      label: 'Citas hoy', 
      value: stats.todayCount.toString(), 
      icon: CalendarDays, 
      color: 'text-primary',
      tip: (
        <div className="space-y-1.5 py-1">
          <p className="flex justify-between gap-6 border-b border-white/5 pb-1">Confirmadas: <span className="text-green-500 font-black">{stats.todayConfirmed}</span></p>
          <p className="flex justify-between gap-6">Total agendadas: <span className="text-blue-400 font-black">{stats.todayCount}</span></p>
        </div>
      )
    },
    { 
      label: 'Pendientes', 
      value: stats.pendingCount.toString(), 
      icon: Wallet, 
      color: 'text-primary',
      tip: (
        <div className="space-y-1.5 py-1">
          <p className="text-muted-foreground uppercase text-[9px] font-black tracking-widest mb-1">Estatus Operativo</p>
          <p className="flex justify-between gap-6">Por atender: <span className="text-blue-400 font-black">{stats.pendingCount}</span></p>
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
        <div className="space-y-1.5 py-1">
          <p className="flex justify-between gap-6 border-b border-white/5 pb-1">Nuevos registros: <span className="text-blue-400 font-black">{stats.currentMonthProspects}</span></p>
          <p className="flex justify-between gap-6">Ciclo anterior: <span className="text-muted-foreground font-black">{stats.lastMonthProspects}</span></p>
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
        <div className="space-y-1.5 py-1">
          <p className="flex justify-between gap-6 border-b border-white/5 pb-1">Cierres (Ventas): <span className="text-green-500 font-black">{stats.currentMonthOnlyCierre}</span></p>
          <p className="flex justify-between gap-6">Apartados: <span className="text-blue-400 font-black">{stats.currentMonthApartados}</span></p>
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
        <div className="space-y-1.5 py-1">
          <p className="flex justify-between gap-6 border-b border-white/5 pb-1">Este viernes: <span className="text-yellow-500 font-black">{formatCurrency(stats.thisFridayCommission)}</span></p>
          <p className="flex justify-between gap-6">Siguiente: <span className="text-blue-400 font-black">{formatCurrency(stats.nextFridayCommission)}</span></p>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="grid grid-cols-5 gap-4">
        {statsCards.map((stat, i) => (
          <TooltipProvider key={i}>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Card 
                  className="bg-card/30 backdrop-blur-md border-none hover:bg-card/50 transition-all duration-300 cursor-help"
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={cn("p-2 rounded-full bg-muted/5", stat.color)}><stat.icon size={20} /></div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[9px] uppercase font-bold text-muted-foreground truncate">{stat.label}</p>
                      <div className="flex items-baseline gap-2">
                        <p className={cn("text-lg font-bold truncate", stat.label === 'Comisiones Mes' ? getDynamicGradient(stats.currentMonthCommission) : "")}>
                          {stat.value}
                        </p>
                        {stat.comparison !== undefined && (
                          <div className="flex flex-col">
                            <span className={cn(
                              "text-[8px] font-bold flex items-center",
                              (parseFloat(stat.value.replace(/[^0-9.-]+/g,"")) >= stat.comparison) ? "text-green-500" : "text-destructive"
                            )}>
                              {stat.comparison >= 0 ? <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" /> : <ArrowDownRight className="w-2.5 h-2.5 mr-0.5" />}
                              {stat.isCurrency ? formatCurrency(stat.comparison) : stat.comparison}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="p-3 border-border/40 min-w-[180px]">
                {stat.tip}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
        <section className="col-span-5 space-y-6">
          <CreditCalculator isExpanded={isSimulatorExpanded} onExpandedChange={onToggleSimulator} />
          <AdvancedStats stats={stats} isExpanded={isStatsExpanded} onExpandedChange={onToggleStats} />
        </section>
        <section className="col-span-7 pb-10">
          <AppointmentsDashboard 
            isExpanded={isGestorExpanded}
            onExpandedChange={onToggleGestor}
            selectedAppId={selectedId}
            onSelectAppId={onSelectId}
            theme={theme}
            appointments={appointments} 
            activeAppointments={activeAppointments}
            upcoming={upcoming} 
            past={past} 
            addAppointment={addAppointment} 
            editAppointment={editAppointment} 
            archiveAppointment={archiveAppointment}
            unarchiveAppointment={unarchiveAppointment}
            formatFriendlyDate={formatFriendlyDate} 
            format12hTime={format12hTime} 
            stats={stats}
          />
        </section>
      </div>
    </div>
  );
}

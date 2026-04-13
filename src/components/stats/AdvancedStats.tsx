
/**
 * @fileOverview Panel de Inteligencia Avanzada - Finanto
 */

"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, BarChart3, Maximize2, X, Activity, CalendarDays, Trophy, Users, Coins, ArrowUpRight, ArrowDownRight, Zap, Target, Receipt, Percent, Info, LineChart as LineIcon, AlertCircle, Lightbulb, CalendarClock, CheckCircle2, History
} from "lucide-react";
import { Bar, CartesianGrid, XAxis, YAxis, Cell, ReferenceArea, Line, ResponsiveContainer, ComposedChart, LineChart, ReferenceLine } from "recharts";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const chartConfig = {
  agendadas: { label: "Agendadas", color: "url(#agendaGradient)" },
  atendidas: { label: "Atendidas", color: "url(#atendidaGradient)" },
  cierres: { label: "Cierres", color: "url(#cierreGradient)" },
  income: { label: "Ingresos", color: "hsl(var(--primary))" }
} satisfies ChartConfig;

const CustomXAxisTick = (props: any) => {
  const { x, y, payload, data } = props;
  const item = data[payload.index];
  if (!item) return null;

  const isCorte = item.isCorte;
  const isPaga = item.isPaga;
  
  const dotColor = isCorte ? "#64748b" : isPaga ? "#1877F2" : null;

  return (
    <g transform={`translate(${x},${y})`}>
      <text 
        x={0} 
        y={0} 
        dy={16} 
        textAnchor="middle" 
        fill={dotColor || "currentColor"} 
        fillOpacity={dotColor ? 1 : 0.5}
        className="text-[9px] font-bold uppercase"
      >
        {item.dayNumber}
      </text>
      <text 
        x={0} 
        y={32} 
        textAnchor="middle" 
        fill={dotColor || "currentColor"} 
        fillOpacity={1}
        className="text-[10px] font-black uppercase"
      >
        {item.dayInitial}
      </text>
      {dotColor && (
        <circle 
          cx={0} 
          cy={44} 
          r={3} 
          fill={dotColor} 
          className="shadow-sm"
        />
      )}
    </g>
  );
};

const FortnightMonitor = ({ data, title, icon: Icon, expanded = false, markedBorder = false, globalMax }: { data: any, title: string, icon: any, expanded?: boolean, markedBorder?: boolean, globalMax: number }) => {
  const isMobile = useIsMobile();
  
  const displayData = useMemo(() => {
    if (isMobile) return data.slice(-25);
    return data;
  }, [data, isMobile]);

  const todayItem = displayData.find((d: any) => d.isToday);
  const barSize = expanded ? (isMobile ? 10 : 14) : 22;

  return (
    <div className={cn(
      "bg-muted/5 rounded-2xl p-4 md:p-6 space-y-4",
      markedBorder ? "border border-white/20 shadow-sm" : "border border-border/5"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl"><Icon className="w-4 h-4 text-primary" /></div>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{title}</h4>
            <p className="text-[8px] font-medium text-muted-foreground/40 uppercase">
              {isMobile ? "Vista de 25 días" : "Ciclo de 35 días"}
            </p>
          </div>
        </div>
      </div>
      <div className={cn("overflow-visible", expanded ? "h-[320px]" : "h-[220px]")}>
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ComposedChart data={displayData} margin={{ top: 35, right: 10, left: 10, bottom: 55 }}>
            <defs>
              <linearGradient id="agendaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="atendidaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.8} />
                <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="cierreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00F5FF" />
                <stop offset="100%" stopColor="#1877F2" />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.1} />
            
            <XAxis 
              xAxisId={0} 
              dataKey="dayNumber" 
              tickLine={false} 
              axisLine={false} 
              interval={0} 
              tick={<CustomXAxisTick data={displayData} />} 
            />
            <XAxis xAxisId={1} dataKey="dayNumber" hide />
            <YAxis hide domain={[0, globalMax + 2]} />
            
            <ChartTooltip 
              cursor={{ fill: "hsl(var(--primary))", fillOpacity: 0.05 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-card/95 p-3 rounded-lg shadow-2xl border-none space-y-2 backdrop-blur-xl">
                      <p className="text-[10px] font-black uppercase">{d.dayFull}</p>
                      <div className="space-y-1">
                        {payload.map((p: any, i: number) => (
                          <div key={`tooltip-item-${i}`} className="flex items-center justify-between gap-6 text-[10px] font-bold">
                            <span className="opacity-60">{p.name}:</span>
                            <span style={{ color: p.color === 'url(#cierreGradient)' ? '#00F5FF' : p.color }}>{p.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {todayItem && (
              <ReferenceArea 
                xAxisId={0}
                x1={todayItem.dayNumber} 
                x2={todayItem.dayNumber} 
                fill="hsl(var(--primary))" 
                fillOpacity={0.05} 
              />
            )}
            
            <Bar xAxisId={0} dataKey="agendadas" name="Agendadas" radius={[6, 6, 0, 0]} barSize={barSize} fill="url(#agendaGradient)" />
            <Bar xAxisId={1} dataKey="atendidas" name="Atendidas" radius={[6, 6, 0, 0]} barSize={barSize} fill="url(#atendidaGradient)" />
            
            <Line 
              xAxisId={0}
              type="monotone" 
              dataKey="cierres" 
              name="Cierres" 
              stroke="none" 
              dot={(props: any) => {
                const { cx, payload } = props;
                if (!payload || payload.cierres <= 0) return null;
                const markerY = 15; 
                const radius = barSize / 2;
                return (
                  <g key={`marker-cierre-${payload.dayFull}-${payload.dayNumber}`}>
                    <circle cx={cx} cy={markerY} r={radius} fill="url(#cierreGradient)" />
                    <text x={cx} y={markerY} dy={3.5} textAnchor="middle" fill="white" className="text-[8px] font-black">{payload.cierres}</text>
                  </g>
                );
              }}
            />
          </ComposedChart>
        </ChartContainer>
      </div>
    </div>
  );
};

export default function AdvancedStats({ stats, isExpanded = false, onExpandedChange }: any) {
  const isMobile = useIsMobile();
  const attendanceRate = (stats.todayConfirmed / (stats.todayCount || 1)) * 100;
  const closingRate = attendanceRate > 0 ? (stats.conversionRate / (attendanceRate / 100)) : 0;
  const monthlyGrowth = stats.lastMonthProspects > 0 ? ((stats.currentMonthProspects - stats.lastMonthProspects) / stats.lastMonthProspects) * 100 : 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(Math.round(val));
  };

  const WeeklyHistoryChart = ({ markedBorder = false }: { markedBorder?: boolean }) => {
    const data = useMemo(() => {
      if (isMobile) return stats.charts.weeklyIncomeHistory.slice(-12);
      return stats.charts.weeklyIncomeHistory;
    }, [stats.charts.weeklyIncomeHistory, isMobile]);

    return (
      <div className={cn(
        "bg-muted/5 rounded-2xl p-6 space-y-6",
        markedBorder ? "border border-white/20 shadow-sm" : "border border-border/5"
      )}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl"><LineIcon className="w-5 h-5 text-primary" /></div>
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest">Flujo de Cobro Semanal</h4>
            <p className="text-[9px] text-muted-foreground/60">{isMobile ? "Vista de 3 meses" : "Historial extendido"}</p>
          </div>
        </div>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 10, right: 10, top: 20, bottom: 10 }}>
              <CartesianGrid vertical={true} horizontal={false} stroke="currentColor" opacity={0.05} />
              <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={10} className="text-[10px] font-bold text-muted-foreground/40" />
              <YAxis hide />
              <ChartTooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-card/95 p-3 rounded-lg shadow-2xl border-none space-y-1 backdrop-blur-xl">
                        <p className="text-[10px] font-black uppercase opacity-60">Semana: {d.week}</p>
                        <p className="text-xs font-bold text-primary">{formatCurrency(d.income)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" dataKey="income" stroke="#1877F2" strokeWidth={3} 
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  if (payload.isCurrentWeek) return <circle cx={cx} cy={cy} r={6} fill="#1877F2" stroke="#1877F2" strokeWidth={3} />;
                  return <circle cx={cx} cy={cy} r={2} fill="#1877F2" fillOpacity={0.3} />;
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const PaydayTimeline = () => (
    <div className="flex flex-col gap-4">
      <div className="bg-primary/[0.03] p-5 rounded-2xl space-y-3 border border-primary/5">
        <div className="flex items-center gap-2 text-primary/60">
          <CalendarClock className="w-4 h-4" />
          <span className="text-[9px] font-black uppercase tracking-widest">Liquidación Este Viernes</span>
        </div>
        <div className="flex items-baseline justify-between">
          <p className={cn("text-2xl font-black tracking-tighter", stats.thisFridayCommission > 0 ? "text-primary" : "opacity-20")}>
            {formatCurrency(stats.thisFridayCommission)}
          </p>
        </div>
      </div>
      <div className="bg-muted/5 p-5 rounded-2xl space-y-3 border border-border/5">
        <div className="flex items-center gap-2 text-muted-foreground/60">
          <CalendarClock className="w-4 h-4" />
          <span className="text-[9px] font-black uppercase tracking-widest">Siguiente Viernes</span>
        </div>
        <p className={cn("text-2xl font-black tracking-tighter", stats.nextFridayCommission > 0 ? "text-foreground" : "opacity-20")}>
          {formatCurrency(stats.nextFridayCommission)}
        </p>
      </div>
    </div>
  );

  return (
    <>
      <Card className="shadow-none bg-card border-none overflow-hidden hover:bg-card/40 transition-colors group">
        <CardHeader className="py-4 flex flex-row items-center justify-between border-b border-border/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
              <BarChart3 className="text-primary w-5 h-5" />
            </div>
            <CardTitle className="text-lg font-bold tracking-tight">Inteligencia</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onExpandedChange(true)} className="h-8 w-8 text-muted-foreground/40 hover:text-primary">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <FortnightMonitor data={stats.charts.fortnightActivity} title="Monitor Operativo" icon={CalendarDays} globalMax={stats.charts.globalMax} />
        </CardContent>
      </Card>

      <Dialog open={isExpanded} onOpenChange={onExpandedChange}>
        <DialogContent data-calculator-dialog="true" className="max-w-none w-screen h-screen m-0 rounded-none bg-background border-none p-0 flex flex-col overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b border-border/10 flex flex-row items-center justify-between bg-card/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-xl"><BarChart3 className="text-primary w-6 h-6" /></div>
              <div>
                <DialogTitle className="text-xl font-black uppercase tracking-tighter">Panel de Inteligencia</DialogTitle>
                <DialogDescription className="text-xs">Monitor de rendimiento y ciclos financieros.</DialogDescription>
              </div>
            </div>
            <DialogClose asChild><Button variant="ghost" size="icon" className="rounded-full hover:bg-destructive/10 h-10 w-10"><X className="w-5 h-5" /></Button></DialogClose>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto scrollbar-thin bg-background/50">
            <div className="max-w-[1400px] mx-auto p-4 md:p-10 space-y-10 pb-32">
              {/* KPIs Principales */}
              <div className="flex overflow-x-auto pb-4 md:pb-0 md:grid md:grid-cols-5 gap-4 scrollbar-thin">
                {[
                  { icon: CalendarDays, color: 'text-primary', label: 'Citas Hoy', value: stats.todayCount || 0, val1: stats.todayConfirmed || 0, sub1: 'Conf.', bg: 'bg-primary/5' },
                  { icon: TrendingUp, color: 'text-primary', label: 'Eficiencia', value: `${Math.round(closingRate)}%`, val1: 'Atendidas', sub1: 'Base', bg: 'bg-muted/5' },
                  { icon: Users, color: 'text-accent', label: 'Prospectos', value: stats.currentMonthProspects || 0, growth: monthlyGrowth, val1: stats.lastMonthProspects || 0, sub1: 'Mes Ant.', bg: 'bg-accent/5' },
                  { icon: Trophy, color: 'text-green-500', label: 'Cierres', value: stats.currentMonthOnlyCierre || 0, val1: stats.lastMonthSales || 0, sub1: 'Mes Ant.', bg: 'bg-green-500/5' },
                  { icon: Coins, color: 'text-yellow-600', label: 'Ingresos', value: formatCurrency(stats.currentMonthCommission || 0), growth: stats.commissionGrowth, val1: formatCurrency(stats.lastMonthCommission || 0), sub1: 'Mes Ant.', isGradient: true, bg: 'bg-yellow-500/5' }
                ].map((s, i) => (
                  <div key={`stat-card-${i}`} className={cn("p-5 rounded-2xl space-y-4 shrink-0 border-none shadow-none min-w-[160px] md:min-w-0", s.bg)}>
                    <div className="flex justify-between items-start">
                      <div className={cn("p-2 rounded-xl bg-background/50 shadow-sm", s.color)}><s.icon className="w-4 h-4" /></div>
                      {s.growth !== undefined && <span className={cn("text-[10px] font-bold flex items-center", s.growth >= 0 ? "text-green-500" : "text-destructive")}>{s.growth >= 0 ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>} {Math.abs(Math.round(s.growth))}%</span>}
                    </div>
                    <div><p className="text-[9px] uppercase font-black text-muted-foreground/60 tracking-widest">{s.label}</p><p className={cn("text-xl md:text-2xl font-black truncate", s.label === 'Ingresos' && stats.currentMonthCommission > 10000 ? "text-gradient-lima-blue" : "")}>{s.value}</p></div>
                    <div className="pt-3 border-t border-border/5 flex justify-between"><span className="text-[8px] font-bold text-muted-foreground uppercase">{s.sub1}</span><span className="text-xs font-bold opacity-60">{s.val1}</span></div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-8">
                  <WeeklyHistoryChart markedBorder />
                  <FortnightMonitor data={stats.charts.expandedActivity || stats.charts.fortnightActivity} title="Monitor Operativo Extendido" icon={CalendarDays} expanded markedBorder globalMax={stats.charts.globalMax} />
                </div>

                <div className="lg:col-span-4 space-y-8">
                  <PaydayTimeline />

                  {/* Record de Venta */}
                  <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 shadow-2xl relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                      <Trophy size={160} className="text-primary" />
                    </div>
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary text-white rounded-2xl shadow-lg">
                          <Trophy size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Récord de Venta</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest ml-1">Monto más alto cerrado</p>
                        <p className="text-4xl md:text-5xl font-black tracking-tighter text-foreground text-gradient-aqua-blue">
                          {formatCurrency(stats.salesRecord)}
                        </p>
                      </div>
                      <div className="pt-4 border-t border-primary/10">
                        <p className="text-[8px] font-black uppercase text-primary/60 tracking-widest italic flex items-center gap-2">
                          <Zap size={10} /> Sigue superando tus propios límites
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actividad Últimas 6 Semanas */}
                  <div className="bg-muted/5 rounded-[2.5rem] p-6 space-y-6 border border-border/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-xl"><History className="w-4 h-4 text-muted-foreground" /></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Flujo Semanal (6 Sem.)</span>
                    </div>
                    <div className="space-y-4">
                      {stats.last6Weeks.map((week: any, i: number) => (
                        <div key={`week-stat-${i}`} className={cn(
                          "flex items-center justify-between p-3 rounded-2xl border transition-all",
                          week.isCurrent ? "bg-primary/5 border-primary/20" : "bg-background/20 border-transparent opacity-60"
                        )}>
                          <div>
                            <p className="text-[10px] font-black uppercase leading-none mb-1">{week.label}</p>
                            {week.isCurrent && <span className="text-[8px] font-bold text-primary uppercase tracking-tighter">Ciclo Actual</span>}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <span className="block text-[8px] font-bold text-muted-foreground uppercase mb-0.5">Agend.</span>
                              <span className="text-xs font-black">{week.agendadas}</span>
                            </div>
                            <div className="text-center">
                              <span className="block text-[8px] font-bold text-muted-foreground uppercase mb-0.5">Atend.</span>
                              <span className="text-xs font-black text-accent">{week.atendidas}</span>
                            </div>
                            <div className="text-center">
                              <span className="block text-[8px] font-bold text-muted-foreground uppercase mb-0.5">Cierr.</span>
                              <span className="text-xs font-black text-green-500">{week.cierres}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

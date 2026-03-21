
/**
 * @fileOverview Panel de Inteligencia Avanzada - Finanto
 */

"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, BarChart3, Maximize2, X, Activity, CalendarDays, Trophy, Users, Coins, ArrowUpRight, ArrowDownRight, Zap, Target, Receipt, Percent, Info, LineChart as LineIcon, AlertCircle, Lightbulb, CalendarClock
} from "lucide-react";
import { Bar, CartesianGrid, XAxis, YAxis, Cell, ReferenceArea, Line, ResponsiveContainer, ComposedChart, LineChart, ReferenceLine } from "recharts";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const chartConfig = {
  agendadas: { label: "Agendadas", color: "hsl(var(--primary))" },
  atendidas: { label: "Atendidas", color: "hsl(var(--accent))" },
  cierres: { label: "Cierres", color: "url(#cierreGradient)" },
  income: { label: "Ingresos", color: "hsl(var(--primary))" }
} satisfies ChartConfig;

const CustomXAxisTick = (props: any) => {
  const { x, y, payload, data } = props;
  const item = data[payload.index];
  if (!item) return null;

  const isCorte = item.isCorte;
  const isPaga = item.isPaga;
  
  // Gris para corte, Azul para pago
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
  const [isCorporate, setIsCorporate] = useState(false);
  
  useEffect(() => {
    const theme = document.documentElement.getAttribute('data-theme');
    setIsCorporate(!theme || theme === 'corporativo-v2');
  }, []);

  const todayItem = data.find((d: any) => d.isToday);
  
  const localConfig = useMemo(() => ({
    ...chartConfig,
    atendidas: { 
      ...chartConfig.atendidas, 
      color: isCorporate ? "hsl(187 100% 42%)" : "hsl(var(--accent))" 
    }
  }), [isCorporate]);

  const barSize = expanded ? 14 : 22;
  const agendadasNormalColor = "hsl(var(--primary) / 0.25)";
  const atendidasNormalColor = isCorporate ? "hsl(187 100% 42%)" : "hsl(var(--accent))";
  
  const todayAgendadasColor = "hsl(var(--primary))"; 
  const todayAtendidasColor = "hsl(142 70% 45%)"; 

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
            <p className="text-[8px] font-medium text-muted-foreground/40 uppercase">{expanded ? "Monitor Extendido (35 días)" : "Monitor de 15 días"}</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3">
           <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-primary/40" /> <span className="text-[8px] font-bold uppercase opacity-60">Agendadas</span></div>
           <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: atendidasNormalColor }} /> <span className="text-[8px] font-bold uppercase opacity-60">Atendidas</span></div>
           <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[url(#cierreGradient)]" /> <span className="text-[8px] font-bold uppercase opacity-60">Cierres</span></div>
        </div>
      </div>
      <div className={cn("overflow-visible", expanded ? "h-[320px]" : "h-[220px]")}>
        <ChartContainer config={localConfig} className="h-full w-full">
          <ComposedChart data={data} margin={{ top: 35, right: 10, left: 10, bottom: 55 }}>
            <defs>
              <linearGradient id="cierreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00F5FF" />
                <stop offset="33%" stopColor="#1877F2" />
                <stop offset="66%" stopColor="#7B61FF" />
                <stop offset="100%" stopColor="#FF00D6" />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.1} />
            
            <XAxis 
              xAxisId={0} 
              dataKey="dayNumber" 
              tickLine={false} 
              axisLine={false} 
              interval={0}
              tick={<CustomXAxisTick data={data} />} 
            />
            <XAxis xAxisId={1} dataKey="dayNumber" hide />
            
            <YAxis hide domain={[0, globalMax + 2]} />
            
            <ChartTooltip 
              cursor={{ 
                fill: "hsl(var(--primary))", 
                fillOpacity: 0.08,
                stroke: "hsl(var(--primary))",
                strokeDasharray: "4 4",
                strokeWidth: 1
              }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className={cn("bg-card/95 p-3 rounded-lg shadow-2xl border-none space-y-2 backdrop-blur-xl", d.isToday ? "shadow-[0_0_15px_rgba(24,119,242,0.3)]" : "")}>
                      <p className="text-[10px] font-black uppercase flex items-center justify-between gap-4">{d.dayFull} {d.isToday && <span className="text-primary">(HOY)</span>}</p>
                      <div className="space-y-1">
                        {payload.map((p: any, i: number) => (
                          <div key={`tooltip-item-${i}`} className="flex items-center justify-between gap-6 text-[10px] font-bold">
                            <span className="opacity-60">{p.name}:</span>
                            <span style={{ color: p.color === 'url(#cierreGradient)' ? '#00F5FF' : (d.isToday && p.dataKey === 'atendidas' ? todayAtendidasColor : p.color) }}>{p.value}</span>
                          </div>
                        ))}
                        {(d.isPaga || d.isCorte) && (
                          <div className={cn("mt-2 pt-2 border-t border-border/10 text-[10px] font-black uppercase flex items-center gap-2", d.isPaga ? "text-primary" : "text-slate-500")}>
                            {d.isPaga ? <Coins className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            {d.isPaga ? `PAGA: ${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(d.projectedPay)}` : "CORTE SEMANAL"}
                          </div>
                        )}
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
                fillOpacity={0.08} 
                stroke="hsl(var(--primary))"
                strokeDasharray="4 4"
                strokeWidth={1}
              />
            )}
            
            <Bar xAxisId={0} dataKey="agendadas" name="Agendadas" radius={[6, 6, 0, 0]} barSize={barSize}>
              {data.map((e: any, i: number) => (
                <Cell key={`bar-agenda-${i}`} fill={e.isToday ? todayAgendadasColor : agendadasNormalColor} />
              ))}
            </Bar>

            <Bar xAxisId={1} dataKey="atendidas" name="Atendidas" radius={[6, 6, 0, 0]} barSize={barSize}>
              {data.map((e: any, i: number) => (
                <Cell key={`bar-atendida-${i}`} fill={e.isToday ? todayAtendidasColor : atendidasNormalColor} />
              ))}
            </Bar>
            
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
                  <g key={`marker-cierre-${payload.dayFull}-${payload.dayNumber}-${cx}`}>
                    <circle 
                      cx={cx} 
                      cy={markerY} 
                      r={radius} 
                      fill="url(#cierreGradient)" 
                      className="animate-pulse"
                    />
                    <text 
                      x={cx} 
                      y={markerY} 
                      dy={3.5} 
                      textAnchor="middle" 
                      fill="white" 
                      className="text-[8px] font-black"
                    >
                      {payload.cierres}
                    </text>
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
  const attendanceRate = (stats.todayConfirmed / (stats.todayCount || 1)) * 100;
  const closingRate = attendanceRate > 0 ? (stats.conversionRate / (attendanceRate / 100)) : 0;
  const monthlyGrowth = stats.lastMonthProspects > 0 ? ((stats.currentMonthProspects - stats.lastMonthProspects) / stats.lastMonthProspects) * 100 : 0;
  const taxImpact = (stats.currentMonthCommission || 0) / 0.91 * 0.09;

  const formatCurrency = (val: number) => {
    if (isNaN(val) || val === null || val === undefined) return "$0";
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(Math.round(val));
  };

  const getDynamicGradient = (val: number) => {
    if (val < 2000) return "";
    if (val < 5000) return "text-gradient-aqua-blue";
    if (val < 10000) return "text-gradient-aqua-violet";
    return "text-gradient-lima-blue";
  };

  const WeeklyHistoryChart = ({ markedBorder = false }: { markedBorder?: boolean }) => {
    const data = stats.charts.weeklyIncomeHistory;
    const lastIdx = data.length - 1;
    const secondLastIdx = data.length - 2;

    return (
      <div className={cn(
        "bg-muted/5 rounded-2xl p-6 space-y-6",
        markedBorder ? "border border-white/20 shadow-sm" : "border border-border/5"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl"><LineIcon className="w-5 h-5 text-primary" /></div>
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-widest">Flujo de Cobro Semanal</h4>
              <p className="text-[9px] text-muted-foreground/60">Ingreso neto por semana de pago</p>
            </div>
          </div>
        </div>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 10, right: 10, top: 20, bottom: 10 }}>
              <defs>
                <linearGradient id="historyLineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00F5FF" />
                  <stop offset="50%" stopColor="#1877F2" />
                  <stop offset="100%" stopColor="#7B61FF" />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={true} horizontal={false} stroke="currentColor" opacity={0.1} strokeDasharray="3 3" />
              <XAxis 
                dataKey="week" 
                interval={0}
                tickLine={false} 
                axisLine={false} 
                tickMargin={10} 
                className="text-[10px] font-bold text-muted-foreground/40" 
              />
              <YAxis hide />
              <ChartTooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className={cn("bg-card/95 p-3 rounded-lg shadow-2xl border-none space-y-2 backdrop-blur-xl", d.isCurrentWeek ? "shadow-[0_0_20px_rgba(24,119,242,0.2)]" : "")}>
                        <p className={cn("text-[10px] font-black uppercase border-b border-border/10 pb-1 mb-1", d.isCurrentWeek ? "text-primary" : "opacity-60")}>Semana: {d.week}</p>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-foreground flex items-center justify-between gap-4"><span className="opacity-60 text-[9px] uppercase">Cobro:</span><span className="text-primary">{formatCurrency(d.income)}</span></p>
                          <p className="text-[10px] font-bold flex items-center justify-between gap-4"><span className="opacity-60 uppercase text-[8px]">Cierres:</span><span className="text-green-500">{d.cierres}</span></p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Animated blinking lines for the last two vertical milestones */}
              {data[lastIdx] && (
                <ReferenceLine 
                  x={data[lastIdx].week} 
                  stroke="#1877F2" 
                  strokeWidth={2} 
                  strokeDasharray="3 3" 
                  className="animate-pulse"
                />
              )}
              {data[secondLastIdx] && (
                <ReferenceLine 
                  x={data[secondLastIdx].week} 
                  stroke="#1877F2" 
                  strokeWidth={2} 
                  strokeDasharray="3 3" 
                  className="animate-pulse opacity-50"
                />
              )}
              <Line 
                type="monotone" dataKey="income" stroke="url(#historyLineGradient)" strokeWidth={3} 
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  if (payload.isCurrentWeek) return <circle key={`dot-current-${payload.week}`} cx={cx} cy={cy} r={6} fill="#1877F2" stroke="#1877F2" strokeWidth={3} />;
                  return <circle key={`dot-week-${payload.week}`} cx={cx} cy={cy} r={2} fill="#1877F2" fillOpacity={0.3} />;
                }}
                activeDot={{ r: 6, strokeWidth: 0 }}
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
          {stats.thisFridayCommission > 0 && <span className="text-[10px] font-bold text-primary animate-pulse uppercase">Pendiente</span>}
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

  const SummarySection = ({ markedBorder = false }: { markedBorder?: boolean }) => (
    <div className={cn(
      "bg-muted/5 rounded-2xl p-6 space-y-6",
      markedBorder ? "border border-white/20 shadow-sm" : "border border-border/5"
    )}>
      <div className="space-y-6">
        <div>
          <span className="text-[9px] font-black uppercase block text-muted-foreground/60 mb-1 tracking-widest">Volumen Vendido (Mes)</span>
          <p className={cn("text-2xl font-black tracking-tighter", getDynamicGradient(stats.totalCreditSold))}>{formatCurrency(stats.totalCreditSold || 0)}</p>
          <span className="text-[8px] text-muted-foreground font-bold uppercase opacity-40">Basado en cierres finales</span>
        </div>
        
        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border/5">
          <div>
            <span className="text-[9px] font-black uppercase block text-muted-foreground/60 mb-1 tracking-widest">Ingreso Neto</span>
            <p className="text-xl font-black tracking-tight">{formatCurrency(stats.currentMonthCommission || 0)}</p>
          </div>
          <div>
            <span className="text-[9px] font-black uppercase block text-muted-foreground/60 mb-1 tracking-widest">Participación</span>
            <p className="text-xl font-black tracking-tight">{stats.avgParticipation || 0}%</p>
          </div>
        </div>

        <div className="pt-4 border-t border-border/5">
          <span className="text-[9px] font-black uppercase block text-muted-foreground/60 mb-1 tracking-widest">Retención ISR Est.</span>
          <p className="text-xl font-black tracking-tight text-destructive/60">{formatCurrency(taxImpact || 0)}</p>
          <span className="text-[8px] text-destructive/40 font-bold uppercase">9% del ingreso bruto</span>
        </div>
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
          <div className="hidden md:grid grid-cols-2 gap-4">
            <div className="bg-primary/[0.03] p-4 rounded-2xl border border-primary/10">
              <span className="text-[8px] font-black uppercase text-primary/60 block mb-1">Citas Hoy</span>
              <p className="text-xl font-black text-primary">{stats.todayCount || 0}</p>
            </div>
            <div className="bg-accent/[0.03] p-4 rounded-2xl border border-accent/10">
              <span className="text-[8px] font-black uppercase text-accent/60 block mb-1">Prospectos</span>
              <p className="text-xl font-black text-accent">{stats.currentMonthProspects || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isExpanded} onOpenChange={onExpandedChange}>
        <DialogContent data-calculator-dialog="true" className="max-w-none w-screen h-screen m-0 rounded-none bg-background border-none p-0 flex flex-col overflow-hidden">
          <DialogTitle className="sr-only">Inteligencia Pro Finanto</DialogTitle>
          <DialogHeader className="px-6 py-4 border-b border-border/10 flex flex-row items-center justify-between bg-card/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-xl"><BarChart3 className="text-primary w-6 h-6" /></div>
              <div><h3 className="text-xl font-black uppercase tracking-tighter">Panel de Inteligencia</h3><DialogDescription className="text-xs">Monitor de rendimiento y ciclos financieros.</DialogDescription></div>
            </div>
            <DialogClose asChild><Button variant="ghost" size="icon" className="rounded-full hover:bg-destructive/10 h-10 w-10"><X className="w-5 h-5" /></Button></DialogClose>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto scrollbar-thin bg-background/50">
            <div className="max-w-[1400px] mx-auto p-4 md:p-10 space-y-10 pb-32">
              <div className="flex overflow-x-auto pb-4 md:pb-0 md:grid md:grid-cols-5 gap-4 scrollbar-thin">
                {[
                  { icon: CalendarDays, color: 'text-primary', label: 'Citas Hoy', value: stats.todayCount || 0, val1: stats.todayConfirmed || 0, sub1: 'Conf.', bg: 'bg-primary/5' },
                  { icon: TrendingUp, color: 'text-primary', label: 'Eficiencia', value: `${Math.round(closingRate)}%`, val1: 'Atendidas', sub1: 'Base', bg: 'bg-muted/5' },
                  { icon: Users, color: 'text-accent', label: 'Prospectos', value: stats.currentMonthProspects || 0, growth: monthlyGrowth, val1: stats.lastMonthProspects || 0, sub1: 'Mes Ant.', bg: 'bg-accent/5' },
                  { icon: Trophy, color: 'text-green-500', label: 'Cierres', value: stats.currentMonthOnlyCierre || 0, val1: stats.lastMonthSales || 0, sub1: 'Mes Ant.', bg: 'bg-green-500/5' },
                  { icon: Coins, color: 'text-yellow-600', label: 'Ingresos', value: formatCurrency(stats.currentMonthCommission || 0), growth: stats.commissionGrowth, val1: formatCurrency(stats.lastMonthCommission || 0), sub1: 'Mes Ant.', isGradient: true, bg: 'bg-yellow-500/5' }
                ].map((s, i) => (
                  <div key={`stat-card-${i}`} className={cn("p-5 rounded-2xl space-y-4 hover:brightness-110 transition-all cursor-default group animate-finanto-reveal opacity-0 shrink-0 border-none shadow-none min-w-[160px] md:min-w-0", s.bg, i === 0 ? "delay-100" : i === 1 ? "delay-200" : i === 2 ? "delay-300" : i === 3 ? "delay-400" : i === 4 ? "delay-500" : "")}>
                    <div className="flex justify-between items-start">
                      <div className={cn("p-2 rounded-xl bg-background/50 shadow-sm", s.color)}><s.icon className="w-4 h-4" /></div>
                      {s.growth !== undefined && <span className={cn("text-[10px] font-bold flex items-center", s.growth >= 0 ? "text-green-500" : "text-destructive")}>{s.growth >= 0 ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>} {Math.abs(Math.round(s.growth))}%</span>}
                    </div>
                    <div><p className="text-[9px] uppercase font-black text-muted-foreground/60 tracking-widest">{s.label}</p><p className={cn("text-xl md:text-2xl font-black truncate", s.isGradient ? getDynamicGradient(stats.currentMonthCommission || 0) : "")}>{s.value}</p></div>
                    <div className="pt-3 border-t border-border/5 flex justify-between"><span className="text-[8px] font-bold text-muted-foreground uppercase">{s.sub1}</span><span className="text-xs font-bold opacity-60">{s.val1}</span></div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-8">
                  <div className="animate-finanto-reveal opacity-0 delay-200">
                    <WeeklyHistoryChart markedBorder />
                  </div>
                  <div className="animate-finanto-reveal opacity-0 delay-300">
                    <FortnightMonitor data={stats.charts.expandedActivity || stats.charts.fortnightActivity} title="Monitor Operativo de 35 Días" icon={CalendarDays} expanded markedBorder globalMax={stats.charts.globalMax} />
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                  <div className="animate-finanto-reveal opacity-0 delay-400">
                    <PaydayTimeline />
                  </div>

                  <div className="animate-finanto-reveal opacity-0 delay-500 border border-yellow-500/5 bg-yellow-500/[0.03] p-6 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-500/10 rounded-xl"><Lightbulb className="w-5 h-5 text-yellow-600" /></div>
                      <span className="text-[10px] font-black uppercase text-yellow-700 tracking-widest">Insights Operativos</span>
                    </div>
                    <div className="space-y-4">
                      {closingRate > 30 ? (
                        <p className="text-xs font-medium leading-relaxed opacity-80">
                          Tu tasa de cierre es <strong>excepcional</strong>. Estás superando el promedio del equipo.
                        </p>
                      ) : (
                        <p className="text-xs font-medium leading-relaxed opacity-80">
                          La tasa de cierre actual sugiere revisar el seguimiento de 2das consultas.
                        </p>
                      )}
                      <div className="pt-3 border-t border-yellow-500/10 flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase opacity-40">Ticket Promedio:</span>
                        <span className="text-[10px] font-black">
                          {formatCurrency(stats.totalCreditSold / (stats.currentMonthOnlyCierre || 1))}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="animate-finanto-reveal opacity-0 delay-600">
                    <SummarySection markedBorder />
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

/**
 * @fileOverview Panel de Inteligencia Avanzada - Finanto
 */

"use client"

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, BarChart3, Maximize2, X, Activity, CalendarDays, Trophy, Users, History, Coins, ArrowUpRight, ArrowDownRight, Zap, Target, Receipt, Percent, Info, LineChart as LineIcon, AlertCircle, PieChart as PieIcon, LayoutGrid, Lightbulb, UserCheck, CalendarClock
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell, LabelList, ReferenceArea, ReferenceLine, Line, LineChart, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface AdvancedStatsProps {
  stats: any;
  isExpanded?: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

const chartConfig = {
  agendadas: { label: "Agendadas", color: "hsl(var(--primary))" },
  atendidas: { label: "Atendidas", color: "hsl(var(--accent))" },
  cierres: { label: "Cierres", color: "url(#cierreGradient)" },
  income: { label: "Ingresos", color: "hsl(var(--primary))" }
} satisfies ChartConfig;

const CustomBarLabel = (props: any) => {
  const { x, y, width, payload } = props;
  if (!payload) return null;
  if (payload.isPaga && payload.projectedPay > 0) {
    return (
      <g>
        <text x={x + width / 2} y={y - 25} fill="hsl(var(--primary))" textAnchor="middle" className="text-[9px] font-black">
          ${(payload.projectedPay / 1000).toFixed(1)}k
        </text>
        <text x={x + width / 2} y={y - 12} fill="hsl(var(--primary))" textAnchor="middle" className="text-[7px] font-bold uppercase opacity-60">
          PAGA
        </text>
      </g>
    );
  }
  if (payload.isCorte) {
    return (
      <text x={x + width / 2} y={y - 12} fill="hsl(var(--destructive))" textAnchor="middle" className="text-[7px] font-bold uppercase opacity-60">
        CORTE
      </text>
    );
  }
  return null;
};

const CustomXAxisTick = (props: any) => {
  const { x, y, payload, data } = props;
  const item = data[payload.index];
  if (!item) return null;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="middle" fill="currentColor" className="text-[9px] font-bold opacity-60 uppercase">
        {item.dayNumber}
      </text>
      <g transform="translate(0, 32)">
        <text x={0} y={0} textAnchor="middle" fill="currentColor" className="text-[10px] font-black">
          {item.dayInitial}
        </text>
        {item.isCorte && <circle cx={10} cy={-3} r={2.5} fill="#ef4444" />}
        {item.isPaga && <circle cx={10} cy={-3} r={2.5} fill="#1877f2" />}
      </g>
    </g>
  );
};

export default function AdvancedStats({ stats, isExpanded = false, onExpandedChange }: AdvancedStatsProps) {
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

  const FortnightMonitor = ({ data, title, icon: Icon, expanded = false }: { data: any, title: string, icon: any, expanded?: boolean }) => {
    const todayItem = data.find((d: any) => d.isToday);
    return (
      <div className="bg-muted/5 rounded-2xl p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl"><Icon className="w-4 h-4 text-primary" /></div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{title}</h4>
              <p className="text-[8px] font-medium text-muted-foreground/40 uppercase">Monitor de 15 días</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-destructive/40" /> <span className="text-[8px] font-bold uppercase opacity-60">Corte</span></div>
             <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-primary/40" /> <span className="text-[8px] font-bold uppercase opacity-60">Paga</span></div>
          </div>
        </div>
        <div className={cn("overflow-visible", expanded ? "h-[380px]" : "h-[220px]")}>
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart data={data} margin={{ top: 30, right: 10, left: 10, bottom: 40 }}>
              <defs>
                <linearGradient id="cierreGradient" x1="0" x1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00F5FF" />
                  <stop offset="33%" stopColor="#1877F2" />
                  <stop offset="66%" stopColor="#7B61FF" />
                  <stop offset="100%" stopColor="#FF00D6" />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.1} />
              <XAxis dataKey="dayNumber" tickLine={false} axisLine={false} interval={0} tick={<CustomXAxisTick data={data} />} />
              <YAxis hide domain={[0, stats.charts.globalMax + 3]} />
              <ChartTooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className={cn("bg-card/95 p-3 rounded-lg shadow-2xl border-none space-y-2 backdrop-blur-xl", d.isToday ? "shadow-[0_0_15px_rgba(24,119,242,0.3)]" : "")}>
                        <p className="text-[10px] font-black uppercase flex items-center justify-between gap-4">{d.dayFull} {d.isToday && <span className="text-primary">(HOY)</span>}</p>
                        <div className="space-y-1">
                          {payload.map((p: any, i: number) => (
                            <div key={i} className="flex items-center justify-between gap-6 text-[10px] font-bold">
                              <span className="opacity-60">{p.name}:</span>
                              <span style={{ color: p.color }}>{p.value}</span>
                            </div>
                          ))}
                          {(d.isPaga || d.isCorte) && (
                            <div className={cn("mt-2 pt-2 border-t border-border/10 text-[10px] font-black uppercase flex items-center gap-2", d.isPaga ? "text-primary" : "text-destructive")}>
                              {d.isPaga ? <Coins className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                              {d.isPaga ? `PAGA: ${formatCurrency(d.projectedPay)}` : "CORTE SEMANAL"}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {todayItem && <ReferenceArea x1={todayItem.dayNumber} x2={todayItem.dayNumber} fill="hsl(var(--primary))" fillOpacity={0.05} stroke="none" className="animate-periodic-glow" />}
              <Bar dataKey="agendadas" name="Agendadas" radius={[2, 2, 0, 0]}>
                {data.map((e: any, i: number) => <Cell key={i} fill={e.isToday ? "hsl(var(--primary))" : "var(--color-agendadas)"} opacity={0.8} />)}
                <LabelList dataKey="agendadas" content={<CustomBarLabel />} />
              </Bar>
              <Bar dataKey="atendidas" name="Atendidas" radius={[2, 2, 0, 0]}>
                {data.map((e: any, i: number) => <Cell key={i} fill={e.isToday ? "hsl(var(--accent))" : "var(--color-atendidas)"} opacity={0.8} />)}
              </Bar>
              <Bar dataKey="cierres" name="Cierres" radius={[2, 2, 0, 0]} fill="url(#cierreGradient)" />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    );
  };

  const PerformanceSection = () => (
    <div className="bg-primary/[0.03] p-6 rounded-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl"><Activity className="w-5 h-5 text-primary" /></div>
          <h3 className="text-xs font-bold uppercase text-primary/80 tracking-widest">Salud Operativa</h3>
        </div>
        <span className="text-2xl font-black text-primary">{Math.round(attendanceRate)}% <span className="text-[8px] uppercase">Asistencia</span></span>
      </div>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between text-[9px] uppercase font-bold text-muted-foreground">
            <span>Efectividad Cierre</span>
            <span className="text-primary">{Math.round(closingRate)}%</span>
          </div>
          <Progress value={closingRate} className="h-1.5 bg-primary/10" />
        </div>
      </div>
    </div>
  );

  const WeeklyHistoryChart = () => {
    const currentWeekData = stats.charts.weeklyIncomeHistory.find((d: any) => d.isCurrentWeek);
    return (
      <div className="bg-muted/5 rounded-2xl p-6 space-y-6">
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
            <LineChart data={stats.charts.weeklyIncomeHistory} margin={{ left: 10, right: 10, top: 20, bottom: 10 }}>
              <defs>
                <linearGradient id="historyLineGradient" x1="0" x1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00F5FF" />
                  <stop offset="50%" stopColor="#1877F2" />
                  <stop offset="100%" stopColor="#7B61FF" />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.1} />
              <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={10} className="text-[10px] font-bold text-muted-foreground/40" />
              <YAxis hide />
              <ChartTooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className={cn("bg-card/95 p-3 rounded-lg shadow-2xl border-none space-y-2 backdrop-blur-xl", data.isCurrentWeek ? "shadow-[0_0_20px_rgba(24,119,242,0.2)]" : "")}>
                        <p className={cn("text-[10px] font-black uppercase border-b border-border/10 pb-1 mb-1", data.isCurrentWeek ? "text-primary" : "opacity-60")}>Semana: {data.week}</p>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-foreground flex items-center justify-between gap-4"><span className="opacity-60 text-[9px] uppercase">Cobro:</span><span className="text-primary">{formatCurrency(data.income)}</span></p>
                          <p className="text-[10px] font-bold flex items-center justify-between gap-4"><span className="opacity-60 uppercase text-[8px]">Cierres:</span><span className="text-green-500">{data.cierres}</span></p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" dataKey="income" stroke="url(#historyLineGradient)" strokeWidth={3} 
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  if (payload.isCurrentWeek) return <circle key={`dot-${payload.week}`} cx={cx} cy={cy} r={6} fill="none" stroke="#1877F2" strokeWidth={3} />;
                  return <circle key={`dot-${payload.week}`} cx={cx} cy={cy} r={2} fill="#1877F2" fillOpacity={0.3} />;
                }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const ExecutiveRanking = () => (
    <div className="bg-muted/5 rounded-2xl p-6 h-full flex flex-col space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-yellow-500/10 rounded-xl"><Trophy className="w-5 h-5 text-yellow-500" /></div>
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-widest">Ranking del Mes</h4>
          <p className="text-[9px] text-muted-foreground/60 uppercase">Todos los usuarios registrados</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin pr-2">
        <div className="space-y-6">
          {stats.executiveRanking.map((exec: any, i: number) => {
            const maxSales = Math.max(...stats.executiveRanking.map((e: any) => e.sales)) || 1;
            return (
              <div key={i} className="flex flex-col gap-2.5 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-none shrink-0 transition-colors",
                      i === 0 ? "bg-yellow-500 text-yellow-950" : "bg-muted/40 text-muted-foreground"
                    )}>
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate group-hover:text-primary transition-colors">{exec.name}</p>
                      <p className="text-[9px] text-muted-foreground uppercase font-bold">{exec.sales} cierres • {formatCurrency(exec.amount)}</p>
                    </div>
                  </div>
                </div>
                <div className="h-1 w-full bg-muted/20 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full transition-all duration-700", i === 0 ? "bg-primary" : "bg-muted-foreground/30")} 
                    style={{ width: `${(exec.sales / maxSales) * 100}%` }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const PaydayTimeline = () => (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-primary/[0.03] p-4 rounded-2xl space-y-2 border-none">
        <div className="flex items-center gap-2 text-primary/60">
          <CalendarClock className="w-3.5 h-3.5" />
          <span className="text-[8px] font-black uppercase tracking-widest">Este Viernes</span>
        </div>
        <p className={cn("text-lg font-black tracking-tight", stats.thisFridayCommission > 0 ? "text-primary" : "opacity-20")}>
          {formatCurrency(stats.thisFridayCommission)}
        </p>
      </div>
      <div className="bg-muted/5 p-4 rounded-2xl space-y-2 border-none">
        <div className="flex items-center gap-2 text-muted-foreground/60">
          <CalendarClock className="w-3.5 h-3.5" />
          <span className="text-[8px] font-black uppercase tracking-widest">Siguiente</span>
        </div>
        <p className={cn("text-lg font-black tracking-tight", stats.nextFridayCommission > 0 ? "text-foreground" : "opacity-20")}>
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
          <FortnightMonitor data={stats.charts.fortnightActivity} title="Monitor Operativo" icon={CalendarDays} />
          <div className="hidden md:block"><PerformanceSection /></div>
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
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { icon: CalendarDays, color: 'text-primary', label: 'Citas Hoy', value: stats.todayCount || 0, val1: stats.todayConfirmed || 0, sub1: 'Conf.' },
                  { icon: TrendingUp, color: 'text-primary', label: 'Eficiencia', value: `${Math.round(closingRate)}%`, val1: 'Atendidas', sub1: 'Base' },
                  { icon: Users, color: 'text-accent', label: 'Prospectos', value: stats.currentMonthProspects || 0, growth: monthlyGrowth, val1: stats.lastMonthProspects || 0, sub1: 'Mes Ant.' },
                  { icon: Trophy, color: 'text-green-500', label: 'Cierres', value: stats.currentMonthOnlyCierre || 0, val1: stats.lastMonthSales || 0, sub1: 'Mes Ant.' },
                  { icon: Coins, color: 'text-yellow-600', label: 'Ingresos', value: formatCurrency(stats.currentMonthCommission || 0), growth: stats.commissionGrowth, val1: formatCurrency(stats.lastMonthCommission || 0), sub1: 'Mes Ant.', isGradient: true }
                ].map((s, i) => (
                  <div key={i} className={cn("bg-muted/5 p-5 rounded-2xl space-y-4 hover:bg-muted/10 transition-all cursor-default group animate-finanto-reveal opacity-0 shrink-0", i === 0 ? "delay-100" : i === 1 ? "delay-200" : i === 2 ? "delay-300" : i === 3 ? "delay-400" : i === 4 ? "delay-500" : "")}>
                    <div className="flex justify-between items-start">
                      <div className={cn("p-2 rounded-xl bg-muted/20 group-hover:bg-background/50 transition-colors", s.color)}><s.icon className="w-4 h-4" /></div>
                      {s.growth !== undefined && <span className={cn("text-[10px] font-bold flex items-center", s.growth >= 0 ? "text-green-500" : "text-destructive")}>{s.growth >= 0 ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>} {Math.abs(Math.round(s.growth))}%</span>}
                    </div>
                    <div><p className="text-[9px] uppercase font-black text-muted-foreground/60 tracking-widest">{s.label}</p><p className={cn("text-xl md:text-2xl font-black truncate", s.isGradient ? getDynamicGradient(stats.currentMonthCommission || 0) : "")}>{s.value}</p></div>
                    <div className="pt-3 border-t border-border/5 flex justify-between"><span className="text-[8px] font-bold text-muted-foreground uppercase">{s.sub1}</span><span className="text-xs font-bold opacity-60">{s.val1}</span></div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-stretch">
                <div className="xl:col-span-8 space-y-8">
                  <div className="animate-finanto-reveal opacity-0 delay-200"><WeeklyHistoryChart /></div>
                  <div className="animate-finanto-reveal opacity-0 delay-300"><FortnightMonitor data={stats.charts.fortnightActivity} title="Monitor Operativo de 15 Días" icon={CalendarDays} expanded /></div>
                  <div className="animate-finanto-reveal opacity-0 delay-400"><PaydayTimeline /></div>
                  
                  <div className="bg-muted/5 rounded-2xl p-8 grid grid-cols-1 md:grid-cols-4 gap-10 animate-finanto-reveal opacity-0 delay-500">
                    <div><span className="text-[10px] font-black uppercase block text-muted-foreground/60 mb-2 tracking-widest">Total Vendido</span><p className={cn("text-2xl font-black", getDynamicGradient(stats.currentMonthCommission || 0))}>{formatCurrency(stats.totalCreditSold || 0)}</p><span className="text-[8px] text-muted-foreground font-bold uppercase opacity-40">Cierres finales</span></div>
                    <div><span className="text-[10px] font-black uppercase block text-muted-foreground/60 mb-2 tracking-widest">Ingreso Neto</span><p className={cn("text-2xl font-black", getDynamicGradient(stats.currentMonthCommission || 0))}>{formatCurrency(stats.currentMonthCommission || 0)}</p><div className="flex items-center gap-1 opacity-40"><span className="text-[8px] font-bold uppercase">Anterior:</span><span className="text-[8px] font-black">{formatCurrency(stats.lastMonthCommission || 0)}</span></div></div>
                    <div className="hidden md:block"><span className="text-[10px] font-black uppercase block text-muted-foreground/60 mb-2 tracking-widest">Participación</span><p className="text-2xl font-black">{stats.avgParticipation || 0}%</p><span className="text-[8px] text-muted-foreground font-bold uppercase opacity-40">Promedio por cierre</span></div>
                    <div><span className="text-[10px] font-black uppercase block text-muted-foreground/60 mb-2 tracking-widest">Retención</span><p className="text-2xl font-black text-destructive/60">{formatCurrency(taxImpact || 0)}</p><span className="text-[8px] text-destructive/40 font-bold uppercase">9% ISR Estimado</span></div>
                  </div>
                </div>

                <div className="xl:col-span-4 flex flex-col gap-8">
                  <div className="flex-1 min-h-[500px] animate-finanto-reveal opacity-0 delay-100">
                    <ExecutiveRanking />
                  </div>
                  <div className="bg-yellow-500/[0.03] p-6 rounded-2xl space-y-4 animate-finanto-reveal opacity-0 delay-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-500/10 rounded-xl"><Lightbulb className="w-5 h-5 text-yellow-600" /></div>
                      <span className="text-[10px] font-black uppercase text-yellow-700 tracking-widest">Insights</span>
                    </div>
                    <div className="space-y-4">
                      {closingRate > 30 ? <p className="text-xs font-medium leading-relaxed opacity-80">Tu tasa de cierre es <strong>excepcional</strong>. Mantén el ritmo de prospección.</p> : <p className="text-xs font-medium leading-relaxed opacity-80">Tu tasa de cierre puede mejorar. Revisa tus simulaciones post-cita.</p>}
                      <div className="pt-3 border-t border-yellow-500/10 flex items-center justify-between"><span className="text-[9px] font-bold uppercase opacity-40">Ticket Promedio:</span><span className="text-[10px] font-black">{formatCurrency(stats.totalCreditSold / (stats.currentMonthOnlyCierre || 1))}</span></div>
                    </div>
                  </div>
                  <div className="bg-primary/[0.03] p-6 rounded-2xl space-y-4 animate-finanto-reveal opacity-0 delay-400">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl"><AlertCircle className="w-5 h-5 text-primary" /></div>
                      <span className="text-[10px] font-black uppercase text-primary tracking-widest">Ciclo Operativo</span>
                    </div>
                    <p className="text-xs font-medium leading-relaxed italic border-l-2 border-primary/20 pl-4 opacity-80">"Cierre de ciclo cada martes. Liquidación el viernes de la semana entrante."</p>
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

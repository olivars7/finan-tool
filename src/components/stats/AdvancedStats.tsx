
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
      <Card className="border-border/40 bg-card/30 backdrop-blur-md overflow-visible relative">
        <CardHeader className="p-4 pb-2 border-b border-border/10 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-primary" />
            <div className="flex flex-col">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{title}</CardTitle>
              <span className="text-[8px] font-medium text-muted-foreground/40 uppercase">Monitor de 15 días</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-destructive/40" /> <span className="text-[8px] font-bold uppercase opacity-60">Corte</span></div>
             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary/40" /> <span className="text-[8px] font-bold uppercase opacity-60">Paga</span></div>
          </div>
        </CardHeader>
        <CardContent className={cn("p-4 overflow-visible", expanded ? "h-[380px]" : "h-[250px]")}>
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
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="dayNumber" tickLine={false} axisLine={false} interval={0} tick={<CustomXAxisTick data={data} />} />
              <YAxis hide domain={[0, stats.charts.globalMax + 3]} />
              <ChartTooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className={cn("bg-card/95 p-3 rounded-lg shadow-2xl border-2 space-y-2 backdrop-blur-xl", d.isToday ? "border-primary shadow-[0_0_15px_rgba(24,119,242,0.3)]" : "border-border/50")}>
                        <p className="text-[10px] font-black uppercase flex items-center justify-between gap-4">{d.dayFull} {d.isToday && <span className="text-primary">(HOY)</span>}</p>
                        <div className="space-y-1">
                          {payload.map((p: any, i: number) => (
                            <div key={i} className="flex items-center justify-between gap-6 text-[10px] font-bold">
                              <span className="opacity-60">{p.name}:</span>
                              <span style={{ color: p.color }}>{p.value}</span>
                            </div>
                          ))}
                          {(d.isPaga || d.isCorte) && (
                            <div className={cn("mt-2 pt-2 border-t border-border/20 text-[10px] font-black uppercase flex items-center gap-2", d.isPaga ? "text-primary" : "text-destructive")}>
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
              {todayItem && <ReferenceArea x1={todayItem.dayNumber} x2={todayItem.dayNumber} fill="hsl(var(--primary))" fillOpacity={0.1} stroke="hsl(var(--primary) / 0.4)" strokeWidth={2} className="animate-periodic-glow" />}
              <Bar dataKey="agendadas" name="Agendadas" radius={[2, 2, 0, 0]}>
                {data.map((e: any, i: number) => <Cell key={i} fill={e.isToday ? "hsl(var(--primary))" : "var(--color-agendadas)"} />)}
                <LabelList dataKey="agendadas" content={<CustomBarLabel />} />
              </Bar>
              <Bar dataKey="atendidas" name="Atendidas" radius={[2, 2, 0, 0]}>
                {data.map((e: any, i: number) => <Cell key={i} fill={e.isToday ? "hsl(var(--accent))" : "var(--color-atendidas)"} />)}
              </Bar>
              <Bar dataKey="cierres" name="Cierres" radius={[2, 2, 0, 0]} fill="url(#cierreGradient)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  };

  const PerformanceSection = () => (
    <Card className="border-primary/20 bg-primary/5 overflow-hidden">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="text-xs font-bold uppercase text-primary/80">Salud Operativa</h3>
          </div>
          <span className="text-2xl font-black text-primary">{Math.round(attendanceRate)}% <span className="text-[8px] uppercase">Asistencia</span></span>
        </div>
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] uppercase font-bold text-muted-foreground">
              <span>Efectividad Cierre</span>
              <span className="text-primary">{Math.round(closingRate)}%</span>
            </div>
            <Progress value={closingRate} className="h-1.5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const WeeklyHistoryChart = () => {
    const currentWeekData = stats.charts.weeklyIncomeHistory.find((d: any) => d.isCurrentWeek);
    return (
      <Card className="border-border/40 bg-card/30 backdrop-blur-md overflow-hidden">
        <CardHeader className="p-6 pb-2 border-b border-border/10 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <LineIcon className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-[11px] font-bold uppercase tracking-widest">Flujo de Cobro Semanal</CardTitle>
              <CardDescription className="text-[9px]">Ingreso neto por semana de pago</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.charts.weeklyIncomeHistory} margin={{ left: 10, right: 10, top: 20, bottom: 10 }}>
              <defs>
                <linearGradient id="historyLineGradient" x1="0" x1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00F5FF" />
                  <stop offset="50%" stopColor="#1877F2" />
                  <stop offset="100%" stopColor="#7B61FF" />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
              <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={10} className="text-[10px] font-bold text-muted-foreground/60" />
              <YAxis hide />
              {currentWeekData && (
                <>
                  <ReferenceArea x1={currentWeekData.week} x2={currentWeekData.week} fill="hsl(var(--muted-foreground))" fillOpacity={0.15} />
                  <ReferenceLine x={currentWeekData.week} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeWidth={1} opacity={0.5} />
                </>
              )}
              <ChartTooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className={cn("bg-card/95 p-3 rounded-lg shadow-2xl backdrop-blur-xl space-y-2 border-2", data.isCurrentWeek ? "border-primary border-[2px] shadow-[0_0_20px_rgba(24,119,242,0.4)] scale-105 transition-transform" : "border-border/50")}>
                        <p className={cn("text-[10px] font-black uppercase border-b border-border/20 pb-1 mb-1", data.isCurrentWeek ? "text-primary" : "opacity-60")}>Semana: {data.week}</p>
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
                type="linear" dataKey="income" stroke="url(#historyLineGradient)" strokeWidth={3} 
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  if (payload.isCurrentWeek) return <circle key={`dot-${payload.week}`} cx={cx} cy={cy} r={7} fill="none" stroke="#1877F2" strokeWidth={3} />;
                  return <circle key={`dot-${payload.week}`} cx={cx} cy={cy} r={2} fill="#1877F2" fillOpacity={0.5} />;
                }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const ExecutiveRanking = () => (
    <Card className="border-border/40 bg-card/30 backdrop-blur-md overflow-hidden h-full flex flex-col">
      <CardHeader className="p-6 pb-2 border-b border-border/10 shrink-0">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <div>
            <CardTitle className="text-[11px] font-bold uppercase tracking-widest">Ranking del Mes</CardTitle>
            <CardDescription className="text-[9px]">Líderes de cierre reales</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 flex-1 overflow-y-auto scrollbar-thin">
        <div className="space-y-6">
          {stats.executiveRanking && stats.executiveRanking.length > 0 ? (
            stats.executiveRanking.map((exec: any, i: number) => {
              const maxSales = stats.executiveRanking[0].sales;
              return (
                <div key={i} className="flex flex-col gap-2 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border shrink-0",
                        i === 0 ? "bg-yellow-500/20 text-yellow-600 border-yellow-500/30" : "bg-muted text-muted-foreground border-border"
                      )}>
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold group-hover:text-primary transition-colors truncate">{exec.name}</p>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold">{exec.sales} cierres • {formatCurrency(exec.amount)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500" 
                      style={{ width: `${(exec.sales / maxSales) * 100}%` }} 
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground opacity-40 italic">
              <Users className="w-8 h-8 mb-2" />
              <p className="text-[10px] uppercase font-bold">Sin cierres registrados</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const PaydayTimeline = () => (
    <Card className="border-border/40 bg-card/30 backdrop-blur-md overflow-hidden">
      <CardHeader className="p-4 pb-2 border-b border-border/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-primary" />
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest">Liquidaciones</CardTitle>
        </div>
        <span className="text-[8px] font-black uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">Próximos Viernes</span>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-background/40 border border-border/20 space-y-1">
            <span className="text-[8px] font-black uppercase text-muted-foreground">Este Viernes</span>
            <p className={cn("text-sm font-black", stats.thisFridayCommission > 0 ? "text-primary" : "opacity-40")}>
              {formatCurrency(stats.thisFridayCommission)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-background/40 border border-border/20 space-y-1">
            <span className="text-[8px] font-black uppercase text-muted-foreground">Siguiente</span>
            <p className={cn("text-sm font-black", stats.nextFridayCommission > 0 ? "text-accent" : "opacity-40")}>
              {formatCurrency(stats.nextFridayCommission)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Card className="shadow-lg bg-card border-border overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-border/50 py-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="text-primary w-5 h-5" />
            <CardTitle className="text-lg font-semibold">Stats</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onExpandedChange(true)} className="h-8 w-8 text-muted-foreground/60 hover:text-primary">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <FortnightMonitor data={stats.charts.fortnightActivity} title="Monitor 15 Días" icon={CalendarDays} />
          <div className="hidden md:block"><PerformanceSection /></div>
        </CardContent>
      </Card>

      <Dialog open={isExpanded} onOpenChange={onExpandedChange}>
        <DialogContent data-calculator-dialog="true" className="max-w-none w-screen h-screen m-0 rounded-none bg-background border-none p-0 flex flex-col overflow-hidden">
          <DialogTitle className="sr-only">Inteligencia Finanto</DialogTitle>
          <DialogHeader className="px-6 py-4 border-b border-border/40 flex flex-row items-center justify-between bg-card/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-xl border border-primary/30"><BarChart3 className="text-primary w-6 h-6" /></div>
              <div><h3 className="text-xl font-bold">Inteligencia de Negocio</h3><DialogDescription className="text-xs">Monitor operativo y ranking de ejecutivos.</DialogDescription></div>
            </div>
            <DialogClose asChild><Button variant="ghost" size="icon" className="rounded-full hover:bg-destructive/10 h-10 w-10"><X className="w-5 h-5" /></Button></DialogClose>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto scrollbar-thin bg-muted/5">
            <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8 pb-24">
              <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-thin md:grid md:grid-cols-5 md:pb-0">
                {[
                  { icon: CalendarDays, color: 'text-primary', label: 'Citas Hoy', value: stats.todayCount || 0, val1: stats.todayConfirmed || 0, sub1: 'Conf.' },
                  { icon: TrendingUp, color: 'text-primary', label: 'Eficiencia', value: `${Math.round(closingRate)}%`, val1: 'Atendidas', sub1: 'Base' },
                  { icon: Users, color: 'text-accent', label: 'Prospectos', value: stats.currentMonthProspects || 0, growth: monthlyGrowth, val1: stats.lastMonthProspects || 0, sub1: 'Mes Ant.' },
                  { icon: Trophy, color: 'text-green-500', label: 'Cierres', value: stats.currentMonthOnlyCierre || 0, val1: stats.lastMonthSales || 0, sub1: 'Mes Ant.' },
                  { icon: Coins, color: 'text-yellow-600', label: 'Ingresos', value: formatCurrency(stats.currentMonthCommission || 0), growth: stats.commissionGrowth, val1: formatCurrency(stats.lastMonthCommission || 0), sub1: 'Mes Ant.', isGradient: true }
                ].map((s, i) => (
                  <Card key={i} className={cn("min-w-[160px] md:min-w-0 bg-card/40 border-primary/20 p-4 space-y-3 hover:bg-primary/10 transition-all duration-300 cursor-default group animate-finanto-reveal opacity-0 shrink-0", i === 0 ? "delay-100" : i === 1 ? "delay-200" : i === 2 ? "delay-300" : i === 3 ? "delay-400" : i === 4 ? "delay-500" : "")}>
                    <div className="flex justify-between items-start">
                      <div className={cn("p-2 rounded-lg bg-muted/20 group-hover:bg-background/50 transition-colors", s.color)}><s.icon className="w-4 h-4" /></div>
                      {s.growth !== undefined && <span className={cn("text-[10px] font-bold flex items-center", s.growth >= 0 ? "text-green-500" : "text-destructive")}>{s.growth >= 0 ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>} {Math.abs(Math.round(s.growth))}%</span>}
                    </div>
                    <div><p className="text-[9px] uppercase font-bold text-muted-foreground">{s.label}</p><p className={cn("text-lg md:text-2xl font-black truncate", s.isGradient ? getDynamicGradient(stats.currentMonthCommission || 0) : "")}>{s.value}</p></div>
                    <div className="pt-2 border-t border-border/10 flex justify-between"><span className="text-[8px] font-bold text-muted-foreground uppercase">{s.sub1}</span><span className="text-xs font-bold">{s.val1}</span></div>
                  </Card>
                ))}
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
                <div className="xl:col-span-8 space-y-6">
                  <div className="animate-finanto-reveal opacity-0 delay-200"><WeeklyHistoryChart /></div>
                  <div className="animate-finanto-reveal opacity-0 delay-300"><FortnightMonitor data={stats.charts.fortnightActivity} title="Monitor Operativo de 15 Días" icon={CalendarDays} expanded /></div>
                  <div className="animate-finanto-reveal opacity-0 delay-400"><PaydayTimeline /></div>
                  <Card className="bg-card border-border/40 overflow-hidden animate-finanto-reveal opacity-0 delay-500">
                    <CardHeader className="bg-muted/30 p-4 border-b text-xs font-bold uppercase flex items-center justify-between">
                      <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-500" /> Rendimiento Financiero del Mes</div>
                      <span className="text-[9px] text-muted-foreground font-medium">Actualizado en tiempo real</span>
                    </CardHeader>
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-4 gap-8">
                      <div><span className="text-[10px] font-bold uppercase block text-muted-foreground mb-1">Total Vendido</span><p className={cn("text-2xl font-black", getDynamicGradient(stats.currentMonthCommission || 0))}>{formatCurrency(stats.totalCreditSold || 0)}</p><span className="text-[8px] text-muted-foreground font-bold uppercase">Solo cierres finales</span></div>
                      <div><span className="text-[10px] font-bold uppercase block text-muted-foreground mb-1">Ingreso Proyectado</span><p className={cn("text-2xl font-black", getDynamicGradient(stats.currentMonthCommission || 0))}>{formatCurrency(stats.currentMonthCommission || 0)}</p><div className="flex items-center gap-1"><span className="text-[8px] text-muted-foreground font-bold uppercase">Mes Anterior:</span><span className="text-[8px] font-black text-primary">{formatCurrency(stats.lastMonthCommission || 0)}</span></div></div>
                      <div className="hidden md:block"><span className="text-[10px] font-bold uppercase block text-muted-foreground mb-1">Participación Promedio</span><p className="text-2xl font-black text-foreground">{stats.avgParticipation || 0}%</p><span className="text-[8px] text-muted-foreground font-bold uppercase">Por cada cierre</span></div>
                      <div><span className="text-[10px] font-bold uppercase block text-muted-foreground mb-1">Retención Fiscal</span><p className="text-2xl font-black text-destructive">{formatCurrency(taxImpact || 0)}</p><span className="text-[8px] text-destructive/60 font-bold uppercase">9% ISR Estimado</span></div>
                    </CardContent>
                  </Card>
                </div>
                <div className="xl:col-span-4 space-y-6 h-full flex flex-col">
                  <div className="flex-1 min-h-[400px] animate-finanto-reveal opacity-0 delay-100">
                    <ExecutiveRanking />
                  </div>
                  <Card className="border-yellow-500/20 bg-yellow-500/5 p-6 space-y-4 animate-finanto-reveal opacity-0 delay-200">
                    <div className="flex items-center gap-2"><Lightbulb className="w-5 h-5 text-yellow-600" /><span className="text-[10px] font-bold uppercase text-yellow-700 tracking-widest">Insights del Mes</span></div>
                    <div className="space-y-4">
                      {closingRate > 30 ? <p className="text-xs font-medium leading-relaxed text-yellow-900/80">Tu tasa de cierre es <strong>excepcional</strong>. Sigue con el seguimiento activo.</p> : <p className="text-xs font-medium leading-relaxed text-yellow-900/80">Tu tasa de cierre puede mejorar. Refuerza el seguimiento post-cotización.</p>}
                      <div className="pt-2 border-t border-yellow-500/10 flex items-center justify-between"><span className="text-[9px] font-bold uppercase opacity-60">Ticket Promedio:</span><span className="text-[10px] font-black">{formatCurrency(stats.totalCreditSold / (stats.currentMonthOnlyCierre || 1))}</span></div>
                    </div>
                  </Card>
                  <Card className="border-accent/20 bg-accent/5 p-6 space-y-4 animate-finanto-reveal opacity-0 delay-400">
                    <div className="flex items-center gap-2"><AlertCircle className="w-5 h-5 text-accent" /><span className="text-[10px] font-bold uppercase text-accent/80 tracking-widest">Información de Ciclos</span></div>
                    <div className="space-y-3">
                      <p className="text-xs font-bold leading-relaxed text-foreground/90 italic border-l-2 border-accent/30 pl-4">"El cierre de ciclo operativo es cada martes. Los pagos se liquidan el viernes de la semana entrante."</p>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

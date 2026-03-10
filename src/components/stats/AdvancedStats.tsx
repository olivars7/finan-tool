/**
 * @fileOverview Panel de Inteligencia Avanzada - Finanto
 */

"use client"

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, BarChart3, Maximize2, X, Activity, CalendarDays, Trophy, Users, History, Coins, ArrowUpRight, ArrowDownRight, Zap, Target, Receipt, Percent, Info, LineChart as LineIcon
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell, LabelList, ReferenceArea, ReferenceLine, Line, LineChart, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
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

const ZeroLabel = (props: any) => {
  const { x, y, width, value } = props;
  if (value > 0) return null;
  return <text x={x + width / 2} y={y - 5} fill="currentColor" textAnchor="middle" className="text-[8px] font-bold opacity-30">×</text>;
};

export default function AdvancedStats({ stats, isExpanded = false, onExpandedChange }: AdvancedStatsProps) {
  const totalMonth = stats.currentMonthProspects || 0;
  const attendanceRate = totalMonth > 0 ? Math.min(95, 75 + (stats.todayConfirmed / (stats.todayCount || 1) * 10)) : 0;
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

  const getAdvice = () => {
    if (stats.conversionRate > 20) return "Vas muy bien con los cierres. Hay que seguir enfocados en los prospectos que sí están perfilados.";
    if (stats.conversionRate < 8) return "Andamos algo bajos en cierres. Habría que checar si estamos perfilando bien desde la primera llamada.";
    return "Vas a un ritmo constante. Lo ideal es no soltar el seguimiento de los clientes que ya atendiste esta semana.";
  };

  const WeeklyChart = ({ data, title, icon: Icon, opacity = 1 }: { data: any, title: string, icon: any, opacity?: number }) => {
    const todayItem = data.find((d: any) => d.isToday);
    
    return (
      <Card 
        className={cn(
          "border-border/40 bg-card/30 backdrop-blur-md overflow-visible",
          opacity < 1 && "opacity-75"
        )}
      >
        <CardHeader className="p-4 pb-2 border-b border-border/10 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-primary" />
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 h-[200px] overflow-visible">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart data={data}>
              <defs>
                <linearGradient id="cierreGradient" x1="0" x1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00F5FF" />
                  <stop offset="33%" stopColor="#1877F2" />
                  <stop offset="66%" stopColor="#7B61FF" />
                  <stop offset="100%" stopColor="#FF00D6" />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="day" tickLine={false} tickMargin={10} axisLine={false} className="text-[10px] font-bold uppercase text-muted-foreground/60" />
              <YAxis hide domain={[0, stats.charts.globalMax + 1]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              
              {todayItem && (
                <ReferenceArea 
                  x1={todayItem.day} 
                  x2={todayItem.day} 
                  fill="hsl(var(--primary))" 
                  fillOpacity={0.08} 
                  stroke="hsl(var(--primary) / 0.3)"
                  strokeWidth={1}
                />
              )}

              <Bar dataKey="agendadas" name="Agendadas" radius={[2, 2, 0, 0]}>
                {data.map((e: any, i: number) => <Cell key={i} fill={e.isToday ? "hsl(var(--primary))" : "var(--color-agendadas)"} className={e.isToday ? "stroke-primary stroke-2" : ""} />)}
                <LabelList dataKey="agendadas" content={<ZeroLabel />} />
              </Bar>
              <Bar dataKey="atendidas" name="Atendidas" radius={[2, 2, 0, 0]}>
                {data.map((e: any, i: number) => <Cell key={i} fill={e.isToday ? "hsl(var(--accent))" : "var(--color-atendidas)"} />)}
                <LabelList dataKey="atendidas" content={<ZeroLabel />} />
              </Bar>
              <Bar dataKey="cierres" name="Cierres" radius={[2, 2, 0, 0]} fill="url(#cierreGradient)">
                <LabelList dataKey="cierres" content={<ZeroLabel />} />
              </Bar>
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
              <CardTitle className="text-[11px] font-bold uppercase tracking-widest">Flujo de Cobro Semanal (Proyectado)</CardTitle>
              <CardDescription className="text-[9px]">Ingreso liquidado por semana de pago (4m atrás - 3s futuro)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 h-[300px]">
          <ChartContainer config={chartConfig} className="h-full w-full">
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
                  <ReferenceArea 
                    x1={currentWeekData.week} 
                    x2={currentWeekData.week} 
                    fill="hsl(var(--muted-foreground))" 
                    fillOpacity={0.15} 
                  />
                  <ReferenceLine 
                    x={currentWeekData.week} 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeDasharray="3 3"
                    strokeWidth={1}
                    opacity={0.5}
                  />
                </>
              )}

              <ChartTooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className={cn(
                        "bg-card/95 p-3 rounded-lg shadow-2xl backdrop-blur-xl space-y-2 border-2",
                        data.isCurrentWeek 
                          ? "border-primary border-[2px] shadow-[0_0_20px_rgba(24,119,242,0.4)] scale-105 transition-transform" 
                          : "border-border/50"
                      )}>
                        <p className={cn(
                          "text-[10px] font-black uppercase border-b border-border/20 pb-1 mb-1",
                          data.isCurrentWeek ? "text-primary" : "opacity-60"
                        )}>
                          Semana: {data.week} {data.isCurrentWeek ? "(Actual)" : ""}
                        </p>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-foreground flex items-center justify-between gap-4">
                            <span className="opacity-60 text-[9px] uppercase">Cobro Semanal:</span>
                            <span className="text-primary">{formatCurrency(data.income)}</span>
                          </p>
                          <p className="text-[10px] font-bold flex items-center justify-between gap-4">
                            <span className="opacity-60 uppercase text-[8px]">Citas Atendidas:</span>
                            <span className="text-accent">{data.atendidas}</span>
                          </p>
                          <p className="text-[10px] font-bold flex items-center justify-between gap-4">
                            <span className="opacity-60 uppercase text-[8px]">Ventas Cerradas:</span>
                            <span className="text-green-500">{data.cierres}</span>
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="linear" 
                dataKey="income" 
                stroke="url(#historyLineGradient)" 
                strokeWidth={3} 
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  if (payload.isCurrentWeek) {
                    return (
                      <circle 
                        key={`dot-${payload.week}`} 
                        cx={cx} 
                        cy={cy} 
                        r={7} 
                        fill="none" 
                        stroke="#1877F2"
                        strokeWidth={3}
                      />
                    );
                  }
                  return <circle key={`dot-${payload.week}`} cx={cx} cy={cy} r={2} fill="#1877F2" fillOpacity={0.5} />;
                }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  };

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
          <WeeklyChart data={stats.charts.dailyActivity} title="Ciclo Actual" icon={CalendarDays} />
          <PerformanceSection />
        </CardContent>
      </Card>

      <Dialog open={isExpanded} onOpenChange={onExpandedChange}>
        <DialogContent data-calculator-dialog="true" className="max-w-none w-screen h-screen m-0 rounded-none bg-background border-none p-0 flex flex-col overflow-hidden">
          <DialogTitle className="sr-only">Inteligencia Finanto</DialogTitle>
          
          <DialogHeader className="px-6 py-4 border-b border-border/40 flex flex-row items-center justify-between bg-card/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-xl border border-primary/30">
                <BarChart3 className="text-primary w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Inteligencia Avanzada</h3>
                <DialogDescription className="text-xs">Análisis financiero operativo y perfilamiento de éxito.</DialogDescription>
              </div>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-destructive/10 h-10 w-10">
                <X className="w-5 h-5" />
              </Button>
            </DialogClose>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto scrollbar-thin bg-muted/5">
            <div className="max-w-[1400px] mx-auto p-8 space-y-8 pb-24">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                  { icon: CalendarDays, color: 'text-primary', label: 'Citas Hoy', value: stats.todayCount || 0, val1: stats.todayConfirmed || 0, sub1: 'Conf.' },
                  { icon: TrendingUp, color: 'text-primary', label: 'Eficiencia', value: `${Math.round(closingRate)}%`, val1: 'Atendidas', sub1: 'Base' },
                  { icon: Users, color: 'text-accent', label: 'Prospectos', value: stats.currentMonthProspects || 0, growth: monthlyGrowth, val1: stats.lastMonthProspects || 0, sub1: 'Mes Ant.' },
                  { icon: Trophy, color: 'text-green-500', label: 'Cierres', value: stats.currentMonthOnlyCierre || 0, val1: stats.lastMonthSales || 0, sub1: 'Mes Ant.' },
                  { icon: Coins, color: 'text-yellow-600', label: 'Ingresos', value: formatCurrency(stats.currentMonthCommission || 0), growth: stats.commissionGrowth, val1: formatCurrency(stats.lastMonthCommission || 0), sub1: 'Mes Ant.', isGradient: true }
                ].map((s, i) => (
                  <Card key={i} className={cn(
                    "bg-card/40 border-primary/20 p-4 space-y-3 hover:bg-primary/10 transition-all duration-300 cursor-default group animate-finanto-reveal opacity-0",
                    i === 0 ? "delay-100" : i === 1 ? "delay-200" : i === 2 ? "delay-300" : i === 3 ? "delay-400" : "delay-500"
                  )}>
                    <div className="flex justify-between items-start">
                      <div className={cn("p-2 rounded-lg bg-muted/20 group-hover:bg-background/50 transition-colors", s.color)}>
                        <s.icon className="w-4 h-4" />
                      </div>
                      {s.growth !== undefined && (
                        <span className={cn("text-[10px] font-bold flex items-center", s.growth >= 0 ? "text-green-500" : "text-destructive")}>
                          {s.growth >= 0 ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>} {Math.abs(Math.round(s.growth))}%
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">{s.label}</p>
                      <p className={cn(
                        "text-2xl font-black truncate",
                        s.isGradient ? getDynamicGradient(stats.currentMonthCommission || 0) : ""
                      )}>{s.value}</p>
                    </div>
                    <div className="pt-2 border-t border-border/10 flex justify-between">
                      <span className="text-[8px] font-bold text-muted-foreground uppercase">{s.sub1}</span>
                      <span className="text-xs font-bold">{s.val1}</span>
                    </div>
                  </Card>
                ))}
              </div>
              
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                <div className="xl:col-span-8 space-y-6">
                  <div className="animate-finanto-reveal opacity-0 delay-200">
                    <WeeklyHistoryChart />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="animate-finanto-reveal opacity-0 delay-300">
                      <WeeklyChart data={stats.charts.dailyActivity} title="Ciclo Actual (Operativo)" icon={CalendarDays} />
                    </div>
                    <div className="animate-finanto-reveal opacity-0 delay-400">
                      <WeeklyChart data={stats.charts.lastWeekActivity} title="Ciclo Anterior (Histórico)" icon={History} opacity={0.65} />
                    </div>
                  </div>
                  
                  <Card className="bg-card border-border/40 overflow-hidden animate-finanto-reveal opacity-0 delay-500">
                    <CardHeader className="bg-muted/30 p-4 border-b text-xs font-bold uppercase flex items-center justify-between">
                      <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-500" /> Rendimiento Financiero del Mes</div>
                      <span className="text-[9px] text-muted-foreground font-medium">Actualizado en tiempo real</span>
                    </CardHeader>
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-4 gap-8">
                      <div>
                        <span className="text-[10px] font-bold uppercase block text-muted-foreground mb-1">Total Vendido</span>
                        <p className={cn(
                          "text-2xl font-black",
                          getDynamicGradient(stats.currentMonthCommission || 0)
                        )}>{formatCurrency(stats.totalCreditSold || 0)}</p>
                        <span className="text-[8px] text-muted-foreground font-bold uppercase">Solo cierres finales</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase block text-muted-foreground mb-1">Ingreso Proyectado</span>
                        <p className={cn(
                          "text-2xl font-black",
                          getDynamicGradient(stats.currentMonthCommission || 0)
                        )}>{formatCurrency(stats.currentMonthCommission || 0)}</p>
                        <div className="flex items-center gap-1">
                          <span className="text-[8px] text-muted-foreground font-bold uppercase">Mes Anterior (Total):</span>
                          <span className="text-[8px] font-black text-primary">{formatCurrency(stats.lastMonthCommission || 0)}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase block text-muted-foreground mb-1">Participación Promedio</span>
                        <p className="text-2xl font-black text-foreground">{stats.avgParticipation || 0}%</p>
                        <span className="text-[8px] text-muted-foreground font-bold uppercase">Por cada cierre</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase block text-muted-foreground mb-1">Retención Fiscal</span>
                        <p className="text-2xl font-black text-destructive">{formatCurrency(taxImpact || 0)}</p>
                        <span className="text-[8px] text-destructive/60 font-bold uppercase">9% ISR Estimado</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="xl:col-span-4 space-y-6">
                  <div className="animate-finanto-reveal opacity-0 delay-300">
                    <PerformanceSection />
                  </div>
                  <Card className="border-accent/20 bg-accent/5 p-6 space-y-4 animate-finanto-reveal opacity-0 delay-400">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-accent" />
                      <span className="text-[10px] font-bold uppercase text-accent/80 tracking-widest">Observación</span>
                    </div>
                    <p className="text-sm font-bold border-l-2 border-accent/30 pl-4 leading-relaxed text-foreground/90 italic">{getAdvice()}</p>
                  </Card>

                  <Card className="border-primary/20 bg-primary/5 p-6 overflow-hidden relative animate-finanto-reveal opacity-0 delay-500">
                    <div className="absolute top-0 right-0 opacity-10 p-4">
                      <Activity className="w-24 h-24 rotate-12" />
                    </div>
                    <div className="space-y-4 relative z-10">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        <span className="text-[10px] font-bold uppercase text-primary/80 tracking-widest">Flujo de Prospectos</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-background/40 rounded-xl border border-primary/10">
                          <span className="text-[9px] font-bold uppercase text-muted-foreground block mb-1">Este Mes</span>
                          <span className="text-xl font-black">{stats.currentMonthProspects || 0}</span>
                        </div>
                        <div className="p-3 bg-background/40 rounded-xl border border-primary/10">
                          <span className="text-[9px] font-bold uppercase text-muted-foreground block mb-1">Mes Pasado</span>
                          <span className="text-xl font-black text-muted-foreground/60">{stats.lastMonthProspects || 0}</span>
                        </div>
                      </div>
                      <div className="space-y-1 pt-2">
                        <div className="flex justify-between text-[8px] font-bold uppercase"><span>Crecimiento de Embudo</span><span>{Math.abs(Math.round(monthlyGrowth))}%</span></div>
                        <Progress value={Math.min(100, Math.abs(monthlyGrowth))} className={cn("h-1", monthlyGrowth >= 0 ? "bg-green-500/20" : "bg-destructive/20")} />
                      </div>
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

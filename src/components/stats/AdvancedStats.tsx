"use client"

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, BarChart3, Maximize2, X, Activity, CalendarDays, Trophy, Users, History, Coins, ArrowUpRight, ArrowDownRight, Zap
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell, LabelList } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface AdvancedStatsProps {
  stats: any;
  isExpanded?: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

const chartConfig = {
  agendadas: { label: "Agendadas", color: "hsl(var(--primary))" },
  atendidas: { label: "Atendidas", color: "hsl(var(--accent))" },
  cierres: { label: "Cierres", color: "url(#cierreGradient)" },
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
  const taxImpact = stats.currentMonthCommission / 0.91 * 0.09;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(Math.round(val));
  };

  const getAdvice = () => {
    if (stats.conversionRate > 20) return "Tu tasa de cierre es excepcional. Enfócate en captar perfiles de crédito más alto.";
    if (stats.conversionRate < 8) return "Conversión baja. Revisa la calificación de prospectos antes de agendar.";
    return "Ritmo operativo estable. Mantén el registro de notas detalladas.";
  };

  const WeeklyChart = ({ data, title, icon: Icon, opacity = 1 }: { data: any, title: string, icon: any, opacity?: number }) => (
    <Card 
      className={cn(
        "border-border/40 bg-card/30 backdrop-blur-md overflow-visible",
        opacity < 1 && "opacity-75"
      )}
    >
      <CardHeader className="p-4 pb-2 border-b border-border/10 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2"><Icon className="w-4 h-4 text-primary" /><CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{title}</CardTitle></div>
      </CardHeader>
      <CardContent className="p-4 h-[200px] overflow-visible">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart data={data}>
            <defs><linearGradient id="cierreGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00F5FF" /><stop offset="33%" stopColor="#1877F2" /><stop offset="66%" stopColor="#7B61FF" /><stop offset="100%" stopColor="#FF00D6" /></linearGradient></defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="day" tickLine={false} tickMargin={10} axisLine={false} className="text-[10px] font-bold uppercase text-muted-foreground/60" />
            <YAxis hide domain={[0, stats.charts.globalMax + 1]} />
            <ChartTooltip content={<ChartTooltipContent />} />
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

  const PerformanceSection = () => (
    <Card className="border-primary/20 bg-primary/5 overflow-hidden">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Activity className="w-5 h-5 text-primary" /><h3 className="text-xs font-bold uppercase text-primary/80">Salud Operativa</h3></div>
          <span className="text-2xl font-black text-primary">{Math.round(attendanceRate)}% <span className="text-[8px] uppercase">Asistencia</span></span>
        </div>
        <div className="space-y-4">
          <div className="space-y-1"><div className="flex justify-between text-[9px] uppercase font-bold"><span>Efectividad Cierre</span><span>{Math.round(closingRate)}%</span></div><Progress value={closingRate} className="h-1.5" /></div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Card className="shadow-lg bg-card border-border overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-border/50 py-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2"><BarChart3 className="text-primary w-5 h-5" /><CardTitle className="text-lg font-semibold">Stats</CardTitle></div>
          <Button variant="ghost" size="icon" onClick={() => onExpandedChange(true)} className="h-8 w-8 text-muted-foreground/60 hover:text-primary"><Maximize2 className="w-4 h-4" /></Button>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <WeeklyChart data={stats.charts.dailyActivity} title="Ciclo Actual" icon={CalendarDays} />
          <PerformanceSection />
        </CardContent>
      </Card>

      <Dialog open={isExpanded} onOpenChange={onExpandedChange}>
        <DialogContent data-calculator-dialog="true" className="max-w-none w-screen h-screen m-0 rounded-none bg-background border-none p-0 flex flex-col overflow-hidden">
          <DialogTitle className="sr-only">Inteligencia Finanto</DialogTitle>
          <div className="flex-1 flex flex-col">
            <DialogHeader className="px-6 py-4 border-b border-border/40 flex flex-row items-center justify-between bg-card/10 shrink-0">
              <div className="flex items-center gap-3"><div className="bg-primary/20 p-2 rounded-xl border border-primary/30"><BarChart3 className="text-primary w-6 h-6" /></div><div><h3 className="text-xl font-bold">Inteligencia Avanzada</h3><DialogDescription className="text-xs">Análisis financiero operativo.</DialogDescription></div></div>
              <DialogClose asChild><Button variant="ghost" size="icon" className="rounded-full hover:bg-destructive/10 h-10 w-10"><X className="w-5 h-5" /></Button></DialogClose>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-8 scrollbar-thin bg-muted/5">
              <div className="max-w-[1400px] mx-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {[
                    { icon: CalendarDays, color: 'text-primary', label: 'Citas Hoy', value: stats.todayCount, val1: stats.todayConfirmed, sub1: 'Conf.' },
                    { icon: TrendingUp, color: 'text-primary', label: 'Eficiencia', value: `${Math.round(closingRate)}%`, val1: 'Atendidas', sub1: 'Base' },
                    { icon: Users, color: 'text-accent', label: 'Prospectos', value: stats.currentMonthProspects, growth: monthlyGrowth, val1: stats.lastMonthProspects, sub1: 'Mes Ant.' },
                    { icon: Trophy, color: 'text-green-500', label: 'Cierres', value: stats.currentMonthSales, val1: stats.currentMonthOnlyCierre, sub1: 'Ventas' },
                    { icon: Coins, color: 'text-yellow-600', label: 'Ingresos', value: formatCurrency(stats.currentMonthCommission), val1: formatCurrency(stats.thisFridayCommission), sub1: 'Viernes' }
                  ].map((s, i) => (
                    <Card key={i} className="bg-card/40 border-primary/20 p-4 space-y-3">
                      <div className="flex justify-between items-start"><div className={cn("p-2 rounded-lg bg-muted/20", s.color)}><s.icon className="w-4 h-4" /></div>{s.growth !== undefined && <span className={cn("text-[10px] font-bold flex items-center", s.growth >= 0 ? "text-green-500" : "text-destructive")}>{s.growth >= 0 ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>} {Math.abs(Math.round(s.growth))}%</span>}</div>
                      <div><p className="text-[9px] uppercase font-bold text-muted-foreground">{s.label}</p><p className="text-2xl font-black truncate">{s.value}</p></div>
                      <div className="pt-2 border-t border-border/10 flex justify-between"><span className="text-[8px] font-bold text-muted-foreground uppercase">{s.sub1}</span><span className="text-xs font-bold">{s.val1}</span></div>
                    </Card>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                  <div className="xl:col-span-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <WeeklyChart data={stats.charts.dailyActivity} title="Actual" icon={CalendarDays} />
                      <WeeklyChart data={stats.charts.lastWeekActivity} title="Anterior" icon={History} opacity={0.65} />
                    </div>
                    
                    <Card className="bg-card border-border/40 overflow-hidden">
                      <CardHeader className="bg-muted/30 p-4 border-b text-xs font-bold uppercase">
                        <Zap className="w-4 h-4 text-yellow-500 inline mr-2" /> Insights
                      </CardHeader>
                      <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                          <span className="text-[10px] font-bold uppercase block text-muted-foreground">Vendido</span>
                          <p className="text-2xl font-black">{formatCurrency(stats.totalCreditSold)}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase block text-muted-foreground">Part. Media</span>
                          <p className="text-2xl font-black text-primary">{stats.avgParticipation}%</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase block text-muted-foreground">Impuestos</span>
                          <p className="text-2xl font-black text-destructive">{formatCurrency(taxImpact)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="xl:col-span-4 space-y-6">
                    <PerformanceSection />
                    <Card className="border-accent/20 bg-accent/5 p-4">
                      <Zap className="w-4 h-4 text-accent inline mr-2" />
                      <span className="text-[10px] font-bold uppercase text-accent/80">Sugerencia</span>
                      <p className="text-sm mt-2 font-bold border-l-2 border-accent/30 pl-3 leading-relaxed">{getAdvice()}</p>
                    </Card>
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

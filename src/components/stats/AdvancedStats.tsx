"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  BarChart3, 
  Target, 
  Lightbulb, 
  Maximize2, 
  X,
  Info,
  Activity,
  CalendarDays,
  Trophy,
  Users,
  History,
  Coins,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  PieChart,
  Zap,
  TrendingDown,
  Percent
} from "lucide-react";
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  YAxis,
  Cell,
  LabelList
} from "recharts";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  type ChartConfig 
} from "@/components/ui/chart";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface AdvancedStatsProps {
  stats: any;
  initialExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

const chartConfig = {
  agendadas: {
    label: "Agendadas",
    color: "hsl(var(--primary))",
  },
  atendidas: {
    label: "Atendidas",
    color: "hsl(var(--accent))",
  },
  cierres: {
    label: "Cierres",
    color: "url(#cierreGradient)",
  },
} satisfies ChartConfig;

const ZeroLabel = (props: any) => {
  const { x, y, width, value } = props;
  if (value > 0) return null;
  return (
    <text 
      x={x + width / 2} 
      y={y - 5} 
      fill="currentColor" 
      textAnchor="middle" 
      className="text-[8px] font-bold opacity-30"
    >
      ×
    </text>
  );
};

export default function AdvancedStats({ stats, initialExpanded = false, onExpandedChange }: AdvancedStatsProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  useEffect(() => {
    onExpandedChange?.(isExpanded);
    if (isExpanded) {
      window.history.pushState(null, '', '/stats');
    } else if (window.location.pathname === '/stats') {
      window.history.pushState(null, '', '/');
    }
  }, [isExpanded, onExpandedChange]);

  const totalMonth = stats.currentMonthProspects || 0;
  const attendanceRate = totalMonth > 0 ? Math.min(95, 75 + (stats.todayConfirmed / (stats.todayCount || 1) * 10)) : 0;
  const closingRate = attendanceRate > 0 ? (stats.conversionRate / (attendanceRate / 100)) : 0;
  
  const monthlyGrowth = stats.lastMonthProspects > 0 ? ((stats.currentMonthProspects - stats.lastMonthProspects) / stats.lastMonthProspects) * 100 : 0;
  const creditGrowth = stats.lastMonthCreditSold > 0 ? ((stats.totalCreditSold - stats.lastMonthCreditSold) / stats.lastMonthCreditSold) * 100 : 0;
  const taxImpact = stats.currentMonthCommission / 0.91 * 0.09;

  // Cierre mensual fijo en 5
  const MONTHLY_GOAL = 5;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(Math.round(val));
  };

  const getAdvice = () => {
    if (stats.conversionRate > 20) return "Sugerencia: Tu tasa de cierre es excepcional. Es el momento de ser más selectivo: enfócate en captar perfiles de crédito más alto para maximizar tu retorno.";
    if (stats.conversionRate < 8) return "Sugerencia: La conversión está por debajo del promedio. Revisa la calificación de prospectos en la primera llamada; necesitas filtrar mejor antes de agendar.";
    if (stats.currentMonthFollowUps > 5) return "Sugerencia: Tienes un volumen alto de prospectos en seguimiento. Prioriza las llamadas de cierre hoy para evitar que el interés se enfríe.";
    if (stats.todayCount > 0 && (stats.todayConfirmed / stats.todayCount) < 0.6) return "Sugerencia: Baja tasa de asistencia hoy. Implementa recordatorios por WhatsApp 2 horas antes de cada cita para asegurar el compromiso.";
    if (stats.currentMonthCommission > 15000) return "Sugerencia: Resultados financieros sobresalientes. Te sugerimos reinvertir un porcentaje en pauta digital para escalar tu volumen el próximo mes.";
    if (stats.currentMonthApartados > stats.currentMonthOnlyCierre * 2) return "Sugerencia: Tienes muchos apartados pendientes de formalizar. Enfoca tu semana en el área operativa para empujar esas firmas y liberar flujo de efectivo.";
    return "Sugerencia: Tu ritmo operativo es estable. Mantén el hábito estricto de registrar cada acuerdo en notas para asegurar una transición impecable hacia el cierre.";
  };

  const WeeklyChart = ({ data, title, icon: Icon, opacity = 1 }: { data: any, title: string, icon: any, opacity?: number }) => (
    <Card className={cn("border-border/40 bg-card/30 backdrop-blur-md shadow-sm overflow-visible", opacity < 1 && "opacity-75")}>
      <CardHeader className="p-4 pb-2 border-b border-border/10 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{title}</CardTitle>
        </div>
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6"><Info className="w-3.5 h-3.5 text-muted-foreground/60" /></Button>
            </TooltipTrigger>
            <TooltipContent className="text-[10px] max-w-[200px] bg-card border-border shadow-xl p-3 z-[250]" side="top">
              <p className="font-bold mb-1 uppercase text-primary">Ciclo Miércoles a Martes</p>
              Compara citas agendadas, clientes que asistieron y cierres finales por día.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="p-4 h-[200px] overflow-visible">
        <ChartContainer config={chartConfig} className="h-full w-full overflow-visible">
          <BarChart data={data}>
            <defs>
              <linearGradient id="cierreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00F5FF" />
                <stop offset="33%" stopColor="#1877F2" />
                <stop offset="66%" stopColor="#7B61FF" />
                <stop offset="100%" stopColor="#FF00D6" />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="day" 
              tickLine={false} 
              tickMargin={10} 
              axisLine={false} 
              className="text-[10px] font-bold uppercase text-muted-foreground/60" 
            />
            <YAxis 
              hide 
              domain={[0, stats.charts.globalMax + 1]} 
            />
            <ChartTooltip content={<ChartTooltipContent className="z-[250]" />} />
            <Bar dataKey="agendadas" name="Agendadas" radius={[2, 2, 0, 0]}>
              {data.map((entry: any, index: number) => (
                <Cell 
                  key={`cell-age-${index}`} 
                  fill={entry.isToday ? "hsl(var(--primary))" : "var(--color-agendadas)"}
                  stroke={entry.isToday ? "hsl(var(--primary))" : "none"}
                  strokeWidth={entry.isToday ? 2 : 0}
                  className={entry.isToday ? "filter drop-shadow-[0_0_4px_rgba(var(--primary),0.5)]" : ""}
                />
              ))}
              <LabelList dataKey="agendadas" content={<ZeroLabel />} />
            </Bar>
            <Bar dataKey="atendidas" name="Atendidas" radius={[2, 2, 0, 0]}>
              {data.map((entry: any, index: number) => (
                <Cell 
                  key={`cell-ate-${index}`} 
                  fill={entry.isToday ? "hsl(var(--accent))" : "var(--color-atendidas)"}
                  stroke={entry.isToday ? "hsl(var(--accent))" : "none"}
                  strokeWidth={entry.isToday ? 2 : 0}
                />
              ))}
              <LabelList dataKey="atendidas" content={<ZeroLabel />} />
            </Bar>
            <Bar dataKey="cierres" name="Cierres" radius={[2, 2, 0, 0]}>
              {data.map((entry: any, index: number) => (
                <Cell 
                  key={`cell-cie-${index}`} 
                  fill={entry.isToday ? "url(#cierreGradient)" : "url(#cierreGradient)"}
                  stroke={entry.isToday ? "white" : "none"}
                  strokeWidth={entry.isToday ? 1 : 0}
                  className="filter drop-shadow-sm"
                />
              ))}
              <LabelList dataKey="cierres" content={<ZeroLabel />} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );

  const PerformanceSection = () => (
    <Card className="border-primary/20 bg-primary/5 shadow-lg relative overflow-hidden">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary/80">Salud Operativa</h3>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-2xl font-black text-primary leading-none">{Math.round(attendanceRate)}%</span>
            <span className="text-[7px] font-bold uppercase text-primary/40">Tasa de Asistencia</span>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] uppercase font-bold text-muted-foreground">Efectividad de Cierre</span>
                <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="w-2.5 h-2.5 opacity-40 cursor-help"/></TooltipTrigger><TooltipContent className="text-[10px] z-[250]">Ventas logradas divididas entre prospectos que sí asistieron.</TooltipContent></Tooltip></TooltipProvider>
              </div>
              <span className="text-xs font-bold text-green-500">{Math.round(closingRate)}%</span>
            </div>
            <Progress value={closingRate} className="h-1.5 bg-green-500/10" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/10">
            <div>
              <p className="text-[8px] font-bold text-muted-foreground uppercase mb-1">Cierres Meta</p>
              <p className="text-xs font-black">{stats.currentMonthSales} / {MONTHLY_GOAL}</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-bold text-muted-foreground uppercase mb-1">Impacto Fiscal</p>
              <p className="text-xs font-black text-destructive">{formatCurrency(taxImpact)}</p>
            </div>
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
            <CardTitle className="text-lg font-headline font-semibold">Stats Avanzados</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-lg text-muted-foreground/60 hover:text-primary hover:bg-primary/10"
            onClick={() => setIsExpanded(true)}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <WeeklyChart data={stats.charts.dailyActivity} title="Flujo Ciclo Actual" icon={CalendarDays} />
          <PerformanceSection />
        </CardContent>
      </Card>

      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent 
          data-calculator-dialog="true"
          className="max-w-none w-screen h-screen m-0 rounded-none bg-background border-none shadow-none p-0 flex flex-col overflow-hidden"
        >
          <DialogHeader className="px-6 py-4 border-b border-border/40 flex flex-row items-center justify-between bg-card/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-xl border border-primary/30">
                <BarChart3 className="text-primary w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-headline font-bold text-foreground">Panel de Inteligencia</DialogTitle>
                <DialogDescription className="text-xs">Análisis de rendimiento, flujo financiero y tendencias operativas.</DialogDescription>
              </div>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-destructive/10 hover:text-destructive h-10 w-10">
                <X className="w-5 h-5" />
              </Button>
            </DialogClose>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-8 scrollbar-thin bg-muted/5">
            <div className="max-w-[1400px] mx-auto space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                  { icon: CalendarDays, color: 'text-primary', label: 'Citas Agendadas', value: stats.todayCount, tag: 'HOY', sub1: 'Confirmadas', val1: stats.todayConfirmed, sub2: 'Mañana', val2: stats.tomorrowTotal },
                  { icon: TrendingUp, color: 'text-primary', label: 'Eficiencia de Cierre', value: `${Math.round(closingRate)}%`, sub1: 'Ratio de éxito', val1: 'Sobre atendidos' },
                  { icon: Users, color: 'text-accent', label: 'Prospectos Mes', value: stats.currentMonthProspects, growth: monthlyGrowth, sub1: 'Mes Pasado', val1: stats.lastMonthProspects, sub2: 'Seguimientos', val2: stats.currentMonthFollowUps },
                  { icon: Trophy, color: 'text-green-500', label: 'Cierres de Mes', value: stats.currentMonthSales, sub1: 'Formalizados', val1: stats.currentMonthOnlyCierre, sub2: 'Apartados', val2: stats.currentMonthApartados },
                  { icon: Coins, color: 'text-yellow-600', label: 'Ingresos Totales (Neto)', value: formatCurrency(stats.currentMonthCommission), special: true, sub1: 'Cobrado Neto', val1: formatCurrency(stats.currentMonthPaidCommission), sub2: 'Este Viernes', val2: formatCurrency(stats.thisFridayCommission) }
                ].map((s, i) => (
                  <Card 
                    key={i} 
                    className={cn(
                      "bg-card/40 border-primary/20 p-4 space-y-3 animate-entrance-stagger animate-staggered-periodic",
                      s.special && stats.currentMonthCommission > 5000 && "border-primary/40 shadow-[0_0_15px_rgba(var(--primary),0.1)]"
                    )}
                    style={{ animationDelay: `${i * 0.1}s, ${i * 0.2}s` }}
                  >
                    <div className="flex justify-between items-start">
                      <div className={cn("p-2 rounded-lg bg-muted/20", s.color)}><s.icon className="w-4 h-4" /></div>
                      {s.tag && <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">{s.tag}</span>}
                      {s.growth !== undefined && (
                        <div className="flex items-center gap-1">
                          {s.growth >= 0 ? <ArrowUpRight className="w-3 h-3 text-green-500"/> : <ArrowDownRight className="w-3 h-3 text-destructive"/>}
                          <span className={cn("text-[10px] font-bold", s.growth >= 0 ? "text-green-500" : "text-destructive")}>{Math.abs(Math.round(s.growth))}%</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">{s.label}</p>
                      <p className={cn(
                        "text-2xl font-black truncate",
                        s.special && stats.currentMonthCommission > 5000 && "bg-gradient-to-r from-[#00F5FF] via-[#7B61FF] to-[#FF00D6] bg-clip-text text-transparent"
                      )}>
                        {s.value}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-1 pt-2 border-t border-border/10">
                      <div className="flex justify-between">
                        <span className="text-[8px] font-bold text-muted-foreground uppercase">{s.sub1}</span>
                        <span className="text-xs font-bold">{s.val1}</span>
                      </div>
                      {s.sub2 && (
                        <div className="flex justify-between">
                          <span className="text-[8px] font-bold text-muted-foreground uppercase">{s.sub2}</span>
                          <span className="text-xs font-bold">{s.val2}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 overflow-visible">
                <div className="xl:col-span-8 space-y-6 overflow-visible">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-visible">
                    <div className="animate-entrance-stagger" style={{ animationDelay: '0.5s' }}>
                      <WeeklyChart data={stats.charts.dailyActivity} title="Ciclo Actual" icon={CalendarDays} />
                    </div>
                    <div className="animate-entrance-stagger" style={{ animationDelay: '0.6s' }}>
                      <WeeklyChart data={stats.charts.lastWeekActivity} title="Ciclo Anterior" icon={History} opacity={0.65} />
                    </div>
                  </div>
                  
                  <Card className="bg-card border-border/40 overflow-hidden animate-entrance-stagger" style={{ animationDelay: '0.7s' }}>
                    <CardHeader className="bg-muted/30 p-4 border-b">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <CardTitle className="text-xs font-bold uppercase tracking-wider">Insights Financieros</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Target className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase">Crédito Vendido</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <p className="text-2xl font-black text-foreground">{formatCurrency(stats.totalCreditSold)}</p>
                          <div className="flex items-center text-[10px] font-bold">
                            {creditGrowth >= 0 ? <ArrowUpRight className="w-3 h-3 text-green-500 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 text-destructive mr-0.5" />}
                            <span className={creditGrowth >= 0 ? "text-green-500" : "text-destructive"}>{Math.abs(Math.round(creditGrowth))}%</span>
                          </div>
                        </div>
                        <p className="text-[9px] text-muted-foreground">Valor total formalizado este mes vs mes pasado ({formatCurrency(stats.lastMonthCreditSold)}).</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Percent className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase">Participación Media</span>
                        </div>
                        <p className="text-2xl font-black text-primary">{stats.avgParticipation}%</p>
                        <p className="text-[9px] text-muted-foreground">Tu porcentaje de comisión promedio sobre el volumen total.</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Receipt className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase">Impacto Fiscal</span>
                        </div>
                        <p className="text-2xl font-black text-destructive">{formatCurrency(taxImpact)}</p>
                        <p className="text-[9px] text-muted-foreground">Monto aproximado retenido por el impuesto del 9%.</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="xl:col-span-4 space-y-6 animate-entrance-stagger" style={{ animationDelay: '0.8s' }}>
                  <PerformanceSection />
                  
                  <Card className="border-accent/20 bg-accent/5 relative overflow-hidden h-fit">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Lightbulb className="w-24 h-24 rotate-12" />
                    </div>
                    <CardHeader className="p-4 pb-0 flex flex-row items-center gap-2 relative z-10">
                      <Zap className="w-4 h-4 text-accent animate-bounce" />
                      <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-accent/80">Sugerencia Estratégica</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-2 relative z-10">
                      <p className="text-sm text-foreground/90 leading-relaxed font-bold border-l-2 border-accent/30 pl-3">
                        {getAdvice()}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-primary/5 border-primary/20 p-6 flex items-center gap-4">
                    <div className="bg-primary/20 p-3 rounded-2xl">
                      <Activity className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Meta Mensual</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black">{stats.currentMonthSales} / {MONTHLY_GOAL}</span>
                        <span className="text-xs font-bold text-primary">+{Math.round((stats.currentMonthSales / MONTHLY_GOAL) * 100)}%</span>
                      </div>
                      <Progress value={(stats.currentMonthSales / MONTHLY_GOAL) * 100} className="h-1.5 mt-2" />
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
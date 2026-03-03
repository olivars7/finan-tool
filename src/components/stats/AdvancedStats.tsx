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
  YAxis
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
} satisfies ChartConfig;

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
    <Card className={cn("border-border/40 bg-card/30 backdrop-blur-md shadow-sm overflow-hidden", opacity < 1 && "opacity-75")}>
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
            <TooltipContent className="text-[10px] max-w-[200px] bg-card border-border shadow-xl p-3 z-[100]" side="top">
              <p className="font-bold mb-1 uppercase text-primary">Ciclo Miércoles a Martes</p>
              Compara citas agendadas contra citas con resultado real (excluyendo inasistencias).
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="p-4 h-[200px]">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart data={data}>
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
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="agendadas" name="Agendadas" fill="var(--color-agendadas)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="atendidas" name="Atendidas" fill="var(--color-atendidas)" radius={[4, 4, 0, 0]} />
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
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary/80">Salud Operativa del Mes</h3>
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
                <span className="text-[9px] uppercase font-bold text-muted-foreground">Efectividad de Cierre (Sobre Atendidas)</span>
                <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="w-2.5 h-2.5 opacity-40 cursor-help"/></TooltipTrigger><TooltipContent className="text-[10px] z-[110]">Ventas logradas divididas entre prospectos que sí asistieron.</TooltipContent></Tooltip></TooltipProvider>
              </div>
              <span className="text-xs font-bold text-green-500">{Math.round(closingRate)}%</span>
            </div>
            <Progress value={closingRate} className="h-1.5 bg-green-500/10" />
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
                <DialogTitle className="text-xl font-headline font-bold text-foreground">Inteligencia de Negocio Finanto</DialogTitle>
                <DialogDescription className="text-xs">Análisis profundo de rendimiento, flujo financiero y tendencias operativas.</DialogDescription>
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
                <Card className="bg-card/40 border-primary/20 p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-primary/10 rounded-lg"><CalendarDays className="w-4 h-4 text-primary" /></div>
                    <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">HOY</span>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Citas Agendadas</p>
                    <p className="text-3xl font-black">{stats.todayCount}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/10">
                    <div>
                      <p className="text-[8px] font-bold text-muted-foreground uppercase">Confirmadas</p>
                      <p className="text-xs font-bold text-green-500">{stats.todayConfirmed}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-muted-foreground uppercase">Mañana</p>
                      <p className="text-xs font-bold text-primary">{stats.tomorrowTotal}</p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-card/40 border-primary/20 p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-primary/10 rounded-lg"><TrendingUp className="w-4 h-4 text-primary" /></div>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Eficiencia de Cierre</p>
                    <p className="text-3xl font-black">{Math.round(closingRate)}%</p>
                  </div>
                  <div className="pt-2 border-t border-border/10">
                    <p className="text-[8px] font-bold text-muted-foreground uppercase">Ratio de éxito</p>
                    <p className="text-xs font-bold text-primary">Sobre prospectos atendidos</p>
                  </div>
                </Card>

                <Card className="bg-card/40 border-accent/20 p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-accent/10 rounded-lg"><Users className="w-4 h-4 text-accent" /></div>
                    <div className="flex items-center gap-1">
                      {monthlyGrowth >= 0 ? <ArrowUpRight className="w-3 h-3 text-green-500"/> : <ArrowDownRight className="w-3 h-3 text-destructive"/>}
                      <span className={cn("text-[10px] font-bold", monthlyGrowth >= 0 ? "text-green-500" : "text-destructive")}>{Math.abs(Math.round(monthlyGrowth))}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Prospectos Mes</p>
                    <p className="text-3xl font-black">{stats.currentMonthProspects}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/10">
                    <div>
                      <p className="text-[8px] font-bold text-muted-foreground uppercase">Mes Pasado</p>
                      <p className="text-xs font-bold">{stats.lastMonthProspects}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-muted-foreground uppercase">Seguimientos</p>
                      <p className="text-xs font-bold text-accent">{stats.currentMonthFollowUps}</p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-card/40 border-green-500/20 p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-green-500/10 rounded-lg"><Trophy className="w-4 h-4 text-green-500" /></div>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Cierres de Mes</p>
                    <p className="text-3xl font-black text-green-500">{stats.currentMonthSales}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/10">
                    <div>
                      <p className="text-[8px] font-bold text-muted-foreground uppercase">Formalizados</p>
                      <p className="text-xs font-bold text-green-600">{stats.currentMonthOnlyCierre}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-muted-foreground uppercase">Apartados</p>
                      <p className="text-xs font-bold text-blue-500">{stats.currentMonthApartados}</p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-card/40 border-yellow-500/20 p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-yellow-500/10 rounded-lg"><Coins className="w-4 h-4 text-yellow-600" /></div>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Ingresos Totales (Neto)</p>
                    <p className={cn(
                      "text-xl font-black truncate",
                      stats.currentMonthCommission > 5000 && "bg-gradient-to-r from-[#00F5FF] via-[#7B61FF] to-[#FF00D6] bg-clip-text text-transparent"
                    )}>
                      {formatCurrency(stats.currentMonthCommission)}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-1 pt-2 border-t border-border/10">
                    <div className="flex justify-between">
                      <span className="text-[8px] font-bold text-muted-foreground uppercase">Cobrado Neto</span>
                      <span className="text-xs font-bold text-green-500">{formatCurrency(stats.currentMonthPaidCommission)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[8px] font-bold text-muted-foreground uppercase">Este Viernes</span>
                      <span className="text-xs font-bold text-yellow-600">{formatCurrency(stats.thisFridayCommission)}</span>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                <div className="xl:col-span-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <WeeklyChart data={stats.charts.dailyActivity} title="Flujo Ciclo Actual (Mié-Mar)" icon={CalendarDays} />
                    <WeeklyChart data={stats.charts.lastWeekActivity} title="Flujo Ciclo Anterior (Mié-Mar)" icon={History} opacity={0.65} />
                  </div>
                  
                  <Card className="bg-card border-border/40 overflow-hidden">
                    <CardHeader className="bg-muted/30 p-4 border-b">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <CardTitle className="text-xs font-bold uppercase tracking-wider">Insights Financieros Avanzados</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Target className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase">Crédito Vendido (Volumen)</span>
                        </div>
                        <p className="text-2xl font-black text-foreground">{formatCurrency(stats.totalCreditSold)}</p>
                        <p className="text-[9px] text-muted-foreground">Valor total del monto crediticio gestionado y formalizado.</p>
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
                          <span className="text-[10px] font-bold uppercase">Impacto Fiscal Mes</span>
                        </div>
                        <p className="text-2xl font-black text-destructive">{formatCurrency(taxImpact)}</p>
                        <p className="text-[9px] text-muted-foreground">Monto aproximado retenido por el impuesto del 9%.</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="xl:col-span-4 space-y-6">
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
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Meta de Cierre Mensual</p>
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

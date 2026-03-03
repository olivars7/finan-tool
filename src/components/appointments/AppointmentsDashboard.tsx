"use client"

import React, { useState, useMemo, useEffect } from 'react';
import AppointmentForm from './AppointmentForm';
import UpcomingAppointments from './UpcomingAppointments';
import PastAppointments from './PastAppointments';
import AppointmentDetailsDialog from './AppointmentDetailsDialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  CalendarClock, 
  Search, 
  Maximize2, 
  X, 
  LayoutDashboard,
  CalendarDays,
  TrendingUp,
  Coins,
  ArrowRight,
  CheckCircle2,
  Archive,
  Inbox
} from 'lucide-react';
import { Appointment, AppointmentStatus } from '@/services/appointment-service';
import { parseISO, format, isAfter, isBefore, isToday, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

interface DashboardContentProps {
  expanded?: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  appointments: Appointment[];
  editAppointment: (id: string, data: Partial<Appointment>) => void;
  archiveAppointment: (id: string) => void;
  unarchiveAppointment: (id: string) => void;
  formatFriendlyDate: (date: string) => string;
  format12hTime: (time: string) => string;
  handleSelect: (app: Appointment) => void;
  handleHighlight: (app: Appointment) => void;
  activeId: string | null;
  visibleCountPast: number;
  setVisibleCountPast: (count: number | ((prev: number) => number)) => void;
  stats: any;
  theme?: string;
  searchTerm: string;
  onCelebrate?: (app: Appointment) => void;
}

const DashboardContent = ({ 
  expanded = false, 
  activeTab, 
  setActiveTab,
  appointments,
  editAppointment,
  archiveAppointment,
  unarchiveAppointment,
  formatFriendlyDate,
  format12hTime,
  handleSelect,
  handleHighlight,
  activeId,
  visibleCountPast,
  setVisibleCountPast,
  stats,
  theme,
  searchTerm,
  onCelebrate
}: DashboardContentProps) => {
  const [view, setView] = useState<"activas" | "archivadas">("activas");

  const normalizeStr = (str: string) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  };

  const today = startOfDay(new Date());

  const filteredList = appointments.filter(a => {
    const matchesView = view === "activas" ? !a.isArchived : a.isArchived;
    if (!matchesView) return false;

    if (!searchTerm) return true;
    const s = normalizeStr(searchTerm);
    const appDate = parseISO(a.date);
    const friendlyDate = normalizeStr(formatFriendlyDate(a.date));
    const monthName = normalizeStr(format(appDate, 'MMMM', { locale: es }));
    const dayName = normalizeStr(format(appDate, 'EEEE', { locale: es }));
    
    return normalizeStr(a.name).includes(s) || 
           a.phone.includes(s) || 
           (a.status && normalizeStr(a.status).includes(s)) ||
           (a.product && normalizeStr(a.product).includes(s)) ||
           friendlyDate.includes(s) ||
           monthName.includes(s) ||
           dayName.includes(s);
  });

  const filteredUpcoming = filteredList
    .filter(a => {
      const d = startOfDay(parseISO(a.date));
      return (isToday(d) || isAfter(d, today)) && !a.status;
    })
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime() || a.time.localeCompare(b.time));

  const filteredPast = filteredList
    .filter(a => {
      const d = startOfDay(parseISO(a.date));
      return isBefore(d, today) || !!a.status;
    })
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime() || b.time.localeCompare(a.time));

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
      <div className={cn(
        "flex flex-col gap-4 mb-6 shrink-0", 
        expanded && "bg-muted/10 p-6 rounded-2xl border border-border/30 backdrop-blur-md animate-entrance-stagger"
      )}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <TabsList className="grid w-full sm:w-80 grid-cols-2 h-10 p-1 bg-muted/40 border border-border/20 shadow-inner rounded-lg">
            <TabsTrigger 
              value="upcoming" 
              className="h-full rounded-md text-xs font-bold transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              Próximas ({filteredUpcoming.length})
            </TabsTrigger>
            <TabsTrigger 
              value="past" 
              className="h-full rounded-md text-xs font-bold transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              Historial ({filteredPast.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg border border-border/40">
            <Button 
              variant={view === "activas" ? "secondary" : "ghost"} 
              size="sm" 
              onClick={() => setView("activas")}
              className="h-8 text-[10px] font-bold uppercase gap-2"
            >
              <Inbox className="w-3.5 h-3.5" /> Activas
            </Button>
            <Button 
              variant={view === "archivadas" ? "secondary" : "ghost"} 
              size="sm" 
              onClick={() => setView("archivadas")}
              className="h-8 text-[10px] font-bold uppercase gap-2"
            >
              <Archive className="w-3.5 h-3.5" /> Archivadas
            </Button>
          </div>
        </div>

        {expanded && (
          <TooltipProvider delayDuration={0}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 items-center flex-1">
              {[
                { 
                  label: 'Hoy', 
                  icon: CalendarDays, 
                  color: 'text-blue-600', 
                  bg: 'bg-blue-500/10', 
                  val: `${stats.todayConfirmed}/${stats.todayCount}`,
                  sub: `Mañana: ${stats.tomorrowTotal}`
                },
                { 
                  label: 'Cierres Mes', 
                  icon: CheckCircle2, 
                  color: 'text-green-600', 
                  bg: 'bg-green-500/10', 
                  val: stats.currentMonthOnlyCierre,
                  trend: stats.currentMonthOnlyCierre > stats.lastMonthOnlyCierre,
                  trendVal: `Mes pasado: ${stats.lastMonthOnlyCierre}`
                },
                { 
                  label: 'Apartados', 
                  icon: Coins, 
                  color: 'text-blue-500', 
                  bg: 'bg-blue-500/10', 
                  val: stats.currentMonthApartados,
                  trend: stats.currentMonthApartados > stats.lastMonthApartados,
                  trendVal: `Mes pasado: ${stats.lastMonthApartados}`
                },
                { 
                  label: 'Conversión', 
                  icon: TrendingUp, 
                  color: 'text-primary', 
                  bg: 'bg-primary/10', 
                  val: `${stats.conversionRate}%`,
                  trend: stats.conversionRate > stats.lastMonthConversionRate,
                  trendVal: `Mes pasado: ${stats.lastMonthConversionRate}%`
                },
                { 
                  label: 'Ingresos Mes', 
                  icon: Coins, 
                  color: 'text-yellow-600', 
                  bg: 'bg-yellow-500/10', 
                  val: formatCurrency(stats.currentMonthCommission),
                  trend: stats.currentMonthCommission > stats.lastMonthCommission,
                  trendVal: `Mes pasado: ${formatCurrency(stats.lastMonthCommission)}`,
                  isCurrency: true
                }
              ].map((s, i) => (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <div 
                      className="flex flex-col items-center sm:items-start group cursor-help animate-entrance-stagger"
                      style={{ animationDelay: `${(i + 1) * 0.1}s` }}
                    >
                      <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest mb-1 group-hover:text-primary transition-colors">{s.label}</span>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <div className={cn("p-1.5 rounded-lg border", s.bg, s.color, "border-current/20")}>
                            <s.icon className="w-3.5 h-3.5"/>
                          </div>
                          <span className={cn(
                            "text-sm font-bold text-foreground truncate",
                            s.isCurrency && stats.currentMonthCommission > 5000 && "bg-gradient-to-r from-[#00F5FF] via-[#7B61FF] to-[#FF00D6] bg-clip-text text-transparent"
                          )}>
                            {s.val}
                          </span>
                        </div>
                        <div className="flex items-center mt-1 text-[7px] font-bold text-muted-foreground/40 uppercase">
                          {s.trend && <TrendingUp className="w-2 h-2 text-green-500 mr-0.5" />}
                          {s.trendVal || s.sub}
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-card border-border shadow-xl p-3">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">{s.label} detallado</span>
                    <span className="text-xs font-bold">{s.val}</span>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden animate-stats-reveal" style={{ animationDelay: '0.6s' }}>
        <TabsContent value="upcoming" className="mt-0 h-full">
          <UpcomingAppointments 
            appointments={filteredUpcoming} 
            allAppointments={appointments}
            formatDate={formatFriendlyDate}
            format12hTime={format12hTime}
            onSelect={handleSelect}
            onHighlight={handleHighlight}
            editAppointment={editAppointment}
            archiveAppointment={archiveAppointment}
            unarchiveAppointment={unarchiveAppointment}
            activeId={activeId}
            expanded={expanded}
            theme={theme}
            onCelebrate={onCelebrate}
          />
        </TabsContent>
        <TabsContent value="past" className="mt-0 h-full">
          <PastAppointments 
            appointments={filteredPast} 
            formatDate={formatFriendlyDate}
            format12hTime={format12hTime}
            onSelect={handleSelect}
            onHighlight={handleHighlight}
            archiveAppointment={archiveAppointment}
            unarchiveAppointment={unarchiveAppointment}
            activeId={activeId}
            expanded={expanded}
            visibleCount={visibleCountPast}
            setVisibleCount={setVisibleCountPast}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};

interface AppointmentsDashboardProps {
  appointments: Appointment[];
  activeAppointments: Appointment[];
  upcoming: Appointment[];
  past: Appointment[];
  addAppointment: (app: any) => void;
  editAppointment: (id: string, data: Partial<Appointment>) => void;
  archiveAppointment: (id: string) => void;
  unarchiveAppointment: (id: string) => void;
  formatFriendlyDate: (date: string) => string;
  format12hTime: (time: string) => string;
  initialExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  selectedAppId: string | null;
  onSelectAppId: (id: string | null) => void;
  stats: any;
  theme?: string;
  onCelebrate?: (app: Appointment) => void;
}

export default function AppointmentsDashboard({
  appointments,
  addAppointment,
  editAppointment,
  archiveAppointment,
  unarchiveAppointment,
  formatFriendlyDate,
  format12hTime,
  initialExpanded = false,
  onExpandedChange,
  selectedAppId,
  onSelectAppId,
  stats,
  theme,
  onCelebrate
}: AppointmentsDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [visibleCountPast, setVisibleCountPast] = useState(25);

  useEffect(() => {
    onExpandedChange?.(isExpanded);
  }, [isExpanded, onExpandedChange]);

  useEffect(() => {
    if (isExpanded) {
      window.history.pushState(null, '', '/gestor');
      return () => { 
        if (window.location.pathname === '/gestor') {
          window.history.pushState(null, '', '/');
        }
      };
    }
  }, [isExpanded]);

  const selectedApp = useMemo(() => {
    return appointments.find(app => app.id === selectedAppId) || null;
  }, [appointments, selectedAppId]);

  const handleSelect = (app: Appointment) => {
    setActiveId(app.id);
    onSelectAppId(app.id);
  };

  const handleHighlight = (app: Appointment) => {
    setActiveId(app.id);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <AppointmentForm onAdd={addAppointment} />

        <Card className="shadow-xl bg-card border-border border-l-4 border-l-blue-600 overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600/10 p-2 rounded-xl border border-blue-600/20">
                <CalendarClock className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-headline font-semibold">Gestión de citas</CardTitle>
                <CardDescription className="text-muted-foreground">Monitoreo de prospectos y cierres</CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar prospecto..."
                  className="pl-9 h-9 bg-muted/30 border-border/50 focus-visible:ring-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsExpanded(true)}
                className="h-9 w-9 rounded-lg text-muted-foreground/60 hover:text-blue-600 hover:bg-blue-600/10 transition-all border border-transparent hover:border-blue-600/20"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <DashboardContent 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              appointments={appointments}
              editAppointment={editAppointment}
              archiveAppointment={archiveAppointment}
              unarchiveAppointment={unarchiveAppointment}
              formatFriendlyDate={formatFriendlyDate}
              format12hTime={format12hTime}
              handleSelect={handleSelect}
              handleHighlight={handleHighlight}
              activeId={activeId}
              visibleCountPast={visibleCountPast}
              setVisibleCountPast={setVisibleCountPast}
              stats={stats}
              theme={theme}
              searchTerm={searchTerm}
              onCelebrate={onCelebrate}
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent 
          data-appointments-dialog="true"
          className="max-w-none w-screen h-screen m-0 rounded-none bg-background border-none shadow-none p-0 flex flex-col overflow-hidden"
        >
          <DialogHeader className="px-6 py-4 border-b border-border/40 flex flex-row items-center justify-between bg-card/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600/20 p-2 rounded-xl border border-blue-600/30">
                <LayoutDashboard className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-headline font-bold text-foreground">Panel de Control de Citas</DialogTitle>
                <DialogDescription className="text-xs">Vista completa del flujo de prospectos y operaciones mensuales.</DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="relative w-80 hidden md:block">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Búsqueda global..."
                  className="pl-9 h-10 bg-muted/30 border-border/50 focus-visible:ring-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-destructive/10 hover:text-destructive h-10 w-10">
                  <X className="w-5 h-5" />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>
          <div className="flex-1 p-6 overflow-hidden flex flex-col relative">
            <DashboardContent 
              expanded={true}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              appointments={appointments}
              editAppointment={editAppointment}
              archiveAppointment={archiveAppointment}
              unarchiveAppointment={unarchiveAppointment}
              formatFriendlyDate={formatFriendlyDate}
              format12hTime={format12hTime}
              handleSelect={handleSelect}
              handleHighlight={handleHighlight}
              activeId={activeId}
              visibleCountPast={visibleCountPast}
              setVisibleCountPast={setVisibleCountPast}
              stats={stats}
              theme={theme}
              searchTerm={searchTerm}
              onCelebrate={onCelebrate}
            />
          </div>
        </DialogContent>
      </Dialog>

      <AppointmentDetailsDialog 
        appointment={selectedApp} 
        open={!!selectedAppId} 
        onOpenChange={(o) => !o && onSelectAppId(null)}
        onEdit={editAppointment}
        onAdd={addAppointment}
        formatFriendlyDate={formatFriendlyDate}
        format12hTime={format12hTime}
        archiveAppointment={archiveAppointment}
      />
    </div>
  );
}
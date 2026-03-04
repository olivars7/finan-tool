"use client"

import React, { useState, useMemo } from 'react';
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
  CheckCircle2,
  Info
} from 'lucide-react';
import { Appointment } from '@/services/appointment-service';
import { parseISO, isAfter, isBefore, isToday, startOfDay, format } from 'date-fns';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  setVisibleCountPast: (val: number | ((p: number) => number)) => void;
  stats: any;
  theme?: string;
  searchTerm: string;
  onCelebrate?: (app: Appointment) => void;
}

const DashboardContent = ({ 
  expanded = false, activeTab, setActiveTab, appointments, editAppointment, archiveAppointment, unarchiveAppointment, formatFriendlyDate, format12hTime, handleSelect, handleHighlight, activeId, visibleCountPast, setVisibleCountPast, stats, searchTerm, onCelebrate
}: DashboardContentProps) => {
  const normalizeStr = (str: string) => (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const today = startOfDay(new Date());

  const filteredList = appointments.filter(a => {
    if (a.isArchived) return false;
    if (!searchTerm) return true;
    
    const s = normalizeStr(searchTerm);
    
    // Generar string de fecha casual (ej: "martes 3 marzo")
    const dateObj = parseISO(a.date);
    const casualDate = format(dateObj, "EEEE d MMMM", { locale: es });
    
    const searchableBuffer = [
      a.name,
      a.phone,
      a.prospectorName,
      a.attendingExecutive,
      a.type,
      a.status,
      casualDate
    ].map(val => normalizeStr(val)).join(' ');

    return searchableBuffer.includes(s);
  });

  const filteredUpcoming = filteredList.filter(a => {
    const d = startOfDay(parseISO(a.date));
    return (isToday(d) || isAfter(d, today)) && !a.status;
  }).sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  const filteredPast = filteredList.filter(a => {
    const d = startOfDay(parseISO(a.date));
    return isBefore(d, today) || !!a.status;
  }).sort((a, b) => b.date.localeCompare(a.date));

  const formatCurrency = (val: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(val);

  const getDynamicGradient = (val: number) => {
    if (val < 2000) return "";
    if (val < 5000) return "text-gradient-aqua-blue";
    if (val < 10000) return "text-gradient-aqua-violet";
    return "text-gradient-lima-blue";
  };

  const microStats = [
    { label: 'Hoy', icon: CalendarDays, val: `${stats.todayConfirmed}/${stats.todayCount}`, color: 'text-blue-600', tip: "Citas confirmadas vs agendadas para hoy." },
    { label: 'Cierres Mes', icon: CheckCircle2, val: stats.currentMonthOnlyCierre, color: 'text-green-600', tip: "Ventas cerradas en el mes actual." },
    { label: 'Apartados', icon: Coins, val: stats.currentMonthApartados, color: 'text-blue-500', tip: "Trámites en fase de reserva/apartado." },
    { label: 'Conversión', icon: TrendingUp, val: `${stats.conversionRate}%`, color: 'text-primary', tip: "Efectividad de cierre sobre prospectos totales." },
    { label: 'Ingresos Mes', icon: Coins, val: formatCurrency(stats.currentMonthCommission), color: 'text-yellow-600', isCurrency: true, tip: "Total neto proyectado para este ciclo." }
  ];

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col flex-1 min-h-0">
      {expanded && (
        <div className="flex flex-col gap-4 mb-6 shrink-0 bg-muted/10 p-6 rounded-2xl border border-border/30 backdrop-blur-md">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {microStats.map((s, i) => (
              <TooltipProvider key={i}>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col cursor-help">
                      <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest mb-1">{s.label}</span>
                      <div className="flex items-center gap-2">
                        <div className={cn("p-1.5 rounded-lg border bg-muted/20", s.color, "border-current/20")}><s.icon className="w-3.5 h-3.5"/></div>
                        <span className={cn(
                          "text-sm font-bold truncate", 
                          s.isCurrency ? getDynamicGradient(stats.currentMonthCommission) : ""
                        )}>{s.val}</span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-card border-border shadow-xl text-[10px] font-bold p-2 border-white">
                    {s.tip}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 shrink-0">
        <TabsList className="grid w-full sm:w-80 grid-cols-2 h-10 p-1 bg-muted/40 border border-border/20 rounded-lg">
          <TabsTrigger value="upcoming" className="text-xs font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white">Próximas ({filteredUpcoming.length})</TabsTrigger>
          <TabsTrigger value="past" className="text-xs font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white">Historial ({filteredPast.length})</TabsTrigger>
        </TabsList>
      </div>

      <div className="flex-1 min-h-0">
        <TabsContent value="upcoming" className="mt-0 h-full overflow-hidden">
          <UpcomingAppointments appointments={filteredUpcoming} allAppointments={appointments} formatDate={formatFriendlyDate} format12hTime={format12hTime} onSelect={handleSelect} onHighlight={handleHighlight} editAppointment={editAppointment} archiveAppointment={archiveAppointment} unarchiveAppointment={unarchiveAppointment} activeId={activeId} expanded={expanded} onCelebrate={onCelebrate} />
        </TabsContent>
        <TabsContent value="past" className="mt-0 h-full overflow-hidden">
          <PastAppointments appointments={filteredPast} formatDate={formatFriendlyDate} format12hTime={format12hTime} onSelect={handleSelect} onHighlight={handleHighlight} archiveAppointment={archiveAppointment} unarchiveAppointment={unarchiveAppointment} activeId={activeId} expanded={expanded} visibleCount={visibleCountPast} setVisibleCount={setVisibleCountPast} />
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
  isExpanded?: boolean;
  onExpandedChange: (expanded: boolean) => void;
  selectedAppId: string | null;
  onSelectAppId: (id: string | null) => void;
  stats: any;
  theme?: string;
  onCelebrate?: (app: Appointment) => void;
}

export default function AppointmentsDashboard({
  appointments, addAppointment, editAppointment, archiveAppointment, unarchiveAppointment, formatFriendlyDate, format12hTime, isExpanded = false, onExpandedChange, selectedAppId, onSelectAppId, stats, theme, onCelebrate
}: AppointmentsDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [visibleCountPast, setVisibleCountPast] = useState(25);

  const selectedApp = useMemo(() => appointments.find(app => app.id === selectedAppId) || null, [appointments, selectedAppId]);
  const handleSelect = (app: Appointment) => { setActiveId(app.id); onSelectAppId(app.id); };
  const handleHighlight = (app: Appointment) => setActiveId(app.id);

  return (
    <div className="space-y-6">
      <AppointmentForm onAdd={addAppointment} />
      <Card className="shadow-xl bg-card border-border border-l-4 border-l-blue-600 overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600/10 p-2 rounded-xl border border-blue-600/20">
              <CalendarClock className="text-blue-600 w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">Gestión de citas</CardTitle>
              <CardDescription className="text-muted-foreground">Monitoreo de prospectos</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar..." className="pl-9 h-9 bg-muted/30" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Button variant="ghost" size="icon" onClick={() => onExpandedChange(true)} className="h-9 w-9 text-muted-foreground/60 hover:text-blue-600">
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <DashboardContent activeTab={activeTab} setActiveTab={setActiveTab} appointments={appointments} editAppointment={editAppointment} archiveAppointment={archiveAppointment} unarchiveAppointment={unarchiveAppointment} formatFriendlyDate={formatFriendlyDate} format12hTime={format12hTime} handleSelect={handleSelect} handleHighlight={handleHighlight} activeId={activeId} visibleCountPast={visibleCountPast} setVisibleCount={setVisibleCountPast} stats={stats} searchTerm={searchTerm} onCelebrate={onCelebrate} />
        </CardContent>
      </Card>

      <Dialog open={isExpanded} onOpenChange={onExpandedChange}>
        <DialogContent data-appointments-dialog="true" className="max-w-none w-screen h-screen m-0 rounded-none bg-background border-none p-0 flex flex-col overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b border-border/40 flex flex-row items-center justify-between bg-card/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600/20 p-2 rounded-xl border border-blue-600/30">
                <LayoutDashboard className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Panel de Control de Citas</DialogTitle>
                <DialogDescription className="text-xs">Vista completa del flujo.</DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-80 hidden md:block">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Búsqueda global..." className="pl-9 h-10 bg-muted/30" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-destructive/10 h-10 w-10">
                  <X className="w-5 h-5" />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>
          <div className="flex-1 p-6 overflow-hidden flex flex-col">
            <DashboardContent expanded={true} activeTab={activeTab} setActiveTab={setActiveTab} appointments={appointments} editAppointment={editAppointment} archiveAppointment={archiveAppointment} unarchiveAppointment={unarchiveAppointment} formatFriendlyDate={formatFriendlyDate} format12hTime={format12hTime} handleSelect={handleSelect} handleHighlight={handleHighlight} activeId={activeId} visibleCountPast={visibleCountPast} setVisibleCount={setVisibleCountPast} stats={stats} searchTerm={searchTerm} onCelebrate={onCelebrate} />
          </div>
        </DialogContent>
      </Dialog>

      <AppointmentDetailsDialog appointment={selectedApp} open={!!selectedAppId} onOpenChange={(o) => !o && onSelectAppId(null)} onEdit={editAppointment} onAdd={addAppointment} formatFriendlyDate={formatFriendlyDate} format12hTime={format12hTime} archiveAppointment={archiveAppointment} />
    </div>
  );
}
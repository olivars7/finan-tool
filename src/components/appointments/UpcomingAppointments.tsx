"use client"

import React, { useState } from 'react';
import { Appointment, AppointmentStatus } from '@/services/appointment-service';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Clock, Calendar, AlertCircle, 
  CheckCircle, ClipboardCheck, Phone, Box, ChevronRight, 
  CheckCircle as CheckIcon,
  Save, MessageSquare, Coins, Info, UserCog, UserCheck, ChevronDown,
  ClipboardList, X
} from "lucide-react";
import { parseISO, isToday, isTomorrow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

interface Props {
  appointments: Appointment[];
  allAppointments: Appointment[];
  formatDate: (date: string) => string;
  format12hTime: (time: string) => string;
  onSelect: (app: Appointment) => void;
  onHighlight: (app: Appointment) => void;
  editAppointment: (id: string, data: Partial<Appointment>) => void;
  archiveAppointment: (id: string) => void;
  unarchiveAppointment: (id: string) => void;
  activeId?: string | null;
  expanded?: boolean;
  theme?: string;
  onCelebrate?: (app: Appointment) => void;
}

export default function UpcomingAppointments({ 
  appointments, 
  allAppointments,
  formatDate, 
  format12hTime, 
  onSelect, 
  onHighlight,
  editAppointment,
  activeId,
  expanded = false,
  onCelebrate
}: Props) {
  const [confirmingApp, setConfirmingApp] = useState<Appointment | null>(null);
  const [finalizingApp, setFinalizingApp] = useState<Appointment | null>(null);
  
  const [finalStatus, setFinalStatus] = useState<AppointmentStatus>('Asistencia');
  const [finalNotes, setFinalNotes] = useState('');
  const [finalCreditAmount, setFinalCreditAmount] = useState<number>(0);
  const [creditInput, setCreditInput] = useState('');
  const [finalCommissionPercent, setFinalCommissionPercent] = useState<number>(100);
  const [attendingExecutive, setAttendingExecutive] = useState('');
  const [showExecutiveSection, setShowExecutiveSection] = useState(false);

  const { toast } = useToast();

  const isActuallyToday = (dateStr: string) => isToday(parseISO(dateStr));
  const isActuallyTomorrow = (dateStr: string) => isTomorrow(parseISO(dateStr));

  const formatWithCommas = (val: string) => {
    const num = val.replace(/[^0-9]/g, '');
    if (!num) return '';
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(Math.round(val));
  };

  const handleCreditChange = (val: string) => {
    const formatted = formatWithCommas(val);
    setCreditInput(formatted);
    setFinalCreditAmount(parseInt(formatted.replace(/,/g, '')) || 0);
  };

  const processConfirmation = () => {
    if (confirmingApp) {
      editAppointment(confirmingApp.id, { isConfirmed: true });
      toast({
        title: "Asistencia Confirmada",
        description: `${confirmingApp.name} ha validado su asistencia para hoy.`,
      });
      setConfirmingApp(null);
    }
  };

  const handleToggleConfirmation = (e: React.MouseEvent | React.TouchEvent, app: Appointment) => {
    e.stopPropagation();
    if (app.isConfirmed) {
      editAppointment(app.id, { isConfirmed: false });
      toast({
        title: "Confirmación Removida",
        description: `Se ha quitado la marca de asistencia para ${app.name}.`,
      });
    } else {
      setConfirmingApp(app);
    }
  };

  const handleOpenFinalize = (e: React.MouseEvent | React.TouchEvent, app: Appointment) => {
    e.stopPropagation();
    setFinalizingApp(app);
    setFinalStatus('Asistencia');
    setFinalNotes(app.notes || '');
    const amount = app.finalCreditAmount || 0;
    setFinalCreditAmount(amount);
    setCreditInput(amount > 0 ? amount.toLocaleString('en-US') : '');
    setFinalCommissionPercent(app.commissionPercent || 100);
    setAttendingExecutive(app.attendingExecutive || '');
    setShowExecutiveSection(!!app.attendingExecutive);
  };

  const handleSaveFinalization = () => {
    if (finalizingApp) {
      const isCierre = finalStatus === 'Cierre';
      
      editAppointment(finalizingApp.id, { 
        status: finalStatus, 
        notes: finalNotes,
        isConfirmed: true, 
        finalCreditAmount: isCierre ? finalCreditAmount : undefined,
        commissionPercent: isCierre ? finalCommissionPercent : undefined,
        commissionStatus: isCierre ? 'Pendiente' : undefined,
        attendingExecutive: attendingExecutive || undefined
      });

      toast({
        title: isCierre ? "¡Venta Cerrada!" : "Consulta Finalizada",
        description: `Se ha registrado el resultado "${finalStatus}" para ${finalizingApp.name}.`,
      });
      
      const appRef = finalizingApp;
      setFinalizingApp(null);

      if (isCierre && onCelebrate) {
        onCelebrate(appRef);
      } else {
        onSelect(appRef);
      }
    }
  };

  const copyPhone = (e: React.MouseEvent | React.TouchEvent, app: Appointment) => {
    e.stopPropagation();
    onHighlight(app);
    navigator.clipboard.writeText(app.phone).then(() => {
      toast({
        title: "Número copiado",
        description: `${app.name}: ${app.phone} listo para usar.`,
      });
    });
  };

  const copyAllTodayAppointments = () => {
    const todayApps = allAppointments
      .filter(a => isActuallyToday(a.date) && !a.isArchived)
      .sort((a, b) => a.time.localeCompare(b.time));

    if (todayApps.length === 0) {
      toast({ title: "Sin citas", description: "No hay citas registradas para hoy." });
      return;
    }

    let text = "";

    todayApps.forEach((app) => {
      const dateObj = parseISO(app.date);
      const dateFormatted = format(dateObj, "EEEE d 'de' MMMM yyyy", { locale: es });
      const capitalizedDate = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);
      const timeFormatted = format12hTime(app.time);

      text += `Cita: *${capitalizedDate}*\n`;
      text += `Nombre: *${app.name}*\n`;
      text += `Teléfono: *${app.phone || 'N/A'}*\n`;
      if (app.type !== '1ra consulta') {
        text += `Motivo: *${app.type}*\n`;
      }
      text += `Producto: *${app.product || 'N/A'}*\n`;
      text += `Hora: *${timeFormatted}*\n\n`;
    });

    navigator.clipboard.writeText(text.trim()).then(() => {
      toast({
        title: "Citas copiadas",
        description: "Listado de hoy listo para WhatsApp.",
      });
    });
  };

  const copyAllTomorrowAppointments = () => {
    const tomorrowApps = allAppointments
      .filter(a => isActuallyTomorrow(a.date) && !a.isArchived)
      .sort((a, b) => a.time.localeCompare(b.time));

    if (tomorrowApps.length === 0) {
      toast({ title: "Sin citas", description: "No hay citas registradas para mañana." });
      return;
    }

    let text = "";

    tomorrowApps.forEach((app) => {
      const dateObj = parseISO(app.date);
      const dateFormatted = format(dateObj, "EEEE d 'de' MMMM yyyy", { locale: es });
      const capitalizedDate = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);
      const timeFormatted = format12hTime(app.time);

      text += `Cita: *${capitalizedDate}*\n`;
      text += `Nombre: *${app.name}*\n`;
      text += `Teléfono: *${app.phone || 'N/A'}*\n`;
      if (app.type !== '1ra consulta') {
        text += `Motivo: *${app.type}*\n`;
      }
      text += `Producto: *${app.product || 'N/A'}*\n`;
      text += `Hora: *${timeFormatted}*\n\n`;
    });

    navigator.clipboard.writeText(text.trim()).then(() => {
      toast({
        title: "Citas copiadas",
        description: "Listado de mañana listo para WhatsApp.",
      });
    });
  };

  const calculatedCommission = (finalCreditAmount * 0.007 * (finalCommissionPercent / 100)) * 0.91;

  return (
    <div className="space-y-4 flex flex-col h-full">
      <div className={cn(
        "border rounded-xl overflow-hidden relative backdrop-blur-sm bg-card/10 flex flex-col",
        !expanded ? "h-[400px]" : "h-full flex-1"
      )}>
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/10 h-full">
            <Calendar className="w-16 h-16 mb-4 opacity-10" />
            <p className="text-sm font-bold uppercase tracking-widest opacity-40">No hay citas en esta lista</p>
          </div>
        ) : (
          <ScrollArea className="flex-1 scrollbar-thin">
            <div className="hidden md:block">
              <Table className="border-collapse separate border-spacing-0">
                <TableHeader className="sticky top-0 z-30 bg-card shadow-sm border-b">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className={cn("bg-card pl-4", expanded ? "w-[180px]" : "")}>Nombre / Teléfono</TableHead>
                    {expanded && <TableHead className="bg-card w-[140px]">Contacto</TableHead>}
                    <TableHead className="bg-card">Motivo</TableHead>
                    {expanded && <TableHead className="bg-card">Producto</TableHead>}
                    <TableHead className="bg-card">Fecha</TableHead>
                    <TableHead className="bg-card">Hora</TableHead>
                    <TableHead className="bg-card w-24 text-center">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((app) => {
                    const appToday = isActuallyToday(app.date);
                    const isSelected = activeId === app.id;
                    
                    return (
                      <TableRow 
                        key={app.id} 
                        onClick={() => onSelect(app)}
                        className={cn(
                          "hover:bg-primary/10 transition-colors cursor-pointer group relative h-16",
                          appToday && "bg-primary/10",
                          isSelected && "bg-primary/20 z-10"
                        )}
                      >
                        <TableCell className="align-middle pl-4">
                          <div className="flex items-center gap-2">
                            <div className="font-bold text-sm leading-tight text-foreground">{app.name}</div>
                            <div className="flex gap-1">
                              {app.prospectorName && (
                                <TooltipProvider>
                                  <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                      <UserCog className="w-3.5 h-3.5 text-blue-500" />
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-[10px] font-bold">
                                      Prospectado por: {app.prospectorName}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              {app.attendingExecutive && (
                                <TooltipProvider>
                                  <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                      <UserCheck className="w-3.5 h-3.5 text-purple-500" />
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-[10px] font-bold">
                                      Atendido por: {app.attendingExecutive}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </div>
                          {!expanded && (
                            <div className="text-[10px] text-muted-foreground inline-flex items-center gap-1 mt-0.5">
                              <Phone className="w-2.5 h-2.5" /> 
                              <span onClick={(e) => copyPhone(e, app)} className="hover:text-primary transition-colors cursor-pointer font-medium">
                                {app.phone}
                              </span>
                            </div>
                          )}
                        </TableCell>
                        {expanded && (
                          <TableCell className="align-middle">
                            <div className="flex items-center gap-2 text-xs font-medium">
                              <Phone className="w-3.5 h-3.5 text-primary" />
                              <span onClick={(e) => copyPhone(e, app)} className="hover:text-primary transition-colors cursor-pointer font-bold">{app.phone}</span>
                            </div>
                          </TableCell>
                        )}
                        <TableCell className="align-middle text-[10px] font-bold text-muted-foreground uppercase">{app.type}</TableCell>
                        {expanded && (
                          <TableCell className="align-middle">
                            <div className="flex items-center gap-2 text-xs font-semibold"><Box className="w-3.5 h-3.5 text-accent" /> {app.product || 'N/A'}</div>
                          </TableCell>
                        )}
                        <TableCell className="align-middle">
                          <div className="flex flex-col gap-1.5">
                            <span className={cn("text-[10px] font-bold uppercase", appToday ? "text-primary" : "text-muted-foreground")}>{formatDate(app.date)}</span>
                            {appToday && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => handleToggleConfirmation(e, app)}
                                className={cn(
                                  "h-6 px-2 text-[9px] font-bold uppercase border rounded-full",
                                  app.isConfirmed ? "bg-green-500/10 text-green-600" : "bg-orange-500/10 text-orange-600"
                                )}
                              >
                                {app.isConfirmed ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                                {app.isConfirmed ? 'Confirmado' : 'Confirmar'}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="align-middle">
                          <div className="flex items-center gap-1.5 text-accent font-bold text-[10px] bg-accent/5 w-fit px-2 py-1 rounded-md border border-accent/20">
                            <Clock className="w-3 h-3" /> {format12hTime(app.time)}
                          </div>
                        </TableCell>
                        <TableCell className="align-middle text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            {appToday && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/40 hover:text-green-500" onClick={(e) => handleOpenFinalize(e, app)}>
                                <CheckIcon className="w-4 h-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/40 hover:text-primary transition-colors" onClick={() => onSelect(app)}>
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="block md:hidden divide-y divide-border/10">
              {appointments.map((app) => {
                const appToday = isActuallyToday(app.date);
                const isSelected = activeId === app.id;
                return (
                  <div 
                    key={app.id} 
                    onClick={() => onSelect(app)}
                    className={cn(
                      "p-4 flex flex-col gap-3 transition-colors active:bg-muted/50",
                      appToday && "bg-primary/5",
                      isSelected && "bg-primary/10"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base leading-tight text-foreground">{app.name}</h4>
                          <div className="flex gap-1">
                            {app.prospectorName && (
                              <TooltipProvider>
                                <Tooltip delayDuration={0}>
                                  <TooltipTrigger asChild>
                                    <UserCog className="w-3 h-3 text-blue-500" />
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="text-[10px] font-bold">
                                    {app.prospectorName}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            {app.attendingExecutive && (
                              <TooltipProvider>
                                <Tooltip delayDuration={0}>
                                  <TooltipTrigger asChild>
                                    <UserCheck className="w-3 h-3 text-purple-500" />
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="text-[10px] font-bold">
                                    {app.attendingExecutive}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{app.type} • {app.product}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="text-[10px] font-black text-accent bg-accent/5 px-2 py-1 rounded border border-accent/20">
                          {format12hTime(app.time)}
                        </div>
                        <span className={cn("text-[9px] font-bold uppercase", appToday ? "text-primary" : "text-muted-foreground")}>
                          {formatDate(app.date)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-[10px] font-bold uppercase gap-2 flex-1 border-primary/20 bg-primary/5 text-primary rounded-full"
                        onClick={(e) => copyPhone(e, app)}
                      >
                        <Phone className="w-3 h-3" /> Llamar
                      </Button>
                      
                      {appToday && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={cn(
                              "h-8 text-[10px] font-bold uppercase flex-1 border-dashed rounded-full",
                              app.isConfirmed ? "bg-green-500/10 text-green-600 border-green-500/30" : "bg-orange-500/10 text-orange-600 border-orange-500/30"
                            )}
                            onClick={(e) => handleToggleConfirmation(e, app)}
                          >
                            {app.isConfirmed ? 'Confirmado' : 'Confirmar'}
                          </Button>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="h-8 text-[10px] font-bold uppercase gap-2 flex-1 border border-border/50 rounded-full"
                            onClick={(e) => handleOpenFinalize(e, app)}
                          >
                            <CheckIcon className="w-3 h-3 text-green-600" /> Finalizar
                          </Button>
                        </>
                      )}
                      
                      {!appToday && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground/40 rounded-full"
                          onClick={(e) => { e.stopPropagation(); onSelect(app); }}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>

      <div className="flex flex-wrap justify-center sm:justify-end gap-2 sm:gap-3 pt-2 shrink-0 pb-16">
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyAllTodayAppointments} 
                className="text-[10px] font-bold uppercase border-blue-500/40 bg-blue-500/5 text-blue-600 h-9 gap-2 px-3 sm:px-4 flex-1 sm:flex-none rounded-full"
              >
                <ClipboardList className="w-4 h-4" /> <span>Citas Hoy</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-[10px]">
              Copia el listado de hoy para WhatsApp
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyAllTomorrowAppointments} 
                className="text-[10px] font-bold uppercase border-accent/40 bg-accent/5 text-accent h-9 gap-2 px-3 sm:px-4 flex-1 sm:flex-none rounded-full"
              >
                <ClipboardList className="w-4 h-4" /> <span>Citas Mañana</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-[10px]">
              Copia el listado de mañana para WhatsApp
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <AlertDialog open={!!confirmingApp} onOpenChange={(o) => !o && setConfirmingApp(null)}>
        <AlertDialogContent className="bg-background border-border rounded-[2rem] text-foreground">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-primary/20 rounded-2xl"><AlertCircle className="w-6 h-6 text-primary" /></div>
              <AlertDialogTitle className="text-xl font-black uppercase tracking-tighter">Asistencia</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-muted-foreground font-medium">
              ¿Confirmas que el cliente <strong>{confirmingApp?.name}</strong> asistirá hoy?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-4">
            <AlertDialogCancel className="bg-muted/20 border-border text-foreground rounded-full h-11 px-6 text-xs font-bold uppercase">No</AlertDialogCancel>
            <AlertDialogAction onClick={processConfirmation} className="bg-primary hover:bg-primary/80 text-primary-foreground rounded-full h-11 px-8 text-xs font-black uppercase shadow-lg">
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!finalizingApp} onOpenChange={(o) => !o && setFinalizingApp(null)}>
        <DialogContent 
          className="sm:max-w-[550px] bg-background border-border shadow-2xl rounded-[2.5rem] p-0 overflow-hidden z-[160]"
        >
          <DialogHeader className="bg-green-500/5 p-8 border-b border-green-500/10">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-green-600 text-white rounded-2xl shadow-xl">
                  <CheckIcon className="w-6 h-6" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-foreground leading-none">Finalizar</DialogTitle>
                  <DialogDescription className="text-[10px] font-bold uppercase text-green-600 tracking-widest mt-1">
                    {finalizingApp?.name}
                  </DialogDescription>
                </div>
              </div>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full bg-muted/20 text-foreground">
                  <X className="w-5 h-5" />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>
          
          <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto scrollbar-thin pb-24">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block text-center">Resultado Final</Label>
              <Select value={finalStatus} onValueChange={(v) => setFinalStatus(v as AppointmentStatus)}>
                <SelectTrigger className="w-full h-14 bg-muted/10 border-border text-foreground text-lg font-bold rounded-2xl">
                  <SelectValue placeholder="Selecciona..." />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  <SelectItem value="Asistencia" className="focus:bg-primary/20">👤 Asistencia (Visto)</SelectItem>
                  <SelectItem value="Cierre" className="focus:bg-green-500/20">💰 CIERRE (VENTA) ✨</SelectItem>
                  <SelectItem value="Apartado" className="focus:bg-blue-500/20">📑 Apartado (Reserva)</SelectItem>
                  <SelectItem value="No asistencia" className="focus:bg-destructive/20">❌ No asistencia</SelectItem>
                  <SelectItem value="Reagendó" className="focus:bg-primary/20">📅 Reagendó</SelectItem>
                  <SelectItem value="Continuación en otra cita" className="focus:bg-primary/20">🔄 Continuación</SelectItem>
                  <SelectItem value="Reembolso" className="focus:bg-orange-500/20">💸 Reembolso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {finalStatus === 'Cierre' && (
              <div className="p-6 bg-green-500/5 border-2 border-green-500/20 rounded-[2rem] space-y-6 animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-3 border-b border-green-500/10 pb-4">
                  <Coins className="w-5 h-5 text-green-600" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600">Finanzas</span>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Crédito Final</Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-green-600">$</span>
                      <Input 
                        type="text" 
                        value={creditInput} 
                        onChange={e => handleCreditChange(e.target.value)}
                        className="h-14 pl-10 bg-background border-green-500/20 text-2xl font-black text-foreground rounded-xl"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Part. %</Label>
                      <div className="relative">
                        <Input 
                          type="number"
                          max={100}
                          value={finalCommissionPercent || ''} 
                          onChange={e => setFinalCommissionPercent(parseFloat(e.target.value) || 0)}
                          className="h-11 pr-8 bg-background border-green-500/20 text-lg font-black text-foreground rounded-xl"
                          placeholder="100"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-green-600">%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Neto (91%)</Label>
                      <div className="h-11 flex items-center px-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                        <span className="text-lg font-black text-green-600 truncate">{formatCurrency(calculatedCommission)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                <MessageSquare className="w-4 h-4 text-primary" /> Notas Finales
              </Label>
              <Textarea 
                placeholder="Escribe acuerdos o detalles..."
                className="bg-muted/10 border-border min-h-[120px] resize-none text-sm text-foreground font-medium p-4 rounded-2xl"
                value={finalNotes}
                onChange={(e) => setFinalNotes(e.target.value)}
              />
            </div>

            <Collapsible open={showExecutiveSection} onOpenChange={setShowExecutiveSection}>
              <CollapsibleTrigger asChild>
                <Button type="button" variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 px-0 w-full justify-between">
                  <span className="flex items-center"><UserCheck className="w-4 h-4 mr-2" /> ¿Atendió otro ejecutivo?</span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", showExecutiveSection && "rotate-180")} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 animate-in fade-in slide-in-from-top-2">
                <div className="p-4 border rounded-2xl bg-purple-500/5 border-purple-500/10">
                  <Label className="text-[9px] font-bold uppercase text-purple-600/70 dark:text-purple-400/70 mb-2 block">Nombre del Ejecutivo</Label>
                  <Input 
                    placeholder="Escribe el nombre..."
                    className="bg-background border-purple-500/20 h-11 text-foreground font-bold"
                    value={attendingExecutive}
                    onChange={(e) => setAttendingExecutive(e.target.value)}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <DialogFooter className="p-8 border-t border-border/10 bg-primary/5 flex flex-row gap-4">
            <Button variant="ghost" onClick={() => setFinalizingApp(null)} className="h-12 px-6 font-black uppercase text-[10px] text-muted-foreground flex-1 rounded-full">Cancelar</Button>
            <Button onClick={handleSaveFinalization} className="bg-green-600 hover:bg-green-700 text-white h-12 px-10 font-black uppercase text-[10px] shadow-xl shadow-green-600/20 rounded-full gap-2 flex-[2] transition-all active:scale-95">
              <Save className="w-4 h-4" /> Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

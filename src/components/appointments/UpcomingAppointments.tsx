
"use client"

import React, { useState } from 'react';
import { Appointment, AppointmentStatus, getCommissionPaymentDate } from '@/services/appointment-service';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Clock, Calendar, CheckCircle2, AlertCircle, 
  CheckCircle, ClipboardCheck, Phone, Box, ChevronRight, 
  Trash2, RotateCcw, Archive, CheckCircle as CheckIcon,
  Save, MessageSquare, Coins, Percent, Info, UserCog, UserCheck
} from "lucide-react";
import { parseISO, isToday, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  archiveAppointment,
  unarchiveAppointment,
  activeId,
  expanded = false,
  theme = 'corporativo',
  onCelebrate
}: Props) {
  const [archiveConfirmId, setArchiveConfirmId] = useState<string | null>(null);
  const [confirmingApp, setConfirmingApp] = useState<Appointment | null>(null);
  const [finalizingApp, setFinalizingApp] = useState<Appointment | null>(null);
  
  const [finalStatus, setFinalStatus] = useState<AppointmentStatus>('Asistencia');
  const [finalNotes, setFinalNotes] = useState('');
  const [finalCreditAmount, setFinalCreditAmount] = useState<number>(0);
  const [creditInput, setCreditInput] = useState('');
  const [finalCommissionPercent, setFinalCommissionPercent] = useState<number>(100);
  const [attendingExecutive, setAttendingExecutive] = useState('');

  const { toast } = useToast();

  const isActuallyToday = (dateStr: string) => isToday(parseISO(dateStr));

  const formatWithCommas = (val: string) => {
    const num = val.replace(/[^0-9]/g, '');
    if (!num) return '';
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleCreditChange = (val: string) => {
    const formatted = formatWithCommas(val);
    setCreditInput(formatted);
    setFinalCreditAmount(parseInt(formatted.replace(/,/g, '')) || 0);
  };

  const handleConfirmArchive = () => {
    if (archiveConfirmId) {
      const app = appointments.find(a => a.id === archiveConfirmId);
      archiveAppointment(archiveConfirmId);
      toast({
        title: "Cita archivada",
        description: `${app?.name} se ha movido a archivadas.`,
      });
      setArchiveConfirmId(null);
    }
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

  const handleToggleConfirmation = (e: React.MouseEvent, app: Appointment) => {
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

  const handleOpenFinalize = (e: React.MouseEvent, app: Appointment) => {
    e.stopPropagation();
    setFinalizingApp(app);
    setFinalStatus('Asistencia');
    setFinalNotes(app.notes || '');
    const amount = app.finalCreditAmount || 0;
    setFinalCreditAmount(amount);
    setCreditInput(amount > 0 ? amount.toLocaleString('en-US') : '');
    setFinalCommissionPercent(app.commissionPercent || 100);
    setAttendingExecutive(app.attendingExecutive || '');
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

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(Math.round(val));
  };

  const calculatedCommission = (finalCreditAmount * 0.007 * (finalCommissionPercent / 100)) * 0.91;

  const copyPhone = (e: React.MouseEvent, app: Appointment) => {
    e.stopPropagation();
    onHighlight(app);
    navigator.clipboard.writeText(app.phone).then(() => {
      toast({
        title: "Número copiado",
        description: `${app.name}: ${app.phone} listo para usar.`,
      });
    });
  };

  const copyDailyReport = () => {
    const todayTotal = allAppointments.filter(a => isActuallyToday(a.date) && !a.isArchived).length;
    const tomorrowTotal = allAppointments.filter(a => {
      if (a.isArchived) return false;
      const d = parseISO(a.date);
      const tomorrow = addDays(new Date(), 1);
      return d.getDate() === tomorrow.getDate() && d.getMonth() === tomorrow.getMonth() && d.getFullYear() === tomorrow.getFullYear();
    }).length;

    const reportText = `✅ Citas para hoy: *${todayTotal}*
✅ Citas para mañana: *${tomorrowTotal}*`;

    navigator.clipboard.writeText(reportText).then(() => {
      toast({
        title: "Reporte diario copiado",
        description: "Agenda de hoy y mañana lista para enviar.",
      });
    });
  };

  return (
    <div className="space-y-4 flex flex-col h-full">
      <div className={cn(
        "border rounded-xl overflow-hidden relative backdrop-blur-sm bg-card/20 flex flex-col",
        !expanded ? "h-[400px]" : "h-full flex-1"
      )}>
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/10 h-full">
            <Calendar className="w-16 h-16 mb-4 opacity-10" />
            <p className="text-sm font-bold uppercase tracking-widest opacity-40">No hay citas en esta lista</p>
          </div>
        ) : (
          <ScrollArea className="flex-1 scrollbar-thin">
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
                              <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="p-1 rounded-md bg-blue-500/10 hover:bg-blue-500/20 transition-colors cursor-help">
                                      <UserCog className="w-3.5 h-3.5 text-blue-500" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="shadow-xl border-border bg-card p-3">
                                    <div className="space-y-1">
                                      <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Prospectado por:</p>
                                      <p className="text-xs font-black text-blue-600">{app.prospectorName}</p>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            {app.attendingExecutive && (
                              <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="p-1 rounded-md bg-purple-500/10 hover:bg-purple-500/20 transition-colors cursor-help">
                                      <UserCheck className="w-3.5 h-3.5 text-purple-500" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="shadow-xl border-border bg-card p-3">
                                    <div className="space-y-1">
                                      <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Atendido por:</p>
                                      <p className="text-xs font-black text-purple-600">{app.attendingExecutive}</p>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </div>
                        {!expanded && (
                          <div className="text-[10px] text-muted-foreground inline-flex items-center gap-1 mt-0.5">
                            <Phone className="w-2.5 h-2.5 ml-4" /> 
                            <span 
                              onClick={(e) => copyPhone(e, app)} 
                              className="hover:text-primary transition-colors cursor-pointer font-medium"
                            >
                              {app.phone}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      {expanded && (
                        <TableCell className="align-middle">
                          <div className="flex items-center gap-2 text-xs font-medium">
                            <div className="p-1.5 rounded-lg bg-primary/10 text-primary"><Phone className="w-3.5 h-3.5" /></div>
                            <span 
                              onClick={(e) => copyPhone(e, app)} 
                              className="hover:text-primary transition-colors cursor-pointer font-bold"
                            >
                              {app.phone}
                            </span>
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
                                "h-6 px-2 text-[9px] font-bold uppercase border transition-all",
                                app.isConfirmed 
                                  ? "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20" 
                                  : "bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/20 animate-pulse"
                              )}
                            >
                              {app.isConfirmed ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" /> Confirmado
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-3 h-3 mr-1" /> Confirmar
                                </>
                              )}
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
                            <TooltipProvider delayDuration={0}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-muted-foreground/40 hover:text-green-500 hover:bg-green-500/10 transition-colors"
                                    onClick={(e) => handleOpenFinalize(e, app)}
                                  >
                                    <CheckIcon className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-card border-border shadow-xl text-[10px] font-bold">
                                  FINALIZAR CONSULTA
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
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
          </ScrollArea>
        )}
      </div>
      <div className="flex flex-wrap justify-end gap-3 pt-2 shrink-0">
        <Button variant="outline" size="sm" onClick={copyDailyReport} className="text-[10px] font-bold uppercase border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 h-9 gap-2 px-4">
          <ClipboardCheck className="w-4 h-4" /> Reporte Diario
        </Button>
      </div>

      <AlertDialog open={!!confirmingApp} onOpenChange={(o) => !o && setConfirmingApp(null)}>
        <AlertDialogContent className="z-[160] border-border">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <AlertCircle className="w-6 h-6 text-primary" />
              </div>
              <AlertDialogTitle className="text-foreground">Confirmar Asistencia</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-muted-foreground">
              ¿Confirmas que el cliente <strong>{confirmingApp?.name}</strong> asistirá a su cita el día de hoy? Esta acción se reflejará en tus estadísticas de cierre.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-muted">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={processConfirmation} className="bg-primary hover:bg-primary/90 text-white">
              Sí, confirmar asistencia
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!finalizingApp} onOpenChange={(o) => !o && setFinalizingApp(null)}>
        <DialogContent className="sm:max-w-[500px] border-green-200 bg-card shadow-2xl z-[160] max-h-[90vh] overflow-y-auto scrollbar-thin">
          <DialogHeader className="bg-green-500/5 p-4 -m-6 mb-4 border-b border-green-500/20 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-xl">
                <CheckIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <DialogTitle className="text-foreground">Finalizar Consulta</DialogTitle>
                <DialogDescription className="text-muted-foreground text-xs">Registrando resultado para {finalizingApp?.name}</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest block text-center">Resultado de la cita</Label>
              <select 
                value={finalStatus} 
                onChange={(e) => setFinalStatus(e.target.value as AppointmentStatus)}
                className="w-full h-11 px-3 rounded-md bg-muted/20 border border-border/40 focus:ring-green-500 text-sm"
              >
                <option value="Asistencia">👤 Asistencia (Visto)</option>
                <option value="Cierre">💰 CIERRE (VENTA) ✨</option>
                <option value="Apartado">📑 Apartado (Reserva)</option>
                <option value="No asistencia">❌ No asistencia</option>
                <option value="Reagendó">📅 Reagendó</option>
                <option value="Continuación en otra cita">🔄 Continuación</option>
                <option value="Reembolso">💸 Reembolso</option>
              </select>
            </div>

            {finalStatus === 'Cierre' && (
              <div className="p-6 bg-green-500/5 border-2 border-green-500/20 rounded-xl space-y-6 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-center gap-2 border-b border-green-500/10 pb-3">
                  <Coins className="w-4 h-4 text-green-600" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-green-700">Configuración Financiera</span>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2 text-center">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground block">
                      Monto de Crédito Final
                    </Label>
                    <div className="relative max-w-[240px] mx-auto">
                      <span className="absolute left-4 top-2.5 text-xs font-bold text-green-600">$</span>
                      <Input 
                        type="text" 
                        value={creditInput} 
                        onChange={e => handleCreditChange(e.target.value)}
                        className="h-10 pl-8 pr-4 bg-background border-green-500/30 text-sm font-black text-center focus:ring-green-500"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-center border-t border-green-500/10 pt-4">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground block">Participación en Comisión</Label>
                    <div className="relative max-w-[120px] mx-auto">
                      <Input 
                        type="number"
                        max={100}
                        value={finalCommissionPercent || ''} 
                        onChange={e => setFinalCommissionPercent(parseFloat(e.target.value) || 0)}
                        className="h-10 pr-8 bg-background border-green-500/30 text-sm font-black text-center focus:ring-green-500"
                        placeholder="100"
                      />
                      <span className="absolute right-4 top-2.5 text-xs font-bold text-green-600">%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-green-500/20 flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold uppercase text-muted-foreground">Comisión Proyectada (Neto):</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild><Info className="w-3.5 h-3.5 text-muted-foreground/40 cursor-help" /></TooltipTrigger>
                        <TooltipContent className="text-[10px] z-[300]">Incluye retención del 9% de impuesto sobre el 0.7% del crédito.</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="text-2xl font-black text-green-600 tracking-tight">{formatCurrency(calculatedCommission)}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                <MessageSquare className="w-3.5 h-3.5" /> Notas del resultado
              </Label>
              <Textarea 
                placeholder="Escribe aquí los acuerdos, dudas o detalles del cierre..."
                className="bg-muted/10 border-border/40 min-h-[120px] resize-none text-sm"
                value={finalNotes}
                onChange={(e) => setFinalNotes(e.target.value)}
              />
            </div>

            <div className="space-y-2 border-t border-border/10 pt-4">
              <Label className="flex items-center gap-2 text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                <UserCheck className="w-3.5 h-3.5 text-purple-500" /> Ejecutivo que atendió (Opcional)
              </Label>
              <Input 
                placeholder="Nombre del ejecutivo que dio atención..."
                className="bg-muted/10 border-border/40 h-10 text-sm"
                value={attendingExecutive}
                onChange={(e) => setAttendingExecutive(e.target.value)}
              />
              <p className="text-[9px] text-muted-foreground/60 italic">Solo rellena este campo si la atención NO fue dada por ti.</p>
            </div>
          </div>

          <DialogFooter className="gap-2 mt-4 shrink-0">
            <Button variant="ghost" onClick={() => setFinalizingApp(null)} className="h-11 px-6 font-bold uppercase text-xs">Cancelar</Button>
            <Button onClick={handleSaveFinalization} className="bg-green-600 hover:bg-green-700 text-white h-11 flex-1 font-bold shadow-lg gap-2">
              <Save className="w-4 h-4" /> Guardar Resultado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

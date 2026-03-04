"use client"

import React, { useState } from 'react';
import { Appointment, AppointmentStatus, getCommissionPaymentDate } from '@/services/appointment-service';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  MessageSquare, 
  ChevronDown, 
  Phone, 
  Box, 
  FileText, 
  ChevronRight,
  ShieldAlert,
  UserCog,
  CheckCircle2,
  Trash2,
  Archive,
  RotateCcw,
  Coins,
  Calendar,
  Percent,
  UserCheck
} from "lucide-react";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { format, isToday, parseISO, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  appointments: Appointment[];
  onSelect: (app: Appointment) => void;
  onHighlight: (app: Appointment) => void;
  archiveAppointment: (id: string) => void;
  unarchiveAppointment: (id: string) => void;
  formatDate: (date: string) => string;
  format12hTime: (time: string) => string;
  activeId?: string | null;
  expanded?: boolean;
  visibleCount: number;
  setVisibleCount: (val: number | ((p: number) => number)) => void;
}

export default function PastAppointments({ 
  appointments, 
  onSelect, 
  onHighlight,
  archiveAppointment,
  unarchiveAppointment,
  formatDate, 
  format12hTime, 
  activeId, 
  expanded = false,
  visibleCount,
  setVisibleCount
}: Props) {
  const { toast } = useToast();

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/10 h-full rounded-xl border border-dashed border-border/50">
        <MessageSquare className="w-16 h-16 mb-4 opacity-10" />
        <p className="text-sm font-bold uppercase tracking-widest opacity-40">No hay registros en esta lista</p>
      </div>
    );
  }

  const getStatusColor = (status?: AppointmentStatus) => {
    switch (status) {
      case 'Cierre': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'Apartado': return 'text-green-100/90 bg-green-500/20 border-green-400/30';
      case 'No asistencia': return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'Reagendó': return 'text-primary bg-primary/10 border-primary/20';
      case 'Asistencia': return 'text-blue-600 bg-blue-600/10 border-blue-600/20 font-bold';
      case 'Reembolso': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'Continuación en otra cita': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-muted-foreground bg-muted/10 border-border/20';
    }
  };

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

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(Math.round(val));
  };

  const visibleAppointments = appointments.slice(0, visibleCount);

  return (
    <div className="space-y-4 flex flex-col h-full">
      <div className={cn(
        "border rounded-xl overflow-hidden relative backdrop-blur-sm bg-card/10 flex flex-col",
        !expanded ? "h-[400px]" : "h-full flex-1"
      )}>
        <ScrollArea className="flex-1 scrollbar-thin">
          <Table className="border-collapse separate border-spacing-0">
            <TableHeader className="sticky top-0 z-30 bg-card shadow-sm border-b">
              <TableRow className="hover:bg-transparent">
                <TableHead className={cn("bg-card pl-4", expanded ? "w-[180px]" : "")}>Nombre / Teléfono</TableHead>
                {expanded && <TableHead className="bg-card w-[140px]">Contacto</TableHead>}
                <TableHead className="bg-card">Motivo</TableHead>
                {expanded && <TableHead className="bg-card">Producto</TableHead>}
                <TableHead className="bg-card">Fecha / Hora</TableHead>
                {expanded && <TableHead className="bg-card w-[300px]">Notas rápidas</TableHead>}
                <TableHead className={cn("bg-card", !expanded ? "w-[160px]" : "w-[200px]")}>Resultado</TableHead>
                <TableHead className="bg-card w-24 text-center"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleAppointments.map((app) => {
                const appToday = isToday(parseISO(app.date));
                const isSelected = activeId === app.id;
                const isCierre = app.status === 'Cierre';
                const isApartado = app.status === 'Apartado';
                const isCommissionPaid = isCierre && app.commissionStatus === 'Pagada';
                const isPending = isCierre && app.commissionStatus !== 'Pagada';
                
                const paymentDate = getCommissionPaymentDate(app.date);
                // Solo cierres tienen advertencia de pago vencido
                const isCommissionOverdue = isCierre && isPending && isBefore(paymentDate, new Date());

                const commissionValue = isCierre 
                  ? ((app.finalCreditAmount || 0) * 0.007 * ((app.commissionPercent || 0) / 100)) * 0.91
                  : 0;
                
                return (
                  <TableRow 
                    key={app.id} 
                    onClick={() => onSelect(app)}
                    className={cn(
                      "hover:bg-primary/10 transition-colors cursor-pointer group relative h-16",
                      appToday && "bg-primary/10",
                      isSelected && "bg-primary/20 z-20"
                    )}
                  >
                    <TableCell className="align-middle pl-4">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-sm text-foreground">{app.name}</div>
                        <div className="flex gap-1">
                          {app.prospectorName && (
                            <TooltipProvider delayDuration={0}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="p-1 rounded-md bg-blue-500/10 hover:bg-blue-500/20 transition-colors cursor-help">
                                    <UserCog className="w-3.5 h-3.5 text-blue-500" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="shadow-xl border-border bg-card p-3 border-white">
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
                                <TooltipContent className="shadow-xl border-border bg-card p-3 border-white">
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
                          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                            <Phone className="w-3.5 h-3.5" />
                          </div>
                          <span 
                            onClick={(e) => copyPhone(e, app)} 
                            className="hover:text-primary transition-colors cursor-pointer font-bold"
                          >
                            {app.phone}
                          </span>
                        </div>
                      </TableCell>
                    )}

                    <TableCell className="text-[10px] text-muted-foreground uppercase font-bold align-middle">
                      {app.type}
                    </TableCell>

                    {expanded && (
                      <TableCell className="align-middle">
                        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                          <Box className="w-3.5 h-3.5 text-accent" /> {app.product || 'N/A'}
                        </div>
                      </TableCell>
                    )}

                    <TableCell className="text-muted-foreground text-[10px] uppercase font-bold align-middle">
                      <div className="leading-tight">{formatDate(app.date)}</div>
                      <div className="text-accent/80">{format12hTime(app.time)}</div>
                    </TableCell>

                    {expanded && (
                      <TableCell className="align-middle">
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {app.notes || 'Sin anotaciones.'}
                        </p>
                      </TableCell>
                    )}

                    <TableCell className="align-middle">
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 cursor-help">
                              <div className={cn(
                                "text-[9px] uppercase font-bold px-2 py-1 rounded-full border w-fit text-center min-w-[80px]",
                                getStatusColor(app.status)
                              )}>
                                {app.status || 'N/A'}
                              </div>
                              
                              {isCommissionPaid && (
                                <div className="p-1 bg-green-500/20 rounded-full border border-green-500/30">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                </div>
                              )}

                              {isCommissionOverdue && (
                                <ShieldAlert className="w-3.5 h-3.5 text-destructive animate-pulse" />
                              )}
                            </div>
                          </TooltipTrigger>
                          {isCierre && (
                            <TooltipContent side="top" className="bg-card border-border shadow-xl p-3 min-w-[180px] z-[300] border-white">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between border-b border-border/10 pb-1">
                                  <span className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest">Detalle Financiero (Neto)</span>
                                  <span className={cn(
                                    "text-[8px] font-bold px-1.5 py-0.5 rounded-full border",
                                    isCommissionPaid ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                                  )}>
                                    {app.commissionStatus || 'Pendiente'}
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-1.5">
                                      <Coins className="w-3 h-3 text-accent" />
                                      <span className="text-[9px] text-muted-foreground font-medium uppercase">Monto Ganado:</span>
                                    </div>
                                    <span className="text-xs font-bold text-accent">{formatCurrency(commissionValue)}</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-1.5">
                                      <Percent className="w-3 h-3 text-primary" />
                                      <span className="text-[9px] text-muted-foreground font-medium uppercase">Participación:</span>
                                    </div>
                                    <span className="text-[10px] font-bold">{app.commissionPercent}%</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-4 pt-1 border-t border-border/10">
                                    <div className="flex items-center gap-1.5">
                                      <Calendar className="w-3 h-3 text-muted-foreground" />
                                      <span className="text-[9px] text-muted-foreground font-medium uppercase">Fecha Pago:</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-primary">
                                      {format(paymentDate, "d 'de' MMM", { locale: es })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>

                    <TableCell className="align-middle text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {app.isArchived ? (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground/40 hover:text-primary hover:bg-primary/10 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              unarchiveAppointment(app.id);
                              toast({ title: "Cita restaurada", description: `${app.name} ha vuelto a activas.` });
                            }}
                            title="Restaurar"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        ) : null}
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
      </div>
      
      {visibleCount < appointments.length && (
        <div className="flex justify-center shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setVisibleCount((prev: number) => prev + 25)}
            className="text-[10px] font-bold uppercase tracking-widest border-dashed hover:bg-primary/10 backdrop-blur-md h-9 px-6"
          >
            <ChevronDown className="mr-2 h-4 w-4" /> Cargar más historial
          </Button>
        </div>
      )}
    </div>
  );
}

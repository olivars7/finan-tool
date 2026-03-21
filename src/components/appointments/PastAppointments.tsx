
"use client"

import React, { useState } from 'react';
import { Appointment, AppointmentStatus, getCommissionPaymentDate } from '@/services/appointment-service';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  MessageSquare, 
  ChevronDown, 
  Phone, 
  Box, 
  ChevronRight,
  ShieldAlert,
  UserCog,
  CheckCircle2,
  Trash2,
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
        <p className="text-sm font-bold uppercase tracking-widest opacity-40">No hay registros</p>
      </div>
    );
  }

  const getStatusColor = (status?: AppointmentStatus) => {
    switch (status) {
      case 'Cierre': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'Apartado': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'No asistencia': return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'Reagendó': return 'text-primary bg-primary/10 border-primary/20';
      case 'Asistencia': return 'text-blue-600 bg-blue-600/10 border-blue-600/20 font-bold';
      case 'Reembolso': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'Continuación en otra cita': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-muted-foreground bg-muted/10 border-border/20';
    }
  };

  const copyPhone = (e: React.MouseEvent | React.TouchEvent, app: Appointment) => {
    e.stopPropagation();
    onHighlight(app);
    navigator.clipboard.writeText(app.phone).then(() => {
      toast({ title: "Número copiado", description: `${app.name}: ${app.phone}` });
    });
  };

  const visibleAppointments = appointments.slice(0, visibleCount);

  return (
    <div className="space-y-4 flex flex-col h-full">
      <div className={cn(
        "border rounded-xl overflow-hidden relative backdrop-blur-sm bg-card/10 flex flex-col",
        !expanded ? "h-[400px]" : "h-full flex-1"
      )}>
        <ScrollArea className="flex-1 scrollbar-thin">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table className="border-collapse separate border-spacing-0">
              <TableHeader className="sticky top-0 z-30 bg-card shadow-sm border-b">
                <TableRow className="hover:bg-transparent">
                  <TableHead className={cn("bg-card pl-4", expanded ? "w-[180px]" : "")}>Nombre / Teléfono</TableHead>
                  {expanded && <TableHead className="bg-card w-[180px]">Contacto</TableHead>}
                  <TableHead className={cn("bg-card", expanded ? "w-[120px]" : "")}>Motivo</TableHead>
                  {expanded && <TableHead className="bg-card w-[130px]">Producto</TableHead>}
                  <TableHead className={cn("bg-card", expanded ? "w-[150px]" : "")}>Fecha / Hora</TableHead>
                  {expanded && <TableHead className="bg-card w-[180px]">Notas</TableHead>}
                  <TableHead className={cn("bg-card", !expanded ? "w-[160px]" : "w-[200px]")}>Resultado</TableHead>
                  <TableHead className="bg-card w-24 text-center"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleAppointments.map((app) => {
                  const isSelected = activeId === app.id;
                  const isCierre = app.status === 'Cierre';
                  const isCommissionPaid = isCierre && app.commissionStatus === 'Pagada';
                  const isPending = isCierre && app.commissionStatus !== 'Pagada';
                  const paymentDate = getCommissionPaymentDate(app.date);
                  const isCommissionOverdue = isCierre && isPending && isBefore(paymentDate, new Date());
                  
                  return (
                    <TableRow 
                      key={app.id} 
                      onClick={() => onSelect(app)}
                      className={cn(
                        "hover:bg-primary/10 transition-colors cursor-pointer group h-16",
                        isSelected && "bg-primary/20 z-20"
                      )}
                    >
                      <TableCell className="align-middle pl-4">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-sm text-foreground">{app.name}</div>
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
                            <span onClick={(e) => copyPhone(e, app)} className="hover:text-primary cursor-pointer font-medium">{app.phone}</span>
                          </div>
                        )}
                      </TableCell>
                      {expanded && (
                        <TableCell className="align-middle">
                          <div className="flex items-center gap-2 text-xs font-medium">
                            <Phone className="w-3.5 h-3.5 text-primary" />
                            <span onClick={(e) => copyPhone(e, app)} className="hover:text-primary cursor-pointer font-bold">{app.phone}</span>
                          </div>
                        </TableCell>
                      )}
                      <TableCell className="text-[10px] text-muted-foreground uppercase font-bold align-middle">{app.type}</TableCell>
                      {expanded && (
                        <TableCell className="align-middle">
                          <div className="flex items-center gap-2 text-xs font-semibold text-foreground"><Box className="w-3.5 h-3.5 text-accent" /> {app.product || 'N/A'}</div>
                        </TableCell>
                      )}
                      <TableCell className="text-muted-foreground text-[10px] uppercase font-bold align-middle">
                        <div>{formatDate(app.date)}</div>
                        <div className="text-accent/80">{format12hTime(app.time)}</div>
                      </TableCell>
                      {expanded && (
                        <TableCell className="align-middle">
                          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{app.notes || 'Sin notas.'}</p>
                        </TableCell>
                      )}
                      <TableCell className="align-middle">
                        <div className="flex items-center gap-2">
                          <div className={cn("text-[9px] uppercase font-bold px-2 py-1 rounded-full border min-w-[80px] text-center", getStatusColor(app.status))}>
                            {app.status || 'N/A'}
                          </div>
                          {isCommissionPaid && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                          {isCommissionOverdue && <ShieldAlert className="w-3.5 h-3.5 text-destructive animate-pulse" />}
                        </div>
                      </TableCell>
                      <TableCell className="align-middle text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/40" onClick={() => onSelect(app)}>
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

          {/* Mobile Card View */}
          <div className="block md:hidden divide-y divide-border/10">
            {visibleAppointments.map((app) => {
              const isSelected = activeId === app.id;
              const isCierre = app.status === 'Cierre';
              const isCommissionPaid = isCierre && app.commissionStatus === 'Pagada';
              return (
                <div 
                  key={app.id} 
                  onClick={() => onSelect(app)}
                  className={cn(
                    "p-4 flex flex-col gap-3 transition-colors active:bg-muted/50",
                    isSelected && "bg-primary/10"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base leading-tight">{app.name}</h4>
                        {isCommissionPaid && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                        <div className="flex gap-1 ml-1">
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
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">
                        {app.type} • {app.product || 'N/A'}
                      </p>
                    </div>
                    <div className={cn("text-[9px] uppercase font-bold px-2 py-1 rounded-full border h-fit", getStatusColor(app.status))}>
                      {app.status || 'N/A'}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-medium text-muted-foreground">
                      {formatDate(app.date)} • {format12hTime(app.time)}
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/40">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
      
      {visibleCount < appointments.length && (
        <div className="flex justify-center shrink-0">
          <Button variant="outline" size="sm" onClick={() => setVisibleCount((p: number) => p + 25)} className="text-[10px] font-bold uppercase tracking-widest h-9 px-6">
            Cargar más historial
          </Button>
        </div>
      )}
    </div>
  );
}

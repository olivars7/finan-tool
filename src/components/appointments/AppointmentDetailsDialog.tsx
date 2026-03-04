"use client"

import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Appointment, AppointmentStatus, AppointmentType, AppointmentProduct, getCommissionPaymentDate } from '@/services/appointment-service';
import { 
  User, Phone, Clock, Edit2, Save, Copy, ClipboardList, 
  CheckCircle2, Box, CalendarPlus, Receipt, Coins, 
  CalendarDays, UserCog, ChevronDown, History as HistoryIcon, 
  Info, Trash2, Archive, UserCheck
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { parseISO, format, isToday, isTomorrow, isYesterday, differenceInCalendarDays, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
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

interface Props {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (id: string, data: Partial<Appointment>) => void;
  onAdd: (app: Omit<Appointment, 'id'>) => void;
  archiveAppointment: (id: string) => void;
  formatFriendlyDate: (date: string) => string;
  format12hTime: (time: string) => string;
}

export default function AppointmentDetailsDialog({ 
  appointment, 
  open, 
  onOpenChange, 
  onEdit,
  onAdd,
  archiveAppointment,
  format12hTime
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [showEditProspector, setShowEditProspector] = useState(false);
  const [showEditExecutive, setShowEditExecutive] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [editData, setEditData] = useState<Partial<Appointment>>({});
  
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newProduct, setNewProduct] = useState<AppointmentProduct>('Casa');
  const [newType, setNewType] = useState<AppointmentType>('2da consulta');
  const [newAttendingExecutive, setNewAttendingExecutive] = useState('');
  const [newProspectorName, setNewProspectorName] = useState('');
  const [newProspectorPhone, setNewProspectorPhone] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    if (appointment) {
      setEditData(appointment);
      setShowEditProspector(!!appointment.prospectorName);
      setShowEditExecutive(!!appointment.attendingExecutive);
    }
  }, [appointment]);

  useEffect(() => {
    if (isRescheduling && appointment) {
      setNewName(appointment.name);
      setNewPhone(appointment.phone || '');
      setNewProduct(appointment.product || 'Casa');
      setNewNotes(appointment.notes || '');
      setNewType(appointment.status === 'Cierre' ? 'Seguimiento' : '2da consulta');
      setNewAttendingExecutive(appointment.attendingExecutive || '');
      setNewProspectorName(appointment.prospectorName || '');
      setNewProspectorPhone(appointment.prospectorPhone || '');
      setNewDate('');
      setNewTime('');
    }
  }, [isRescheduling, appointment]);

  if (!appointment) return null;

  const handleSave = () => {
    onEdit(appointment.id, editData);
    setIsEditing(false);
    toast({ title: "Guardado", description: "La información ha sido actualizada." });
  };

  const handleArchive = () => {
    archiveAppointment(appointment.id);
    setShowArchiveConfirm(false);
    onOpenChange(false);
    toast({ 
      title: "Cita archivada", 
      description: `${appointment.name} se ha movido a la papelera.` 
    });
  };

  const handleConfirmSecond = () => {
    if (!newDate || !newTime) {
      toast({ title: "Error", description: "Fecha y hora son obligatorias.", variant: "destructive" });
      return;
    }

    const isoDate = new Date(newDate + 'T12:00:00Z').toISOString();
    onAdd({
      name: newName,
      phone: newPhone,
      date: isoDate,
      time: newTime,
      type: newType,
      product: newProduct,
      notes: newNotes,
      prospectorName: newProspectorName || appointment.prospectorName,
      prospectorPhone: newProspectorPhone || appointment.prospectorPhone,
      attendingExecutive: newAttendingExecutive || appointment.attendingExecutive
    });

    setIsRescheduling(false);
    toast({ title: "Cita Agendada", description: `Nueva cita de ${newType} registrada para ${newName}.` });
  };

  const copyPhoneOnly = () => {
    if (!appointment.phone) return;
    navigator.clipboard.writeText(appointment.phone).then(() => {
      toast({
        title: "Número copiado",
        description: `${appointment.name}: ${appointment.phone} listo para usar.`,
      });
    });
  };

  const copyProspectorPhone = () => {
    if (!appointment.prospectorPhone) return;
    navigator.clipboard.writeText(appointment.prospectorPhone).then(() => {
      toast({
        title: "Prospectador copiado",
        description: `${appointment.prospectorName}: ${appointment.prospectorPhone} listo.`,
      });
    });
  };

  const copyToWhatsAppFormat = () => {
    const dateObj = parseISO(appointment.date);
    const dateFormatted = format(dateObj, "EEEE d 'de' MMMM yyyy", { locale: es });
    const capitalizedDate = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);
    const timeFormatted = format12hTime(appointment.time);
    
    const dateBold = `*${capitalizedDate}*`;
    const timeBold = `*${timeFormatted}*`;
    const confirmedBold = appointment.isConfirmed ? ' * (Confirmado)*' : '';

    const motivoLine = appointment.type === '1ra consulta' ? '' : `Motivo: *${appointment.type}*\n`;

    const text = `Cita: ${dateBold}
Nombre: *${appointment.name}*
${motivoLine}Producto: *${appointment.product || 'N/A'}*
Hora: ${timeBold}${confirmedBold}`;

    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "Copiado", description: "Datos de la cita listos para enviar." });
    });
  };

  const showCommissionPanel = appointment.status === 'Cierre' || appointment.status === 'Apartado';
  const commissionValue = ((editData.finalCreditAmount || 0) * 0.007 * ((editData.commissionPercent || 0) / 100)) * 0.91;

  const calculatePaymentDateText = (dateStr: string) => {
    const paymentDate = getCommissionPaymentDate(dateStr);
    const formatted = format(paymentDate, "EEEE d 'de' MMMM", { locale: es });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(Math.round(val));
  };

  const formatWithCommas = (val: string) => {
    const num = val.replace(/[^0-9.]/g, '');
    if (!num) return '';
    const parts = num.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const handleCommissionToggle = (checked: boolean) => {
    const newStatus = checked ? 'Pagada' : 'Pendiente';
    const updates: Partial<Appointment> = { commissionStatus: newStatus };
    
    if (checked && editData.status === 'Apartado') {
      updates.status = 'Cierre';
    }

    setEditData(prev => ({ ...prev, ...updates }));
    onEdit(appointment.id, updates);
    
    toast({ 
      title: updates.status === 'Cierre' ? "¡Venta Cerrada!" : (newStatus === 'Pagada' ? "Comisión Pagada" : "Comisión Pendiente"), 
      description: updates.status === 'Cierre' 
        ? `El apartado de ${appointment.name} ahora es Cierre tras recibir el pago.`
        : `Estatus actualizado para ${appointment.name}.` 
    });
  };

  const handleFinalCreditChange = (val: string) => {
    const cleanVal = val.replace(/,/g, '');
    const num = parseFloat(cleanVal) || 0;
    setEditData(prev => ({ ...prev, finalCreditAmount: num }));
  };

  const handleCommissionPercentChange = (val: string) => {
    let num = parseFloat(val) || 0;
    if (num > 100) num = 100;
    setEditData(prev => ({ ...prev, commissionPercent: num }));
  };

  const isCierre = appointment.status === 'Cierre';
  const appDate = startOfDay(parseISO(appointment.date));
  const today = startOfDay(new Date());
  const diffCalendar = differenceInCalendarDays(appDate, today);
  
  let headerTimeText = "";
  if (isToday(appDate)) {
    headerTimeText = "Hoy es el día de la cita";
  } else if (isTomorrow(appDate)) {
    headerTimeText = "La cita es mañana";
  } else if (isYesterday(appDate)) {
    headerTimeText = "La cita fue ayer";
  } else if (diffCalendar > 0) {
    headerTimeText = `Faltan ${diffCalendar} ${diffCalendar === 1 ? 'día' : 'días'} para la cita`;
  } else {
    headerTimeText = `Han pasado ${Math.abs(diffCalendar)} ${Math.abs(diffCalendar) === 1 ? 'día' : 'días'} desde la cita`;
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { 
      if(!o) {
        setIsEditing(false);
        onOpenChange(false);
      } else {
        onOpenChange(true);
      }
    }}>
      <DialogContent 
        className="sm:max-w-[550px] bg-card border-border p-0 shadow-xl backdrop-blur-md overflow-hidden flex flex-col max-h-[95vh]"
      >
        <DialogHeader className="px-6 py-3 border-b border-border/40 flex flex-row items-center justify-between bg-card/10 shrink-0">
          <DialogTitle className="text-lg font-headline font-bold text-foreground">
            {isEditing ? 'Editar Registro' : 'Detalles de la Cita'}
          </DialogTitle>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <>
                <Button 
                  onClick={copyToWhatsAppFormat}
                  variant="outline" 
                  size="sm"
                  className="h-7 px-2 text-[9px] border-primary/40 text-primary hover:bg-primary/5 font-bold uppercase backdrop-blur-md"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copiar datos
                </Button>
                <Button 
                  onClick={() => setShowArchiveConfirm(true)}
                  variant="ghost" 
                  size="sm"
                  className="h-7 px-2 text-[9px] font-bold uppercase text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Archivar
                </Button>
              </>
            )}
            <DialogClose className="h-7 w-7 flex items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive transition-colors group backdrop-blur-md border border-destructive/20">
              <span className="text-[10px] font-bold group-hover:text-white">✕</span>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 scrollbar-thin">
          {!isEditing && (
            <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg">
              <HistoryIcon className="w-4 h-4 text-primary" />
              <p className="text-xs font-bold text-primary">
                {headerTimeText}
              </p>
            </div>
          )}

          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Nombre</Label>
                  <Input value={editData.name || ''} onChange={e => setEditData({...editData, name: e.target.value})} className="h-8 bg-muted/20 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Teléfono</Label>
                  <Input value={editData.phone || ''} onChange={e => setEditData({...editData, phone: e.target.value})} className="h-8 bg-muted/20 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 border rounded-lg bg-blue-500/5 border-blue-500/20 space-y-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEditProspector(!showEditProspector)}
                    className="h-7 text-[10px] font-bold uppercase text-blue-600 hover:bg-blue-500/10 px-0 w-full justify-between"
                    type="button"
                  >
                    <span className="flex items-center"><UserCog className="w-3.5 h-3.5 mr-2" /> Prospectador</span>
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showEditProspector && "rotate-180")} />
                  </Button>

                  {showEditProspector && (
                    <div className="space-y-3 animate-in slide-in-from-top-2">
                      <div className="space-y-1">
                        <Label className="text-[9px] font-bold uppercase text-blue-600/60">Nombre</Label>
                        <Input 
                          value={editData.prospectorName || ''} 
                          onChange={e => setEditData({...editData, prospectorName: e.target.value})} 
                          className="h-8 bg-background border-blue-500/20 text-xs" 
                          placeholder="Ej. Juan Perez"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px] font-bold uppercase text-blue-600/60">Teléfono</Label>
                        <Input 
                          value={editData.prospectorPhone || ''} 
                          onChange={e => setEditData({...editData, prospectorPhone: e.target.value})} 
                          className="h-8 bg-background border-blue-500/20 text-xs" 
                          placeholder="664 000 0000"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 border rounded-lg bg-purple-500/5 border-purple-500/20 space-y-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEditExecutive(!showEditExecutive)}
                    className="h-7 text-[10px] font-bold uppercase text-purple-600 hover:bg-purple-500/10 px-0 w-full justify-between"
                    type="button"
                  >
                    <span className="flex items-center"><UserCheck className="w-3.5 h-3.5 mr-2" /> Ejecutivo</span>
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showEditExecutive && "rotate-180")} />
                  </Button>

                  {showEditExecutive && (
                    <div className="space-y-3 animate-in slide-in-from-top-2">
                      <div className="space-y-1">
                        <Label className="text-[9px] font-bold uppercase text-purple-600/60">Atendido por</Label>
                        <Input 
                          value={editData.attendingExecutive || ''} 
                          onChange={e => setEditData({...editData, attendingExecutive: e.target.value})} 
                          className="h-8 bg-background border-purple-500/20 text-xs" 
                          placeholder="Nombre del ejecutivo..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Motivo</Label>
                  <Select value={editData.type} onValueChange={(v) => setEditData({...editData, type: v as AppointmentType})}>
                    <SelectTrigger className="h-8 bg-muted/20 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1ra consulta">1ra consulta</SelectItem>
                      <SelectItem value="2da consulta">2da consulta</SelectItem>
                      <SelectItem value="cierre">Cierre</SelectItem>
                      <SelectItem value="Seguimiento">Seguimiento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Producto</Label>
                  <Select value={editData.product || 'Casa'} onValueChange={(v) => setEditData({...editData, product: v as AppointmentProduct})}>
                    <SelectTrigger className="h-8 bg-muted/20 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Casa">Casa</SelectItem>
                      <SelectItem value="Departamento">Departamento</SelectItem>
                      <SelectItem value="Terreno">Terreno</SelectItem>
                      <SelectItem value="Transporte">Transporte</SelectItem>
                      <SelectItem value="Préstamo">Préstamo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Estatus</Label>
                  <Select 
                    value={editData.status || 'Asistencia'} 
                    onValueChange={(v) => setEditData({...editData, status: v as AppointmentStatus, isConfirmed: true})}
                  >
                    <SelectTrigger className="h-8 bg-muted/20 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asistencia">👤 Asistencia</SelectItem>
                      <SelectItem value="Cierre">💰 CIERRE (VENTA) ✨</SelectItem>
                      <SelectItem value="Apartado">📑 Apartado</SelectItem>
                      <SelectItem value="No asistencia">❌ No asistencia</SelectItem>
                      <SelectItem value="Reagendó">📅 Reagendó</SelectItem>
                      <SelectItem value="Continuación en otra cita">🔄 Continuación</SelectItem>
                      <SelectItem value="Reembolso">💸 Reembolso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Fecha</Label>
                  <Input 
                    type="date" 
                    value={editData.date ? parseISO(editData.date).toISOString().split('T')[0] : ''} 
                    onChange={e => setEditData({...editData, date: new Date(e.target.value + 'T12:00:00Z').toISOString()})} 
                    className="h-8 bg-muted/20 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Hora</Label>
                  <Input type="time" value={editData.time || ''} onChange={e => setEditData({...editData, time: e.target.value})} className="h-8 bg-muted/20 text-sm" />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 bg-muted/10 p-4 rounded-xl border border-border/30 backdrop-blur-sm shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg"><User className="w-4 h-4 text-primary" /></div>
                <div className="flex-1">
                  <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Cliente</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold">{appointment.name}</p>
                    <div className="flex gap-1">
                      {appointment.prospectorName && <UserCog className="w-3 h-3 text-blue-500" />}
                      {appointment.attendingExecutive && <UserCheck className="w-3 h-3 text-purple-500" />}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div onClick={copyPhoneOnly} className="flex items-center gap-3 cursor-pointer group/phone">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover/phone:bg-primary/20 transition-colors"><Phone className="w-4 h-4 text-primary" /></div>
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Teléfono</p>
                    <p className="text-xs font-semibold group-hover/phone:text-primary transition-colors">{appointment.phone || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg"><ClipboardList className="w-4 h-4 text-accent" /></div>
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Motivo</p>
                    <p className="text-xs font-semibold">{appointment.type}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg"><Box className="w-4 h-4 text-primary" /></div>
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Producto</p>
                    <p className="text-xs font-semibold">{appointment.product || 'Casa'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg"><Clock className="w-4 h-4 text-primary" /></div>
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Hora</p>
                    <p className="text-xs font-semibold">{format12hTime(appointment.time)}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-border/10 pt-3">
                <div className="p-2 bg-primary/10 rounded-lg"><CalendarDays className="w-4 h-4 text-primary" /></div>
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Fecha Programada</p>
                  <p className="text-xs font-bold">
                    {format(parseISO(appointment.date), "EEEE d 'de' MMMM 'del' yyyy", { locale: es })}
                  </p>
                </div>
              </div>

              {appointment.prospectorName && (
                <div className="flex items-center gap-3 border-t border-border/10 pt-3 group/prospector">
                  <div className="p-2 bg-blue-500/10 rounded-lg"><UserCog className="w-4 h-4 text-blue-500" /></div>
                  <div className="flex-1">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Prospectado por</p>
                    <p className="text-xs font-bold">{appointment.prospectorName}</p>
                  </div>
                  {appointment.prospectorPhone && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={copyProspectorPhone} 
                      className="h-8 w-8 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10"
                    >
                      <Copy className="h-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              )}

              {appointment.attendingExecutive && (
                <div className="flex items-center gap-3 border-t border-border/10 pt-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg"><UserCheck className="w-4 h-4 text-purple-500" /></div>
                  <div className="flex-1">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Atendido por</p>
                    <p className="text-xs font-bold">{appointment.attendingExecutive}</p>
                  </div>
                </div>
              )}

              {appointment.status && (
                <div className="flex items-center gap-3 border-t border-border/20 pt-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg"><CheckCircle2 className="w-4 h-4 text-blue-600" /></div>
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Resultado</p>
                    <p className={cn(
                      "text-xs font-bold",
                      appointment.status === 'Asistencia' ? "text-blue-600" : "text-green-500"
                    )}>
                      {appointment.status}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {showCommissionPanel && (
            <div className="bg-card border-2 border-border/40 p-4 rounded-xl space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/20 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-accent/10 rounded-md"><Receipt className="w-3.5 h-3.5 text-accent" /></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Liquidación y Comisiones</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border",
                    (editData.commissionStatus || 'Pendiente') === 'Pagada' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                  )}>
                    {editData.commissionStatus || 'Pendiente'}
                  </span>
                  <Switch 
                    checked={(editData.commissionStatus || 'Pendiente') === 'Pagada'} 
                    onCheckedChange={handleCommissionToggle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="h-4 flex items-center">
                    <Label className="text-[9px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                      <Coins className="w-3 h-3" /> Crédito Final
                    </Label>
                  </div>
                  {isEditing ? (
                    <div className="relative flex items-center">
                      <span className="absolute left-2.5 text-[10px] font-bold text-muted-foreground">$</span>
                      <Input 
                        type="text" 
                        value={formatWithCommas(editData.finalCreditAmount?.toString() || '')} 
                        onChange={e => handleFinalCreditChange(e.target.value)}
                        className="h-8 pl-5 bg-muted/20 text-xs font-bold w-full"
                      />
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-foreground">{formatCurrency(appointment.finalCreditAmount || 0)}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <div className="h-4 flex items-center gap-1">
                    <Label className="text-[9px] font-bold uppercase text-muted-foreground">Participación</Label>
                    <TooltipProvider>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <Info className="w-3 h-3 text-muted-foreground/60 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[200px] text-[10px] leading-tight" side="top">
                          Define el porcentaje de la comisión total (0.7% del crédito) que te corresponde por este cierre.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  {isEditing ? (
                    <div className="relative flex items-center">
                      <Input 
                        type="number" 
                        max={100}
                        value={editData.commissionPercent || ''} 
                        onChange={e => handleCommissionPercentChange(e.target.value)}
                        className="h-8 pr-6 bg-muted/20 text-xs font-bold text-accent w-full"
                      />
                      <span className="absolute right-2.5 text-[10px] font-bold text-accent">%</span>
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-accent">{appointment.commissionPercent || 0}%</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-bold uppercase text-muted-foreground block">Valor Comisión (Neto)</span>
                    <TooltipProvider>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <Info className="w-3 h-3 text-muted-foreground/40 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="text-[10px] p-2 bg-card border-border shadow-xl" side="top">
                          Incluye retención del 9% de impuesto al monto ganado.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-sm font-bold text-accent">{formatCurrency(commissionValue)}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Label className="text-[9px] font-bold uppercase text-muted-foreground">Fecha de Pago</Label>
                    <TooltipProvider>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <Info className="w-3 h-3 text-muted-foreground/60 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[220px] text-[10px] leading-tight" side="top">
                          <p className="font-bold mb-1">Ciclo de Liquidación:</p>
                          Ventas de Domingo a Martes se pagan el viernes de la siguiente semana. Ventas de Miércoles a Sábado se pagan el viernes de la subsiguiente semana.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-[11px] font-bold text-primary">{calculatePaymentDateText(appointment.date)}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1.5 shrink-0 flex flex-col">
            <Label className="flex items-center gap-2 text-muted-foreground text-[10px] font-bold uppercase tracking-wider shrink-0 mb-1">📝 Notas del cliente</Label>
            <Textarea 
              placeholder="Detalles importantes..."
              className="bg-muted/10 border-border/30 h-[200px] resize-none text-sm backdrop-blur-sm"
              value={isEditing ? editData.notes : appointment.notes}
              onChange={e => setEditData({...editData, notes: e.target.value})}
              readOnly={!isEditing}
            />
          </div>
        </div>

        <DialogFooter className="flex flex-row justify-between items-center gap-2 border-t border-border/30 px-6 py-3 bg-card/10 backdrop-blur-sm shrink-0">
          <div className="flex-1">
            {!isEditing && (
              <Button 
                onClick={() => setIsRescheduling(true)}
                variant="ghost" 
                size="sm" 
                className="h-8 text-[10px] font-bold uppercase text-primary hover:bg-primary/10"
                type="button"
              >
                <CalendarPlus className="w-3.5 h-3.5 mr-2" />
                {isCierre ? 'Agendar seguimiento' : 'Agendar 2da cita'}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} className="h-8 text-xs" type="button">Cancelar</Button>
                <Button size="sm" onClick={handleSave} className="h-8 text-xs bg-primary font-bold shadow-lg" type="button">
                  <Save className="w-3.5 h-3.5 mr-2" /> Guardar
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} size="sm" variant="secondary" className="h-8 text-xs font-bold border border-border/50" type="button">
                <Edit2 className="w-3.5 h-3.5 mr-2" /> Editar
              </Button>
            )}
          </div>
        </DialogFooter>

        <AlertDialog open={showArchiveConfirm} onOpenChange={setShowArchiveConfirm}>
          <AlertDialogContent className="z-[160]">
            <AlertDialogHeader>
              <AlertDialogTitle>¿Archivar registro?</AlertDialogTitle>
              <AlertDialogDescription>
                El registro se moverá a la papelera. Podrás recuperarlo en cualquier momento desde la vista de "Archivadas".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowArchiveConfirm(false)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleArchive} className="bg-destructive hover:bg-destructive/90 text-white">
                Sí, archivar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={isRescheduling} onOpenChange={setIsRescheduling}>
          <DialogContent 
            className="sm:max-w-[450px] bg-card border-border shadow-2xl backdrop-blur-md z-[160]"
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarPlus className="w-5 h-5 text-primary" />
                Programar Seguimiento
              </DialogTitle>
              <DialogDescription className="text-xs">
                Agendando seguimiento para <strong>{newName}</strong>. Se heredarán prospectadores y ejecutivos anteriores.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Nombre</Label>
                  <Input value={newName} onChange={e => setNewName(e.target.value)} className="h-9 bg-muted/20 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Teléfono</Label>
                  <Input value={newPhone} onChange={e => setNewPhone(e.target.value)} className="h-9 bg-muted/20 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Producto</Label>
                  <Select value={newProduct} onValueChange={(v) => setNewProduct(v as AppointmentProduct)}>
                    <SelectTrigger className="h-9 bg-muted/20 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Casa">Casa</SelectItem>
                      <SelectItem value="Departamento">Departamento</SelectItem>
                      <SelectItem value="Terreno">Terreno</SelectItem>
                      <SelectItem value="Transporte">Transporte</SelectItem>
                      <SelectItem value="Préstamo">Préstamo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Motivo</Label>
                  <Select value={newType} onValueChange={(v) => setNewType(v as AppointmentType)}>
                    <SelectTrigger className="h-9 bg-primary/10 border-primary/20 text-xs font-bold text-primary focus:ring-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1ra consulta">1ra consulta</SelectItem>
                      <SelectItem value="2da consulta">2da consulta</SelectItem>
                      <SelectItem value="cierre">Cierre</SelectItem>
                      <SelectItem value="Seguimiento">Seguimiento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Ejecutivo que atendió</Label>
                <Input 
                  value={newAttendingExecutive} 
                  onChange={e => setNewAttendingExecutive(e.target.value)} 
                  className="h-9 bg-muted/20 text-sm" 
                  placeholder="Heredado del anterior..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Nueva Fecha</Label>
                  <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="h-9 bg-muted/20 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Nueva Hora</Label>
                  <Input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="h-9 bg-muted/20 text-sm" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Notas de Seguimiento</Label>
                <Textarea 
                  value={newNotes} 
                  onChange={e => setNewNotes(e.target.value)} 
                  className="bg-muted/10 border-border/40 h-24 resize-none text-xs" 
                  placeholder="Escribe acuerdos previos o temas a tratar..."
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsRescheduling(false)} className="h-9 text-xs" type="button">Cancelar</Button>
              <Button onClick={handleConfirmSecond} className="h-9 text-xs bg-primary font-bold shadow-lg" type="button">
                Confirmar Seguimiento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}

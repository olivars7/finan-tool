
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
  Info, Trash2, UserCheck, MapPin, Briefcase, FileText
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
      
      if (appointment.prospectorName) {
        setNewProspectorName(appointment.prospectorName);
        setNewProspectorPhone(appointment.prospectorPhone || '');
        setNewAttendingExecutive('');
      } else {
        setNewAttendingExecutive(appointment.attendingExecutive || '');
        setNewProspectorName('');
        setNewProspectorPhone('');
      }
      
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
      prospectorName: newProspectorName || undefined,
      prospectorPhone: newProspectorPhone || undefined,
      attendingExecutive: newAttendingExecutive || undefined
    });

    setIsRescheduling(false);
    toast({ title: "Cita Agendada", description: `Nueva cita de ${newType} registrada para ${newName}.` });
  };

  const handleToggleEditProspector = (open: boolean) => {
    setShowEditProspector(open);
    if (open) {
      setShowEditExecutive(false);
      setEditData(prev => ({ ...prev, attendingExecutive: undefined }));
    }
  };

  const handleToggleEditExecutive = (open: boolean) => {
    setShowEditExecutive(open);
    if (open) {
      setShowEditProspector(false);
      setEditData(prev => ({ ...prev, prospectorName: undefined, prospectorPhone: undefined }));
    }
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
Teléfono: *${appointment.phone || 'N/A'}*
${motivoLine}Producto: *${appointment.product || 'N/A'}*
Hora: ${timeBold}${confirmedBold}`;

    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "Copiado", description: "Datos de la cita listos para enviar." });
    });
  };

  const showCommissionPanel = appointment.status === 'Cierre';
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
    
    setEditData(prev => ({ ...prev, ...updates }));
    onEdit(appointment.id, updates);
    
    toast({ 
      title: newStatus === 'Pagada' ? "Comisión Pagada" : "Comisión Pendiente", 
      description: `Estatus actualizado para ${appointment.name}.` 
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
        className="sm:max-w-[650px] bg-[#020617] border-white/10 p-0 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] rounded-[2rem]"
      >
        <DialogHeader className="px-8 py-6 border-b border-white/5 flex flex-row items-center justify-between bg-primary/5 shrink-0">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-xl font-black text-white uppercase tracking-tighter">
              {isEditing ? 'Editar Registro' : 'Expediente de Cita'}
            </DialogTitle>
            <DialogDescription className="text-[10px] font-bold uppercase text-primary tracking-widest flex items-center gap-2">
              <HistoryIcon className="w-3 h-3" /> {headerTimeText}
            </DialogDescription>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <>
                <Button 
                  onClick={copyToWhatsAppFormat}
                  variant="outline" 
                  size="sm"
                  className="h-9 px-4 text-[10px] border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 font-black uppercase rounded-full"
                >
                  <Copy className="w-3.5 h-3.5 mr-2" />
                  Copiar Datos
                </Button>
                <Button 
                  onClick={() => setShowArchiveConfirm(true)}
                  variant="ghost" 
                  size="sm"
                  className="h-9 px-4 text-[10px] font-black uppercase text-slate-500 hover:text-destructive hover:bg-destructive/10 transition-colors gap-2 rounded-full"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Archivar
                </Button>
              </>
            )}
            <DialogClose className="h-9 w-9 flex items-center justify-center rounded-full bg-white/5 text-white hover:bg-destructive transition-colors group">
              <X className="w-4 h-4" />
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="px-8 py-8 space-y-8 overflow-y-auto flex-1 scrollbar-thin">
          {isEditing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Nombre del Cliente</Label>
                  <Input value={editData.name || ''} onChange={e => setEditData({...editData, name: e.target.value})} className="h-11 bg-white/5 border-white/10 text-white font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Teléfono de Contacto</Label>
                  <Input value={editData.phone || ''} onChange={e => setEditData({...editData, phone: e.target.value})} className="h-11 bg-white/5 border-white/10 text-white font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-2xl bg-blue-500/5 border-blue-500/10 space-y-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleEditProspector(!showEditProspector)}
                    className="h-8 text-[10px] font-black uppercase text-blue-400 hover:bg-blue-500/10 px-0 w-full justify-between"
                    type="button"
                  >
                    <span className="flex items-center"><UserCog className="w-4 h-4 mr-2" /> Info Prospectador</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", showEditProspector && "rotate-180")} />
                  </Button>

                  {showEditProspector && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-bold uppercase text-blue-400/60">Nombre</Label>
                        <Input 
                          value={editData.prospectorName || ''} 
                          onChange={e => setEditData({...editData, prospectorName: e.target.value})} 
                          className="h-10 bg-[#020617] border-blue-500/20 text-xs text-white" 
                          placeholder="Ej. Juan Perez"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-bold uppercase text-blue-400/60">Teléfono</Label>
                        <Input 
                          value={editData.prospectorPhone || ''} 
                          onChange={e => setEditData({...editData, prospectorPhone: e.target.value})} 
                          className="h-10 bg-[#020617] border-blue-500/20 text-xs text-white" 
                          placeholder="664 000 0000"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 border rounded-2xl bg-purple-500/5 border-purple-500/10 space-y-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleEditExecutive(!showEditExecutive)}
                    className="h-8 text-[10px] font-black uppercase text-purple-400 hover:bg-purple-500/10 px-0 w-full justify-between"
                    type="button"
                  >
                    <span className="flex items-center"><UserCheck className="w-4 h-4 mr-2" /> Info Ejecutivo</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", showEditExecutive && "rotate-180")} />
                  </Button>

                  {showEditExecutive && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-bold uppercase text-purple-400/60">Atendido por</Label>
                        <Input 
                          value={editData.attendingExecutive || ''} 
                          onChange={e => setEditData({...editData, attendingExecutive: e.target.value})} 
                          className="h-10 bg-[#020617] border-purple-500/20 text-xs text-white" 
                          placeholder="Nombre del ejecutivo..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Motivo de Consulta</Label>
                  <Select value={editData.type} onValueChange={(v) => setEditData({...editData, type: v as AppointmentType})}>
                    <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white font-bold">
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
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Producto Interesado</Label>
                  <Select value={editData.product || 'Casa'} onValueChange={(v) => setEditData({...editData, product: v as AppointmentProduct})}>
                    <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white font-bold">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Resultado / Estatus</Label>
                  <Select 
                    value={editData.status || 'Asistencia'} 
                    onValueChange={(v) => setEditData({...editData, status: v as AppointmentStatus, isConfirmed: true})}
                  >
                    <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white font-bold">
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
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Fecha Programada</Label>
                  <Input 
                    type="date" 
                    value={editData.date ? parseISO(editData.date).toISOString().split('T')[0] : ''} 
                    onChange={e => setEditData({...editData, date: new Date(e.target.value + 'T12:00:00Z').toISOString()})} 
                    className="h-11 bg-white/5 border-white/10 text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Hora de la Cita</Label>
                  <Input type="time" value={editData.time || ''} onChange={e => setEditData({...editData, time: e.target.value})} className="h-11 bg-white/5 border-white/10 text-white font-bold" />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Perfil Principal */}
              <div className="flex items-center gap-6 p-6 rounded-3xl bg-white/[0.03] border border-white/5 shadow-inner">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-lg ring-4 ring-primary/10">
                  <User className="w-10 h-10" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">{appointment.name}</h3>
                    {appointment.status && (
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase border shadow-sm",
                        appointment.status === 'Cierre' ? "bg-green-500/10 text-green-500 border-green-500/20" : 
                        appointment.status === 'Apartado' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                        "bg-white/10 text-white border-white/20"
                      )}>
                        {appointment.status}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div onClick={copyPhoneOnly} className="flex items-center gap-2 cursor-pointer group/phone">
                      <Phone className="w-3.5 h-3.5 text-primary group-hover/phone:scale-110 transition-transform" />
                      <span className="text-sm font-bold text-slate-400 group-hover/phone:text-primary transition-colors">{appointment.phone || 'N/A'}</span>
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-sm font-bold text-slate-400">{appointment.product || 'Casa'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Grid de Datos Técnicos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-primary tracking-[0.2em] flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" /> Agenda y Horarios
                    </Label>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Fecha Programada</span>
                          <p className="text-sm font-black text-white">{format(parseISO(appointment.date), "EEEE d 'de' MMMM", { locale: es })}</p>
                        </div>
                        <CalendarDays className="w-5 h-5 text-slate-600" />
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Hora de Atención</span>
                          <p className="text-sm font-black text-white">{format12hTime(appointment.time)}</p>
                        </div>
                        <Clock className="w-5 h-5 text-slate-600" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] flex items-center gap-2">
                      <ClipboardList className="w-3.5 h-3.5" /> Detalles de Trámite
                    </Label>
                    <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-1">
                      <span className="text-[9px] font-bold text-blue-400/60 uppercase">Motivo de la Consulta</span>
                      <p className="text-sm font-black text-white uppercase">{appointment.type}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5" /> Participantes
                    </Label>
                    <div className="space-y-3">
                      {appointment.prospectorName ? (
                        <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-center gap-4">
                          <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400"><UserCog className="w-5 h-5" /></div>
                          <div className="flex-1 overflow-hidden">
                            <span className="text-[9px] font-bold text-blue-400/60 uppercase">Prospectado por</span>
                            <p className="text-xs font-black text-white truncate">{appointment.prospectorName}</p>
                          </div>
                          {appointment.prospectorPhone && (
                            <Button variant="ghost" size="icon" onClick={copyProspectorPhone} className="h-8 w-8 text-blue-400 hover:bg-blue-500/10 rounded-full">
                              <Copy className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 border-dashed flex items-center gap-3 text-slate-600 italic">
                          <UserCog className="w-4 h-4 opacity-40" />
                          <span className="text-[10px] font-bold uppercase">Sin prospectador externo</span>
                        </div>
                      )}

                      {appointment.attendingExecutive ? (
                        <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 flex items-center gap-4">
                          <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400"><UserCheck className="w-5 h-5" /></div>
                          <div className="flex-1 overflow-hidden">
                            <span className="text-[9px] font-bold text-purple-400/60 uppercase">Atendido por</span>
                            <p className="text-xs font-black text-white truncate">{appointment.attendingExecutive}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 border-dashed flex items-center gap-3 text-slate-600 italic">
                          <UserCheck className="w-4 h-4 opacity-40" />
                          <span className="text-[10px] font-bold uppercase">Sin ejecutivo asignado</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel de Comisión (Solo si es Cierre) */}
              {showCommissionPanel && (
                <div className="p-6 rounded-[2rem] bg-green-500/5 border-2 border-green-500/20 space-y-6 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Coins className="w-24 h-24 text-green-500" /></div>
                  
                  <div className="flex items-center justify-between border-b border-green-500/10 pb-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/20 rounded-xl"><Receipt className="w-5 h-5 text-green-500" /></div>
                      <div>
                        <h4 className="text-[10px] font-black uppercase text-green-600 tracking-[0.2em]">Liquidación Final</h4>
                        <p className="text-[8px] font-bold text-green-700/60 uppercase">Cierre de trámite inmobiliario</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-background/40 p-1.5 pr-3 rounded-full border border-green-500/20">
                      <Switch 
                        checked={(editData.commissionStatus || 'Pendiente') === 'Pagada'} 
                        onCheckedChange={handleCommissionToggle}
                        className="data-[state=checked]:bg-green-500"
                      />
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest",
                        (editData.commissionStatus || 'Pendiente') === 'Pagada' ? "text-green-500" : "text-amber-500"
                      )}>
                        {editData.commissionStatus || 'Pendiente'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 relative z-10">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1.5"><Coins className="w-3 h-3" /> Crédito Final</span>
                      <p className="text-xl font-black text-white">{formatCurrency(appointment.finalCreditAmount || 0)}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1.5">Participación <Info className="w-3 h-3 opacity-40" /></span>
                      <p className="text-xl font-black text-primary">{appointment.commissionPercent || 0}%</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 pt-4 border-t border-green-500/10 relative z-10">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-green-600 uppercase">Ingreso Neto</span>
                      <p className="text-2xl font-black text-green-500">{formatCurrency(commissionValue)}</p>
                      <p className="text-[8px] font-bold text-slate-500 uppercase italic">Deducido 9% ISR</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-500 uppercase">Fecha de Pago Proyectada</span>
                      <p className="text-sm font-black text-white">{calculatePaymentDateText(appointment.date)}</p>
                      <p className="text-[8px] font-bold text-slate-500 uppercase">Viernes de liquidación</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notas del Cliente */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-[0.3em]">
                  <FileText className="w-4 h-4 text-primary" /> Diario de Seguimiento
                </Label>
                <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 min-h-[120px] relative">
                  <p className="text-sm leading-relaxed text-slate-300 font-medium italic">
                    {appointment.notes ? `"${appointment.notes}"` : 'Sin comentarios u observaciones registradas para este expediente.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-8 py-6 border-t border-white/5 bg-primary/5 flex flex-row justify-between items-center gap-4 shrink-0">
          <div className="flex-1">
            {!isEditing && (
              <Button 
                onClick={() => setIsRescheduling(true)}
                variant="ghost" 
                size="sm" 
                className="h-10 px-6 text-[10px] font-black uppercase text-primary hover:bg-primary/10 rounded-full gap-2 transition-all active:scale-95"
                type="button"
              >
                <CalendarPlus className="w-4 h-4" />
                {isCierre ? 'Agendar Seguimiento' : 'Programar 2da Cita'}
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="h-10 px-6 text-[10px] font-black uppercase text-slate-500 rounded-full" type="button">Cancelar</Button>
                <Button size="sm" onClick={handleSave} className="h-10 px-8 text-[10px] font-black uppercase bg-primary text-white hover:bg-primary/80 rounded-full shadow-lg gap-2" type="button">
                  <Save className="w-4 h-4" /> Guardar Cambios
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} size="sm" className="h-10 px-8 text-[10px] font-black uppercase bg-white text-slate-950 hover:bg-slate-200 rounded-full gap-2 shadow-xl" type="button">
                <Edit2 className="w-4 h-4" /> Editar Expediente
              </Button>
            )}
          </div>
        </DialogFooter>

        {/* DIALOGOS INTERNOS (ARCHIVAR Y REAGENDAR) */}
        <AlertDialog open={showArchiveConfirm} onOpenChange={setShowArchiveConfirm}>
          <AlertDialogContent className="bg-slate-900 border-white/10 rounded-[2rem] text-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-black uppercase tracking-tighter">¿Archivar Expediente?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400 font-medium">
                El registro de <strong>{appointment.name}</strong> se moverá a la papelera. Podrás recuperarlo en cualquier momento desde el historial de archivados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel onClick={() => setShowArchiveConfirm(false)} className="bg-white/5 border-white/10 text-white rounded-full h-11 px-6 text-xs font-bold uppercase">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleArchive} className="bg-destructive hover:bg-destructive/90 text-white rounded-full h-11 px-8 text-xs font-black uppercase">
                Sí, Archivar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={isRescheduling} onOpenChange={setIsRescheduling}>
          <DialogContent 
            className="sm:max-w-[500px] bg-[#020617] border-white/10 shadow-2xl rounded-[2.5rem] p-0 overflow-hidden"
          >
            <DialogHeader className="p-8 border-b border-white/5 bg-primary/5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary text-white rounded-2xl shadow-lg"><CalendarPlus className="w-6 h-6" /></div>
                <div>
                  <DialogTitle className="text-xl font-black uppercase tracking-tighter text-white leading-none">Nueva Consulta</DialogTitle>
                  <DialogDescription className="text-[10px] font-bold uppercase text-primary tracking-widest mt-1">
                    Continuidad de Trámite: {newName}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Cliente</Label>
                  <Input value={newName} readOnly className="h-10 bg-white/5 border-white/10 text-slate-400 font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Producto</Label>
                  <Select value={newProduct} onValueChange={(v) => setNewProduct(v as AppointmentProduct)}>
                    <SelectTrigger className="h-10 bg-white/5 border-white/10 text-white font-bold">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Nueva Fecha</Label>
                  <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="h-10 bg-white/5 border-white/10 text-white font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Nueva Hora</Label>
                  <Input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="h-10 bg-white/5 border-white/10 text-white font-bold" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Acuerdos Previos</Label>
                <Textarea 
                  value={newNotes} 
                  onChange={e => setNewNotes(e.target.value)} 
                  className="bg-white/5 border-white/10 h-24 resize-none text-xs text-white" 
                  placeholder="Temas pendientes para la siguiente sesión..."
                />
              </div>
            </div>

            <DialogFooter className="p-8 border-t border-white/5 bg-primary/5 gap-3">
              <Button variant="ghost" onClick={() => setIsRescheduling(false)} className="h-11 px-6 text-[10px] font-black uppercase text-slate-500 rounded-full" type="button">Cancelar</Button>
              <Button onClick={handleConfirmSecond} className="h-11 px-8 text-[10px] font-black uppercase bg-primary text-white hover:bg-primary/80 rounded-full shadow-lg" type="button">
                Confirmar Registro
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}

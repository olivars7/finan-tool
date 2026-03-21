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
  Info, Trash2, UserCheck, MapPin, Briefcase, FileText, X,
  LayoutList
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
  onEdit: (id: string, partial: Partial<Appointment>) => void;
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

  const handleCopyData = () => {
    if (!appointment) return;
    const dateObj = parseISO(appointment.date);
    const dateFormatted = format(dateObj, "EEEE d 'de' MMMM yyyy", { locale: es });
    const capitalizedDate = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);
    const timeFormatted = format12hTime(appointment.time);
    
    const text = `Cita: ${capitalizedDate}\n` +
                 `Nombre: ${appointment.name}\n` +
                 `Teléfono: ${appointment.phone}\n` +
                 `Producto: ${appointment.product || 'N/A'}\n` +
                 `Hora: ${timeFormatted}`;

    navigator.clipboard.writeText(text).then(() => {
      toast({ 
        title: "Copiado", 
        description: "Información de la cita lista para compartir." 
      });
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

  const copyName = () => {
    navigator.clipboard.writeText(appointment.name).then(() => {
      toast({ title: "Nombre copiado", description: appointment.name });
    });
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

  const showCommissionPanel = appointment.status === 'Cierre';
  const commissionValue = ((editData.finalCreditAmount || 0) * 0.007 * ((editData.commissionPercent || 0) / 100)) * 0.91;

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
        className="sm:max-w-[650px] bg-background border-border/40 p-0 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] rounded-[2.5rem]"
      >
        <DialogHeader className="px-6 sm:px-8 py-6 border-b border-border/10 flex flex-row items-center justify-between bg-primary/5 shrink-0">
          <div className="flex flex-col gap-1 min-w-0">
            <DialogTitle className="text-xl font-black text-foreground uppercase tracking-tighter truncate">
              {isEditing ? 'Editar' : 'Expediente'}
            </DialogTitle>
            <DialogDescription className="text-[9px] font-bold uppercase text-primary tracking-widest flex items-center gap-1 truncate">
              <HistoryIcon className="w-2.5 h-2.5" /> {headerTimeText}
            </DialogDescription>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isEditing && (
              <>
                <Button 
                  onClick={handleCopyData} 
                  variant="outline" 
                  size="sm" 
                  className="h-8 px-3 text-[9px] font-black uppercase text-green-600 border-green-600/30 hover:bg-green-600/10 rounded-full gap-1.5 flex items-center"
                >
                  <Copy className="w-3 h-3" /> 
                  <span>Copiar informacion de cita</span>
                </Button>
                <Button 
                  onClick={() => setShowArchiveConfirm(true)}
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </>
            )}
            <DialogClose className="h-9 w-9 flex items-center justify-center rounded-full bg-muted/20 text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors">
              <X className="w-4 h-4" />
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="px-8 py-8 space-y-8 overflow-y-auto flex-1 scrollbar-thin pb-32">
          {isEditing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Nombre del Cliente</Label>
                  <Input value={editData.name || ''} onChange={e => setEditData({...editData, name: e.target.value})} className="h-11 bg-muted/20 border-border/40 text-foreground font-bold rounded-full px-6" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Teléfono de Contacto</Label>
                  <Input value={editData.phone || ''} onChange={e => setEditData({...editData, phone: e.target.value})} className="h-11 bg-muted/20 border-border/40 text-foreground font-bold rounded-full px-6" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Motivo</Label>
                  <Select value={editData.type} onValueChange={(v) => setEditData({...editData, type: v as AppointmentType})}>
                    <SelectTrigger className="h-11 bg-muted/20 border-border/40 text-foreground font-bold rounded-full px-6">
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
                  <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Producto</Label>
                  <Select value={editData.product || 'Casa'} onValueChange={(v) => setEditData({...editData, product: v as AppointmentProduct})}>
                    <SelectTrigger className="h-11 bg-muted/20 border-border/40 text-foreground font-bold rounded-full px-6">
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

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Notas</Label>
                <Textarea 
                  value={editData.notes || ''} 
                  onChange={e => setEditData({...editData, notes: e.target.value})} 
                  className="bg-muted/20 border-border/40 min-h-[150px] text-sm text-foreground resize-none rounded-[2rem] p-6" 
                />
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-500 text-foreground">
              <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-muted/10 border border-border/20">
                <div className="flex-1 space-y-2">
                  <h3 onClick={copyName} className="text-3xl font-black text-foreground uppercase tracking-tighter leading-none cursor-pointer hover:text-primary">{appointment.name}</h3>
                  <div className="flex items-center gap-4">
                    <div onClick={copyPhoneOnly} className="flex items-center gap-2 cursor-pointer group/phone">
                      <Phone className="w-3.5 h-3.5 text-primary" />
                      <span className="text-sm font-bold text-muted-foreground group-hover/phone:text-primary">{appointment.phone || 'N/A'}</span>
                    </div>
                    <div className="h-4 w-px bg-border/40" />
                    <span className="text-sm font-bold text-muted-foreground uppercase">{appointment.product || 'Casa'}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase text-primary tracking-[0.2em] flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" /> Agenda
                  </Label>
                  <div className="p-4 rounded-[1.5rem] bg-muted/10 border border-border/20 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase">Fecha</span>
                      <p className="text-xs font-black text-foreground">{format(parseISO(appointment.date), "EEEE d 'de' MMMM", { locale: es })}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase">Hora</span>
                      <p className="text-xs font-black text-foreground">{format12hTime(appointment.time)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-[0.2em] flex items-center gap-2">
                    <LayoutList className="w-3.5 h-3.5" /> Detalles
                  </Label>
                  <div className="p-4 rounded-[1.5rem] bg-blue-500/5 border border-blue-500/10 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-blue-600/60 uppercase">Motivo</span>
                      <p className="text-xs font-black text-foreground uppercase">{appointment.type}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-blue-600/60 uppercase">Estado</span>
                      <p className="text-xs font-black text-foreground uppercase">{appointment.status || 'En Proceso'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {showCommissionPanel && (
                <div className="p-6 rounded-[2rem] bg-green-500/5 border-2 border-green-500/20 space-y-6">
                  <div className="flex items-center justify-between border-b border-green-500/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/20 rounded-xl"><Receipt className="w-5 h-5 text-green-600" /></div>
                      <h4 className="text-[10px] font-black uppercase text-green-600 tracking-[0.2em]">Liquidación</h4>
                    </div>
                    <div className="flex items-center gap-3 bg-muted/20 p-1.5 pr-3 rounded-full border border-green-500/20">
                      <Switch checked={(editData.commissionStatus || 'Pendiente') === 'Pagada'} onCheckedChange={(checked) => {
                        const newStatus = checked ? 'Pagada' : 'Pendiente';
                        onEdit(appointment.id, { commissionStatus: newStatus });
                        setEditData(prev => ({ ...prev, commissionStatus: newStatus }));
                      }} className="data-[state=checked]:bg-green-600" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-foreground">{editData.commissionStatus || 'Pendiente'}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div><span className="text-[9px] font-bold text-muted-foreground uppercase">Crédito</span><p className="text-lg font-black text-foreground">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(appointment.finalCreditAmount || 0)}</p></div>
                    <div><span className="text-[9px] font-bold text-muted-foreground uppercase">Ingreso Neto</span><p className="text-xl font-black text-green-600">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(commissionValue)}</p></div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <Label className="flex items-center gap-2 text-foreground text-[10px] font-black uppercase tracking-[0.3em]">
                  <FileText className="w-4 h-4 text-primary" /> NOTAS
                </Label>
                <div className="p-6 rounded-[2rem] bg-muted/10 border border-border/20 min-h-[120px]">
                  <p className="text-sm leading-relaxed text-foreground font-medium whitespace-pre-wrap italic opacity-80">
                    {appointment.notes ? appointment.notes : 'Sin comentarios registrados.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-8 py-6 border-t border-border/10 bg-primary/5 flex flex-row justify-between items-center gap-4 shrink-0">
          <div className="flex flex-1 gap-3">
            {!isEditing && (
              <Button onClick={() => setIsRescheduling(true)} variant="ghost" size="sm" className="h-11 px-6 text-[10px] font-black uppercase text-primary hover:bg-primary/10 rounded-full gap-2">
                <CalendarPlus className="w-4 h-4" /> Reagendar
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="h-11 px-6 text-[10px] font-black uppercase text-muted-foreground rounded-full">Cancelar</Button>
                <Button size="sm" onClick={handleSave} className="h-11 px-8 text-[10px] font-black uppercase bg-primary text-primary-foreground hover:bg-primary/80 rounded-full shadow-lg gap-2">
                  <Save className="w-4 h-4" /> Guardar
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} size="sm" className="h-11 px-10 text-[10px] font-black uppercase bg-foreground text-background hover:opacity-90 rounded-full gap-2 shadow-xl">
                <Edit2 className="w-4 h-4" /> Editar
              </Button>
            )}
          </div>
        </DialogFooter>

        <AlertDialog open={showArchiveConfirm} onOpenChange={setShowArchiveConfirm}>
          <AlertDialogContent className="bg-background border-border shadow-2xl rounded-[2rem] text-foreground">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-black uppercase tracking-tighter">¿Archivar Expediente?</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground font-medium">El registro se moverá a la papelera.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel className="bg-muted/20 border-border text-foreground rounded-full h-11 px-6 text-xs font-bold uppercase">No</AlertDialogCancel>
              <AlertDialogAction onClick={handleArchive} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full h-11 px-8 text-xs font-black uppercase">Archivar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}

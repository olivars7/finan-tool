"use client"

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PlusCircle, UserPlus, Plus, Calendar as CalendarIcon, ArrowRight, UserCog, UserCheck, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AppointmentType, AppointmentProduct } from '@/services/appointment-service';
import { cn } from "@/lib/utils";
import { addDays, format, getDay } from 'date-fns';

interface AppointmentFormProps {
  onAdd: (app: { name: string; phone: string; date: string; time: string; type: AppointmentType; product: AppointmentProduct; prospectorName?: string; prospectorPhone?: string; attendingExecutive?: string }) => void;
}

export default function AppointmentForm({ onAdd }: AppointmentFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState<AppointmentType>('1ra consulta');
  const [product, setProduct] = useState<AppointmentProduct>('Casa');
  const [prospectorName, setProspectorName] = useState('');
  const [prospectorPhone, setProspectorPhone] = useState('');
  const [attendingExecutive, setAttendingExecutive] = useState('');
  const [showProspector, setShowProspector] = useState(false);
  const [showExecutive, setShowExecutive] = useState(false);

  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date || !time) {
      toast({
        title: "Error",
        description: "Por favor completa los campos obligatorios.",
        variant: "destructive"
      });
      return;
    }
    
    const isoDate = new Date(date + 'T12:00:00Z').toISOString();
    
    onAdd({ 
      name, 
      phone, 
      date: isoDate, 
      time, 
      type, 
      product,
      prospectorName: prospectorName || undefined,
      prospectorPhone: prospectorPhone || undefined,
      attendingExecutive: attendingExecutive || undefined
    });

    setName('');
    setPhone('');
    setDate('');
    setTime('');
    setType('1ra consulta');
    setProduct('Casa');
    setProspectorName('');
    setProspectorPhone('');
    setAttendingExecutive('');
    setShowProspector(false);
    setShowExecutive(false);

    toast({
      title: "Cita agregada",
      description: `Cita de ${type} para ${name} registrada.`,
    });
  };

  const setDateTomorrow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    setDate(tomorrow);
  };

  const setDateNextSaturday = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const today = new Date();
    const nextSat = format(addDays(today, (6 - getDay(today) + 7) % 7 || 7), 'yyyy-MM-dd');
    setDate(nextSat);
  };

  const setDateNextSunday = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const today = new Date();
    const nextSun = format(addDays(today, (7 - getDay(today) + 7) % 7 || 7), 'yyyy-MM-dd');
    setDate(nextSun);
  };

  return (
    <Card className="bg-card border-border shadow-md backdrop-blur-lg">
      <CardHeader className="py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <UserPlus className="text-accent w-5 h-5" />
          <CardTitle className="text-lg font-headline">Nueva Cita</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs uppercase font-bold text-muted-foreground/70">Nombre</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Escribe el nombre..." 
                className="bg-muted/30 border-border/40 text-sm placeholder:text-muted-foreground/40 h-11 w-full" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs uppercase font-bold text-muted-foreground/70">Teléfono</Label>
              <Input 
                id="phone" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="Ej. 664 123 4567" 
                className="bg-muted/30 border-border/40 text-sm placeholder:text-muted-foreground/40 h-11 w-full" 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="date" className="text-xs uppercase font-bold text-muted-foreground/70">Fecha</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" className="h-5 w-5 rounded-full bg-primary/10 text-primary hover:bg-primary/20">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent side="top" className="w-48 p-2 flex flex-col gap-1 backdrop-blur-md bg-card/90 border-primary/20">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground px-2 mb-1">Agendado rápido</p>
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm" 
                      className="justify-start h-8 text-xs font-semibold hover:bg-primary/10"
                      onMouseDown={setDateTomorrow}
                    >
                      <ArrowRight className="w-3 h-3 mr-2 text-primary" /> Mañana
                    </Button>
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm" 
                      className="justify-start h-8 text-xs font-semibold hover:bg-blue-500/10 text-blue-500"
                      onMouseDown={setDateNextSaturday}
                    >
                      <CalendarIcon className="w-3 h-3 mr-2" /> Sábado
                    </Button>
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm" 
                      className="justify-start h-8 text-xs font-semibold hover:bg-orange-500/10 text-orange-600"
                      onMouseDown={setDateNextSunday}
                    >
                      <CalendarIcon className="w-3 h-3 mr-2" /> Domingo
                    </Button>
                  </PopoverContent>
                </Popover>
              </div>
              <Input 
                id="date" 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                className={cn(
                  "bg-muted/30 border-border/40 text-sm h-11 w-full",
                  !date && "text-muted-foreground/40"
                )} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="text-xs uppercase font-bold text-muted-foreground/70">Hora</Label>
              <Input 
                id="time" 
                type="time" 
                value={time} 
                onChange={(e) => setTime(e.target.value)} 
                className={cn(
                  "bg-muted/30 border-border/40 text-sm h-11 w-full",
                  !time && "text-muted-foreground/40"
                )} 
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Collapsible open={showProspector} onOpenChange={setShowProspector} className="flex-1 min-w-[250px]">
              <CollapsibleTrigger asChild>
                <Button type="button" variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase text-primary hover:bg-primary/10 px-0">
                  <UserCog className="w-3.5 h-3.5 mr-2" />
                  {showProspector ? 'Ocultar prospectador' : '¿Viene de otro prospectador?'}
                  <ChevronDown className={cn("ml-2 h-3.5 w-3.5", showProspector && "rotate-180")} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border rounded-lg bg-blue-500/5 border-blue-500/20">
                  <div className="space-y-2">
                    <Label htmlFor="prospectorName" className="text-xs uppercase font-bold text-blue-600/70">Nombre del Prospectador</Label>
                    <Input 
                      id="prospectorName" 
                      value={prospectorName} 
                      onChange={(e) => setProspectorName(e.target.value)} 
                      placeholder="¿Quién agendó?" 
                      className="bg-background border-blue-500/20 text-sm h-10" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prospectorPhone" className="text-xs uppercase font-bold text-blue-600/70">Teléfono del Prospectador</Label>
                    <Input 
                      id="prospectorPhone" 
                      value={prospectorPhone} 
                      onChange={(e) => setProspectorPhone(e.target.value)} 
                      placeholder="Ej. 664 000 0000" 
                      className="bg-background border-blue-500/20 text-sm h-10" 
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={showExecutive} onOpenChange={setShowExecutive} className="flex-1 min-w-[250px]">
              <CollapsibleTrigger asChild>
                <Button type="button" variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase text-purple-500 hover:bg-purple-500/10 px-0">
                  <UserCheck className="w-3.5 h-3.5 mr-2" />
                  {showExecutive ? 'Ocultar ejecutivo' : '¿Atiende otro ejecutivo?'}
                  <ChevronDown className={cn("ml-2 h-3.5 w-3.5", showExecutive && "rotate-180")} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="p-4 border rounded-lg bg-purple-500/5 border-purple-500/20">
                  <div className="space-y-2">
                    <Label htmlFor="attendingExecutive" className="text-xs uppercase font-bold text-purple-600/70">Ejecutivo de atención</Label>
                    <Input 
                      id="attendingExecutive" 
                      value={attendingExecutive} 
                      onChange={(e) => setAttendingExecutive(e.target.value)} 
                      placeholder="Nombre del ejecutivo que atiende..." 
                      className="bg-background border-purple-500/20 text-sm h-10" 
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-5 space-y-2">
              <Label htmlFor="type" className="text-xs uppercase font-bold text-muted-foreground/70">Motivo de la Consulta</Label>
              <Select value={type} onValueChange={(v) => setType(v as AppointmentType)}>
                <SelectTrigger className="bg-muted/30 border-border/40 h-11 text-sm w-full text-muted-foreground/60">
                  <SelectValue placeholder="Selecciona el motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1ra consulta">1ra consulta</SelectItem>
                  <SelectItem value="2da consulta">2da consulta</SelectItem>
                  <SelectItem value="cierre">Cierre</SelectItem>
                  <SelectItem value="Seguimiento">Seguimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-4 space-y-2">
              <Label htmlFor="product" className="text-xs uppercase font-bold text-muted-foreground/70">Producto</Label>
              <Select value={product} onValueChange={(v) => setProduct(v as AppointmentProduct)}>
                <SelectTrigger className="bg-muted/30 border-border/40 h-11 text-sm w-full text-muted-foreground/60">
                  <SelectValue placeholder="Selecciona el producto" />
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
            <div className="md:col-span-3">
              <Button 
                type="submit" 
                className="bg-accent hover:bg-accent/80 text-accent-foreground font-bold shadow-lg h-11 flex items-center justify-center gap-2 w-full"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Registrar</span>
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

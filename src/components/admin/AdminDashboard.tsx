
"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogClose 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ShieldCheck, Search, X, Users, Calendar, 
  ArrowUpDown, Filter, UserCog, UserCheck, 
  MessageSquare, ExternalLink, RefreshCcw
} from "lucide-react";
import { fetchAllGlobalAppointments } from '@/lib/firebaseAppointments';
import { Appointment, AppointmentStatus } from '@/services/appointment-service';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface GlobalApp extends Appointment {
  ownerName: string;
  ownerEmail: string;
}

interface AdminDashboardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AdminDashboard({ open, onOpenChange }: AdminDashboardProps) {
  const [appointments, setAppointments] = useState<GlobalApp[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAllGlobalAppointments();
      setAppointments(data as GlobalApp[]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const filteredApps = useMemo(() => {
    return appointments.filter(app => {
      const matchesSearch = 
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.phone && app.phone.includes(searchTerm));
      
      const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
      
      return matchesSearch && matchesStatus && !app.isArchived;
    });
  }, [appointments, searchTerm, filterStatus]);

  const getStatusColor = (status?: AppointmentStatus) => {
    switch (status) {
      case 'Cierre': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'Apartado': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'No asistencia': return 'text-destructive bg-destructive/10 border-destructive/20';
      default: return 'text-muted-foreground bg-muted/10 border-border/20';
    }
  };

  const formatFriendlyDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "d MMM yyyy", { locale: es });
    } catch {
      return dateStr;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none w-screen h-screen m-0 rounded-none bg-background border-none p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-border/40 flex flex-row items-center justify-between bg-card/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-xl border border-primary/30">
              <ShieldCheck className="text-primary w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Consola Maestra de Citas</DialogTitle>
              <DialogDescription className="text-xs">Monitoreo global de todos los ejecutivos y prospectos.</DialogDescription>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-1 justify-end px-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por cliente, ejecutivo o teléfono..." 
                className="pl-9 h-10 bg-muted/20" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="h-10 gap-2">
              <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} />
              Actualizar
            </Button>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-destructive/10 h-10 w-10">
                <X className="w-5 h-5" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="flex-1 p-6 overflow-hidden flex flex-col bg-muted/5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-card border rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Total Global</span>
              <p className="text-2xl font-black">{appointments.length}</p>
            </div>
            <div className="p-4 bg-card border rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-green-600">Cierres Totales</span>
              <p className="text-2xl font-black text-green-600">{appointments.filter(a => a.status === 'Cierre').length}</p>
            </div>
            <div className="p-4 bg-card border rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-blue-600">En Seguimiento</span>
              <p className="text-2xl font-black text-blue-600">{appointments.filter(a => !a.status).length}</p>
            </div>
            <div className="p-4 bg-card border rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Ejecutivos Activos</span>
              <p className="text-2xl font-black">{new Set(appointments.map(a => a.ownerEmail)).size}</p>
            </div>
          </div>

          <div className="border rounded-2xl overflow-hidden bg-card flex-1 flex flex-col shadow-sm">
            <ScrollArea className="flex-1 scrollbar-thin">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[120px]">Fecha</TableHead>
                    <TableHead>Cliente / Registro</TableHead>
                    <TableHead>Ejecutivo Responsable</TableHead>
                    <TableHead>Motivo / Producto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Comisión</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <TableRow key={i} className="animate-pulse">
                        <TableCell colSpan={6} className="h-16 bg-muted/5"></TableCell>
                      </TableRow>
                    ))
                  ) : filteredApps.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-[400px] text-center">
                        <div className="flex flex-col items-center justify-center opacity-40 gap-3">
                          <Users className="w-12 h-12" />
                          <p className="font-bold uppercase tracking-widest text-xs">No se encontraron registros</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredApps.map((app) => (
                      <TableRow key={app.id} className="hover:bg-muted/30 h-16 transition-colors">
                        <TableCell className="font-medium text-xs">
                          {formatFriendlyDate(app.date)}
                          <div className="text-[10px] text-muted-foreground">{app.time}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-sm">{app.name}</div>
                          <div className="text-[10px] text-primary font-medium">{app.phone || 'Sin tel.'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="bg-primary/10 p-1 rounded text-primary"><UserCog className="w-3 h-3" /></div>
                            <div>
                              <div className="text-xs font-bold">{app.ownerName}</div>
                              <div className="text-[9px] text-muted-foreground uppercase">{app.ownerEmail}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-[10px] font-bold uppercase">{app.type}</div>
                          <div className="text-[10px] text-muted-foreground">{app.product || 'N/A'}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-[9px] font-bold uppercase", getStatusColor(app.status))}>
                            {app.status || 'Pendiente'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {app.status === 'Cierre' ? (
                            <div className="font-black text-xs text-green-600">
                              {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(app.finalCreditAmount || 0)}
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground opacity-40">---</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

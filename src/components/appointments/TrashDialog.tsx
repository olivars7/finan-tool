"use client"

import React, { useState } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, RotateCcw, Ghost, ChevronDown } from "lucide-react";
import { Appointment } from '@/services/appointment-service';
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  archivedAppointments: Appointment[];
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  formatDate: (date: string) => string;
  format12hTime: (time: string) => string;
}

export default function TrashDialog({ 
  open, 
  onOpenChange, 
  archivedAppointments, 
  onRestore, 
  onDelete,
  formatDate,
  format12hTime
}: Props) {
  const [visibleCount, setVisibleCount] = useState(20);
  const { toast } = useToast();

  const handleRestore = (id: string, name: string) => {
    onRestore(id);
    toast({
      title: "Cita restaurada",
      description: `${name} ha vuelto a tu lista activa.`,
    });
  };

  const handlePermanentDelete = (id: string, name: string) => {
    onDelete(id);
    toast({
      variant: "destructive",
      title: "Eliminado permanentemente",
      description: `Se ha borrado definitivamente a ${name}.`,
    });
  };

  const visibleApps = archivedAppointments.slice(0, visibleCount);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-card border-border shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-muted-foreground" />
            <DialogTitle>Papelera de Citas</DialogTitle>
          </div>
          <DialogDescription>
            Citas archivadas recientemente. Puedes restaurarlas o borrarlas permanentemente.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {archivedAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
              <Ghost className="w-12 h-12 mb-3 opacity-20" />
              <p className="font-medium text-sm">La papelera está vacía</p>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden bg-muted/10">
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader className="bg-card sticky top-0 z-10">
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Fecha / Hora</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleApps.map((app) => (
                      <TableRow key={app.id} className="group hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="font-bold text-sm">{app.name}</div>
                          <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{app.type}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs font-semibold">{formatDate(app.date)}</div>
                          <div className="text-[10px] text-muted-foreground font-medium">{format12hTime(app.time)}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-primary hover:bg-primary/10"
                              onClick={(e) => { e.stopPropagation(); handleRestore(app.id, app.name); }}
                              title="Restaurar"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={(e) => { e.stopPropagation(); handlePermanentDelete(app.id, app.name); }}
                              title="Borrar permanentemente"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              
              {visibleCount < archivedAppointments.length && (
                <div className="p-3 border-t bg-muted/20 flex justify-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setVisibleCount(p => p + 20)}
                    className="text-[10px] font-bold uppercase tracking-wider h-8"
                  >
                    <ChevronDown className="w-3 h-3 mr-2" />
                    Cargar más
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-start pb-14 md:pb-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Appointment, getCommissionPaymentDate } from '@/services/appointment-service';
import { 
  Receipt, Coins, CalendarDays, CheckCircle2, 
  X, AlertCircle, TrendingUp, HandCoins
} from 'lucide-react';
import { format, isToday, isBefore, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Props {
  appointments: Appointment[];
  onConfirmPayment: (id: string) => void;
}

export default function PaymentReminderDialog({ appointments, onConfirmPayment }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filtrar cierres pendientes cuya fecha de pago es hoy o ya pasó
  const pendingPayments = useMemo(() => {
    const today = startOfDay(new Date());
    return appointments.filter(a => {
      if (a.status !== 'Cierre' || a.commissionStatus === 'Pagada' || a.isArchived) return false;
      const paymentDate = startOfDay(getCommissionPaymentDate(a.date));
      return isToday(paymentDate) || isBefore(paymentDate, today);
    }).sort((a, b) => {
      // Priorizar los más antiguos
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [appointments]);

  useEffect(() => {
    if (pendingPayments.length > 0 && !isOpen) {
      // Pequeño delay para no interrumpir la carga inicial
      const timer = setTimeout(() => setIsOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [pendingPayments.length, isOpen]);

  if (pendingPayments.length === 0 || !isOpen) return null;

  const currentApp = pendingPayments[currentIndex];
  if (!currentApp) return null;

  const paymentDate = getCommissionPaymentDate(currentApp.date);
  const isOverdue = isBefore(startOfDay(paymentDate), startOfDay(new Date()));
  
  const finalCredit = Number(currentApp.finalCreditAmount) || 0;
  const commissionPercent = Number(currentApp.commissionPercent) || 100;
  const netIncome = (finalCredit * 0.007 * (commissionPercent / 100)) * 0.91;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', { 
      style: 'currency', 
      currency: 'MXN', 
      maximumFractionDigits: 0 
    }).format(Math.round(val));
  };

  const handleConfirm = () => {
    onConfirmPayment(currentApp.id);
    if (currentIndex < pendingPayments.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsOpen(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < pendingPayments.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[2.5rem] border-none bg-green-600 text-white shadow-2xl z-[250]">
        <DialogHeader className="p-8 pb-4 relative shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-2xl shadow-xl backdrop-blur-md">
              <HandCoins size={32} className="text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-white leading-none">
                ¡Día de Cobro!
              </DialogTitle>
              <DialogDescription className="text-[10px] font-bold uppercase text-white/70 tracking-[0.2em] mt-1">
                {isOverdue ? 'Liquidación Vencida' : 'Pago proyectado para hoy'}
              </DialogDescription>
            </div>
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="absolute right-4 top-6 rounded-full hover:bg-white/10 text-white border-none">
              <X size={24} />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="p-8 space-y-8">
          <div className="text-center space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Cliente</p>
            <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">{currentApp.name}</h3>
          </div>

          <div className="bg-white/10 rounded-[2rem] p-6 space-y-6 backdrop-blur-sm border border-white/10">
            <div className="grid grid-cols-2 gap-4 border-b border-white/10 pb-4">
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase text-white/50 tracking-widest">Monto Crédito</span>
                <p className="text-lg font-bold">{formatCurrency(finalCredit)}</p>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[9px] font-black uppercase text-white/50 tracking-widest">Participación</span>
                <p className="text-lg font-bold">{commissionPercent}%</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center py-2">
              <span className="text-[10px] font-black uppercase text-white/60 tracking-[0.4em] mb-2">Ingreso Neto para ti</span>
              <p className="text-5xl font-black tracking-tighter drop-shadow-lg">
                {formatCurrency(netIncome)}
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays size={14} className="text-white/60" />
                <span className="text-[10px] font-bold uppercase text-white/70">
                  {format(paymentDate, "d 'de' MMMM", { locale: es })}
                </span>
              </div>
              {pendingPayments.length > 1 && (
                <span className="text-[9px] font-black uppercase bg-white/20 px-2 py-0.5 rounded-full">
                  {currentIndex + 1} de {pendingPayments.length} pendientes
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleConfirm}
              className="w-full h-16 rounded-[1.5rem] bg-white text-green-600 hover:bg-white/90 font-black uppercase text-base tracking-widest shadow-xl transition-all active:scale-[0.97] border-none"
            >
              <CheckCircle2 className="mr-2 h-6 w-6" /> Confirmar Cobro
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={handleNext}
              className="w-full h-12 rounded-full text-white/60 hover:text-white hover:bg-white/10 font-bold uppercase text-[10px] tracking-[0.2em] border-none"
            >
              Recordar más tarde
            </Button>
          </div>
        </div>

        <div className="p-6 bg-black/10 text-center">
          <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/40">
            FINANTO SETTLEMENT ENGINE • v2.0
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

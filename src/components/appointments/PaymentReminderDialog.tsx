
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
  X, HandCoins, ArrowRight, Wallet
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
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [appointments]);

  // Manejador de apertura inicial e intervalos de 60 segundos
  useEffect(() => {
    if (pendingPayments.length > 0 && !isOpen) {
      // Primera apertura con pequeño delay
      const initialTimer = setTimeout(() => setIsOpen(true), 2500);

      // Intervalo de re-apertura cada 60 segundos
      const reminderInterval = setInterval(() => {
        setIsOpen(true);
      }, 60000);

      return () => {
        clearTimeout(initialTimer);
        clearInterval(reminderInterval);
      };
    }
  }, [pendingPayments.length, isOpen]);

  if (pendingPayments.length === 0) return null;

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
    setIsOpen(false); // Cierra el diálogo, el intervalo lo volverá a abrir en 60s
    if (currentIndex < pendingPayments.length - 1) {
      // Preparamos el siguiente para cuando vuelva a abrir
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0); // Reiniciamos ciclo para la próxima vez
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent 
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="sm:max-w-[500px] p-0 overflow-hidden rounded-[3rem] border-none bg-gradient-to-br from-emerald-600 via-green-600 to-teal-800 text-white shadow-[0_0_50px_rgba(0,0,0,0.3)] z-[250]"
      >
        <DialogHeader className="p-8 pb-4 relative shrink-0">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-white/20 rounded-[1.5rem] shadow-xl backdrop-blur-xl border border-white/10">
              <HandCoins size={36} className="text-white" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-3xl font-black uppercase tracking-tighter text-white leading-none">
                ¡Día de Cobro!
              </DialogTitle>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest",
                  isOverdue ? "bg-red-500/30 text-white" : "bg-white/20 text-white"
                )}>
                  {isOverdue ? 'VENCIDO' : 'PARA HOY'}
                </span>
                <DialogDescription className="text-[10px] font-bold uppercase text-white/60 tracking-[0.1em]">
                  Liquidación de comisión
                </DialogDescription>
              </div>
            </div>
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="absolute right-4 top-6 rounded-full hover:bg-white/10 text-white border-none">
              <X size={24} />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="p-8 pt-4 space-y-8">
          <div className="text-center space-y-1 py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Expediente de Cierre</p>
            <h3 className="text-4xl font-black uppercase tracking-tighter leading-none drop-shadow-md">{currentApp.name}</h3>
          </div>

          <div className="bg-white/10 rounded-[2.5rem] p-8 space-y-8 backdrop-blur-xl border border-white/10 shadow-inner">
            <div className="grid grid-cols-2 gap-6 border-b border-white/10 pb-6">
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase text-white/50 tracking-widest flex items-center gap-1.5">
                  <Wallet size={10} /> Crédito
                </span>
                <p className="text-xl font-bold text-white">{formatCurrency(finalCredit)}</p>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[9px] font-black uppercase text-white/50 tracking-widest flex items-center justify-end gap-1.5">
                  Part. % <Coins size={10} />
                </span>
                <p className="text-xl font-bold text-white">{commissionPercent}%</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center py-2">
              <div className="bg-white/5 px-4 py-1.5 rounded-full border border-white/5 mb-4">
                <span className="text-[10px] font-black uppercase text-white/80 tracking-[0.3em]">Ingreso Neto para ti</span>
              </div>
              <p className="text-6xl font-black tracking-tighter drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)] text-white">
                {formatCurrency(netIncome)}
              </p>
              <p className="text-[10px] font-bold text-white/40 mt-2 uppercase tracking-widest italic">ISR Deducido (9%)</p>
            </div>

            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/5">
                <CalendarDays size={14} className="text-emerald-300" />
                <span className="text-[10px] font-black uppercase text-white/90">
                  {format(paymentDate, "d 'de' MMMM", { locale: es })}
                </span>
              </div>
              {pendingPayments.length > 1 && (
                <span className="text-[10px] font-black uppercase bg-white/20 px-3 py-1.5 rounded-full border border-white/10">
                  {currentIndex + 1} / {pendingPayments.length}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Button 
              onClick={handleConfirm}
              className="w-full h-16 rounded-[1.8rem] bg-white text-emerald-700 hover:bg-emerald-50 font-black uppercase text-base tracking-widest shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition-all active:scale-[0.97] border-none group"
            >
              <CheckCircle2 className="mr-3 h-6 w-6 transition-transform group-hover:scale-110" /> Confirmar Cobro
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={handleNext}
              className="w-full h-12 rounded-full text-white/60 hover:text-white hover:bg-white/10 font-bold uppercase text-[10px] tracking-[0.2em] border-none flex items-center justify-center gap-2"
            >
              Recordar en 60 segundos <ArrowRight size={14} />
            </Button>
          </div>
        </div>

        <div className="p-6 bg-black/20 text-center border-t border-white/5">
          <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/30">
            FINANTO SETTLEMENT ENGINE • v2.8 PRO
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

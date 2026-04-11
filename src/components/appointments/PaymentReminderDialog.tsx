
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

  // Manejador de apertura inicial e intervalos de 3 minutos (180,000 ms)
  useEffect(() => {
    if (pendingPayments.length > 0 && !isOpen) {
      // Primera apertura con pequeño delay estético
      const initialTimer = setTimeout(() => setIsOpen(true), 2500);

      // Intervalo de re-apertura cada 3 minutos exactamente
      const reminderInterval = setInterval(() => {
        setIsOpen(true);
      }, 180000);

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
    setIsOpen(false); // Cierra el diálogo, el intervalo lo volverá a abrir en 3 min
    if (currentIndex < pendingPayments.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0); 
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent 
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-[94%] sm:max-w-[450px] aspect-square p-0 overflow-hidden rounded-[3.5rem] border-none bg-gradient-to-br from-emerald-700 via-green-700 to-teal-900 text-white shadow-[0_0_60px_rgba(0,0,0,0.4)] z-[250] flex flex-col"
      >
        <DialogHeader className="p-8 pb-2 relative shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/10">
              <HandCoins size={28} className="text-white" />
            </div>
            <div className="space-y-0.5">
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-white leading-none">
                Cobro Pendiente
              </DialogTitle>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                  isOverdue ? "bg-red-500/40 text-white" : "bg-white/20 text-white"
                )}>
                  {isOverdue ? 'VENCIDO' : 'PARA HOY'}
                </span>
                <DialogDescription className="text-[9px] font-bold uppercase text-white/50 tracking-widest">
                  Liquidación Finanto
                </DialogDescription>
              </div>
            </div>
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="absolute right-4 top-6 rounded-full hover:bg-white/10 text-white border-none h-10 w-10">
              <X size={20} />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="p-8 pt-2 flex-1 flex flex-col justify-between">
          <div className="text-center space-y-1 py-2">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">CLIENTE</p>
            <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">{currentApp.name}</h3>
          </div>

          <div className="bg-black/20 rounded-[2.5rem] p-6 space-y-6 backdrop-blur-xl border border-white/5 shadow-inner flex-1 flex flex-col justify-center my-4">
            <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-4">
              <div className="space-y-0.5">
                <span className="text-[8px] font-black uppercase text-white/40 tracking-widest flex items-center gap-1">
                  <Wallet size={8} /> Crédito
                </span>
                <p className="text-sm font-bold text-white/90">{formatCurrency(finalCredit)}</p>
              </div>
              <div className="space-y-0.5 text-right">
                <span className="text-[8px] font-black uppercase text-white/40 tracking-widest flex items-center justify-end gap-1">
                  Part. % <Coins size={8} />
                </span>
                <p className="text-sm font-bold text-white/90">{commissionPercent}%</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center py-1">
              <div className="bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 mb-3">
                <span className="text-[9px] font-black uppercase text-emerald-400 tracking-[0.3em]">Ingreso Neto para ti</span>
              </div>
              <p className="text-5xl font-black tracking-tighter text-white">
                {formatCurrency(netIncome)}
              </p>
              <p className="text-[9px] font-bold text-white/30 mt-1 uppercase tracking-widest">ISR Deducido (9%)</p>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                <CalendarDays size={12} className="text-emerald-400" />
                <span className="text-[9px] font-black uppercase text-white/70">
                  {format(paymentDate, "d 'de' MMMM", { locale: es })}
                </span>
              </div>
              {pendingPayments.length > 1 && (
                <span className="text-[9px] font-black uppercase bg-white/10 px-2.5 py-1 rounded-full text-white/50">
                  {currentIndex + 1} / {pendingPayments.length}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleConfirm}
              className="w-full h-14 rounded-[1.5rem] bg-white text-emerald-800 hover:bg-emerald-50 font-black uppercase text-sm tracking-widest shadow-lg transition-all active:scale-[0.97] border-none"
            >
              <CheckCircle2 className="mr-2 h-5 w-5" /> Confirmar Cobro
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={handleNext}
              className="w-full h-10 rounded-full text-white/40 hover:text-white hover:bg-white/5 font-bold uppercase text-[8px] tracking-[0.2em] border-none"
            >
              Pausar por 3 minutos <ArrowRight size={12} className="ml-1" />
            </Button>
          </div>
        </div>

        <div className="p-4 bg-black/10 text-center border-t border-white/5 shrink-0">
          <p className="text-[7px] font-black uppercase tracking-[0.4em] text-white/20">
            FINANTO SETTLEMENT ENGINE
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

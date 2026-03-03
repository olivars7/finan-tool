"use client"

import { useState, useEffect, useMemo } from 'react';
import { 
  isToday, isAfter, isBefore, startOfDay, parseISO, 
  format, differenceInDays
} from 'date-fns';
import { es } from 'date-fns/locale';
import * as Service from '@/services/appointment-service';
import { Appointment, AppointmentStatus } from '@/services/appointment-service';
import { v4 as uuidv4 } from 'uuid';

const KEY = Service.STORAGE_KEY;

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carga inicial única - No aplica seeds automáticamente por primera vez
  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    if (stored) {
      setAppointments(JSON.parse(stored));
    } else {
      setAppointments([]);
    }
    setIsLoaded(true);
  }, []);

  const addAppointment = (data: Omit<Appointment, 'id'>) => {
    setAppointments(prev => {
      const newApp: Appointment = {
        ...data,
        id: uuidv4(),
        phone: Service.formatPhoneNumber(data.phone),
        isArchived: false
      };
      const updated = [newApp, ...prev];
      localStorage.setItem(KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const editAppointment = (id: string, partial: Partial<Appointment>) => {
    setAppointments(prev => {
      const updated = prev.map(a => {
        if (a.id === id) {
          const updatedApp = { ...a, ...partial };
          if (partial.phone) updatedApp.phone = Service.formatPhoneNumber(partial.phone);
          return updatedApp;
        }
        return a;
      });
      localStorage.setItem(KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const archiveAppointment = (id: string) => {
    setAppointments(prev => {
      const updated = prev.map(a =>
        a.id === id ? { ...a, isArchived: true } : a
      );
      localStorage.setItem(KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const unarchiveAppointment = (id: string) => {
    setAppointments(prev => {
      const updated = prev.map(a =>
        a.id === id ? { ...a, isArchived: false } : a
      );
      localStorage.setItem(KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const deletePermanent = (id: string) => {
    setAppointments(prev => {
      const updated = prev.filter(a => a.id !== id);
      localStorage.setItem(KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const resetData = () => {
    const seed = Service.generateSeedData();
    setAppointments(seed);
    localStorage.setItem(KEY, JSON.stringify(seed));
  };

  const clearAll = () => {
    setAppointments([]);
    localStorage.setItem(KEY, JSON.stringify([]));
  };

  // Filtrado de activas
  const activeAppointments = useMemo(() => appointments.filter(a => !a.isArchived), [appointments]);

  const upcoming = useMemo(() => {
    const today = startOfDay(new Date());
    return activeAppointments
      .filter(a => {
        const d = startOfDay(parseISO(a.date));
        return (isToday(d) || isAfter(d, today)) && !a.status;
      })
      .sort((a, b) => {
        const dateA = parseISO(a.date).getTime();
        const dateB = parseISO(b.date).getTime();
        if (dateA !== dateB) return dateA - dateB;
        return a.time.localeCompare(b.time);
      });
  }, [activeAppointments]);

  const past = useMemo(() => {
    const today = startOfDay(new Date());
    return activeAppointments
      .filter(a => {
        const d = startOfDay(parseISO(a.date));
        return isBefore(d, today) || !!a.status;
      })
      .sort((a, b) => {
        const dateA = parseISO(a.date).getTime();
        const dateB = parseISO(b.date).getTime();
        if (dateA !== dateB) return dateB - dateA;
        return b.time.localeCompare(a.time);
      });
  }, [activeAppointments]);

  const formatFriendlyDate = (dateStr: string) => {
    const d = parseISO(dateStr);
    const day = startOfDay(d);
    const today = startOfDay(new Date());
    const diff = differenceInDays(day, today);

    if (diff === 0) return "Hoy";
    if (diff === 1) return "Mañana";
    if (diff === -1) return "Ayer";

    if (Math.abs(diff) < 7) {
      const dayName = format(d, 'EEEE', { locale: es });
      return dayName.charAt(0).toUpperCase() + dayName.slice(1);
    }

    const f = format(d, "EEEE d 'de' MMMM 'del' yyyy", { locale: es });
    return f.charAt(0).toUpperCase() + f.slice(1);
  };

  const format12hTime = (time24h: string) => {
    if (!time24h) return '';
    const [h, m] = time24h.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const stats = useMemo(() => Service.calculateStats(appointments), [appointments]);

  return {
    appointments, upcoming, past, activeAppointments, 
    addAppointment, editAppointment, archiveAppointment, unarchiveAppointment, deletePermanent,
    resetData, clearAll, formatFriendlyDate, format12hTime,
    stats, isLoaded
  };
}

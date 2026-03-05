
"use client"

import { useState, useEffect, useMemo } from 'react';
import { 
  isToday, isAfter, isBefore, startOfDay, parseISO, 
  format, differenceInDays
} from 'date-fns';
import { es } from 'date-fns/locale';
import * as Service from '@/services/appointment-service';
import * as FirebaseStore from '@/lib/firebaseAppointments';
import { Appointment } from '@/services/appointment-service';
import { v4 as uuidv4 } from 'uuid';
import { onAuthChange } from '@/lib/auth';
import { User } from 'firebase/auth';

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Escuchar cambios de auth y cargar datos de Firestore
  useEffect(() => {
    const unsubscribe = onAuthChange(async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // 1. Intentar migrar datos si existen en local
        const migratedData = await FirebaseStore.migrateLocalAppointments(currentUser.uid);
        
        if (migratedData) {
          setAppointments(migratedData);
        } else {
          // 2. Cargar directamente desde Firestore
          const cloudApps = await FirebaseStore.loadAppointments(currentUser.uid);
          setAppointments(cloudApps);
        }
      } else {
        // Si no hay sesión, intentamos usar local por compatibilidad offline
        const stored = Service.getFromDisk();
        setAppointments(stored);
      }
      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Helper para persistir cambios tanto en estado como en Firestore
   */
  const persistAppointments = async (updatedList: Appointment[]) => {
    setAppointments(updatedList);
    // Sincronizar con localStorage (offline fallback)
    Service.saveToDisk(updatedList);
    
    // Sincronizar con Firestore
    if (user) {
      try {
        await FirebaseStore.saveAppointments(user.uid, updatedList);
      } catch (err) {
        console.error("Error al sincronizar con la nube:", err);
      }
    }
  };

  const addAppointment = async (data: Omit<Appointment, 'id'>) => {
    const newApp: Appointment = {
      ...data,
      id: uuidv4(),
      phone: Service.formatPhoneNumber(data.phone),
      isArchived: false
    };

    const updated = [newApp, ...appointments];
    await persistAppointments(updated);
  };

  const editAppointment = async (id: string, partial: Partial<Appointment>) => {
    const updated = appointments.map(a => {
      if (a.id === id) {
        const updatedApp = { ...a, ...partial };
        if (partial.phone) updatedApp.phone = Service.formatPhoneNumber(partial.phone);
        return updatedApp;
      }
      return a;
    });
    await persistAppointments(updated);
  };

  const archiveAppointment = (id: string) => {
    editAppointment(id, { isArchived: true });
  };

  const unarchiveAppointment = (id: string) => {
    editAppointment(id, { isArchived: false });
  };

  const deletePermanent = async (id: string) => {
    const updated = appointments.filter(a => a.id !== id);
    await persistAppointments(updated);
  };

  const resetData = async () => {
    const seed = Service.generateSeedData();
    await persistAppointments(seed);
    // Forzamos recarga para asegurar sincronía total
    window.location.reload();
  };

  const clearAll = async () => {
    await persistAppointments([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('FINANTO_MIGRATED');
    }
    window.location.reload();
  };

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
    stats, isLoaded, user
  };
}

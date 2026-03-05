
"use client"

import { useState, useEffect, useMemo } from 'react';
import { 
  isToday, isAfter, isBefore, startOfDay, parseISO, 
  format, differenceInDays
} from 'date-fns';
import { es } from 'date-fns/locale';
import * as Service from '@/services/appointment-service';
import * as FirestoreService from '@/services/firestore-appointments';
import { Appointment } from '@/services/appointment-service';
import { v4 as uuidv4 } from 'uuid';
import { onAuthChange } from '@/lib/auth';
import { User } from 'firebase/auth';

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Escuchar cambios de auth y cargar datos
  useEffect(() => {
    const unsubscribe = onAuthChange(async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // 1. Intentar migrar si es necesario
        await FirestoreService.migrateLocalStorageAppointments(currentUser.uid);
        
        // 2. Cargar desde Firestore
        try {
          const cloudApps = await FirestoreService.getAppointmentsForUser(currentUser.uid);
          setAppointments(cloudApps);
        } catch (error) {
          console.error("Fallback to local storage due to Firestore error:", error);
          const stored = localStorage.getItem(Service.STORAGE_KEY);
          if (stored) setAppointments(JSON.parse(stored));
        }
      } else {
        // Si no hay usuario, limpiar o usar local (para offline parcial)
        const stored = localStorage.getItem(Service.STORAGE_KEY);
        if (stored) setAppointments(JSON.parse(stored));
      }
      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  const addAppointment = async (data: Omit<Appointment, 'id'>) => {
    const newApp: Appointment = {
      ...data,
      id: uuidv4(),
      phone: Service.formatPhoneNumber(data.phone),
      isArchived: false
    };

    // Optimistic Update
    setAppointments(prev => [newApp, ...prev]);

    if (user) {
      FirestoreService.createFirestoreAppointment(newApp, user.uid).catch(err => {
        console.error("Error sync to cloud:", err);
      });
    }
    
    // Fallback local
    const updated = [newApp, ...appointments];
    localStorage.setItem(Service.STORAGE_KEY, JSON.stringify(updated));
  };

  const editAppointment = async (id: string, partial: Partial<Appointment>) => {
    setAppointments(prev => {
      const updated = prev.map(a => {
        if (a.id === id) {
          const updatedApp = { ...a, ...partial };
          if (partial.phone) updatedApp.phone = Service.formatPhoneNumber(partial.phone);
          
          if (user) {
            FirestoreService.updateFirestoreAppointment(id, updatedApp).catch(err => {
              console.error("Error updating cloud:", err);
            });
          }
          return updatedApp;
        }
        return a;
      });
      localStorage.setItem(Service.STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const archiveAppointment = (id: string) => {
    editAppointment(id, { isArchived: true });
  };

  const unarchiveAppointment = (id: string) => {
    editAppointment(id, { isArchived: false });
  };

  const deletePermanent = async (id: string) => {
    setAppointments(prev => {
      const updated = prev.filter(a => a.id !== id);
      if (user) {
        FirestoreService.deleteFirestoreAppointment(id).catch(err => {
          console.error("Error deleting from cloud:", err);
        });
      }
      localStorage.setItem(Service.STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const resetData = async () => {
    const seed = Service.generateSeedData();
    setAppointments(seed);
    localStorage.setItem(Service.STORAGE_KEY, JSON.stringify(seed));
    
    if (user) {
      // Re-migrar o subir batch en caso de reset (opcional)
      for (const app of seed) {
        await FirestoreService.createFirestoreAppointment(app, user.uid);
      }
    }
  };

  const clearAll = () => {
    setAppointments([]);
    localStorage.setItem(Service.STORAGE_KEY, JSON.stringify([]));
    // Nota: Por seguridad no borramos masivamente de Firestore aquí
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

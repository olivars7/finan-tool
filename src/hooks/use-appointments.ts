"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
import { ensureUserDocument } from '@/lib/user-service';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { useToast } from '@/hooks/use-toast';

/**
 * @fileOverview Hook Maestro de Gestión de Citas.
 * Maneja la lógica de negocio y la sincronización bidireccional con Firestore.
 */
export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const { toast } = useToast();

  // Refs para control de sincronización externa
  const isInitialLoad = useRef(true);
  const pendingLocalUpdate = useRef(false);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthChange(async (currentUser) => {
      setUser(currentUser);
      isInitialLoad.current = true;
      
      if (currentUser) {
        // Al detectar usuario, primero establecemos el canal de LECTURA (onSnapshot)
        // Esto garantiza que la app siempre sepa qué hay en la nube antes de cualquier acción
        unsubscribeSnapshot = onSnapshot(doc(db, "users", currentUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const cloudApps = data.appointments || [];
            const hasPendingWrites = docSnap.metadata.hasPendingWrites;

            // Detección de cambios externos (Sync amarilla)
            if (!hasPendingWrites) {
              if (isInitialLoad.current) {
                isInitialLoad.current = false;
              } else if (!pendingLocalUpdate.current) {
                toast({
                  variant: "warning",
                  title: "Sincronización en la nube",
                  description: "Se han recibido cambios desde otro dispositivo.",
                });
              }
              pendingLocalUpdate.current = false;
            }

            setAppointments(cloudApps);
            setProfile(data);
          }
        }, (err) => {
          console.error("Error en listener Firestore:", err);
        });

        // DESPUÉS de iniciar la lectura, actualizamos el perfil (Única escritura permitida al cargar)
        await ensureUserDocument(currentUser);

        // NOTA: Se ha eliminado migrateLocalAppointments() para evitar escrituras 
        // accidentales en la lista de citas al abrir la página.

      } else {
        // Modo offline / local
        const stored = Service.getFromDisk();
        setAppointments(stored);
        setProfile(null);
      }
      setIsLoaded(true);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [toast]);

  /**
   * Persiste los cambios inmediatamente en la base de datos solo por acción del usuario.
   */
  const persistAppointments = useCallback(async (updatedList: Appointment[]) => {
    pendingLocalUpdate.current = true;
    
    // Actualización local para UI instantánea
    setAppointments(updatedList);
    Service.saveToDisk(updatedList);
    
    if (user) {
      try {
        // Escritura explícita en Firestore por acción de usuario
        await FirebaseStore.saveAppointments(user.uid, updatedList);
      } catch (err) {
        console.error("Error al sincronizar con Firestore:", err);
        pendingLocalUpdate.current = false;
      }
    }
  }, [user]);

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

  const statsData = useMemo(() => Service.calculateStats(appointments), [appointments]);

  return {
    appointments, upcoming, past, activeAppointments, 
    addAppointment, editAppointment, archiveAppointment, unarchiveAppointment, deletePermanent,
    formatFriendlyDate, format12hTime,
    stats: statsData, isLoaded, user, profile
  };
}

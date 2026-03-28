
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { Appointment, STORAGE_KEY, calculateStats } from "@/services/appointment-service";

/**
 * Carga las citas desde el documento del usuario en Firestore.
 */
export const loadAppointments = async (userId: string): Promise<Appointment[]> => {
  const docRef = doc(db, "users", userId);
  try {
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const appointments = data.appointments || [];
      return appointments;
    }
    return [];
  } catch (error) {
    console.error("Error al cargar citas desde Firestore:", error);
    return [];
  }
};

/**
 * Guarda el array completo de citas en el documento del usuario de forma inmediata.
 * También actualiza el resumen de estadísticas para consumo rápido.
 */
export const saveAppointments = async (userId: string, appointments: Appointment[]) => {
  const docRef = doc(db, "users", userId);
  try {
    const stats = calculateStats(appointments);
    const statsSummary = {
      monthlyIncome: Math.round(stats.currentMonthCommission || 0),
      totalCreditSold: Math.round(stats.totalCreditSold || 0),
      monthlyProspects: stats.currentMonthProspects || 0,
      lastUpdated: new Date().toISOString()
    };

    // Actualización atómica del registro
    await setDoc(docRef, { 
      appointments, 
      statsSummary,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
  } catch (error) {
    console.error("Error al guardar en Firestore:", error);
    throw error;
  }
};

/**
 * Migra los datos de localStorage a Firestore si existen (Solo una vez).
 */
export const migrateLocalAppointments = async (userId: string): Promise<Appointment[] | null> => {
  if (typeof window === 'undefined') return null;
  
  const localData = localStorage.getItem(STORAGE_KEY);
  if (!localData) return null;

  try {
    const appointments: Appointment[] = JSON.parse(localData);
    if (Array.isArray(appointments) && appointments.length > 0) {
      await saveAppointments(userId, appointments);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem("FINANTO_MIGRATED", "true");
      return appointments;
    }
  } catch (e) {
    console.error("Error durante la migración de datos locales:", e);
  }
  return null;
};

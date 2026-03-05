
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { Appointment, STORAGE_KEY } from "@/services/appointment-service";

/**
 * Carga las citas desde el documento del usuario en Firestore.
 * users/{userId} -> { appointments: [] }
 */
export const loadAppointments = async (userId: string): Promise<Appointment[]> => {
  const docRef = doc(db, "users", userId);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().appointments || [];
    } else {
      // Si el documento no existe, lo creamos vacío
      await setDoc(docRef, { appointments: [] });
      return [];
    }
  } catch (error) {
    console.error("Error al cargar citas desde Firestore:", error);
    return [];
  }
};

/**
 * Guarda el array completo de citas en el documento del usuario.
 */
export const saveAppointments = async (userId: string, appointments: Appointment[]) => {
  const docRef = doc(db, "users", userId);
  try {
    // Usamos setDoc con merge para asegurar que el documento exista
    await setDoc(docRef, { appointments }, { merge: true });
  } catch (error) {
    console.error("Error al guardar citas en Firestore:", error);
    throw error;
  }
};

/**
 * Migra los datos de localStorage a Firestore si existen.
 */
export const migrateLocalAppointments = async (userId: string): Promise<Appointment[] | null> => {
  if (typeof window === 'undefined') return null;
  
  const localData = localStorage.getItem(STORAGE_KEY);
  if (!localData) return null;

  try {
    const appointments: Appointment[] = JSON.parse(localData);
    if (Array.isArray(appointments) && appointments.length > 0) {
      // Guardar en Firestore
      await saveAppointments(userId, appointments);
      // Limpiar local para evitar duplicidad en el futuro
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem("FINANTO_MIGRATED", "true");
      console.log("Migración completada con éxito.");
      return appointments;
    }
  } catch (e) {
    console.error("Error durante la migración de datos locales:", e);
  }
  return null;
};


import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  writeBatch
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { Appointment, STORAGE_KEY } from "./appointment-service";

const COLLECTION_NAME = "appointments";

/**
 * Crea una nueva cita en Firestore asociada al usuario
 */
export const createFirestoreAppointment = async (app: Appointment, userId: string) => {
  const docRef = doc(db, COLLECTION_NAME, app.id);
  await setDoc(docRef, { ...app, userId });
};

/**
 * Actualiza una cita existente
 */
export const updateFirestoreAppointment = async (id: string, data: Partial<Appointment>) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, data);
};

/**
 * Elimina (o archiva) una cita
 */
export const deleteFirestoreAppointment = async (id: string) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};

/**
 * Obtiene todas las citas de un usuario específico
 */
export const getAppointmentsForUser = async (userId: string): Promise<Appointment[]> => {
  const q = query(collection(db, COLLECTION_NAME), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  const apps: Appointment[] = [];
  querySnapshot.forEach((doc) => {
    apps.push(doc.data() as Appointment);
  });
  return apps;
});

/**
 * Migra datos de LocalStorage a Firestore una sola vez
 */
export const migrateLocalStorageAppointments = async (userId: string) => {
  const isMigrated = localStorage.getItem("FINANTO_MIGRATED");
  if (isMigrated === "true") return;

  const localData = localStorage.getItem(STORAGE_KEY);
  if (!localData) {
    localStorage.setItem("FINANTO_MIGRATED", "true");
    return;
  }

  try {
    const apps: Appointment[] = JSON.parse(localData);
    if (apps.length === 0) {
      localStorage.setItem("FINANTO_MIGRATED", "true");
      return;
    }

    const batch = writeBatch(db);
    apps.forEach((app) => {
      const docRef = doc(db, COLLECTION_NAME, app.id);
      batch.set(docRef, { ...app, userId });
    });

    await batch.commit();
    localStorage.setItem("FINANTO_MIGRATED", "true");
    console.log(`Migración exitosa: ${apps.length} citas subidas.`);
  } catch (error) {
    console.error("Error durante la migración:", error);
  }
};

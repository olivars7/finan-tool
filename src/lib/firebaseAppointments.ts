
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { Appointment, STORAGE_KEY, calculateStats } from "@/services/appointment-service";

/**
 * Carga las citas desde el documento del usuario en Firestore.
 * users/{userId} -> { appointments: [], statsSummary: [] }
 * 
 * Implementa detección automática de campos faltantes para cuentas antiguas.
 */
export const loadAppointments = async (userId: string): Promise<Appointment[]> => {
  const docRef = doc(db, "users", userId);
  try {
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const appointments = data.appointments || [];
      
      // REPARACIÓN AUTOMÁTICA: Si la cuenta existía pero no tenía statsSummary
      if (!data.statsSummary) {
        const stats = calculateStats(appointments);
        const statsSummary = [
          Math.round(stats.currentMonthCommission || 0),
          Math.round(stats.totalCreditSold || 0),
          stats.currentMonthProspects || 0
        ];
        
        // Guardamos el campo faltante de forma silenciosa
        await setDoc(docRef, { 
          statsSummary,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        
        console.log("StatsSummary generado automáticamente para cuenta existente.");
      }
      
      return appointments;
    } else {
      // USUARIO NUEVO: Creamos el documento con valores por defecto (ceros)
      const initialStats = [0, 0, 0];
      await setDoc(docRef, { 
        appointments: [], 
        statsSummary: initialStats,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      return [];
    }
  } catch (error) {
    console.error("Error al cargar citas o inicializar stats desde Firestore:", error);
    return [];
  }
};

/**
 * Guarda el array completo de citas en el documento del usuario.
 * También genera y guarda un resumen de estadísticas básicas (statsSummary).
 */
export const saveAppointments = async (userId: string, appointments: Appointment[]) => {
  const docRef = doc(db, "users", userId);
  try {
    // Calculamos las estadísticas actuales para guardar el resumen en la DB
    const stats = calculateStats(appointments);
    
    /**
     * statsSummary Array:
     * [0] = Ingreso este mes (Proyectado neto)
     * [1] = Crédito vendido total este mes
     * [2] = Prospectos registrados este mes
     */
    const statsSummary = [
      Math.round(stats.currentMonthCommission || 0),
      Math.round(stats.totalCreditSold || 0),
      stats.currentMonthProspects || 0
    ];

    // Usamos setDoc con merge para asegurar que el documento exista y actualizar campos específicos
    await setDoc(docRef, { 
      appointments, 
      statsSummary,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
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
      // Guardar en Firestore (esto también generará el statsSummary automáticamente)
      await saveAppointments(userId, appointments);
      
      // Limpiar local para evitar duplicidad en el futuro
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem("FINANTO_MIGRATED", "true");
      console.log("Migración completada con éxito incluyendo resumen de stats.");
      return appointments;
    }
  } catch (e) {
    console.error("Error durante la migración de datos locales:", e);
  }
  return null;
};

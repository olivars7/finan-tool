
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { Appointment, STORAGE_KEY, calculateStats } from "@/services/appointment-service";

/**
 * Carga las citas desde el documento del usuario en Firestore.
 * users/{userId} -> { appointments: [], statsSummary: {} }
 * 
 * Implementa detección automática de campos faltantes o conversión de formatos antiguos.
 */
export const loadAppointments = async (userId: string): Promise<Appointment[]> => {
  const docRef = doc(db, "users", userId);
  try {
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const appointments = data.appointments || [];
      
      // REPARACIÓN/CONVERSIÓN AUTOMÁTICA: 
      // Si el campo no existe o si es un Array (formato antiguo), lo convertimos a Objeto.
      if (!data.statsSummary || Array.isArray(data.statsSummary)) {
        const stats = calculateStats(appointments);
        const statsSummary = {
          monthlyIncome: Math.round(stats.currentMonthCommission || 0),
          totalCreditSold: Math.round(stats.totalCreditSold || 0),
          monthlyProspects: stats.currentMonthProspects || 0
        };
        
        // Guardamos la nueva estructura de objeto de forma silenciosa
        await setDoc(docRef, { 
          statsSummary,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        
        console.log("StatsSummary migrado de Array a Objeto con éxito.");
      }
      
      return appointments;
    } else {
      // USUARIO NUEVO: Creamos el documento con valores por defecto (objeto)
      const initialStats = {
        monthlyIncome: 0,
        totalCreditSold: 0,
        monthlyProspects: 0
      };
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
 * También genera y guarda un resumen de estadísticas básicas (statsSummary) como OBJETO.
 */
export const saveAppointments = async (userId: string, appointments: Appointment[]) => {
  const docRef = doc(db, "users", userId);
  try {
    // Calculamos las estadísticas actuales para guardar el resumen en la DB
    const stats = calculateStats(appointments);
    
    /**
     * statsSummary Object:
     * monthlyIncome: Ingreso este mes (Proyectado neto)
     * totalCreditSold: Crédito vendido total este mes
     * monthlyProspects: Prospectos registrados este mes
     */
    const statsSummary = {
      monthlyIncome: Math.round(stats.currentMonthCommission || 0),
      totalCreditSold: Math.round(stats.totalCreditSold || 0),
      monthlyProspects: stats.currentMonthProspects || 0
    };

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
      // Guardar en Firestore (esto también generará el statsSummary como objeto automáticamente)
      await saveAppointments(userId, appointments);
      
      // Limpiar local para evitar duplicidad en el futuro
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem("FINANTO_MIGRATED", "true");
      console.log("Migración completada con éxito incluyendo resumen de stats en formato objeto.");
      return appointments;
    }
  } catch (e) {
    console.error("Error durante la migración de datos locales:", e);
  }
  return null;
};

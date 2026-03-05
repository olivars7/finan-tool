import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { User } from "firebase/auth";

/**
 * Asegura que el perfil del usuario esté completo en Firestore.
 * Esta función se ejecuta en cada inicio de sesión/carga para garantizar que 
 * tanto usuarios nuevos como antiguos tengan su información sincronizada.
 */
export async function ensureUserDocument(user: User) {
  const userRef = doc(db, "users", user.uid);
  
  try {
    // 1. Obtener el estado actual del documento
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : null;

    // 2. Preparar los datos básicos que siempre queremos mantener actualizados
    // Usamos merge: true para no tocar el array de 'appointments'
    const profileUpdate: any = {
      name: user.displayName || "Sin nombre",
      email: user.email || "Sin email",
      photoURL: user.photoURL || "",
      lastLogin: serverTimestamp(),
    };

    // 3. Si el usuario es nuevo o no tiene fecha de creación, establecemos valores iniciales
    if (!userData || !userData.createdAt) {
      profileUpdate.createdAt = serverTimestamp();
      profileUpdate.role = "prospectador"; // Rol predeterminado en español
    }

    // 4. Ejecutar la actualización/creación con merge
    await setDoc(userRef, profileUpdate, { merge: true });
    
    if (!userData) {
      console.log(`Nuevo perfil de prospectador creado para: ${user.email}`);
    } else if (!userData.email || !userData.name) {
      console.log(`Perfil existente completado para: ${user.email}`);
    }

  } catch (error) {
    console.error("Error al sincronizar el perfil de usuario en Firestore:", error);
  }
}

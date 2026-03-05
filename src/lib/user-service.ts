import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { User } from "firebase/auth";

/**
 * Verifica si el documento del usuario existe en Firestore.
 * Si no existe, crea uno nuevo con datos básicos y rol de ejecutivo.
 * Utiliza merge: true para no sobrescribir el campo de citas (appointments) si ya existe.
 */
export async function ensureUserDocument(user: User) {
  const userRef = doc(db, "users", user.uid);
  
  try {
    const userSnap = await getDoc(userRef);
    
    // Si el documento no existe o le faltan campos básicos de perfil
    if (!userSnap.exists() || !userSnap.data().email) {
      await setDoc(userRef, {
        name: user.displayName || "Sin nombre",
        email: user.email || "Sin email",
        role: "executive",
        photoURL: user.photoURL || "",
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      }, { merge: true });
      
      console.log(`Usuario ${user.email} registrado exitosamente en Firestore.`);
    } else {
      // Actualizar último acceso si ya existe
      await setDoc(userRef, {
        lastLogin: serverTimestamp()
      }, { merge: true });
    }
  } catch (error) {
    console.error("Error al asegurar documento de usuario en Firestore:", error);
  }
}

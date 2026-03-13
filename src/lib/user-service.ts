import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { User } from "firebase/auth";

/**
 * Asegura que el perfil del usuario esté completo en Firestore.
 */
export async function ensureUserDocument(user: User) {
  const userRef = doc(db, "users", user.uid);
  
  try {
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : null;

    const profileUpdate: any = {
      name: user.displayName || "Sin nombre",
      email: user.email || "Sin email",
      photoURL: user.photoURL || "",
      lastLogin: serverTimestamp(),
    };

    if (!userData || !userData.createdAt) {
      profileUpdate.createdAt = serverTimestamp();
      profileUpdate.role = "prospectador";
    }

    await setDoc(userRef, profileUpdate, { merge: true });
  } catch (error) {
    console.error("Error al sincronizar el perfil de usuario en Firestore:", error);
  }
}

/**
 * Obtiene todos los usuarios registrados en la plataforma.
 */
export async function getAllUsers() {
  const usersRef = collection(db, "users");
  try {
    const querySnapshot = await getDocs(usersRef);
    return querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
  }
}

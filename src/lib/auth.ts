
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User
} from "firebase/auth";
import { auth } from "@/app/lib/firebase";

const googleProvider = new GoogleAuthProvider();

/**
 * Inicia sesión con Google Popup
 */
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error logging in with Google:", error);
    throw error;
  }
};

/**
 * Cierra sesión
 */
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

/**
 * Suscriptor al estado de autenticación
 */
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Obtiene el usuario actual de forma síncrona (si está cargado)
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

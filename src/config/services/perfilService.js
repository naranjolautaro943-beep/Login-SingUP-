import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

// Cada usuario tiene un documento en "usuarios" cuyo id es su uid de Firebase Auth
const perfilRef = (uid) => doc(db, 'usuarios', uid);

// LEER: devuelve los datos extra del perfil (teléfono, preferencias) o {} si todavía no hay
export const obtenerPerfil = async (uid) => {
  const snap = await getDoc(perfilRef(uid));
  return snap.exists() ? snap.data() : {};
};

// GUARDAR: crea el documento si no existe y, si existe, solo cambia los campos enviados
export const guardarPerfil = async (uid, datos) => {
  await setDoc(perfilRef(uid), { ...datos, actualizadoEn: serverTimestamp() }, { merge: true });
};

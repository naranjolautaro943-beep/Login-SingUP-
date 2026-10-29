import {
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

const actividadRef = () => collection(db, 'actividad');

// CREAR
export const agregarActividad = async (actividad) => {
  const ref = await addDoc(actividadRef(), { ...actividad, creadoEn: serverTimestamp() });
  return ref.id;
};

// LEER (todas), de la más nueva a la más vieja
export const obtenerActividades = async () => {
  const snap = await getDocs(actividadRef());
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.creadoEn?.seconds ?? 0) - (a.creadoEn?.seconds ?? 0));
};

// EDITAR
export const editarActividad = async (id, datos) => {
  await updateDoc(doc(db, 'actividad', id), datos);
};

// ELIMINAR
export const eliminarActividad = async (id) => {
  await deleteDoc(doc(db, 'actividad', id));
};

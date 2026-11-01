import {
  collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

const cajaRef = () => collection(db, 'caja');

// CREAR
export const agregarMovimiento = async (movimiento) => {
  const ref = await addDoc(cajaRef(), { ...movimiento, creadoEn: serverTimestamp() });
  return ref.id;
};

// LEER (todos), del más nuevo al más viejo
export const obtenerMovimientos = async () => {
  const snap = await getDocs(cajaRef());
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.creadoEn?.seconds ?? 0) - (a.creadoEn?.seconds ?? 0));
};

// LEER (uno)
export const obtenerMovimiento = async (id) => {
  const snap = await getDoc(doc(db, 'caja', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// EDITAR
export const editarMovimiento = async (id, datos) => {
  await updateDoc(doc(db, 'caja', id), datos);
};

// ELIMINAR
export const eliminarMovimiento = async (id) => {
  await deleteDoc(doc(db, 'caja', id));
};

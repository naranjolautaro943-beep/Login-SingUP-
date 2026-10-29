import {
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

const catalogoRef = () => collection(db, 'catalogo');

// CREAR
export const agregarItemCatalogo = async (item) => {
  const ref = await addDoc(catalogoRef(), { ...item, creadoEn: serverTimestamp() });
  return ref.id;
};

// LEER (todos), ordenados por nombre
export const obtenerCatalogo = async () => {
  const snap = await getDocs(catalogoRef());
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => String(a.nombre ?? '').localeCompare(String(b.nombre ?? '')));
};

// EDITAR
export const editarItemCatalogo = async (id, datos) => {
  await updateDoc(doc(db, 'catalogo', id), datos);
};

// ELIMINAR
export const eliminarItemCatalogo = async (id) => {
  await deleteDoc(doc(db, 'catalogo', id));
};

import {
  collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

const productosRef = () => collection(db, 'productos');

export const agregarProducto = async (producto) => {
  const ref = await addDoc(productosRef(), { ...producto, creadoEn: serverTimestamp() });
  return ref.id;
};

export const obtenerProductos = async () => {
  const snap = await getDocs(productosRef());
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const obtenerProducto = async (id) => {
  const snap = await getDoc(doc(db, 'productos', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const editarProducto = async (id, datos) => {
  await updateDoc(doc(db, 'productos', id), datos);
};

export const eliminarProducto = async (id) => {
  await deleteDoc(doc(db, 'productos', id));
};
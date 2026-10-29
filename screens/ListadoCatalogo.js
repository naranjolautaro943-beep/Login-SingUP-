import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { obtenerCatalogo, eliminarItemCatalogo } from '../src/config/services/catalogoService';
import { colors, fontSizes, spacing } from '../src/config/stilos/theme';
import ModalConfirmarEliminar from '../src/config/components/ModalConfirmarEliminar';

const CELESTE = '#2f60d0'; // Celeste Cielo (Manual de Identidad)

const formatearPrecio = (n) => '$' + Number(n ?? 0).toLocaleString('es-AR');

export default function ListadoCatalogo({ navigation }) {
  const [items, setItems] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  const [seleccionado, setSeleccionado] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState('');

  // LEER: se recarga cada vez que la pantalla recupera el foco (al volver de crear o editar)
  useFocusEffect(
    useCallback(() => {
      const cargar = async () => {
        try {
          setItems(await obtenerCatalogo());
        } catch (e) {
          console.log('Error al cargar el catálogo', e);
        } finally {
          setCargando(false);
        }
      };
      cargar();
    }, [])
  );

  const texto = busqueda.toLowerCase();
  const filtrados = items.filter(
    (i) =>
      (i.nombre || '').toLowerCase().includes(texto) ||
      (i.categoria || '').toLowerCase().includes(texto)
  );

  const confirmarEliminacion = async () => {
    if (!seleccionado) return;
    setEliminando(true);
    setErrorEliminar('');
    try {
      await eliminarItemCatalogo(seleccionado.id);
      setItems((prev) => prev.filter((i) => i.id !== seleccionado.id));
      setSeleccionado(null);
    } catch (e) {
      console.log('Error al eliminar artículo', e.code, e.message);
      setErrorEliminar(
        e.code === 'permission-denied'
          ? 'No tiene permisos para eliminar este artículo.'
          : 'No se pudo eliminar el artículo. Intente nuevamente.'
      );
    } finally {
      setEliminando(false);
    }
  };

  if (cargando) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.primary} />;
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.buscador}
        placeholder="Buscar por nombre o categoría..."
        value={busqueda}
        onChangeText={setBusqueda}
      />

      <FlatList
        data={filtrados}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.vacio}>No hay artículos en el catálogo.</Text>}
        contentContainerStyle={{ paddingBottom: 90 }}
        renderItem={({ item }) => {
          const disponible = item.disponible !== false;
          return (
            <View style={[styles.tarjeta, !disponible && styles.tarjetaNoDisponible]}>
              <TouchableOpacity
                style={styles.tarjetaInfo}
                onPress={() => navigation.navigate('FormularioCatalogo', { item })}
              >
                <Text style={styles.nombre}>{item.nombre}</Text>
                {!!item.descripcion && (
                  <Text style={styles.descripcion} numberOfLines={2}>{item.descripcion}</Text>
                )}
                <Text style={styles.detalle}>
                  {[item.categoria, disponible ? 'Disponible' : 'No disponible'].filter(Boolean).join(' · ')}
                </Text>
              </TouchableOpacity>
              <Text style={styles.precio}>{formatearPrecio(item.precio)}</Text>
              <TouchableOpacity
                style={styles.botonIcono}
                onPress={() => navigation.navigate('FormularioCatalogo', { item })}
                accessibilityLabel={'Editar ' + item.nombre}
              >
                <FontAwesome name="pencil" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.botonIcono}
                onPress={() => { setErrorEliminar(''); setSeleccionado(item); }}
                accessibilityLabel={'Eliminar ' + item.nombre}
              >
                <FontAwesome name="trash" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('FormularioCatalogo')}>
        <Text style={styles.fabText}>+ Agregar</Text>
      </TouchableOpacity>

      <ModalConfirmarEliminar
        visible={!!seleccionado}
        titulo="Eliminar artículo"
        nombre={seleccionado?.nombre ?? 'este artículo'}
        eliminando={eliminando}
        error={errorEliminar}
        onConfirmar={confirmarEliminacion}
        onCancelar={() => { if (!eliminando) { setSeleccionado(null); setErrorEliminar(''); } }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.medium },
  buscador: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 12, marginBottom: spacing.medium, fontSize: fontSizes.medium,
  },
  tarjeta: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border, borderRadius: 12,
    padding: spacing.medium, marginBottom: spacing.small,
  },
  tarjetaNoDisponible: { opacity: 0.55 },
  tarjetaInfo: { flex: 1 },
  nombre: { fontSize: fontSizes.medium, fontWeight: 'bold', color: colors.primary },
  descripcion: { fontSize: fontSizes.small, color: colors.primary, marginTop: 2 },
  detalle: { fontSize: fontSizes.small, color: colors.primary, opacity: 0.7, marginTop: 4 },
  precio: { fontSize: fontSizes.medium, fontWeight: '700', color: CELESTE, marginHorizontal: spacing.small },
  botonIcono: { padding: spacing.small },
  vacio: { textAlign: 'center', marginTop: spacing.large, color: colors.primary },
  fab: {
    position: 'absolute', right: spacing.medium, bottom: spacing.large,
    backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 18,
  },
  fabText: { color: colors.background, fontWeight: '600', fontSize: fontSizes.medium },
});

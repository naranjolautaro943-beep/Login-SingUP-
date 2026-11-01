import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { obtenerActividades, eliminarActividad } from '../src/config/services/actividadService';
import { colors, fontSizes, spacing } from '../src/config/stilos/theme';
import ModalConfirmarEliminar from '../src/config/components/ModalConfirmarEliminar';

const CELESTE = '#2f60d0'; // Celeste Cielo (Manual de Identidad)

const formatearFecha = (ts) => {
  const fecha = ts?.toDate?.();
  return fecha ? fecha.toLocaleDateString('es-AR') : '';
};

export default function ListadoActividad({ navigation }) {
  const [actividades, setActividades] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  const [seleccionada, setSeleccionada] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState('');

  // LEER: se recarga cada vez que la pantalla recupera el foco (al volver de crear o editar)
  useFocusEffect(
    useCallback(() => {
      const cargar = async () => {
        try {
          setActividades(await obtenerActividades());
        } catch (e) {
          console.log('Error al cargar actividades', e);
        } finally {
          setCargando(false);
        }
      };
      cargar();
    }, [])
  );

  const texto = busqueda.toLowerCase();
  const filtradas = actividades.filter(
    (a) =>
      (a.titulo || '').toLowerCase().includes(texto) ||
      (a.tipo || '').toLowerCase().includes(texto)
  );

  const confirmarEliminacion = async () => {
    if (!seleccionada) return;
    setEliminando(true);
    setErrorEliminar('');
    try {
      await eliminarActividad(seleccionada.id);
      setActividades((prev) => prev.filter((a) => a.id !== seleccionada.id));
      setSeleccionada(null);
    } catch (e) {
      console.log('Error al eliminar actividad', e.code, e.message);
      setErrorEliminar(
        e.code === 'permission-denied'
          ? 'No tiene permisos para eliminar esta actividad.'
          : 'No se pudo eliminar la actividad. Intente nuevamente.'
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
        placeholder="Buscar por título o tipo..."
        value={busqueda}
        onChangeText={setBusqueda}
      />

      <FlatList
        data={filtradas}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.vacio}>No hay actividades registradas.</Text>}
        contentContainerStyle={{ paddingBottom: 90 }}
        renderItem={({ item }) => {
          const completada = item.estado === 'Completada';
          return (
            <View style={styles.tarjeta}>
              <TouchableOpacity
                style={styles.tarjetaInfo}
                onPress={() => navigation.navigate('FormularioActividad', { actividad: item })}
              >
                <Text style={styles.titulo}>{item.titulo}</Text>
                {!!item.descripcion && (
                  <Text style={styles.descripcion} numberOfLines={2}>{item.descripcion}</Text>
                )}
                <Text style={styles.detalle}>
                  {[item.tipo, item.usuario, formatearFecha(item.creadoEn)].filter(Boolean).join(' · ')}
                </Text>
                <View style={[styles.estado, completada ? styles.estadoCompletada : styles.estadoPendiente]}>
                  <Text style={[styles.estadoTexto, completada && { color: colors.background }]}>
                    {item.estado ?? 'Pendiente'}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.botonIcono}
                onPress={() => navigation.navigate('FormularioActividad', { actividad: item })}
                accessibilityLabel={'Editar ' + item.titulo}
              >
                <FontAwesome name="pencil" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.botonIcono}
                onPress={() => { setErrorEliminar(''); setSeleccionada(item); }}
                accessibilityLabel={'Eliminar ' + item.titulo}
              >
                <FontAwesome name="trash" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('FormularioActividad')}>
        <Text style={styles.fabText}>+ Agregar</Text>
      </TouchableOpacity>

      <ModalConfirmarEliminar
        visible={!!seleccionada}
        titulo="Eliminar actividad"
        nombre={seleccionada?.titulo ?? 'esta actividad'}
        eliminando={eliminando}
        error={errorEliminar}
        onConfirmar={confirmarEliminacion}
        onCancelar={() => { if (!eliminando) { setSeleccionada(null); setErrorEliminar(''); } }}
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
  tarjetaInfo: { flex: 1 },
  titulo: { fontSize: fontSizes.medium, fontWeight: 'bold', color: colors.primary },
  descripcion: { fontSize: fontSizes.small, color: colors.primary, marginTop: 2 },
  detalle: { fontSize: fontSizes.small, color: colors.primary, opacity: 0.7, marginTop: 4 },
  estado: {
    alignSelf: 'flex-start', borderRadius: 8, borderWidth: 1,
    paddingVertical: 2, paddingHorizontal: 10, marginTop: 8,
  },
  estadoPendiente: { borderColor: colors.border },
  estadoCompletada: { backgroundColor: CELESTE, borderColor: CELESTE },
  estadoTexto: { fontSize: fontSizes.small, color: colors.primary, fontWeight: '600' },
  botonIcono: { padding: spacing.small },
  vacio: { textAlign: 'center', marginTop: spacing.large, color: colors.primary },
  fab: {
    position: 'absolute', right: spacing.medium, bottom: spacing.large,
    backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 18,
  },
  fabText: { color: colors.background, fontWeight: '600', fontSize: fontSizes.medium },
});

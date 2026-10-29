import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { obtenerProductos, eliminarProducto } from '../src/config/services/productosService';
import { colors, fontSizes, spacing } from '../src/config/stilos/theme';
import ModalConfirmarEliminar from '../src/config/components/Modalconfirmareliminar.js';

export default function ListadoProductos({ navigation }) {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  // Estado de la eliminación
  const [seleccionado, setSeleccionado] = useState(null); // producto pendiente de eliminar
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState('');

  useFocusEffect(
    useCallback(() => {
      const cargar = async () => {
        try {
          const datos = await obtenerProductos();
          setProductos(datos);
        } catch (e) {
          console.log('Error al cargar productos', e);
        } finally {
          setCargando(false);
        }
      };
      cargar();
    }, [])
  );

  const pedirConfirmacion = (producto) => {
    setErrorEliminar('');
    setSeleccionado(producto);
  };

  const cancelarEliminacion = () => {
    if (eliminando) return;
    setSeleccionado(null);
    setErrorEliminar('');
  };

  const confirmarEliminacion = async () => {
    if (!seleccionado) return;
    setEliminando(true);
    setErrorEliminar('');
    try {
      await eliminarProducto(seleccionado.id);
      // Se quita de la lista local sin volver a consultar Firestore
      setProductos((prev) => prev.filter((p) => p.id !== seleccionado.id));
      setSeleccionado(null);
    } catch (e) {
      console.log('Error al eliminar producto', e.code, e.message);
      setErrorEliminar(
        e.code === 'permission-denied'
          ? 'No tiene permisos para eliminar este producto.'
          : 'No se pudo eliminar el producto. Intente nuevamente.'
      );
    } finally {
      setEliminando(false);
    }
  };

  const filtrados = productos.filter((p) =>
    (p.nombre || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  if (cargando) {
    return (
      <ActivityIndicator
        style={{ flex: 1 }}
        size="large"
        color={colors.primary}
      />
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.buscador}
        placeholder="Buscar producto..."
        value={busqueda}
        onChangeText={setBusqueda}
      />

      <FlatList
        data={filtrados}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.vacio}>No hay productos.</Text>
        }
        contentContainerStyle={{ paddingBottom: 90 }}
        renderItem={({ item }) => (
          <View style={styles.tarjeta}>
            <View style={styles.tarjetaInfo}>
              <Text style={styles.nombre}>{item.nombre}</Text>
              <Text style={styles.detalle}>
                {'$' + item.precio + ' - Stock ' + item.stock}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.botonEliminar}
              onPress={() => pedirConfirmacion(item)}
              accessibilityLabel={'Eliminar ' + item.nombre}
            >
              <FontAwesome name="trash" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('FormularioProducto')}
      >
        <Text style={styles.fabText}>+ Agregar</Text>
      </TouchableOpacity>

      <ModalConfirmarEliminar
        visible={!!seleccionado}
        nombre={seleccionado?.nombre ?? 'este producto'}
        eliminando={eliminando}
        error={errorEliminar}
        onConfirmar={confirmarEliminacion}
        onCancelar={cancelarEliminacion}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.medium,
  },
  buscador: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: spacing.medium,
    fontSize: fontSizes.medium,
  },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.medium,
    marginBottom: spacing.small,
  },
  tarjetaInfo: {
    flex: 1,
  },
  botonEliminar: {
    padding: spacing.small,
    marginLeft: spacing.small,
  },
  nombre: {
    fontSize: fontSizes.medium,
    fontWeight: 'bold',
    color: colors.primary,
  },
  detalle: {
    fontSize: fontSizes.small,
    color: colors.primary,
    opacity: 0.7,
    marginTop: 4,
  },
  vacio: {
    textAlign: 'center',
    marginTop: spacing.large,
    color: colors.primary,
  },
  fab: {
    position: 'absolute',
    right: spacing.medium,
    bottom: spacing.large,
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  fabText: {
    color: colors.background,
    fontWeight: '600',
    fontSize: fontSizes.medium,
  },
});
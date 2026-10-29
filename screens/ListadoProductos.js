import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import {
  obtenerProductos,
  eliminarProducto,
} from '../src/config/services/productosService';
import { colors, fontSizes, spacing } from '../src/config/stilos/theme';

export default function ListadoProductos({ navigation }) {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

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

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [])
  );

  const confirmarEliminar = (producto) => {
    Alert.alert(
      'Eliminar producto',
      'Se va a borrar "' + producto.nombre + '". Esta accion no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarProducto(producto.id);
              await cargar();
            } catch (e) {
              Alert.alert('Error', 'No se pudo eliminar el producto.');
            }
          },
        },
      ]
    );
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
            <View style={{ flex: 1 }}>
              <Text style={styles.nombre}>{item.nombre}</Text>
              <Text style={styles.detalle}>
                {'$' + item.precio + ' - Stock ' + item.stock}
              </Text>
            </View>
            <TouchableOpacity onPress={() => confirmarEliminar(item)}>
              <Ionicons name="trash-outline" size={24} color={colors.error} />
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
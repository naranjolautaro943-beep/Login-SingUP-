import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { obtenerMovimientos, eliminarMovimiento } from '../src/config/services/cajaService';
import { colors, fontSizes, spacing } from '../src/config/stilos/theme';
import ModalConfirmarEliminar from '../src/config/components/ModalConfirmarEliminar';

const CELESTE = '#2f60d0'; // Celeste Cielo (Manual de Identidad)

const formatearMonto = (n) => '$' + Number(n ?? 0).toLocaleString('es-AR');
const formatearFecha = (ts) => {
  const fecha = ts?.toDate?.();
  return fecha ? fecha.toLocaleDateString('es-AR') : '';
};

export default function ListadoCaja({ navigation }) {
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [seleccionado, setSeleccionado] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState('');

  // LEER: se vuelve a cargar cada vez que la pantalla recupera el foco (al volver de crear o editar)
  useFocusEffect(
    useCallback(() => {
      const cargar = async () => {
        try {
          setMovimientos(await obtenerMovimientos());
        } catch (e) {
          console.log('Error al cargar movimientos', e);
        } finally {
          setCargando(false);
        }
      };
      cargar();
    }, [])
  );

  const ingresos = movimientos.filter((m) => m.tipo === 'ingreso').reduce((a, m) => a + (m.monto || 0), 0);
  const egresos = movimientos.filter((m) => m.tipo === 'egreso').reduce((a, m) => a + (m.monto || 0), 0);
  const saldo = ingresos - egresos;

  const confirmarEliminacion = async () => {
    if (!seleccionado) return;
    setEliminando(true);
    setErrorEliminar('');
    try {
      await eliminarMovimiento(seleccionado.id);
      setMovimientos((prev) => prev.filter((m) => m.id !== seleccionado.id));
      setSeleccionado(null);
    } catch (e) {
      console.log('Error al eliminar movimiento', e.code, e.message);
      setErrorEliminar(
        e.code === 'permission-denied'
          ? 'No tiene permisos para eliminar este movimiento.'
          : 'No se pudo eliminar el movimiento. Intente nuevamente.'
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
      <View style={styles.resumen}>
        <Text style={styles.resumenTitulo}>Saldo de caja</Text>
        <Text style={[styles.saldo, saldo < 0 && { color: colors.error }]}>{formatearMonto(saldo)}</Text>
        <Text style={styles.resumenDetalle}>
          Ingresos {formatearMonto(ingresos)}   ·   Egresos {formatearMonto(egresos)}
        </Text>
      </View>

      <FlatList
        data={movimientos}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.vacio}>No hay movimientos.</Text>}
        contentContainerStyle={{ paddingBottom: 90 }}
        renderItem={({ item }) => {
          const esIngreso = item.tipo === 'ingreso';
          return (
            <View style={styles.tarjeta}>
              <TouchableOpacity
                style={styles.tarjetaInfo}
                onPress={() => navigation.navigate('FormularioMovimiento', { movimiento: item })}
              >
                <Text style={styles.concepto}>{item.concepto}</Text>
                <Text style={styles.detalle}>
                  {[item.metodoPago, formatearFecha(item.creadoEn)].filter(Boolean).join(' · ')}
                </Text>
              </TouchableOpacity>
              <Text style={[styles.monto, { color: esIngreso ? CELESTE : colors.error }]}>
                {(esIngreso ? '+' : '-') + formatearMonto(item.monto)}
              </Text>
              <TouchableOpacity
                style={styles.botonIcono}
                onPress={() => navigation.navigate('FormularioMovimiento', { movimiento: item })}
                accessibilityLabel={'Editar ' + item.concepto}
              >
                <FontAwesome name="pencil" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.botonIcono}
                onPress={() => { setErrorEliminar(''); setSeleccionado(item); }}
                accessibilityLabel={'Eliminar ' + item.concepto}
              >
                <FontAwesome name="trash" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('FormularioMovimiento')}>
        <Text style={styles.fabText}>+ Agregar</Text>
      </TouchableOpacity>

      <ModalConfirmarEliminar
        visible={!!seleccionado}
        titulo="Eliminar movimiento"
        nombre={seleccionado?.concepto ?? 'este movimiento'}
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
  resumen: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 12,
    padding: spacing.medium, marginBottom: spacing.medium, alignItems: 'center',
  },
  resumenTitulo: { fontSize: fontSizes.small, color: colors.primary, opacity: 0.7 },
  saldo: { fontSize: 30, fontWeight: 'bold', color: colors.primary, marginVertical: 4 },
  resumenDetalle: { fontSize: fontSizes.small, color: colors.primary, opacity: 0.7 },
  tarjeta: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border, borderRadius: 12,
    padding: spacing.medium, marginBottom: spacing.small,
  },
  tarjetaInfo: { flex: 1 },
  concepto: { fontSize: fontSizes.medium, fontWeight: 'bold', color: colors.primary },
  detalle: { fontSize: fontSizes.small, color: colors.primary, opacity: 0.7, marginTop: 4 },
  monto: { fontSize: fontSizes.medium, fontWeight: '700', marginHorizontal: spacing.small },
  botonIcono: { padding: spacing.small },
  vacio: { textAlign: 'center', marginTop: spacing.large, color: colors.primary },
  fab: {
    position: 'absolute', right: spacing.medium, bottom: spacing.large,
    backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 18,
  },
  fabText: { color: colors.background, fontWeight: '600', fontSize: fontSizes.medium },
});

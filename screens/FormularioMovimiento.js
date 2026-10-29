import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  KeyboardAvoidingView, ScrollView, Platform,
} from 'react-native';
import { agregarMovimiento, editarMovimiento } from '../src/config/services/cajaService';
import { colors, fontSizes, spacing } from '../src/config/stilos/theme';

const CELESTE = '#2f60d0'; // Celeste Cielo (Manual de Identidad)
const TIPOS = [
  { valor: 'ingreso', etiqueta: 'Ingreso' },
  { valor: 'egreso', etiqueta: 'Egreso' },
];
const METODOS = ['Efectivo', 'Transferencia', 'Tarjeta'];

// Sirve para CREAR (sin parámetros) y para EDITAR (route.params.movimiento)
export default function FormularioMovimiento({ navigation, route }) {
  const movimiento = route?.params?.movimiento;
  const editando = !!movimiento;

  const [tipo, setTipo] = useState(movimiento?.tipo ?? 'ingreso');
  const [concepto, setConcepto] = useState(movimiento?.concepto ?? '');
  const [monto, setMonto] = useState(movimiento?.monto !== undefined ? String(movimiento.monto) : '');
  const [metodo, setMetodo] = useState(movimiento?.metodoPago ?? 'Efectivo');
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const validar = () => {
    const e = {};
    if (!concepto.trim()) e.concepto = 'El concepto es obligatorio';
    if (!monto.trim() || isNaN(Number(monto)) || Number(monto) <= 0)
      e.monto = 'Ingresá un monto válido mayor a 0';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar()) return;
    setGuardando(true);
    const datos = {
      tipo,
      concepto: concepto.trim(),
      monto: Number(monto),
      metodoPago: metodo,
    };
    try {
      if (editando) {
        await editarMovimiento(movimiento.id, datos);
      } else {
        await agregarMovimiento(datos);
      }
      Alert.alert('Listo', editando ? 'Movimiento actualizado' : 'Movimiento guardado');
      navigation.goBack();
    } catch (error) {
      console.log('Error al guardar movimiento', error.code, error.message);
      Alert.alert('Error', 'No se pudo guardar el movimiento.');
    } finally {
      setGuardando(false);
    }
  };

  const Opciones = ({ opciones, seleccionado, onSelect }) => (
    <View style={styles.opciones}>
      {opciones.map((o) => {
        const valor = o.valor ?? o;
        const etiqueta = o.etiqueta ?? o;
        const activo = seleccionado === valor;
        return (
          <TouchableOpacity
            key={valor}
            style={[styles.opcion, activo && styles.opcionActiva]}
            onPress={() => onSelect(valor)}
          >
            <Text style={[styles.opcionTexto, activo && styles.opcionTextoActivo]}>{etiqueta}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Tipo *</Text>
        <Opciones opciones={TIPOS} seleccionado={tipo} onSelect={setTipo} />

        <Text style={styles.label}>Concepto *</Text>
        <TextInput
          style={[styles.input, errores.concepto && styles.inputError]}
          value={concepto}
          onChangeText={setConcepto}
          placeholder="Ej: Venta del día, Pago a proveedor"
        />
        {!!errores.concepto && <Text style={styles.error}>{errores.concepto}</Text>}

        <Text style={styles.label}>Monto *</Text>
        <TextInput
          style={[styles.input, errores.monto && styles.inputError]}
          value={monto}
          onChangeText={setMonto}
          keyboardType="numeric"
          placeholder="0"
        />
        {!!errores.monto && <Text style={styles.error}>{errores.monto}</Text>}

        <Text style={styles.label}>Medio de pago</Text>
        <Opciones opciones={METODOS} seleccionado={metodo} onSelect={setMetodo} />

        <TouchableOpacity
          style={[styles.button, guardando && { opacity: 0.6 }]}
          onPress={handleGuardar}
          disabled={guardando}
        >
          <Text style={styles.buttonText}>
            {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Guardar movimiento'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.large },
  label: { fontSize: fontSizes.small, color: colors.primary, marginBottom: 4, marginTop: spacing.medium },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 12, fontSize: fontSizes.medium, color: colors.primary,
  },
  inputError: { borderColor: colors.error },
  error: { color: colors.error, fontSize: fontSizes.small, marginTop: 4 },
  opciones: { flexDirection: 'row', flexWrap: 'wrap' },
  opcion: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 10,
    paddingVertical: 8, paddingHorizontal: 14, marginRight: 8, marginBottom: 8,
  },
  opcionActiva: { backgroundColor: colors.primary, borderColor: colors.primary },
  opcionTexto: { color: colors.primary, fontSize: fontSizes.small },
  opcionTextoActivo: { color: colors.background, fontWeight: '600' },
  button: {
    backgroundColor: colors.primary, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: spacing.large,
  },
  buttonText: { color: colors.background, fontSize: fontSizes.medium, fontWeight: '600' },
});

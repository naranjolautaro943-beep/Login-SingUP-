import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  KeyboardAvoidingView, ScrollView, Platform,
} from 'react-native';
import { agregarProducto, editarProducto } from '../src/config/services/productosService';
import { colors, fontSizes, spacing } from '../src/config/stilos/theme';

export default function FormularioProducto({ navigation, route }) {
  const producto = route.params?.producto;

  const [nombre, setNombre] = useState(producto?.nombre ?? '');
  const [categoria, setCategoria] = useState(producto?.categoria ?? '');
  const [precio, setPrecio] = useState(producto?.precio != null ? String(producto.precio) : '');
  const [stock, setStock] = useState(producto?.stock != null ? String(producto.stock) : '');
  const [codigoBarras, setCodigoBarras] = useState(producto?.codigoBarras ?? '');
  const [proveedor, setProveedor] = useState(producto?.proveedor ?? '');
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const validar = () => {
    const e = {};
    if (!nombre.trim()) e.nombre = 'El nombre es obligatorio';
    if (!categoria.trim()) e.categoria = 'La categoría es obligatoria';
    if (!precio.trim() || isNaN(Number(precio)) || Number(precio) < 0)
      e.precio = 'Ingresá un precio válido';
    if (!stock.trim() || !Number.isInteger(Number(stock)) || Number(stock) < 0)
      e.stock = 'Ingresá un stock válido (número entero)';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar()) return;
    setGuardando(true);
    try {
      const datos = {
        nombre: nombre.trim(),
        categoria: categoria.trim(),
        precio: Number(precio),
        stock: Number(stock),
        codigoBarras: codigoBarras.trim(),
        proveedor: proveedor.trim(),
      };
      if (producto) {
        await editarProducto(producto.id, datos);
      } else {
        await agregarProducto(datos);
      }
      Alert.alert('Listo', producto ? 'Producto actualizado' : 'Producto guardado');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el producto.');
    } finally {
      setGuardando(false);
    }
  };

  const Campo = ({ label, valor, setValor, error, teclado }) => (
    <View style={styles.campo}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={valor}
        onChangeText={setValor}
        keyboardType={teclado || 'default'}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {Campo({ label: 'Nombre *', valor: nombre, setValor: setNombre, error: errores.nombre })}
        {Campo({ label: 'Categoría *', valor: categoria, setValor: setCategoria, error: errores.categoria })}
        {Campo({ label: 'Precio *', valor: precio, setValor: setPrecio, error: errores.precio, teclado: 'numeric' })}
        {Campo({ label: 'Stock *', valor: stock, setValor: setStock, error: errores.stock, teclado: 'numeric' })}
        {Campo({ label: 'Código de barras', valor: codigoBarras, setValor: setCodigoBarras, teclado: 'numeric' })}
        {Campo({ label: 'Proveedor', valor: proveedor, setValor: setProveedor })}

        <TouchableOpacity
          style={[styles.button, guardando && { opacity: 0.6 }]}
          onPress={handleGuardar}
          disabled={guardando}
        >
          <Text style={styles.buttonText}>
            {guardando ? 'Guardando...' : producto ? 'Guardar cambios' : 'Guardar producto'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.large },
  campo: { marginBottom: spacing.medium },
  label: { fontSize: fontSizes.small, color: colors.primary, marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 12, fontSize: fontSizes.medium, color: colors.primary,
  },
  inputError: { borderColor: colors.error },
  error: { color: colors.error, fontSize: fontSizes.small, marginTop: 4 },
  button: {
    backgroundColor: colors.primary, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: spacing.small,
  },
  buttonText: { color: colors.background, fontSize: fontSizes.medium, fontWeight: '600' },
});
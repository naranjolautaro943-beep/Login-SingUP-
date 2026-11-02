import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator,
} from 'react-native';
import { obtenerProducto, editarProducto } from '../src/config/services/productosService';
import { colors, fontSizes, spacing } from '../src/config/stilos/theme';

export default function FormularioEditarProducto({ route, navigation }) {
  const { id } = route.params;

  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [codigoBarras, setCodigoBarras] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Trae el producto y precarga el formulario
  useEffect(() => {
    const cargar = async () => {
      try {
        const producto = await obtenerProducto(id);
        if (!producto) {
          Alert.alert('Error', 'No se encontró el producto.');
          navigation.goBack();
          return;
        }
        setNombre(producto.nombre ?? '');
        setCategoria(producto.categoria ?? '');
        setPrecio(String(producto.precio ?? ''));
        setStock(String(producto.stock ?? ''));
        setCodigoBarras(producto.codigoBarras ?? '');
        setProveedor(producto.proveedor ?? '');
      } catch (error) {
        Alert.alert('Error', 'No se pudo cargar el producto.');
        navigation.goBack();
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id, navigation]);

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
      await editarProducto(id, {
        nombre: nombre.trim(),
        categoria: categoria.trim(),
        precio: Number(precio),
        stock: Number(stock),
        codigoBarras: codigoBarras.trim(),
        proveedor: proveedor.trim(),
      });
      Alert.alert('Listo', 'Producto actualizado');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el producto.');
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

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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
          <Text style={styles.buttonText}>{guardando ? 'Guardando...' : 'Guardar cambios'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
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
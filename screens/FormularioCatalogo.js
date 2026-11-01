import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Switch,
  KeyboardAvoidingView, ScrollView, Platform,
} from 'react-native';
import { agregarItemCatalogo, editarItemCatalogo } from '../src/config/services/catalogoService';
import { colors, fontSizes, spacing } from '../src/config/stilos/theme';

const CELESTE = '#2f60d0'; // Celeste Cielo (Manual de Identidad)

// Sirve para CREAR (sin parámetros) y para EDITAR (route.params.item)
export default function FormularioCatalogo({ navigation, route }) {
  const item = route?.params?.item;
  const editando = !!item;

  const [nombre, setNombre] = useState(item?.nombre ?? '');
  const [descripcion, setDescripcion] = useState(item?.descripcion ?? '');
  const [categoria, setCategoria] = useState(item?.categoria ?? '');
  const [precio, setPrecio] = useState(item?.precio !== undefined ? String(item.precio) : '');
  const [disponible, setDisponible] = useState(item?.disponible ?? true);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const validar = () => {
    const e = {};
    if (!nombre.trim()) e.nombre = 'El nombre es obligatorio';
    if (!categoria.trim()) e.categoria = 'La categoría es obligatoria';
    if (!precio.trim() || isNaN(Number(precio)) || Number(precio) < 0)
      e.precio = 'Ingresá un precio válido';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar()) return;
    setGuardando(true);
    const datos = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      categoria: categoria.trim(),
      precio: Number(precio),
      disponible,
    };
    try {
      if (editando) {
        await editarItemCatalogo(item.id, datos);
      } else {
        await agregarItemCatalogo(datos);
      }
      Alert.alert('Listo', editando ? 'Artículo actualizado' : 'Artículo guardado');
      navigation.goBack();
    } catch (error) {
      console.log('Error al guardar artículo', error.code, error.message);
      Alert.alert('Error', 'No se pudo guardar el artículo.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Nombre *</Text>
        <TextInput
          style={[styles.input, errores.nombre && styles.inputError]}
          value={nombre}
          onChangeText={setNombre}
        />
        {!!errores.nombre && <Text style={styles.error}>{errores.nombre}</Text>}

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.inputMultilinea]}
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
          placeholder="Ej: Alfajor triple de chocolate, 70 g"
        />

        <Text style={styles.label}>Categoría *</Text>
        <TextInput
          style={[styles.input, errores.categoria && styles.inputError]}
          value={categoria}
          onChangeText={setCategoria}
          placeholder="Ej: Golosinas, Bebidas, Cigarrillos"
        />
        {!!errores.categoria && <Text style={styles.error}>{errores.categoria}</Text>}

        <Text style={styles.label}>Precio *</Text>
        <TextInput
          style={[styles.input, errores.precio && styles.inputError]}
          value={precio}
          onChangeText={setPrecio}
          keyboardType="numeric"
          placeholder="0"
        />
        {!!errores.precio && <Text style={styles.error}>{errores.precio}</Text>}

        <View style={styles.filaSwitch}>
          <Text style={[styles.label, { marginTop: 0 }]}>Disponible en el catálogo</Text>
          <Switch
            value={disponible}
            onValueChange={setDisponible}
            trackColor={{ false: colors.border, true: CELESTE }}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, guardando && { opacity: 0.6 }]}
          onPress={handleGuardar}
          disabled={guardando}
        >
          <Text style={styles.buttonText}>
            {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Guardar artículo'}
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
  inputMultilinea: { minHeight: 80, textAlignVertical: 'top' },
  inputError: { borderColor: colors.error },
  error: { color: colors.error, fontSize: fontSizes.small, marginTop: 4 },
  filaSwitch: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: spacing.large,
  },
  button: {
    backgroundColor: colors.primary, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: spacing.large,
  },
  buttonText: { color: colors.background, fontSize: fontSizes.medium, fontWeight: '600' },
});

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  KeyboardAvoidingView, ScrollView, Platform,
} from 'react-native';
import { auth } from '../src/config/firebaseConfig';
import { agregarActividad, editarActividad } from '../src/config/services/actividadService';
import { colors, fontSizes, spacing } from '../src/config/stilos/theme';

const TIPOS = ['Novedad', 'Reposición', 'Pedido a proveedor', 'Otro'];
const ESTADOS = ['Pendiente', 'Completada'];

// Sirve para CREAR (sin parámetros) y para EDITAR (route.params.actividad)
export default function FormularioActividad({ navigation, route }) {
  const actividad = route?.params?.actividad;
  const editando = !!actividad;

  const [titulo, setTitulo] = useState(actividad?.titulo ?? '');
  const [descripcion, setDescripcion] = useState(actividad?.descripcion ?? '');
  const [tipo, setTipo] = useState(actividad?.tipo ?? TIPOS[0]);
  const [estado, setEstado] = useState(actividad?.estado ?? ESTADOS[0]);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const validar = () => {
    const e = {};
    if (!titulo.trim()) e.titulo = 'El título es obligatorio';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar()) return;
    setGuardando(true);
    const datos = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      tipo,
      estado,
    };
    try {
      if (editando) {
        await editarActividad(actividad.id, datos);
      } else {
        // Al crear se guarda quién la registró
        const usuario = auth.currentUser?.displayName || auth.currentUser?.email || 'usuario';
        await agregarActividad({ ...datos, usuario });
      }
      Alert.alert('Listo', editando ? 'Actividad actualizada' : 'Actividad guardada');
      navigation.goBack();
    } catch (error) {
      console.log('Error al guardar actividad', error.code, error.message);
      Alert.alert('Error', 'No se pudo guardar la actividad.');
    } finally {
      setGuardando(false);
    }
  };

  const Opciones = ({ opciones, seleccionado, onSelect }) => (
    <View style={styles.opciones}>
      {opciones.map((o) => {
        const activo = seleccionado === o;
        return (
          <TouchableOpacity
            key={o}
            style={[styles.opcion, activo && styles.opcionActiva]}
            onPress={() => onSelect(o)}
          >
            <Text style={[styles.opcionTexto, activo && styles.opcionTextoActivo]}>{o}</Text>
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
        <Text style={styles.label}>Título *</Text>
        <TextInput
          style={[styles.input, errores.titulo && styles.inputError]}
          value={titulo}
          onChangeText={setTitulo}
          placeholder="Ej: Llegó el pedido de bebidas"
        />
        {!!errores.titulo && <Text style={styles.error}>{errores.titulo}</Text>}

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.inputMultilinea]}
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
          placeholder="Detalles de la actividad"
        />

        <Text style={styles.label}>Tipo</Text>
        <Opciones opciones={TIPOS} seleccionado={tipo} onSelect={setTipo} />

        <Text style={styles.label}>Estado</Text>
        <Opciones opciones={ESTADOS} seleccionado={estado} onSelect={setEstado} />

        <TouchableOpacity
          style={[styles.button, guardando && { opacity: 0.6 }]}
          onPress={handleGuardar}
          disabled={guardando}
        >
          <Text style={styles.buttonText}>
            {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Guardar actividad'}
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
  inputMultilinea: { minHeight: 90, textAlignVertical: 'top' },
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

import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut, updateProfile } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { obtenerPerfil, guardarPerfil } from '../src/config/services/perfilService';
import {
  validarObligatorio,
  validarSoloLetras,
  validarTelefono,
} from '../src/config/utils/validations';
import { colors, fontSizes, spacing } from '../src/config/stilos/theme';

const CELESTE = '#2f60d0'; // Celeste Cielo (Manual de Identidad)

const MENSAJES = {
  nombreObligatorio: 'El nombre es obligatorio.',
  soloLetras: 'Únicamente caracteres alfabéticos',
  telefonoInvalido: 'Ingrese un teléfono válido (solo números, entre 8 y 15 dígitos).',
};

const obtenerErrorNombre = (v) => {
  if (!validarObligatorio(v)) return MENSAJES.nombreObligatorio;
  if (!validarSoloLetras(v)) return MENSAJES.soloLetras;
  return '';
};

// El teléfono es opcional: solo se valida si el usuario escribió algo
const obtenerErrorTelefono = (v) => (v.trim() && !validarTelefono(v) ? MENSAJES.telefonoInvalido : '');

const iniciales = (nombre) =>
  nombre
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || '?';

export default function Perfil({ navigation }) {
  const usuario = auth.currentUser;
  const nombreOriginal = usuario?.displayName ?? '';

  const [nombre, setNombre] = useState(nombreOriginal);
  const [telefono, setTelefono] = useState('');
  const [telefonoOriginal, setTelefonoOriginal] = useState('');
  const [errores, setErrores] = useState({ nombre: '', telefono: '' });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState('');

  // LEER el teléfono guardado en Firestore
  useEffect(() => {
    const cargar = async () => {
      try {
        const perfil = await obtenerPerfil(usuario.uid);
        setTelefono(perfil.telefono ?? '');
        setTelefonoOriginal(perfil.telefono ?? '');
      } catch (e) {
        console.log('Error al cargar el perfil', e.code, e.message);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const hayCambios = nombre.trim() !== nombreOriginal.trim() || telefono.trim() !== telefonoOriginal.trim();

  const cambiarNombre = (texto) => {
    if (!validarSoloLetras(texto)) {
      setErrores((prev) => ({ ...prev, nombre: MENSAJES.soloLetras }));
      return;
    }
    setNombre(texto);
    setAviso('');
    setErrores((prev) => ({ ...prev, nombre: '' }));
  };

  const cambiarTelefono = (texto) => {
    setTelefono(texto);
    setAviso('');
    if (errores.telefono) setErrores((prev) => ({ ...prev, telefono: '' }));
  };

  const handleGuardar = async () => {
    const nuevos = { nombre: obtenerErrorNombre(nombre), telefono: obtenerErrorTelefono(telefono) };
    setErrores(nuevos);
    if (nuevos.nombre || nuevos.telefono) return;

    setGuardando(true);
    try {
      if (nombre.trim() !== nombreOriginal.trim()) {
        await updateProfile(usuario, { displayName: nombre.trim() });
      }
      await guardarPerfil(usuario.uid, { telefono: telefono.trim() });
      setTelefonoOriginal(telefono.trim());
      setAviso('Los cambios se guardaron correctamente.');
    } catch (e) {
      console.log('Error al guardar el perfil', e.code, e.message);
      Alert.alert(
        'Error',
        e.code === 'permission-denied'
          ? 'No tiene permisos para guardar los cambios.'
          : 'No se pudieron guardar los cambios. Intente nuevamente.'
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleCerrarSesion = () => {
    Alert.alert('Cerrar sesión', '¿Está seguro de que desea cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
            // El observador de Firebase muestra Login al cerrar la sesión.
          } catch (e) {
            Alert.alert('Error', 'Hubo un problema al cerrar sesión.');
          }
        },
      },
    ]);
  };

  const miembroDesde = usuario?.metadata?.creationTime
    ? new Date(usuario.metadata.creationTime).toLocaleDateString('es-AR')
    : '';

  if (cargando) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.primary} />;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Cabecera con avatar */}
        <View style={styles.cabecera}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>{iniciales(nombre || nombreOriginal)}</Text>
          </View>
          <Text style={styles.nombreGrande}>{nombreOriginal || 'Usuario'}</Text>
          {!!miembroDesde && <Text style={styles.miembro}>Miembro desde {miembroDesde}</Text>}
        </View>

        {/* Datos personales */}
        <Text style={styles.seccion}>Datos personales</Text>

        <Text style={styles.label}>Nombre completo *</Text>
        <View style={[styles.inputContainer, errores.nombre && styles.inputError]}>
          <Ionicons name="person-outline" size={20} color={colors.primary} style={styles.icono} />
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={cambiarNombre}
            placeholder="Nombre y apellido"
            autoCapitalize="words"
          />
        </View>
        {!!errores.nombre && <Text style={styles.error}>{errores.nombre}</Text>}

        <Text style={styles.label}>Correo electrónico</Text>
        <View style={[styles.inputContainer, styles.inputBloqueado]}>
          <Ionicons name="mail-outline" size={20} color={colors.primary} style={styles.icono} />
          <Text style={styles.valorBloqueado}>{usuario?.email ?? ''}</Text>
          <Ionicons name="lock-closed-outline" size={16} color={colors.primary} />
        </View>
        <Text style={styles.ayuda}>El correo es el usuario de inicio de sesión y no se puede modificar.</Text>

        <Text style={styles.label}>Número de teléfono</Text>
        <View style={[styles.inputContainer, errores.telefono && styles.inputError]}>
          <Ionicons name="call-outline" size={20} color={colors.primary} style={styles.icono} />
          <TextInput
            style={styles.input}
            value={telefono}
            onChangeText={cambiarTelefono}
            onBlur={() => setErrores((prev) => ({ ...prev, telefono: obtenerErrorTelefono(telefono) }))}
            placeholder="Ej: 387 555 1234"
            keyboardType="phone-pad"
          />
        </View>
        {!!errores.telefono && <Text style={styles.error}>{errores.telefono}</Text>}

        {!!aviso && (
          <View style={styles.aviso}>
            <Ionicons name="checkmark-circle" size={18} color={CELESTE} style={{ marginRight: 8 }} />
            <Text style={styles.avisoTexto}>{aviso}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.botonPrimario, (!hayCambios || guardando) && { opacity: 0.4 }]}
          onPress={handleGuardar}
          disabled={!hayCambios || guardando}
        >
          {guardando ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.botonPrimarioTexto}>Guardar cambios</Text>
          )}
        </TouchableOpacity>

        {/* Opciones */}
        <Text style={styles.seccion}>Cuenta</Text>

        <TouchableOpacity style={styles.fila} onPress={() => navigation.navigate('Configuracion')}>
          <Ionicons name="settings-outline" size={22} color={colors.primary} style={styles.icono} />
          <Text style={styles.filaTexto}>Configuración</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.botonCerrar} onPress={handleCerrarSesion}>
          <Text style={styles.botonCerrarTexto}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.large, paddingBottom: spacing.large * 2 },
  cabecera: { alignItems: 'center', marginBottom: spacing.medium },
  avatar: {
    width: 84, height: 84, borderRadius: 42, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.small,
  },
  avatarTexto: { color: colors.background, fontSize: 30, fontWeight: '700' },
  nombreGrande: { fontSize: 22, fontWeight: '700', color: colors.primary },
  miembro: { fontSize: fontSizes.small, color: colors.primary, opacity: 0.7, marginTop: 2 },
  seccion: {
    fontSize: fontSizes.medium, fontWeight: '700', color: colors.primary,
    marginTop: spacing.large, marginBottom: spacing.small,
  },
  label: { fontSize: fontSizes.small, color: colors.primary, marginTop: spacing.medium, marginBottom: 4 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border, borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputError: { borderColor: colors.error },
  inputBloqueado: { backgroundColor: '#f3f4f7', paddingVertical: 12 },
  icono: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 10, fontSize: fontSizes.medium, color: colors.primary },
  valorBloqueado: { flex: 1, fontSize: fontSizes.medium, color: colors.primary, opacity: 0.7 },
  ayuda: { fontSize: fontSizes.small, color: colors.primary, opacity: 0.6, marginTop: 4 },
  error: { color: colors.error, fontSize: fontSizes.small, marginTop: 4 },
  aviso: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#eef3fd',
    borderRadius: 10, padding: 10, marginTop: spacing.medium,
  },
  avisoTexto: { color: colors.primary, fontSize: fontSizes.small, fontWeight: '600', flex: 1 },
  botonPrimario: {
    backgroundColor: colors.primary, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: spacing.large,
  },
  botonPrimarioTexto: { color: colors.background, fontSize: fontSizes.medium, fontWeight: '600' },
  fila: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border, borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: spacing.medium,
  },
  filaTexto: { flex: 1, fontSize: fontSizes.medium, color: colors.primary, fontWeight: '600' },
  botonCerrar: {
    backgroundColor: colors.error, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: spacing.large,
  },
  botonCerrarTexto: { color: colors.background, fontSize: fontSizes.medium + 2 },
});

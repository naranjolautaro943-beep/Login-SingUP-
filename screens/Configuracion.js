import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Switch, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { obtenerPerfil, guardarPerfil } from '../src/config/services/perfilService';
import { colors, fontSizes, spacing } from '../src/config/stilos/theme';

const CELESTE = '#2f60d0'; // Celeste Cielo (Manual de Identidad)
const VERSION = '1.0.0';

export default function Configuracion() {
  const usuario = auth.currentUser;
  const [notificaciones, setNotificaciones] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const perfil = await obtenerPerfil(usuario.uid);
        if (perfil.notificaciones !== undefined) setNotificaciones(perfil.notificaciones);
      } catch (e) {
        console.log('Error al cargar la configuración', e.code, e.message);
      }
    };
    cargar();
  }, []);

  const cambiarNotificaciones = async (valor) => {
    setNotificaciones(valor); // se muestra el cambio enseguida y se revierte si falla
    try {
      await guardarPerfil(usuario.uid, { notificaciones: valor });
    } catch (e) {
      console.log('Error al guardar la configuración', e.code, e.message);
      setNotificaciones(!valor);
      Alert.alert('Error', 'No se pudo guardar la configuración. Intente nuevamente.');
    }
  };

  const enviarCambioContrasena = async () => {
    setEnviando(true);
    try {
      await sendPasswordResetEmail(auth, usuario.email);
      Alert.alert(
        'Revise su correo',
        `Enviamos un enlace para cambiar su contraseña a ${usuario.email}. Revise también la carpeta de spam.`
      );
    } catch (e) {
      console.log('Error al enviar el cambio de contraseña', e.code, e.message);
      Alert.alert(
        'Error',
        `No se pudo enviar el correo. Intente nuevamente.\n\nCódigo: ${e.code ?? 'desconocido'}`
      );
    } finally {
      setEnviando(false);
    }
  };

  const pedirCambioContrasena = () => {
    Alert.alert(
      'Cambiar contraseña',
      `Le enviaremos un enlace a ${usuario.email} para que elija una contraseña nueva.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Enviar enlace', onPress: enviarCambioContrasena },
      ]
    );
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Text style={styles.seccion}>Preferencias</Text>
      <View style={styles.fila}>
        <Ionicons name="notifications-outline" size={22} color={colors.primary} style={styles.icono} />
        <Text style={styles.filaTexto}>Notificaciones</Text>
        <Switch
          value={notificaciones}
          onValueChange={cambiarNotificaciones}
          trackColor={{ false: colors.border, true: CELESTE }}
        />
      </View>

      <Text style={styles.seccion}>Seguridad</Text>
      <TouchableOpacity
        style={[styles.fila, enviando && { opacity: 0.5 }]}
        onPress={pedirCambioContrasena}
        disabled={enviando}
      >
        <Ionicons name="key-outline" size={22} color={colors.primary} style={styles.icono} />
        <Text style={styles.filaTexto}>Cambiar contraseña</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.primary} />
      </TouchableOpacity>

      <Text style={styles.seccion}>Acerca de</Text>
      <View style={styles.fila}>
        <Ionicons name="information-circle-outline" size={22} color={colors.primary} style={styles.icono} />
        <Text style={styles.filaTexto}>Kiosco Azul</Text>
        <Text style={styles.version}>Versión {VERSION}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.large },
  seccion: {
    fontSize: fontSizes.medium, fontWeight: '700', color: colors.primary,
    marginTop: spacing.medium, marginBottom: spacing.small,
  },
  fila: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border, borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: spacing.medium,
  },
  icono: { marginRight: 10 },
  filaTexto: { flex: 1, fontSize: fontSizes.medium, color: colors.primary, fontWeight: '600' },
  version: { fontSize: fontSizes.small, color: colors.primary, opacity: 0.7 },
});

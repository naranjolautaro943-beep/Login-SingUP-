import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { colors, fontSizes, spacing } from '../src/config/stilos/theme';

const OPCIONES = [
  { id: 'caja', titulo: 'Caja', icono: 'cash' },
  { id: 'productos', titulo: 'Productos', icono: 'cube' },
  { id: 'catalogo', titulo: 'Catalogo', icono: 'grid' },
  { id: 'actividad', titulo: 'Actividad', icono: 'pulse' },
];

export default function Home({ navigation }) {
  const insets = useSafeAreaInsets();
  const nombre = auth.currentUser?.displayName || 'usuario';

  const handleOpcion = (opcion) => {
    if (opcion.id === 'productos') {
      navigation.navigate('ListadoProductos');
      return;
    }
    Alert.alert(opcion.titulo, 'Esta sección estará disponible próximamente.');
  };

  const handleLogOut = async () => {
    try {
      await signOut(auth);
      Alert.alert("Sesión cerrada", "Has cerrado sesión correctamente.");
      // El observador de Firebase muestra Login al cerrar la sesión.
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al cerrar sesión.");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.small, paddingBottom: insets.bottom + spacing.medium }]}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <Image source={require('../assets/Imagen2.png')} style={styles.logo} />
        </View>
        <TouchableOpacity onPress={() => Alert.alert('Notificaciones', 'No tenés notificaciones nuevas.')}>
          <Ionicons name="notifications-outline" size={26} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.saludo}>Hola, {nombre}</Text>
      <Text style={styles.pregunta}>¿Qué querés hacer hoy?</Text>

      <View style={styles.grid}>
        {OPCIONES.map((op) => (
          <TouchableOpacity key={op.id} style={styles.opcion} onPress={() => handleOpcion(op)}>
            <View style={styles.iconBox}>
              <Ionicons name={op.icono} size={22} color={colors.primary} />
            </View>
            <Text style={styles.opcionText}>{op.titulo}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flex: 1 }} />

      <TouchableOpacity style={styles.button} onPress={handleLogOut}>
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.large,
  },
  brand: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 200, height: 60, resizeMode: 'contain' },
  saludo: { fontSize: 30, color: colors.primary, marginBottom: spacing.small },
  pregunta: { fontSize: fontSizes.medium, color: colors.primary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.large * 1.5 },
  opcion: { width: '50%', alignItems: 'center', marginBottom: spacing.large * 1.5 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#9aa3b2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.small,
  },
  opcionText: { fontSize: fontSizes.medium, fontWeight: 'bold', color: colors.primary },
  button: {
    backgroundColor: colors.error,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: { color: colors.background, fontSize: fontSizes.medium + 2 },
});
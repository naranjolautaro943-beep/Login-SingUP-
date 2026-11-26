import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

// Paleta institucional (Manual de Identidad Corporativa, diapositiva 07)
const COLORES = {
  azulMarino: '#0a082d',
  celesteCielo: '#2f60d0',
  blanco: '#ffffff',
  error: '#c0392b',
};

/**
 * Modal de confirmación para cerrar sesión.
 *
 * Props:
 *  - visible:     muestra u oculta el modal
 *  - cerrando:    true mientras se cierra la sesión
 *  - onConfirmar: se llama al presionar "Cerrar sesión"
 *  - onCancelar:  se llama al presionar "Cancelar"
 */
export default function ModalConfirmarCerrarSesion({ visible, cerrando, onConfirmar, onCancelar }) {
  const cancelar = () => {
    if (cerrando) return;
    onCancelar && onCancelar();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={cancelar}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <FontAwesome name="sign-out" size={40} color={COLORES.error} style={styles.icono} />
          <Text style={styles.titulo}>Cerrar sesión</Text>
          <Text style={styles.texto}>¿Está seguro de que desea cerrar sesión?</Text>

          <TouchableOpacity
            style={[styles.botonConfirmar, cerrando && styles.botonDeshabilitado]}
            onPress={onConfirmar}
            disabled={cerrando}
          >
            {cerrando ? (
              <ActivityIndicator color={COLORES.blanco} />
            ) : (
              <Text style={styles.botonTexto}>Sí, cerrar sesión</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={cancelar} disabled={cerrando}>
            <Text style={styles.cancelar}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(10, 8, 45, 0.6)',
  },
  card: {
    backgroundColor: COLORES.blanco,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  icono: { marginBottom: 12 },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORES.azulMarino,
    marginBottom: 10,
    textAlign: 'center',
  },
  texto: {
    fontSize: 14,
    fontWeight: '300',
    lineHeight: 21,
    color: COLORES.azulMarino,
    textAlign: 'center',
  },
  botonConfirmar: {
    backgroundColor: COLORES.error,
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 8,
    marginTop: 20,
    minWidth: 180,
    alignItems: 'center',
  },
  botonDeshabilitado: { opacity: 0.6 },
  botonTexto: { color: COLORES.blanco, fontSize: 16, fontWeight: '700' },
  cancelar: {
    marginTop: 16,
    color: COLORES.celesteCielo,
    fontSize: 15,
    fontWeight: '700',
  },
});

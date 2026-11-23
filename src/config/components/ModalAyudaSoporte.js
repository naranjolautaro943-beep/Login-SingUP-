import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Paleta institucional (Manual de Identidad Corporativa, diapositiva 07)
const COLORES = {
  azulMarino: '#0a082d',
  celesteCielo: '#2f60d0',
  blanco: '#ffffff',
};

/**
 * Modal "Ayuda y Soporte".
 *
 * Props:
 *  - visible: muestra u oculta el modal
 *  - onClose: se llama al cerrarlo
 */
export default function ModalAyudaSoporte({ visible, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.cerrar} onPress={onClose} accessibilityLabel="Cerrar">
            <Ionicons name="close" size={24} color={COLORES.azulMarino} />
          </TouchableOpacity>

          <Ionicons name="help-circle" size={48} color={COLORES.celesteCielo} style={styles.icono} />
          <Text style={styles.titulo}>Ayuda y Soporte</Text>
          <Text style={styles.texto}>
            Contactanos a través de <Text style={styles.contacto}>0800-Nosapruebaatodos</Text>.
          </Text>

          <TouchableOpacity style={styles.boton} onPress={onClose}>
            <Text style={styles.botonTexto}>Entendido</Text>
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
    backgroundColor: 'rgba(10, 8, 45, 0.6)', // azul marino institucional con transparencia
  },
  card: {
    backgroundColor: COLORES.blanco,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  cerrar: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 6,
    zIndex: 1,
  },
  icono: {
    marginBottom: 12,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORES.azulMarino,
    marginBottom: 10,
    textAlign: 'center',
  },
  texto: {
    fontSize: 16,
    fontWeight: '300',
    lineHeight: 24,
    color: COLORES.azulMarino,
    textAlign: 'center',
  },
  contacto: {
    fontWeight: '700',
    color: COLORES.celesteCielo,
  },
  boton: {
    backgroundColor: COLORES.azulMarino,
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 8,
    marginTop: 24,
    minWidth: 180,
    alignItems: 'center',
  },
  botonTexto: {
    color: COLORES.blanco,
    fontSize: 16,
    fontWeight: '700',
  },
});

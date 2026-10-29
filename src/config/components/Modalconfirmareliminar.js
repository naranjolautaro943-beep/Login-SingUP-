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
 * Modal de confirmación para eliminar un registro.
 *
 * Props:
 *  - visible:     muestra u oculta el modal
 *  - nombre:      nombre del registro a eliminar (se muestra en el mensaje)
 *  - eliminando:  true mientras se ejecuta la eliminación
 *  - error:       mensaje de error (opcional)
 *  - onConfirmar: se llama al presionar "Eliminar"
 *  - onCancelar:  se llama al presionar "Cancelar" o la X
 */
export default function ModalConfirmarEliminar({ visible, nombre, eliminando, error, onConfirmar, onCancelar }) {
  const cancelar = () => {
    if (eliminando) return;
    onCancelar && onCancelar();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={cancelar}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <FontAwesome name="trash" size={40} color={COLORES.error} style={styles.icono} />
          <Text style={styles.titulo}>Eliminar producto</Text>
          <Text style={styles.texto}>
            ¿Está seguro de que desea eliminar <Text style={styles.nombre}>{nombre}</Text>? Esta acción no se puede
            deshacer.
          </Text>

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[styles.botonEliminar, eliminando && styles.botonDeshabilitado]}
            onPress={onConfirmar}
            disabled={eliminando}
          >
            {eliminando ? (
              <ActivityIndicator color={COLORES.blanco} />
            ) : (
              <Text style={styles.botonTexto}>Eliminar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={cancelar} disabled={eliminando}>
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
    backgroundColor: 'rgba(10, 8, 45, 0.6)', // azul marino institucional con transparencia
  },
  card: {
    backgroundColor: COLORES.blanco,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
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
    fontSize: 14,
    fontWeight: '300',
    lineHeight: 21,
    color: COLORES.azulMarino,
    textAlign: 'center',
  },
  nombre: {
    fontWeight: '700',
  },
  errorText: {
    color: COLORES.error,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
  },
  botonEliminar: {
    backgroundColor: COLORES.error,
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 8,
    marginTop: 20,
    minWidth: 180,
    alignItems: 'center',
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  botonTexto: {
    color: COLORES.blanco,
    fontSize: 16,
    fontWeight: '700',
  },
  cancelar: {
    marginTop: 16,
    color: COLORES.celesteCielo,
    fontSize: 15,
    fontWeight: '700',
  },
});
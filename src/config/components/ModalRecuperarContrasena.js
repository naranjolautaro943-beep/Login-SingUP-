import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { validarObligatorio, validarCorreo } from '../utils/validations';

// Paleta institucional (Manual de Identidad Corporativa, diapositiva 07)
const COLORES = {
  azulMarino: '#0a082d',
  celesteCielo: '#2f60d0',
  blanco: '#ffffff',
  textoSecundario: '#6b6a80',
  error: '#c0392b',
};

const MENSAJES = {
  correoObligatorio: 'El correo electrónico es obligatorio.',
  correoInvalido: 'Ingrese un correo electrónico válido (ejemplo: usuario@correo.com).',
};

const obtenerErrorCorreo = (valor) => {
  if (!validarObligatorio(valor)) return MENSAJES.correoObligatorio;
  if (!validarCorreo(valor)) return MENSAJES.correoInvalido;
  return '';
};

/**
 * Modal "Olvidé mi contraseña".
 *
 * Props:
 *  - visible:       muestra u oculta el modal
 *  - onClose:       se llama al cerrarlo
 *  - emailInicial:  correo con el que se precarga el campo (opcional)
 *  - onEnviado:     se llama con el correo cuando el envío fue exitoso (opcional)
 */
export default function ModalRecuperarContrasena({ visible, onClose, emailInicial = '', onEnviado }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [enfocado, setEnfocado] = useState(false);

  // Cada vez que se abre, se reinicia el estado y se precarga el correo
  useEffect(() => {
    if (visible) {
      setEmail(emailInicial);
      setError('');
      setEnviando(false);
      setEnviado(false);
    }
  }, [visible]);

  const cerrar = () => {
    if (enviando) return;
    onClose && onClose();
  };

  const handleEnviar = async () => {
    const errorCorreo = obtenerErrorCorreo(email);
    if (errorCorreo) {
      setError(errorCorreo);
      return;
    }

    setEnviando(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setEnviado(true);
      onEnviado && onEnviado(email.trim());
    } catch (err) {
      console.log('Error al recuperar contraseña:', err.code, err.message, JSON.stringify(err.customData ?? {}));
      let mensaje = 'No se pudo enviar el correo de recuperación. Intente nuevamente.';
      switch (err.code) {
        case 'auth/invalid-email':
          mensaje = MENSAJES.correoInvalido;
          break;
        case 'auth/network-request-failed':
          mensaje = 'Error de conexión, por favor intente más tarde.';
          break;
        case 'auth/too-many-requests':
          mensaje = 'Se realizaron demasiados intentos. Espere unos minutos e intente nuevamente.';
          break;
      }
      setError(`${mensaje} (${err.code ?? 'error desconocido'})`);
    } finally {
      setEnviando(false);
    }
  };

  const colorBorde = error ? COLORES.error : enfocado ? COLORES.celesteCielo : COLORES.azulMarino;
  const botonDeshabilitado = enviando || !validarObligatorio(email);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={cerrar}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.card}>
          <TouchableOpacity style={styles.cerrar} onPress={cerrar} disabled={enviando}>
            <FontAwesome name="times" size={20} color={COLORES.azulMarino} />
          </TouchableOpacity>

          {enviado ? (
            <>
              <FontAwesome name="check-circle" size={48} color={COLORES.celesteCielo} style={styles.icono} />
              <Text style={styles.titulo}>Revise su correo</Text>
              <Text style={styles.texto}>
                Si el correo ingresado está registrado, recibirá un enlace para restablecer su contraseña.
                Revise también la carpeta de spam.
              </Text>
              <TouchableOpacity style={styles.boton} onPress={cerrar}>
                <Text style={styles.botonTexto}>Entendido</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.titulo}>Recuperar contraseña</Text>
              <Text style={styles.texto}>
                Ingrese el correo electrónico de su cuenta y le enviaremos un enlace para restablecer su contraseña.
              </Text>

              <Text style={styles.label}>Correo</Text>
              <View style={[styles.inputContainer, { borderColor: colorBorde }]}>
                <FontAwesome name="envelope" size={20} color={COLORES.azulMarino} style={styles.iconoInput} />
                <TextInput
                  style={styles.input}
                  placeholder="Usuario@correo.com"
                  placeholderTextColor={COLORES.textoSecundario}
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    if (error) setError('');
                  }}
                  onFocus={() => setEnfocado(true)}
                  onBlur={() => setEnfocado(false)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!enviando}
                />
              </View>
              {!!error && <Text style={styles.errorText}>{error}</Text>}

              <TouchableOpacity
                style={[styles.boton, botonDeshabilitado && styles.botonDeshabilitado]}
                onPress={handleEnviar}
                disabled={botonDeshabilitado}
              >
                {enviando ? (
                  <ActivityIndicator color={COLORES.blanco} />
                ) : (
                  <Text style={styles.botonTexto}>Enviar enlace</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={cerrar} disabled={enviando}>
                <Text style={styles.cancelar}>Cancelar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
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
    top: 14,
    right: 14,
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
    fontSize: 14,
    fontWeight: '300',
    lineHeight: 21,
    color: COLORES.azulMarino,
    textAlign: 'center',
    marginBottom: 8,
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: '600',
    color: COLORES.azulMarino,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    marginBottom: 5,
    width: '100%',
  },
  iconoInput: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 15,
    fontWeight: '300',
    color: COLORES.azulMarino,
  },
  errorText: {
    alignSelf: 'flex-start',
    color: COLORES.error,
    fontSize: 13,
    marginBottom: 6,
  },
  boton: {
    backgroundColor: COLORES.azulMarino,
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 8,
    marginTop: 20,
    minWidth: 180,
    alignItems: 'center',
  },
  botonDeshabilitado: {
    opacity: 0.4,
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
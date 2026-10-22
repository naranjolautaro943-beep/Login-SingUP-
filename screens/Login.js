import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { validarObligatorio, validarCorreo, validarContrasena } from '../src/config/utils/validations';
import KeyboardForm from '../src/config/components/KeyboardWrapper';

// Paleta institucional (Manual de Identidad Corporativa, diapositiva 07)
const COLORES = {
  azulMarino: '#0a082d',
  celesteCielo: '#2f60d0',
  blanco: '#ffffff',
  textoSecundario: '#6b6a80', // tono neutro derivado del marino para placeholders
  error: '#c0392b',
};

// Mensajes formales de validación
const MENSAJES = {
  correoObligatorio: 'El correo electrónico es obligatorio.',
  correoInvalido: 'Ingrese un correo electrónico para Iniciar sesión',
  contrasenaObligatoria: 'La contraseña es obligatoria.',
};

const obtenerErrorCorreo = (valor) => {
  if (!validarObligatorio(valor)) return MENSAJES.correoObligatorio;
  if (!validarCorreo(valor)) return MENSAJES.correoInvalido;
  return '';
};

const obtenerErrorContrasena = (valor) => {
  if (!validarObligatorio(valor)) return MENSAJES.contrasenaObligatoria;
  if (!validarContrasena(valor)) return MENSAJES.contrasenaInvalida;
  return '';
};

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [focused, setFocused] = useState(null); // 'email' | 'password' | null

  // El botón queda deshabilitado mientras haya campos vacíos
  const camposVacios = !validarObligatorio(email) || !validarObligatorio(password);

  const handleEmailChange = (text) => {
    setEmail(text);
    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
  };

  const validarFormulario = () => {
    const nuevosErrores = {
      email: obtenerErrorCorreo(email),
      password: obtenerErrorContrasena(password),
    };
    setErrors(nuevosErrores);
    return !nuevosErrores.email && !nuevosErrores.password;
  };

  const handleLogin = async () => {
    if (!validarFormulario()) return;

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // El observador de Firebase cambia la pantalla al detectar la sesión.
    } catch (error) {
      console.log('Error de inicio de sesión:', error.code, error.message);
      let errorMessage = 'Hubo un problema al iniciar sesión.';
      switch (error.code) {
        // Mensaje único para credenciales incorrectas
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          errorMessage = 'Correo o contraseña incorrectos.';
          break;
        case 'auth/invalid-email':
          errorMessage = MENSAJES.correoInvalido;
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Error de conexión, por favor intente más tarde.';
          break;
      }
      Alert.alert('Error', errorMessage);
    }
  };

  const handleOlvideContrasena = async () => {
    // Se usa el correo escrito en el campo: debe estar completo y tener formato válido
    const errorCorreo = obtenerErrorCorreo(email);
    if (errorCorreo) {
      setErrors((prev) => ({ ...prev, email: errorCorreo }));
      Alert.alert('Recuperar contraseña', 'Ingrese su correo electrónico en el campo "Correo" para enviarle el enlace de recuperación.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert(
        'Revise su correo',
        'Si el correo ingresado está registrado, recibirá un enlace para restablecer su contraseña. Revise también la carpeta de spam.'
      );
    } catch (error) {
      console.log('Error al recuperar contraseña:', error.code, error.message);
      let errorMessage = 'No se pudo enviar el correo de recuperación. Intente nuevamente.';
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = MENSAJES.correoInvalido;
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Error de conexión, por favor intente más tarde.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Se realizaron demasiados intentos. Espere unos minutos e intente nuevamente.';
          break;
      }
      Alert.alert('Error', `${errorMessage}\n\nCódigo: ${error.code ?? 'desconocido'}`);
    }
  };

  const colorBorde = (campo) => {
    if (errors[campo]) return COLORES.error;
    if (focused === campo) return COLORES.celesteCielo;
    return COLORES.azulMarino;
  };

  return (
    <KeyboardForm style={styles.container}>
      <Image source={require('../assets/logo-kiosco-azul.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.slogan}>
        Bienvenido al Sistema Kiosco Azul.
      </Text>
      <Text style={styles.title}>Iniciar sesión</Text>

      <Text style={styles.label}>Correo</Text>
      <View style={[styles.inputContainer, { borderColor: colorBorde('email') }]}>
        <FontAwesome name="envelope" size={20} color={COLORES.azulMarino} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Usuario@correo.com"
          placeholderTextColor={COLORES.textoSecundario}
          value={email}
          onChangeText={handleEmailChange}
          onFocus={() => setFocused('email')}
          onBlur={() => {
            setFocused(null);
            setErrors((prev) => ({ ...prev, email: email ? obtenerErrorCorreo(email) : '' }));
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      {!!errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      <Text style={styles.label}>Contraseña</Text>
      <View style={[styles.inputContainer, { borderColor: colorBorde('password') }]}>
        <FontAwesome name="lock" size={20} color={COLORES.azulMarino} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Ingrese su contraseña"
          placeholderTextColor={COLORES.textoSecundario}
          value={password}
          onChangeText={handlePasswordChange}
          onFocus={() => setFocused('password')}
          onBlur={() => {
            setFocused(null);
            setErrors((prev) => ({ ...prev, password: password ? obtenerErrorContrasena(password) : '' }));
          }}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <FontAwesome name={showPassword ? 'eye-slash' : 'eye'} size={20} color={COLORES.celesteCielo} />
        </TouchableOpacity>
      </View>
      {!!errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      <TouchableOpacity style={styles.forgotContainer} onPress={handleOlvideContrasena}>
        <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, camposVacios && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={camposVacios}
      >
        <Text style={styles.buttonText}>Ingresar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.signUpText}>
          ¿No tienes cuenta aún? <Text style={styles.signUpLink}>Regístrate</Text>
        </Text>
      </TouchableOpacity>
    </KeyboardForm>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORES.blanco,
  },
  logo: {
    width: 230,
    height: 162, // proporción del imagotipo (809 x 569)
    marginBottom: 24,
  },
  slogan: {
    fontSize: 14,
    fontWeight: '300',
    lineHeight: 21,
    textAlign: 'center',
    color: COLORES.azulMarino,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700', // SemiBold/Bold para títulos
    color: COLORES.azulMarino,
    marginBottom: 20,
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
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 15,
    fontWeight: '300', // Light/Regular para texto general
    color: COLORES.azulMarino,
  },
  errorText: {
    alignSelf: 'flex-start',
    color: COLORES.error,
    fontSize: 13,
    marginBottom: 10,
  },
  forgotContainer: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  forgotText: {
    color: COLORES.celesteCielo,
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    backgroundColor: COLORES.azulMarino,
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 8,
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: COLORES.blanco,
    fontSize: 16,
    fontWeight: '700',
  },
  signUpText: {
    marginTop: 24,
    color: COLORES.azulMarino,
    fontWeight: '300',
  },
  signUpLink: {
    color: COLORES.celesteCielo,
    fontWeight: '700',
  },
});
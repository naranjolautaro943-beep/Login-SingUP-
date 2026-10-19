import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { auth } from '../src/config/firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import {
  validarObligatorio,
  validarCorreo,
  validarContrasena,
  coincidenContrasenas,
} from '../src/config/utils/validations';

// Paleta institucional (Manual de Identidad Corporativa, diapositiva 07)
const COLORES = {
  azulMarino: '#0a082d',
  celesteCielo: '#2f60d0',
  blanco: '#ffffff',
  textoSecundario: '#6b6a80',
  error: '#c0392b',
};

// Mensajes formales de validación
const MENSAJES = {
  nombreObligatorio: 'El nombre es obligatorio.',
  apellidoObligatorio: 'El apellido es obligatorio.',
  correoObligatorio: 'El correo electrónico es obligatorio.',
  correoInvalido: 'Ingrese un correo electrónico válido (ejemplo: usuario@correo.com).',
  contrasenaObligatoria: 'La contraseña es obligatoria.',
  contrasenaInvalida:
    'La contraseña debe tener al menos 8 caracteres e incluir mayúscula, minúscula, número y un carácter especial.',
  confirmacionObligatoria: 'Debe confirmar la contraseña.',
  noCoinciden: 'Las contraseñas no coinciden.',
};

const obtenerErrorNombre = (v) => (validarObligatorio(v) ? '' : MENSAJES.nombreObligatorio);
const obtenerErrorApellido = (v) => (validarObligatorio(v) ? '' : MENSAJES.apellidoObligatorio);

const obtenerErrorCorreo = (v) => {
  if (!validarObligatorio(v)) return MENSAJES.correoObligatorio;
  if (!validarCorreo(v)) return MENSAJES.correoInvalido;
  return '';
};

const obtenerErrorContrasena = (v) => {
  if (!validarObligatorio(v)) return MENSAJES.contrasenaObligatoria;
  if (!validarContrasena(v)) return MENSAJES.contrasenaInvalida;
  return '';
};

const obtenerErrorConfirmacion = (contrasena, confirmacion) => {
  if (!validarObligatorio(confirmacion)) return MENSAJES.confirmacionObligatoria;
  if (!coincidenContrasenas(contrasena, confirmacion)) return MENSAJES.noCoinciden;
  return '';
};

// Campo reutilizable: etiqueta + input con ícono + mensaje de error
function Campo({
  label,
  icono,
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
  secureTextEntry,
  mostrarToggle,
  onToggle,
  mostrando,
  keyboardType,
  autoCapitalize,
}) {
  const [enfocado, setEnfocado] = useState(false);
  const colorBorde = error ? COLORES.error : enfocado ? COLORES.celesteCielo : COLORES.azulMarino;

  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, { borderColor: colorBorde }]}>
        <FontAwesome name={icono} size={20} color={COLORES.azulMarino} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORES.textoSecundario}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setEnfocado(true)}
          onBlur={() => {
            setEnfocado(false);
            onBlur && onBlur();
          }}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
        />
        {mostrarToggle && (
          <TouchableOpacity onPress={onToggle}>
            <FontAwesome name={mostrando ? 'eye-slash' : 'eye'} size={20} color={COLORES.celesteCielo} />
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </>
  );
}

export default function SignUp({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // El botón queda deshabilitado mientras haya campos vacíos
  const camposVacios =
    !validarObligatorio(firstName) ||
    !validarObligatorio(lastName) ||
    !validarObligatorio(email) ||
    !validarObligatorio(password) ||
    !validarObligatorio(confirmPassword);

  const limpiarError = (campo) => {
    if (errors[campo]) setErrors((prev) => ({ ...prev, [campo]: '' }));
  };

  const setError = (campo, mensaje) => setErrors((prev) => ({ ...prev, [campo]: mensaje }));

  const validarFormulario = () => {
    const nuevosErrores = {
      firstName: obtenerErrorNombre(firstName),
      lastName: obtenerErrorApellido(lastName),
      email: obtenerErrorCorreo(email),
      password: obtenerErrorContrasena(password),
      confirmPassword: obtenerErrorConfirmacion(password, confirmPassword),
    };
    setErrors(nuevosErrores);
    return Object.values(nuevosErrores).every((e) => !e);
  };

  const handleSignUp = async () => {
    if (!validarFormulario()) return;

    let credential;
    try {
      credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      console.error('Error de registro:', error.code, error.message);
      let errorMessage = 'Hubo un problema al registrar el usuario.';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'El correo electrónico ya está en uso.';
          break;
        case 'auth/invalid-email':
          errorMessage = MENSAJES.correoInvalido;
          break;
        case 'auth/weak-password':
          errorMessage = MENSAJES.contrasenaInvalida;
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Error de conexión, por favor intente más tarde.';
          break;
      }
      Alert.alert('Error', errorMessage);
      return;
    }

    try {
      await updateProfile(credential.user, { displayName: `${firstName.trim()} ${lastName.trim()}` });
      Alert.alert('Registro exitoso', 'Usuario registrado con éxito.');
    } catch (error) {
      Alert.alert('Cuenta creada', 'La cuenta se creó, pero no se pudo guardar el nombre.');
    }
    // Firebase inicia la sesión y el navegador muestra Home.
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Image source={require('../assets/logo-kiosco-azul.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Regístrate</Text>

      <Campo
        label="Nombre"
        icono="user"
        placeholder="Ingrese su nombre"
        value={firstName}
        onChangeText={(t) => { setFirstName(t); limpiarError('firstName'); }}
        onBlur={() => setError('firstName', firstName ? obtenerErrorNombre(firstName) : '')}
        error={errors.firstName}
        autoCapitalize="words"
      />

      <Campo
        label="Apellido"
        icono="user"
        placeholder="Ingrese su apellido"
        value={lastName}
        onChangeText={(t) => { setLastName(t); limpiarError('lastName'); }}
        onBlur={() => setError('lastName', lastName ? obtenerErrorApellido(lastName) : '')}
        error={errors.lastName}
        autoCapitalize="words"
      />

      <Campo
        label="Correo"
        icono="envelope"
        placeholder="Usuario@correo.com"
        value={email}
        onChangeText={(t) => { setEmail(t); limpiarError('email'); }}
        onBlur={() => setError('email', email ? obtenerErrorCorreo(email) : '')}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Campo
        label="Contraseña"
        icono="lock"
        placeholder="Ingrese su contraseña"
        value={password}
        onChangeText={(t) => { setPassword(t); limpiarError('password'); }}
        onBlur={() => setError('password', password ? obtenerErrorContrasena(password) : '')}
        error={errors.password}
        secureTextEntry={!showPassword}
        mostrarToggle
        mostrando={showPassword}
        onToggle={() => setShowPassword(!showPassword)}
        autoCapitalize="none"
      />

      <Campo
        label="Confirmar contraseña"
        icono="lock"
        placeholder="Confirme su contraseña"
        value={confirmPassword}
        onChangeText={(t) => { setConfirmPassword(t); limpiarError('confirmPassword'); }}
        onBlur={() =>
          setError('confirmPassword', confirmPassword ? obtenerErrorConfirmacion(password, confirmPassword) : '')
        }
        error={errors.confirmPassword}
        secureTextEntry={!showConfirmPassword}
        mostrarToggle
        mostrando={showConfirmPassword}
        onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={[styles.button, camposVacios && styles.buttonDisabled]}
        onPress={handleSignUp}
        disabled={camposVacios}
      >
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.signUpText}>
          ¿Ya tienes cuenta? <Text style={styles.signUpLink}>Inicia sesión</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
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
    width: 170,
    height: 120, // proporción del imagotipo (809 x 569)
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORES.azulMarino,
    marginBottom: 12,
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
    fontWeight: '300',
    color: COLORES.azulMarino,
  },
  errorText: {
    alignSelf: 'flex-start',
    color: COLORES.error,
    fontSize: 13,
    marginBottom: 10,
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
    marginBottom: 12,
    color: COLORES.azulMarino,
    fontWeight: '300',
  },
  signUpLink: {
    color: COLORES.celesteCielo,
    fontWeight: '700',
  },
});
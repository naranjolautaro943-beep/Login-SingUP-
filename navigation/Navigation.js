import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../src/config/firebaseConfig';
import Login from '../screens/Login';
import SignUp from '../screens/SignUp';
import Home from '../screens/Home';
import ListadoProductos from '../screens/ListadoProductos';
import FormularioProducto from '../screens/FormularioProducto';
import ListadoCaja from '../screens/ListadoCaja';
import FormularioMovimiento from '../screens/FormularioMovimiento';

const Stack = createStackNavigator();

export default function Navigation() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, setUser);
  }, []);

  if (!isFirebaseConfigured) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>
          Falta configurar Firebase. Copia .env.example como .env y completa los datos de tu proyecto.
        </Text>
      </View>
    );
  }

  if (user === undefined) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen name="Home" component={Home} options={{ title: 'Inicio' }} />
            <Stack.Screen
              name="ListadoProductos"
              component={ListadoProductos}
              options={{ title: 'Productos' }}
            />
            <Stack.Screen
              name="FormularioProducto"
              component={FormularioProducto}
              options={{ title: 'Nuevo producto' }}
            />
            <Stack.Screen
              name="ListadoCaja"
              component={ListadoCaja}
              options={{ title: 'Caja' }}
            />
            <Stack.Screen
              name="FormularioMovimiento"
              component={FormularioMovimiento}
              options={({ route }) => ({
                title: route.params?.movimiento ? 'Editar movimiento' : 'Nuevo movimiento',
              })}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
            <Stack.Screen
              name="SignUp"
              component={SignUp}
              options={{
                title: 'Registro',
                headerTintColor: '#0a082d',
                headerTitleStyle: { fontWeight: '700', color: '#0a082d' },
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  message: { textAlign: 'center', fontSize: 16 },
});
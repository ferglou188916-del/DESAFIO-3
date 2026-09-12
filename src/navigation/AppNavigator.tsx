import React, { useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';
import * as LocalAuthentication from 'expo-local-authentication'; 

import PeliculasScreen from '../screens/PeliculasScreen';
import ReservaScreen from '../screens/ReservaScreen';
import MisBoletosScreen from '../screens/MisBoletosScreen';
import PersonalScreen from '../screens/PersonalScreen'; 
import EscanerScreen from '../screens/EscanerScreen';
import DashboardScreen from '../screens/DashboardScreen';
import SalasScreen from '../screens/SalasScreen';

const Tab = createBottomTabNavigator();
const CarteleraStack = createStackNavigator();

function CarteleraStackScreen() {
  return (
    <CarteleraStack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#0a0a0a' }, headerTintColor: '#ffffff', headerTitleAlign: 'center' }}>
      <CarteleraStack.Screen name="Peliculas" component={PeliculasScreen} options={{ title: 'Wáchalo - Cartelera' }} />
      <CarteleraStack.Screen name="Reserva" component={ReservaScreen} options={{ title: 'Seleccionar Asientos' }} />
    </CarteleraStack.Navigator>
  );
}

const PersonalStack = createStackNavigator();

function PersonalStackScreen() {
  return (
    <PersonalStack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#0a0a0a' }, headerTintColor: '#ffffff', headerTitleAlign: 'center' }}>
      <PersonalStack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <PersonalStack.Screen name="Administracion" component={PersonalScreen} options={{ title: 'Gestión de Catálogo' }} />
      <PersonalStack.Screen name="Salas" component={SalasScreen} options={{ title: 'Gestión de Salas' }} />
      <PersonalStack.Screen name="Escaner" component={EscanerScreen} options={{ headerShown: false }} />
    </PersonalStack.Navigator>
  );
}

export default function AppNavigator() {
  
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync("hidden");
    }
  }, []);

  const verificarHuella = async (navigation: any) => {
    try {
      const hardwareCompatible = await LocalAuthentication.hasHardwareAsync();
      if (!hardwareCompatible) {
        Alert.alert('Aviso', 'Tu dispositivo no tiene hardware biométrico. Ingresando por defecto...');
        resetearStackAdministrativo(navigation);
        return;
      }

      const huellasRegistradas = await LocalAuthentication.isEnrolledAsync();
      if (!huellasRegistradas) {
        Alert.alert('Aviso', 'No tienes huellas configuradas en tu teléfono. Ingresando por defecto...');
        resetearStackAdministrativo(navigation);
        return;
      }

      const autenticacion = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Acceso restringido para Personal',
        fallbackLabel: 'Usar PIN',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false, 
      });

      if (autenticacion.success) {
        resetearStackAdministrativo(navigation);
      } else {
        Alert.alert('Acceso Denegado', 'Autenticación fallida o cancelada.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Hubo un problema con el sensor biométrico.');
    }
  };

  const resetearStackAdministrativo = (navigation: any) => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Personal', params: { screen: 'Dashboard' } }],
      })
    );
  };

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: '#0a0a0a' },
          headerTintColor: '#ffffff',
          headerTitleAlign: 'center',
          tabBarStyle: { 
            backgroundColor: '#1a1a1a', 
            borderTopColor: '#333', 
            paddingBottom: 10,
            paddingTop: 10,
            minHeight: 60 
          },
          tabBarActiveTintColor: '#d32f2f',
          tabBarInactiveTintColor: '#888',
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: any;
            if (route.name === 'Inicio') iconName = focused ? 'film' : 'film-outline';
            else if (route.name === 'Mis Boletos') iconName = focused ? 'ticket' : 'ticket-outline';
            else if (route.name === 'Personal') iconName = focused ? 'lock-closed' : 'lock-closed-outline';
            
            return <Ionicons name={iconName} size={24} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Inicio" component={CarteleraStackScreen} options={{ headerShown: false }} />
        <Tab.Screen name="Mis Boletos" component={MisBoletosScreen} options={{ title: 'Historial de Compras' }} />
        <Tab.Screen 
          name="Personal" 
          component={PersonalStackScreen} 
          options={{ 
            title: 'Administración', 
            headerShown: false
          }} 
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              verificarHuella(navigation);
            },
          })}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
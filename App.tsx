import React, { useEffect } from "react";
import { Text, Alert, Platform, PermissionsAndroid } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { navigationRef } from "./src/navigation/NavigationService";
import BottomTabNavigator from "./src/navigation/BottomTabNavigator";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BibleProvider } from "./src/context/BibleContext"; // Contexto
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "./src/firebaseConfig";

import { navigate } from './src/navigation/NavigationService';
import messaging from "@react-native-firebase/messaging"; // Firebase
import { requestNotificationPermission, getFCMToken } from "./src/NotificationService"; // Servicio de notificaciones
import { AuthProvider } from "./src/context/AuthContext";
import InternetCheck from './src/components/InternetCheck'; // Componente de verificación de conexión
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🔥 Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db };

// Configurar la tipografía predeterminada
(Text as any).defaultProps = (Text as any).defaultProps || {};
(Text as any).defaultProps.style = { fontFamily: "UntitledSerif-Regular" };

const App = () => {

  useEffect(() => {
    const checkAndRequestPermission = async () => {
      // 1. Verificar estado actual del permiso
      let status;
      
      if (Platform.OS === 'ios') {
        status = await check(PERMISSIONS.IOS.USER_NOTIFICATIONS);
      } else {
        if (Platform.Version >= 33) {
          status = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        } else {
          status = RESULTS.GRANTED; // Android <13 no requiere permiso
        }
      }
  
      // 2. Si ya tiene permiso, no hacer nada
      if (status === RESULTS.GRANTED) return;
  
      // 3. Verificar si ya se mostró la alerta antes (usando AsyncStorage)
      const hasAsked = await AsyncStorage.getItem('notificationsAsked');
      
      if (!hasAsked) {
        Alert.alert(
          '🔔 Activar las notificaciones',
          '¿Permites que te enviemos notificaciones sobre un nuevo devocional y demás?',
          [
            { 
              text: 'No', 
              style: 'cancel',
              onPress: () => AsyncStorage.setItem('notificationsAsked', 'true'), // Marcar como preguntado
            },
            { 
              text: 'Sí', 
              onPress: async () => {
                await requestNotificationPermission(); // Solicitar permiso
                AsyncStorage.setItem('notificationsAsked', 'true'); // Marcar como preguntado
              },
            },
          ]
        );
      }
    };
  
    checkAndRequestPermission();
  }, []);

  useEffect(() => {
    // Pedir permisos para recibir notificaciones
    // requestNotificationPermission();

    // Obtener y mostrar el token de FCM
    getFCMToken().then((token) => {
      if (token) {
        console.log("🔹 FCM Token:", token);
      } else {
        console.warn("⚠️ No se pudo obtener el token de FCM");
      }
    });

    // Suscribirse al topic "all" para recibir notificaciones enviadas a ese topic
    messaging()
      .subscribeToTopic('all')
      .then(() => console.log('Suscrito al topic "all"'))
      .catch((error) => console.error('Error suscribiéndose al topic:', error));

    // Escuchar notificaciones en primer plano (cuando la app está abierta)
    const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
      Alert.alert("📩 Nueva Notificación", remoteMessage.notification?.title || "Sin título");
    });

    // Escuchar notificaciones en segundo plano o cuando la app está cerrada
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log("📩 Notificación recibida en segundo plano:", remoteMessage);
    });

    return () => {
      unsubscribeForeground();
    };
  }, []);

  // Función para solicitar permisos
  const requestNotificationPermission = async () => {
    let status;
    
    if (Platform.OS === 'ios') {
      // Para iOS
      status = await request(PERMISSIONS.IOS.USER_NOTIFICATIONS);
    } else {
      // Para Android (API 33+)
      if (Platform.Version >= 33) {
        status = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
      } else {
        // En versiones anteriores no se requiere solicitud
        status = 'granted';
      }
    }

    // Manejar resultado
    if (status === RESULTS.GRANTED || status === 'granted') {
      console.log('Permiso concedido ✅');
    } else {
      console.log('Permiso denegado ❌');
      // Opcional: Abrir configuración de la app
      // Linking.openSettings();
    }
  };

  useEffect(() => {
    // App en background y usuario toca la notificación
    const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
      handleNotificationNavigation(remoteMessage);
    });

    // App cerrada y usuario la abre tocando la notificación
    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        handleNotificationNavigation(remoteMessage);
      }
    });

    return unsubscribe;
  }, []);

  const handleNotificationNavigation = (remoteMessage) => {
  // Esperamos que envíes en el payload:
  // { data: { screen: 'DevotionalDetailScreen', devotionalId: '123' } }

  const screen = remoteMessage?.data?.screen;
  const devotionalId = remoteMessage?.data?.devotionalId;

  if (screen === "DevotionalDetailScreen" && devotionalId) {
    // Navegar a la pantalla anidada
    navigate('Devocionales', {
      screen: 'DevotionalDetailScreen',
      params: { devotionalId }
    });
  }
};

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <BibleProvider>
          <NavigationContainer ref={navigationRef}>
            <BottomTabNavigator />
          </NavigationContainer>
        </BibleProvider>
        <InternetCheck />
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;

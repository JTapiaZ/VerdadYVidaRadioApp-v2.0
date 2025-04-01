import React, { useEffect } from "react";
import { Text, Alert, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import BottomTabNavigator from "./src/navigation/BottomTabNavigator";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BibleProvider } from "./src/context/BibleContext"; // Contexto

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "./src/firebaseConfig";

import messaging from "@react-native-firebase/messaging"; // Firebase
import { requestNotificationPermission, getFCMToken } from "./src/NotificationService"; // Servicio de notificaciones
import { AuthProvider } from "./src/context/AuthContext";
import InternetCheck from './src/components/InternetCheck'; // Componente de verificación de conexión

// 🔥 Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db };

// Configurar la tipografía predeterminada
(Text as any).defaultProps = (Text as any).defaultProps || {};
(Text as any).defaultProps.style = { fontFamily: "UntitledSerif-Regular" };

const App = () => {
  useEffect(() => {
    // Pedir permisos para recibir notificaciones
    requestNotificationPermission();

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

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <BibleProvider>
          <NavigationContainer>
            <BottomTabNavigator />
          </NavigationContainer>
        </BibleProvider>
        <InternetCheck />
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;

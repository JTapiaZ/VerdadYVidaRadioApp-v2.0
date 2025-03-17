import React, { useEffect } from "react";
import { Text, Alert, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import BottomTabNavigator from "./src/navigation/BottomTabNavigator";
import { BibleProvider } from "./src/context/BibleContext"; // Contexto

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "./src/firebaseConfig";

import messaging from "@react-native-firebase/messaging"; // Firebase
import { requestNotificationPermission, getFCMToken } from "./src/NotificationService"; // Servicio de notificaciones

// 🔥 Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db };

// Configurar la tipografía predeterminada
(Text as any).defaultProps = (Text as any).defaultProps || {};
(Text as any).defaultProps.style = { fontFamily: "UntitledSerif-Regular" };

const App = () => {
  useEffect(() => {
    // ✅ Pedir permisos para recibir notificaciones
    requestNotificationPermission();

    // ✅ Obtener y mostrar el token de FCM
    getFCMToken().then((token) => {
      if (token) {
        console.log("🔹 FCM Token:", token);
      } else {
        console.warn("⚠️ No se pudo obtener el token de FCM");
      }
    });

    // ✅ Escuchar notificaciones en primer plano (cuando la app está abierta)
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      Alert.alert("📩 Nueva Notificación", remoteMessage.notification?.title || "Sin título");
    });

    // ✅ Escuchar notificaciones en segundo plano o cuando la app está cerrada
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log("📩 Notificación recibida en segundo plano:", remoteMessage);
    });

    return () => unsubscribe();
  }, []);

  return (
    <BibleProvider>
      <NavigationContainer>
        <BottomTabNavigator />
      </NavigationContainer>
    </BibleProvider>
  );
};

export default App;

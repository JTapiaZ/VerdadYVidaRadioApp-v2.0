import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';

// Configurar el manejo de notificaciones en background
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('📩 Notificación recibida en segundo plano:', remoteMessage);

  PushNotification.localNotification({
    channelId: "default-channel-id",
    title: remoteMessage.notification.title,
    message: remoteMessage.notification.body,
    playSound: true,
    soundName: 'default',
  });
});

// Registrar canal de notificaciones para Android
PushNotification.createChannel(
  {
    channelId: "default-channel-id",
    channelName: "Default Channel",
    channelDescription: "Canal para notificaciones",
    playSound: true,
    soundName: "default",
    importance: 4,
    vibrate: true,
  },
  (created) => console.log(`🔔 Canal de notificación ${created ? "creado" : "ya existe"}`)
);

// 🔹 Configuración de Firebase (usa la que te dio Firebase en el paso de configuración)
export const firebaseConfig = {
  apiKey: "AIzaSyBGKSOxfTijtGpNQ-sXIuMIxr8ydQhMBTo",
  authDomain: "verdadyvidaradionotifications.firebaseapp.com",
  projectId: "verdadyvidaradionotifications",
  storageBucket: "verdadyvidaradionotifications.appspot.com", // Corregido
  messagingSenderId: "923461091261",
  appId: "1:923461091261:web:588e47d4e1350421499cd4",
};

// 🔹 Inicializar Firebase si aún no está inicializado
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// 🔹 Exportar Firestore para usarlo en la app
export const db = getFirestore(app);

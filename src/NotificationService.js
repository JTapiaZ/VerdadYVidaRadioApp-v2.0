import messaging from "@react-native-firebase/messaging";
import { Platform, PermissionsAndroid } from "react-native";

// ✅ Solicitar permisos de notificación
export const requestNotificationPermission = async () => {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("✅ Permiso de notificación concedido");
    } else {
      console.warn("⚠️ Permiso de notificación denegado");
    }
  } catch (error) {
    console.error("❌ Error solicitando permisos de notificación:", error);
  }
};

// ✅ Obtener el token de FCM
export const getFCMToken = async () => {
  try {
    const token = await messaging().getToken();
    return token;
  } catch (error) {
    console.error("❌ Error obteniendo el token de FCM:", error);
    return null;
  }
};

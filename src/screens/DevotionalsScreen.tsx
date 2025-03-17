import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Share, FlatList, ActivityIndicator, Alert} from "react-native";
import Video from "react-native-video";
import Icon from 'react-native-vector-icons/Ionicons';

import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Asegúrate de importar correctamente
import messaging from "@react-native-firebase/messaging"; // 🔔 Notificaciones

import AsyncStorage from "@react-native-async-storage/async-storage";


const DevotionalsScreen = () => {
  const [devotionals, setDevotionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const devotionalsRef = collection(db, "devotionals");
    const devotionalsQuery = query(devotionalsRef, orderBy("createdAt", "desc")); // 🔥 Ordenar por fecha descendente
  
    const unsubscribe = onSnapshot(devotionalsQuery, async (snapshot) => {
      const devotionalList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      if (devotionalList.length > 0) {
        const newDevotional = devotionalList[0]; // 🔥 Ahora este es el MÁS RECIENTE
  
        // Leer el último ID guardado
        const storedLastId = await AsyncStorage.getItem("lastDevotionalId");
        console.log("📌 Último ID guardado:", storedLastId);
        console.log("📌 Nuevo devocional detectado:", newDevotional.id);
  
        if (storedLastId !== newDevotional.id) {
          console.log("📩 ¡Nuevo devocional detectado, enviando alerta y notificación!");
  
          // Enviar la notificación
          try {
            await sendNotification(newDevotional.title, newDevotional.content);
            console.log("✅ Notificación enviada con éxito.");
          } catch (error) {
            console.error("❌ Error enviando notificación:", error);
          }
  
          // Mostrar la alerta
          // Alert.alert("Nuevo devocional", "Revisa el contenido", [{ text: "OK" }]);
  
          // Guardar el nuevo ID en AsyncStorage
          await AsyncStorage.setItem("lastDevotionalId", newDevotional.id);
          console.log("💾 Nuevo ID guardado en AsyncStorage:", newDevotional.id);
        } else {
          console.log("⚠️ El devocional ya fue notificado, no se envía alerta.");
        }
      }
  
      setDevotionals(devotionalList);
      setLoading(false); 
    });
  
    return () => unsubscribe();
  }, []);
  
  


  // Función para enviar notificación
  const sendNotification = async (title, body) => {
    const token = await messaging().getToken();
    if (!token) {
      console.error("No se pudo obtener el token FCM");
      return;
    }
  
    try {
      const response = await fetch("https://fcm.googleapis.com/v1/projects/verdadyvidaradionotifications/messages:send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ya29.c.c0ASRK0GZrTAoo5BHw5fxxSJ1uunRRsSdpsyFGGWTG8Nf8kxnuaoKrgWzjeweInC-KVrXn8sMPT65N2RYgcPIZqS7MysevJjB6ZAKy8IgSaTRUDBh5JuWRsTv8_N1DzD697veJCcSU-GVhgdXpzsZu4Ev0XLJDlLacV8cyA38nm2b_CHMgJWCS6ccmewdey6uP_GSpcYI3ciMxagFGAZp-XVU1wtJZfQs_0PSAJkd_vrDuDt0In0jlW2CpMDso54BjhHO95f4QivyWUGhZBOUGTUGXUutT4DIXKoL67-TysJQeOUyzdNFsp0pzBi5SkYyNFLEMK5IQxic0s7O6z6Y73M5ezlzo-wJqNl0RzT4fhEEC2QQwjTpCNfKCWAL387Kd0FVvyFmQyQ3njn8Z8-fv6aoglxsma3bUxduSZf1_WOkjfrpf_jry99Rs6ZX1htcYW6UmQdYXdWa8oh6cwRff8poeMnV60y09hnnvcQWbluXvUS728-n43dstJWewy39mygymrgqkoQzBxaOYbI0OvtpYymYldtxpmfZkQRa4mlB0SVxc__BXblWbX1booXuvojfpp6IqYpBa9S9los701bYkw-le1db_zsmxYz7Qr_2bjOMxYsk5sSZMdhMpmh0pJm53V5hSM6BZ_Il6ydikzvhtXIvQZucrO7O8o5IW_9OSmibxjkBa-hVIwO799tOl40UIfpc5IQgx3Q4fU3omqhauBqtsZts1lMxb1vm--5v3Xn5grd58ubb_QV1jFXFt15Ycns6SRiJzOFm4BiUOy2fIjUmZpaBhjm2RsMOjcxw6oSegSRnBW9k6djmhsjRvSUag0MWo_7rI0B8tU3-ze0Z8B-96IqpRa0spIiZrpzp3queRtkRk5QZzkZByzxllpWzrxSobror3nRzchkWROv7amJ_jJF87okuzuOjlbgkp_rgOnar6rR9StR0750w4xbb8v4wY4JevumndMUwy0euZgp4dxt0R0JjpXB4SmFM8nhmYrt2xrac`, // 🔹 Genera un nuevo token si es necesario
        },
        body: JSON.stringify({
          message: {
            token, // ✅ Aquí va el token
            notification: {
              title,
              body,
            },
          },
        }),
      });
  
      if (!response.ok) {
        const errorResponse = await response.text();
        console.error("Error en la respuesta de FCM:", errorResponse);
      } else {
        const data = await response.json();
        console.log("Notificación enviada con éxito:", data);
      }
    } catch (error) {
      console.error("Error al enviar notificación:", error.message);
    }
  };

  // Compartir devocional
  const shareDevotional = async () => {
    try {
      await Share.share({
        message: "🌿 Devocional del día: Reflexiona y crece espiritualmente. 🙏✨",
      });
    } catch (error) {
      console.error("Error al compartir:", error);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View>
    {devotionals.length > 0 ? (
      devotionals.map((devotional) => (
        <View key={devotional.id}>
          <Text>{devotional.title}</Text>
          <Text>{devotional.content}</Text>
        </View>
      ))
    ) : (
      <Text>No hay devocionales disponibles</Text>
    )}
    </View>
  );
};

// 🎨 Estilos minimalistas
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  video: {
    width: "100%",
    height: 600,
    borderRadius: 20,
    backgroundColor: "#000",
  },
  content: {
    marginTop: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    textAlign: "center",
    color: "#555",
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 15,
    gap: 20,
  },
});

export default DevotionalsScreen;

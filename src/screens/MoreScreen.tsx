import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking, Alert } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

const MoreScreen = () => {
  const navigation = useNavigation();

  // Función genérica para abrir redes sociales
  const openSocialMedia = async (appUrl: string, webUrl: string) => {
    try {
      // Verificar si se puede abrir la app
      const canOpen = await Linking.canOpenURL(appUrl);
      
      if (canOpen) {
        await Linking.openURL(appUrl);
      } else {
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir el enlace');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header personalizado */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Máss</Text>
        <TouchableOpacity style={styles.donateButton} onPress={() => navigation.navigate("DonationScreen")}>
          <Icon name="heart" size={18} color="black" />
          <Text style={styles.donateText}>Donar Ahora</Text>
        </TouchableOpacity>
      </View>

      {/* Contenido */}
      <ScrollView contentContainerStyle={styles.content} style={{ flex: 1 }}>
        {/* Sección de Acciones */}
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate("ProfileScreen") }>
          <Icon name="person-circle-outline" size={35} color="#555" style={styles.icon} />
          <Text style={styles.itemText}>Juan José Tapias Pinzón</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate("ProfileScreen", { initialCategory: 'verses' })}>
          <Icon name="heart-outline" size={24} color="#555" style={styles.icon} />
          <Text style={styles.itemText}>Versículos favoritos</Text>
        </TouchableOpacity>
        
        {/* Sección de Contenido */}
        <View style={styles.separator} />
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate("Predicaciones") }>
          <Icon name="videocam-outline" size={24} color="#555" style={styles.icon} />
          <Text style={styles.itemText}>Predicaciones</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate("RadioContentScreen") }>
          <Icon name="mic-outline" size={24} color="#555" style={styles.icon} />
          <Text style={styles.itemText}>Podcast</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate("DevotionalsScreen") }>
          <Icon name="book-outline" size={24} color="#555" style={styles.icon} />
          <Text style={styles.itemText}>Devocionales</Text>
        </TouchableOpacity>

        {/* Sección de Información */}
        <View style={styles.separator} />
        {/* <TouchableOpacity style={styles.item} onPress={() => navigation.navigate("LocationsScreen") }>
          <Icon name="heart-outline" size={24} color="#555" style={styles.icon} />
          <Text style={styles.itemText}>Donar a nuestra Fundación</Text>
        </TouchableOpacity> */}
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate("DonationScreen") }>
          <Icon name="heart-outline" size={24} color="#555" style={styles.icon} />
          <Text style={styles.itemText}>Donar a la emisora</Text>
        </TouchableOpacity>

        {/* Sección de Información */}
        <View style={styles.separator} />
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate("SiteInformationScreen") }>
          <Icon name="location-outline" size={24} color="#555" style={styles.icon} />
          <Text style={styles.itemText}>Información de nuestras sedes</Text>
        </TouchableOpacity>

        {/* Sección de Redes */}
        <View style={styles.separator} />
        <TouchableOpacity style={styles.item} onPress={() => openSocialMedia(
          'fb://profile/359807460699524', // Reemplaza con tu ID de Facebook
          'https://www.facebook.com/radioverdadyvida'
        )}>
          <Icon name="logo-facebook" size={24} color="#555" style={styles.icon} />
          <Text style={styles.itemText}>¡Síguenos en Facebook!</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={() => openSocialMedia(
          'instagram://user?username=verdadyvidaradio',
          'https://www.instagram.com/verdadyvidaradio'
        )}>
          <Icon name="logo-instagram" size={24} color="#555" style={styles.icon} />
          <Text style={styles.itemText}>¡Síguenos en Instagram!</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={() => openSocialMedia(
          'youtube://channel/UCsCRnbf4sA7E8FpQa6FKfMg', 
          'https://www.youtube.com/@VerdadYVidaRadioOficial'
        )}>
          <Icon name="logo-youtube" size={24} color="#555" style={styles.icon} />
          <Text style={styles.itemText}>¡Síguenos en Youtube!</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginBottom: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  donateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3e4e5",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  donateText: {
    color: "#333",
    marginLeft: 5,
    fontWeight: "bold",
  },
  content: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    marginTop: 15,
  },
  separator: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
  },
  itemText: {
    fontSize: 16,
    color: "#333",
  },
});

export default MoreScreen;

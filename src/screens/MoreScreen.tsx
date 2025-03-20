import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

const MoreScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header personalizado */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Máss</Text>
        <TouchableOpacity style={styles.donateButton} onPress={() => navigation.navigate("DonateScreen")}>
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
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate("DonateScreen") }>
          <Icon name="heart-outline" size={24} color="#555" style={styles.icon} />
          <Text style={styles.itemText}>Versículos favoritos</Text>
        </TouchableOpacity>
        
        {/* Sección de Contenido */}
        <View style={styles.separator} />
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate("RadioContentScreen") }>
          <Icon name="videocam-outline" size={24} color="#555" style={styles.icon} />
          <Text style={styles.itemText}>Predicaciones</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate("RadioContentScreen") }>
          <Icon name="mic-outline" size={24} color="#555" style={styles.icon} />
          <Text style={styles.itemText}>Podcast</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate("SermonsScreen") }>
          <Icon name="book-outline" size={24} color="#555" style={styles.icon} />
          <Text style={styles.itemText}>Devocionales</Text>
        </TouchableOpacity>

        {/* Sección de Información */}
        <View style={styles.separator} />
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate("LocationsScreen") }>
          <Icon name="heart-outline" size={24} color="#555" style={styles.icon} />
          <Text style={styles.itemText}>Donar a nuestra Fundación</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate("SocialMediaScreen") }>
          <Icon name="heart-outline" size={24} color="#555" style={styles.icon} />
          <Text style={styles.itemText}>Donar a la emisora</Text>
        </TouchableOpacity>

        {/* Sección de Información */}
        <View style={styles.separator} />
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate("LocationsScreen") }>
          <Icon name="location-outline" size={24} color="#555" style={styles.icon} />
          <Text style={styles.itemText}>Información de nuestras sedes</Text>
        </TouchableOpacity>

        {/* Sección de Redes */}
        <View style={styles.separator} />
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate("SocialMediaScreen") }>
          <Icon name="logo-facebook" size={24} color="#555" style={styles.icon} />
          <Text style={styles.itemText}>¡Síguenos en Facebook!</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate("SocialMediaScreen") }>
          <Icon name="logo-instagram" size={24} color="#555" style={styles.icon} />
          <Text style={styles.itemText}>¡Síguenos en Instagram!</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate("SocialMediaScreen") }>
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

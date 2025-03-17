import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const ProfileScreen = () => {
  // Aquí podrías obtener los datos del usuario desde Firebase o AsyncStorage
  const user = {
    name: "Juan Pérez",
    email: "juanperez@example.com",
    profilePic: "https://i.pravatar.cc/150", // Imagen de avatar aleatoria
  };

  const handleEditProfile = () => {
    console.log("Editar perfil");
    // Aquí podrías navegar a una pantalla de edición de perfil
  };

  const handleLogout = () => {
    console.log("Cerrar sesión");
    // Aquí podrías implementar la lógica para cerrar sesión (Firebase Auth, etc.)
  };

  return (
    <View style={styles.container}>
      {/* Imagen de perfil */}
      <Image source={{ uri: user.profilePic }} style={styles.profileImage} />

      {/* Nombre y correo */}
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.email}>{user.email}</Text>

      {/* Botón para editar perfil */}
      <TouchableOpacity style={styles.button} onPress={handleEditProfile}>
        <Icon name="edit" size={18} color="white" />
        <Text style={styles.buttonText}>Editar Perfil</Text>
      </TouchableOpacity>

      {/* Botón para cerrar sesión */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="sign-out" size={18} color="white" />
        <Text style={styles.buttonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "gray",
    marginBottom: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    width: "80%",
    justifyContent: "center",
    marginBottom: 10,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "red",
    padding: 12,
    borderRadius: 8,
    width: "80%",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 10,
  },
});

export default ProfileScreen;

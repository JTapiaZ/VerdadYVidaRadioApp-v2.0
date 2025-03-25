import React, { useState } from "react";
import { View, FlatList, Text, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { useBible } from "../context/BibleContext";
import { SafeAreaView } from "react-native-safe-area-context";


const versions = [
  { name: "Reina Valera 1960", value: "rv1960" },
  { name: "Reina Valera 1995", value: "rv1995" },
  { name: "Nueva Versión Internacional", value: "nvi" },
  { name: "Dios Habla Hoy", value: "dhh" },
  { name: "Palabra de Dios para todos", value: "pdt" },
  { name: "King James Version", value: "kjv" },
];

const VersionSelection = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { version, setVersion } = useBible();
  const [search, setSearch] = useState("");

  const filteredVersions = versions.filter(version =>
    version.name.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").includes(
      search.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")
    )
  );

  const selectVersion = (version) => {
    if (setVersion) {
      setVersion(version.value); // Actualiza el estado global de la versión
    }
  
    // Regresa a BibleReader 
    navigation.navigate("Biblia");
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <TouchableOpacity onPress={() => navigation.navigate('Biblia')} style={styles.backButton}>
        <Icon name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <TextInput
        style={styles.searchBar}
        placeholder="Buscar versión..."
        placeholderTextColor="#999"
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={filteredVersions}
        keyExtractor={(item) => item.value}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => selectVersion(item)}>
            <Text style={styles.text}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    top: 0,
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    marginBottom: 10,
  },
  searchBar: {
    height: 40,
    backgroundColor: "#EAEAEA",
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    alignItems: "flex-start",
  },
  text: {
    fontSize: 18,
    color: "#333",
    fontWeight: "500",
  },
});

export default VersionSelection;

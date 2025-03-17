import React, {useState} from "react";
import { View, FlatList, Text, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { useBible } from "../context/BibleContext"; // Importa el contexto


export const books = [
  { name: "Génesis", value: "Genesis" },
  { name: "Éxodo", value: "Exodus" },
  { name: "Levítico", value: "Leviticus" },
  { name: "Números", value: "Numbers" },
  { name: "Deuteronomio", value: "Deuteronomy" },
  { name: "Josué", value: "Joshua" },
  { name: "Jueces", value: "Judges" },
  { name: "Rut", value: "Ruth" },
  { name: "1 Samuel", value: "1-Samuel" },
  { name: "2 Samuel", value: "2-Samuel" },
  { name: "1 Reyes", value: "1-Kings" },
  { name: "2 Reyes", value: "2-Kings" },
  { name: "1 Crónicas", value: "1-Chronicles" },
  { name: "2 Crónicas", value: "2-Chronicles" },
  { name: "Esdras", value: "Ezra" },
  { name: "Nehemías", value: "Nehemiah" },
  { name: "Ester", value: "Esther" },
  { name: "Job", value: "Job" },
  { name: "Salmos", value: "Psalms" },
  { name: "Proverbios", value: "Proverbs" },
  { name: "Eclesiastés", value: "Ecclesiastes" },
  { name: "Cantares", value: "Song of Solomon" },
  { name: "Isaías", value: "Isaiah" },
  { name: "Jeremías", value: "Jeremiah" },
  { name: "Lamentaciones", value: "Lamentations" },
  { name: "Ezequiel", value: "Ezekiel" },
  { name: "Daniel", value: "Daniel" },
  { name: "Oseas", value: "Hosea" },
  { name: "Joel", value: "Joel" },
  { name: "Amós", value: "Amos" },
  { name: "Abdías", value: "Obadiah" },
  { name: "Jonás", value: "Jonah" },
  { name: "Miqueas", value: "Micah" },
  { name: "Nahúm", value: "Nahum" },
  { name: "Habacuc", value: "Habakkuk" },
  { name: "Sofonías", value: "Zephaniah" },
  { name: "Hageo", value: "Haggai" },
  { name: "Zacarías", value: "Zechariah" },
  { name: "Malaquías", value: "Malachi" },
  { name: "Mateo", value: "Matthew" },
  { name: "Marcos", value: "Mark" },
  { name: "Lucas", value: "Luke" },
  { name: "Juan", value: "John" },
  { name: "Hechos", value: "Acts" },
  { name: "Romanos", value: "Romans" },
  { name: "1 Corintios", value: "1-Corinthians" },
  { name: "2 Corintios", value: "2-Corinthians" },
  { name: "Gálatas", value: "Galatians" },
  { name: "Efesios", value: "Ephesians" },
  { name: "Filipenses", value: "Philippians" },
  { name: "Colosenses", value: "Colossians" },
  { name: "1 Tesalonicenses", value: "1-Thessalonians" },
  { name: "2 Tesalonicenses", value: "2-Thessalonians" },
  { name: "1 Timoteo", value: "1-Timothy" },
  { name: "2 Timoteo", value: "2-Timothy" },
  { name: "Tito", value: "Titus" },
  { name: "Filemón", value: "Philemon" },
  { name: "Hebreos", value: "Hebrews" },
  { name: "Santiago", value: "James" },
  { name: "1 Pedro", value: "1-Peter" },
  { name: "2 Pedro", value: "2-Peter" },
  { name: "1 Juan", value: "1-John" },
  { name: "2 Juan", value: "2-John" },
  { name: "3 Juan", value: "3-John" },
  { name: "Judas", value: "Jude" },
  { name: "Apocalipsis", value: "Revelation" },
];

const BookSelection = () => {
  const navigation = useNavigation();
  const { book, setBook } = useBible(); // Usa el contexto global
  const [search, setSearch] = useState("");

  const removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Elimina tildes y diacríticos
  };

  const filteredBooks = books.filter(book =>
    removeAccents(book.name.toLowerCase()).includes(removeAccents(search.toLowerCase()))
  );

  const selectBook = (book) => {
    setBook(book.value); // Actualiza el estado global
    navigation.navigate('ChapterSelectionScreen') // Pasa a la pantalla capitulo
  };

  

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('Biblia')} style={styles.backButton}>
        <Icon name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <TextInput
        style={styles.searchBar}
        placeholder="Buscar libro..."
        placeholderTextColor="#999"
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item.value}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item, book === item.name && styles.selectedItem]}
            onPress={() => selectBook(item)}
          >
            <Text style={[styles.text, book === item.name && styles.selectedText]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    top: 35,
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  selectedItem: {
    backgroundColor: "#bbbbbb",
    borderRadius: 8,
  },
  selectedText: {
    color: "#FFF",
    fontWeight: "bold",
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

export default BookSelection;

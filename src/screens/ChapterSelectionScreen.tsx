import React from "react";
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";

import { books } from './BookSelectionScreen'
import { useBible } from "../context/BibleContext";
import { SafeAreaView } from "react-native-safe-area-context";

export const chaptersByBook = {
  Genesis: 50,
  Exodus: 40,
  Leviticus: 27,
  Numbers: 36,
  Deuteronomy: 34,
  Joshua: 24,
  Judges: 21,
  Ruth: 4,
  "1-Samuel": 31,
  "2-Samuel": 24,
  "1-Kings": 22,
  "2-Kings": 25,
  "1-Chronicles": 29,
  "2-Chronicles": 36,
  Ezra: 10,
  Nehemiah: 13,
  Esther: 10,
  Job: 42,
  Psalms: 150,
  Proverbs: 31,
  Ecclesiastes: 12,
  "Song of Solomon": 8,
  Isaiah: 66,
  Jeremiah: 52,
  Lamentations: 5,
  Ezekiel: 48,
  Daniel: 12,
  Hosea: 14,
  Joel: 3,
  Amos: 9,
  Obadiah: 1,
  Jonah: 4,
  Micah: 7,
  Nahum: 3,
  Habakkuk: 3,
  Zephaniah: 3,
  Haggai: 2,
  Zechariah: 14,
  Malachi: 4,
  Matthew: 28,
  Mark: 16,
  Luke: 24,
  John: 21,
  Acts: 28,
  Romans: 16,
  "1-Corinthians": 16,
  "2-Corinthians": 13,
  Galatians: 6,
  Ephesians: 6,
  Philippians: 4,
  Colossians: 4,
  "1-Thessalonians": 5,
  "2-Thessalonians": 3,
  "1-Timothy": 6,
  "2-Timothy": 4,
  Titus: 3,
  Philemon: 1,
  Hebrews: 13,
  James: 5,
  "1-Peter": 5,
  "2-Peter": 3,
  "1-John": 5,
  "2-John": 1,
  "3-John": 1,
  Jude: 1,
  Revelation: 22,
};


const ChapterSelection = () => {
  const navigation = useNavigation();
  const { book, setChapter } = useBible();

  // Número total de capítulos en el libro seleccionado
  const totalChapters = chaptersByBook[book] || 1;
  const chapters = Array.from({ length: totalChapters }, (_, i) => i + 1);

  // Buscar el nombre del libro en español
  const bookInfo = books.find((b) => b.value === book);
  const bookName = bookInfo ? bookInfo.name : book;
  
  // Manejar la selección de capítulo
  const selectChapter = (chapter: number) => {
    setChapter(chapter);
    navigation.navigate('Biblia', { screen: 'BibleScreen'}); // Volver a la pantalla principal de lectura
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <TouchableOpacity onPress={() => navigation.navigate('Biblia', { screen: 'BookSelectionScreen'})} style={styles.backButton}>
        <Icon name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <Text style={styles.title}>Selecciona un capítulo de {bookName}:</Text>
      <FlatList
        data={chapters}
        keyExtractor={(item) => item.toString()}
        initialNumToRender={50} // 🔥 Mejora el rendimiento en listas largas
        maxToRenderPerBatch={50} // 🔥 Renderiza en bloques grandes para evitar errores
        windowSize={10} // 🔥 Mantiene un tamaño de ventana grande en la lista
        numColumns={5} // Mostrar en varias columnas
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => selectChapter(item)}>
            <Text style={styles.text}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 40,
    marginBottom: 40,
  },
  backButton: {
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  item: {
    padding: 10,
    margin: 5,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  text: {
    fontSize: 15,
    color: "#fff",
  },
});

export default ChapterSelection;
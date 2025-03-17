import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Text, TouchableOpacity, Share } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { books } from "./BookSelectionScreen";
import { useBible } from "../context/BibleContext";

const BibleReader = () => {
  const insets = useSafeAreaInsets();
  const { version, book, chapter } = useBible();
  const [response, setResponse] = useState(null);
  const navigation = useNavigation();
  const [isDarkMode, setIsDarkMode] = useState(false); // Estado del tema
  const [selectedVerses, setSelectedVerses] = useState([]); 


  // Animación para cambiar el fondo del header
  const scrollY = useRef(new Animated.Value(0)).current;
  const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

  const headerBackground = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [isDarkMode ? "rgba(30,30,30,0)" : "rgba(255,255,255,0)", isDarkMode ? "#222" : "white"],
    extrapolate: "clamp",
  });

  const buttonBorderColor = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: ["rgba(255,255,255,0)", isDarkMode ? "#555" : "#ccc"],
    extrapolate: "clamp",
  });

  const buttonBackgroundColor = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [isDarkMode ? "#333" : "white", isDarkMode ? "#444" : "#e3e4e5"],
    extrapolate: "clamp",
  });

  useEffect(() => {
    setResponse(null);
  }, [version]);

  useEffect(() => {
    let url = `https://bible-api.deno.dev/api/read/${version}/${book}/${chapter}`;

    fetch(url)
      .then((res) => res.json())
      .then((json) => setResponse(json))
      .catch(() => setResponse({ error: "No se encontraron resultados." }));
  }, [chapter, version]);

  const bookInfo = books.find((b) => b.value === book);
  const bookName = bookInfo ? bookInfo.name : book;

  const toggleVerseSelection = (verse) => {
    setSelectedVerses((prev) => {
      const isSelected = prev.find((v) => v.id === verse.id);
      return isSelected ? prev.filter((v) => v.id !== verse.id) : [...prev, verse];
    });
  };

  // Función para compartir el versículo seleccionado
  const shareVerse = async () => {
    if (selectedVerses.length > 0) {
      const message = selectedVerses
        .map((v) => `${bookName} ${chapter}:${v.number} - ${v.verse}`)
        .join("\n\n");
      
      try {
        await Share.share({
          message: `${message}\n\nSacado de Verdad y Vida Radio App`,
        });
      } catch (error) {
        console.error("Error al compartir:", error);
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? "#000" : "rgba(230, 230, 230, 0)" }]}>
      {/* Header animado */}
      <Animated.View style={[styles.header, { backgroundColor: headerBackground }]}>
        <AnimatedTouchableOpacity 
          style={[styles.selectionButton, { borderColor: buttonBorderColor, backgroundColor: buttonBackgroundColor }]} 
          onPress={() => navigation.navigate("BookSelectionScreen")}
        >
          <Text style={[styles.selectionText, { color: isDarkMode ? "#fff" : "#000" }]}>{bookName} {chapter}</Text>
        </AnimatedTouchableOpacity>

        <AnimatedTouchableOpacity 
          style={[styles.versionButton, { borderColor: buttonBorderColor, backgroundColor: buttonBackgroundColor }]} 
          onPress={() => navigation.navigate("VersionSelectionScreen")}
        >
          <Icon name="book-outline" size={24} color={isDarkMode ? "white" : "black"} />
        </AnimatedTouchableOpacity>

        {/* Botón para cambiar de tema */}
        <TouchableOpacity 
          style={[styles.themeButton, { backgroundColor: isDarkMode ? "#444" : "#333" }]} 
          onPress={() => setIsDarkMode(!isDarkMode)}
        >
          <Icon name={isDarkMode ? "sunny-outline" : "moon-outline"} size={24} color={isDarkMode ? "yellow" : "white"} />
        </TouchableOpacity>
      </Animated.View>

      {/* Contenido desplazable */}
      <Animated.ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
          paddingTop: 70,
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {response && (
          <View style={styles.verseContainer}>
            {response.error ? (
              <Text style={{ color: isDarkMode ? "white" : "black" }}>⚠️ {response.error}</Text>
            ) : (
              <>
                <Text style={{ fontSize: 18, textAlign: "center", top: 10, fontFamily: "UntitledSerif-Bold", color: isDarkMode ? "white" : "#333"}}> {response.name}</Text>
                <Text style={[styles.titleText, { color: isDarkMode ? "white" : "#333" }]}>{response.chapter}</Text>
                <Text style={{ fontSize: 10, textAlign: "center", marginBottom: 20, color: isDarkMode ? "white" : "#333" }}> ({version})</Text>
                {Array.isArray(response.vers) ? (
                  response.vers.map((item) => (
                    
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => toggleVerseSelection(item)}
                      style={[styles.verseWrapper, selectedVerses.some((v) => v.id === item.id) && styles.selectedVerse]}
                    >
                      <Text style={[styles.verseText, { color: isDarkMode ? "white" : "#333" }]}>
                        <Text>{item.number}. </Text>
                        {item.verse}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={{ color: isDarkMode ? "white" : "black" }}>⚠️ {response.error}</Text>
                )}
              </>
            )}
          </View>
        )}
      </Animated.ScrollView>
      {/* Botón de compartir */}
      {selectedVerses.length > 0 && (
        <View style={styles.shareContainer}>
          <TouchableOpacity style={styles.shareButton} onPress={shareVerse}>
            <Icon name="share-social-outline" size={24} color="white" />
            <Text style={styles.shareText}>Compartir</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
    borderRadius: 18,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  versionButton: {
    marginLeft: 10,
    padding: 10,
    borderRadius: 8,
  },
  themeButton: {
    marginLeft: 10,
    padding: 10,
    borderRadius: 8,
  },
  selectionText: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "UntitledSerif-Bold",
  },
  verseContainer: {
    marginTop: 20,
    paddingHorizontal: 25,
  },
  titleText: {
    textAlign: "center",
    fontSize: 50,
    fontFamily: "UntitledSerif-Bold",
  },
  verseWrapper: {
    marginVertical: 0,
    padding: 6,
    borderRadius: 5,
    fontFamily: "UntitledSerif-Bold",
  },
  selectedVerse: {
    backgroundColor: "rgba(145, 145, 145, 0.2)", // Color de fondo cuando está seleccionado
  },
  verseText: {
    marginTop: 5,
    fontSize: 15,
    fontFamily: "UntitledSerif-Regular",
  },
  shareContainer: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 8,
  },
  shareText: {
    color: "white",
    marginLeft: 8,
    fontWeight: "bold",
  },
});

export default BibleReader;

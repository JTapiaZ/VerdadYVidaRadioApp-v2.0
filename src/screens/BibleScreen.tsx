import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Text, TouchableOpacity, Share, Alert, ScrollView } from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { books } from "./BookSelectionScreen";
import { useBible } from "../context/BibleContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, addDoc, query, where, onSnapshot, doc, deleteDoc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from "../context/AuthContext";
import { chaptersByBook } from "./ChapterSelectionScreen";



interface Verse {
  id: string;
  number: number;
  verse: string;
  book: string; // Hacer obligatorio
  chapter: number; // Hacer obligatorio
  isSelected?: boolean; // Añade esto para mejor manejo visual
}

const BibleReader = () => {
  const { verse, selectedVerses, setSelectedVerses, setChapter } = useBible(); // Obtener versículo del contexto
  const { version, book, chapter } = useBible();
  const { user, signOut } = useAuth();
  
  const [favoriteVerseIds, setFavoriteVerseIds] = useState<string[]>([]);
  const [response, setResponse] = useState<{
    name?: string;
    chapter?: string;
    vers?: Verse[];
    error?: string;
  } | null>(null);
  const navigation = useNavigation<{ navigate: (route: string) => void }>();
  const [isDarkMode, setIsDarkMode] = useState(false); // Estado del tema
  // const [selectedVerses, setSelectedVerses] = useState<VersesType[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Ref para el ScrollView
  const scrollViewRef = useRef<ScrollView>(null);
  // Animación para cambiar el fondo del header
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const insets = useSafeAreaInsets();
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

  // Carga los favoritos al montar el componente y cuando cambia el capítulo
useEffect(() => {
  const loadFavorites = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (!userData) return;

    const { email } = JSON.parse(userData);
    const q = query(
      collection(db, 'userFavorites'),
      where("userId", "==", email),
      where("type", "==", "verse")
      // where("data.book", "==", book),
      // where("data.chapter", "==", Number(chapter))
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ids = snapshot.docs.map(doc => doc.data().data.id);
      setFavoriteVerseIds(ids);
    });

    return unsubscribe;
  };

  loadFavorites();
}, [book, chapter]); // Recargar cuando cambia el libro o capítulo

  // Efecto para desplazar al versículo
  useEffect(() => {
    if (verse > 0 && response?.vers) {
      const verseElement = scrollViewRef.current;
      if (verseElement) {
        setTimeout(() => {
          verseElement.scrollTo({ y: verse * 40, animated: true }); // Ajusta según la altura real
        }, 300);
      }
    }
  }, [verse, response]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      let url = `https://bible-api.deno.dev/api/read/${version}/${book}/${chapter}`;
      // En tu useEffect que hace el fetch:
      fetch(url)
      .then((res) => res.json())
      .then((json) => {
        const versWithIds = json.vers
          ?.filter(v => v != null) // Elimina posibles valores null/undefined
          .map((v: Verse) => ({
            ...v,
            id: `${book}_${chapter}_${v.number}`, // ID comprobado
            number: v.number || 0 // Asegura un valor numérico
          }));
          
        setResponse({ ...json, vers: versWithIds });
        setSelectedVerses([]); // Resetear selección al cambiar de capítulo

      });
    }, 300); // Espera 300ms antes de hacer la solicitud
  
    return () => clearTimeout(timeoutId);
  }, [chapter, version]);

  const bookInfo = books.find((b) => b.value === book);
  const bookName = bookInfo ? bookInfo.name : book;

  // Reemplázala por:
  const maxChapters = chaptersByBook[book] || 1;
  

  // Funciones para cambiar capítulo
  const handlePreviousChapter = () => {
    if (chapter > 1) {
      setChapter(chapter - 1);
    }
  };
  
  const handleNextChapter = () => {
    const max = chaptersByBook[book] || 1;
    if (chapter < max) {
      setChapter(chapter + 1);
    }
  };

  // Versión CORREGIDA - BibleScreen.tsx
  const toggleVerseSelection = (verse: Verse) => {
    setSelectedVerses(prev => {
      const newSet = new Set(prev);
      const verseId = verse.id; // Usar el ID ya generado
      
      if (newSet.has(verseId)) {
        newSet.delete(verseId);
      } else {
        newSet.add(verseId);
      }
      return Array.from(newSet);
    });
  };

  // Función para compartir el versículo seleccionado
  const shareVerse = async () => {
    const selectedArray = Array.from(selectedVerses); // Convertimos a array
    if (selectedArray.length > 0) {
      const message = selectedArray
        .map((verseId) => {
          const v = response?.vers?.find((v) => v.id === verseId);
          return v ? `${bookName} ${chapter}:${v.number} - ${v.verse}` : "";
        })
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


  // Función para guardar favoritos (Versión Corregida)
  const handleAddToFavorites = async () => {
    if (isSaving || selectedVerses.length === 0) return;
    
    try {
      setIsSaving(true);
      const userData = await AsyncStorage.getItem('user');
      if (!userData) throw new Error("Usuario no autenticado");
  
      const { email } = JSON.parse(userData);
      const bookName = books.find(b => b.value === book)?.name || book;
  
      // Obtener todos los favoritos existentes del usuario
      const q = query(
        collection(db, 'userFavorites'),
        where("userId", "==", email),
        where("type", "==", "verse")
      );
      
      const querySnapshot = await getDocs(q);
      const existingFavorites = querySnapshot.docs.map(doc => doc.data().data.id);
  
      // Manejar operaciones
      await Promise.all(
        selectedVerses.map(async (verseId) => {
          // Buscar el documento existente
          const existingDoc = querySnapshot.docs.find(
            d => d.data().data.id === verseId
          );
  
          if (existingDoc) {
            // Eliminar usando el ID real del documento de Firestore
            await deleteDoc(doc(db, 'userFavorites', existingDoc.id));
          } else {
            // Crear nuevo documento
            const [bookId, chapterNumber, verseNumber] = verseId.split('_');
            const verseText = response?.vers?.find(v => v.id === verseId)?.verse;
            
            if (!verseText) {
              console.warn("Versículo no encontrado:", verseId);
              return;
            }
  
            await addDoc(collection(db, 'userFavorites'), {
              userId: email,
              type: 'verse',
              data: {
                id: verseId,
                reference: `${bookName} ${chapter}:${verseNumber}`,
                text: verseText,
                book: bookId,
                chapter: Number(chapterNumber),
                number: Number(verseNumber),
                version: version,
                createdAt: new Date()
              }
            });
          }
        })
      );
  
      Alert.alert("✅ Agregado a favoritos", "Puedes ver tus versículos favoritos en tu perfil");
      setSelectedVerses([]);
  
    } catch (error) {
      // Alert.alert("❌ Error", error.message);
      console.error("Error detallado:", error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    AsyncStorage.getItem("darkMode").then(value => {
      if (value !== null) setIsDarkMode(value === "true");
    });
  }, []);
  
  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      AsyncStorage.setItem("darkMode", (!prev).toString());
      return !prev;
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <SafeAreaView style={[styles.containerB, { backgroundColor: isDarkMode ? "#000" : "rgba(230, 230, 230, 0)" }]}>
        {/* Header animado */}
        <Animated.View style={[styles.header, { backgroundColor: headerBackground }]}>
          <AnimatedTouchableOpacity 
            style={[styles.selectionButton, { borderColor: buttonBorderColor, backgroundColor: buttonBackgroundColor }]} 
            onPress={() => navigation.navigate('Biblia', { screen: 'BookSelectionScreen'})}
          >
            <Text style={[styles.selectionText, { color: isDarkMode ? "#fff" : "#000" }]}>{bookName} {chapter}</Text>
          </AnimatedTouchableOpacity>

          <AnimatedTouchableOpacity 
            style={[styles.versionButton, { borderColor: buttonBorderColor, backgroundColor: buttonBackgroundColor }]} 
            onPress={() => navigation.navigate('Biblia', { screen: 'VersionSelectionScreen'})}
          >
            <Icon name="book-outline" size={24} color={isDarkMode ? "white" : "black"} />
          </AnimatedTouchableOpacity>

          {/* Botón para cambiar de tema */}
          <TouchableOpacity 
            style={[styles.themeButton, { backgroundColor: isDarkMode ? "#444" : "#333" }]} 
            onPress={() => toggleDarkMode()}
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
                      
                      // Modifica el renderizado de versículos para incluir el resaltado
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => toggleVerseSelection(item)}
                        style={[
                          styles.verseWrapper,
                          selectedVerses.includes(item.id) && styles.selectedVerse,
                          favoriteVerseIds.includes(item.id) && styles.favoritedVerse // Nuevo estilo
                        ]}
                      >
                        <Text style={[
                          styles.verseText, 
                          { color: isDarkMode ? "white" : "#333" },
                          favoriteVerseIds.includes(item.id) && styles.favoritedText // Nuevo estilo de texto
                        ]}>
                          <Text style={{ fontWeight: 'bold' }}>{item.number}.</Text>
                          {item.verse}
                          {selectedVerses.includes(item.id) && (
                            <Icon name="checkmark-circle" size={16} color="#4CAF50" style={{ marginLeft: 10 }}/>
                          )}
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
        {/* Botones de navegación de capítulo - MOVER AQUÍ */}
        {selectedVerses.length === 0 && (
          <View style={[styles.chapterNavigation, { bottom: insets.bottom + 20 }]}>
            <TouchableOpacity 
              style={[
                styles.chapterButton, 
                chapter === 1 && styles.disabledButton,
                { backgroundColor: isDarkMode ? '#444' : '#e3e4e5' }
              ]} 
              onPress={handlePreviousChapter}
              disabled={chapter === 1}
            >
              <Icon name="chevron-back" size={24} color={isDarkMode ? (chapter === 1 ? '#666' : 'white') : (chapter === 1 ? '#999' : '#333')} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.chapterButton, 
                chapter === maxChapters && styles.disabledButton,
                { backgroundColor: isDarkMode ? '#444' : '#e3e4e5' }
              ]} 
              onPress={handleNextChapter}
              disabled={chapter === maxChapters}
            >
              <Icon name="chevron-forward" size={24} color={isDarkMode ? (chapter === maxChapters ? '#666' : 'white') : (chapter === maxChapters ? '#999' : '#333')} />
            </TouchableOpacity>
          </View>
        )}
        {/* Botón de compartir */}
        {selectedVerses.length > 0 && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.favoriteButton, isSaving && styles.disabledButton]} 
              onPress={user? handleAddToFavorites : () => navigation.navigate('Más', { screen: 'LoginScreen'})}
              disabled={isSaving}
            >
              <Icon 
                name={isSaving ? "time-outline" : (selectedVerses.some(v => favoriteVerseIds.includes(v)) ? "trash-outline" : "heart-outline")} 
                size={24} 
                color="white" 
              />
              <Text style={styles.actionText}>
                {isSaving ? 'Guardando...' : (
                  selectedVerses.some(v => favoriteVerseIds.includes(v)) 
                    ? 'Eliminar favorito' 
                    : 'Agregar favorito'
                )}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.shareButton]} 
              onPress={shareVerse}
            >
              <Icon name="share-social-outline" size={24} color="white" />
              <Text style={styles.actionText}>Compartir</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerB: {
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
  actionsContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  favoriteButton: {
    backgroundColor: '#333',
  },
  actionText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#888',
    opacity: 0.7,
  },
  favoritedVerse: {
    backgroundColor: 'rgba(255,215,0,0.15)', // Fondo dorado suave
    borderLeftWidth: 3,
    borderLeftColor: '#FFD700', // Borde dorado
  },
  favoritedText: {
    color: '#FFD700', // Texto dorado
    fontStyle: 'italic',
  },
  chapterNavigation: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 20, // Añadir esto
    marginBottom: 50, // Ajustar posición
  },
  chapterButton: {
    padding: 12,
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
  },
  disabledButtonChapter: {
    opacity: 0.5,
  },
});

export default BibleReader;
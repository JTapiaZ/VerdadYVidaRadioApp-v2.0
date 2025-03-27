import React, {useState, useEffect, useContext} from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking, ScrollView, ActivityIndicator, Alert, StatusBar } from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { useBible } from "../context/BibleContext"; // Importamos el contexto
import { useAuth } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";

// Diccionario para traducir nombres de libros
const bookTranslations: Record<string, string> = {
  "Genesis": "Génesis",
  "Exodus": "Éxodo",
  "Leviticus": "Levítico",
  "Numbers": "Números",
  "Deuteronomy": "Deuteronomio",
  "Joshua": "Josué",
  "Judges": "Jueces",
  "Ruth": "Rut",
  "1-Samuel": "1 Samuel",
  "2-Samuel": "2 Samuel",
  "1-Kings": "1 Reyes",
  "2-Kings": "2 Reyes",
  "1-Chronicles": "1 Crónicas",
  "2-Chronicles": "2 Crónicas",
  "Ezra": "Esdras",
  "Nehemiah": "Nehemías",
  "Esther": "Ester",
  "Job": "Job",
  "Psalms": "Salmos",
  "Proverbs": "Proverbios",
  "Ecclesiastes": "Eclesiastés",
  "Song-of-Solomon": "Cantares",
  "Isaiah": "Isaías",
  "Jeremiah": "Jeremías",
  "Lamentations": "Lamentaciones",
  "Ezekiel": "Ezequiel",
  "Daniel": "Daniel",
  "Hosea": "Oseas",
  "Joel": "Joel",
  "Amos": "Amós",
  "Obadiah": "Abdías",
  "Jonah": "Jonás",
  "Micah": "Miqueas",
  "Nahum": "Nahum",
  "Habakkuk": "Habacuc",
  "Zephaniah": "Sofonías",
  "Haggai": "Hageo",
  "Zechariah": "Zacarías",
  "Malachi": "Malaquías",
  "Matthew": "Mateo",
  "Mark": "Marcos",
  "Luke": "Lucas",
  "John": "Juan",
  "Acts": "Hechos",
  "Romans": "Romanos",
  "1-Corinthians": "1 Corintios",
  "2-Corinthians": "2 Corintios",
  "Galatians": "Gálatas",
  "Ephesians": "Efesios",
  "Philippians": "Filipenses",
  "Colossians": "Colosenses",
  "1-Thessalonians": "1 Tesalonicenses",
  "2-Thessalonians": "2 Tesalonicenses",
  "1-Timothy": "1 Timoteo",
  "2-Timothy": "2 Timoteo",
  "Titus": "Tito",
  "Philemon": "Filemón",
  "Hebrews": "Hebreos",
  "James": "Santiago",
  "1-Peter": "1 Pedro",
  "2-Peter": "2 Pedro",
  "1-John": "1 Juan",
  "2-John": "2 Juan",
  "3-John": "3 Juan",
  "Jude": "Judas",
  "Revelation": "Apocalipsis"
};

const HomeScreen = () => {
  const [verse, setVerse] = useState(null);
  const [reference, setReference] = useState(null);
  const [bookDaily, setBookDaily] = useState(null);
  const [bookDailyEn, setBookDailyEn] = useState(null); // Nuevo estado para guardar el nombre del libro en inglés
  const [chapterDaily, setChapterDaily] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { user, signOut } = useAuth();

  const { book, setBook, chapter, setChapter } = useBible(); // Obtenemos el estado del contexto


  useEffect(() => {
    const fetchDailyVerse = async () => {
      try {
        const dailyVerse = await getVerseFromOurManna();

        // console.log(dailyVerse.reference);
        
        if (!dailyVerse) throw new Error("No se pudo obtener el versículo en inglés.");

        const { book: bookEn, chapter, verseNum, fullReference } = extractVerseDetails(dailyVerse.reference);
        

        setBookDailyEn(bookEn);
        // console.log(bookEn, chapter, verseNum, fullReference);
        
        
        const spanishVerse = await getVerseInSpanish(bookEn, chapter, verseNum);
        // console.log(spanishVerse);
        
        
        if (!spanishVerse) throw new Error("No se pudo obtener el versículo en español.");

        // Traducir el nombre del libro al español
        const bookEs = bookTranslations[bookEn] || bookEn;

        setVerse(spanishVerse);
        setReference(`${bookEs} ${chapter}:${verseNum}`);
        setBookDaily(bookEs);
        setChapterDaily(chapter);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyVerse();
  }, []);

  // 🔹 Obtiene el versículo diario desde OurManna
  const getVerseFromOurManna = async () => {
    const response = await fetch("https://beta.ourmanna.com/api/v1/get/?format=json&order=daily");
    const data = await response.json();
    // console.log(data.verse.details);
    return data.verse.details;
  };

  // 🔹 Extrae los detalles del versículo (libro, capítulo y versículo)
  const extractVerseDetails = (reference: string) => {
    // Expresión regular mejorada para manejar rangos y múltiples formatos
    const match = reference.match(/^(\d*\-?\s?[A-Za-z\-]+)\s(\d+):(\d+[\-\d,]*)/);
    
    if (!match) throw new Error("Formato de referencia no válido");
  
    let book = match[1].trim();
    const chapter = match[2];
    const verses = match[3];  // Ahora acepta rangos (ej: 13-14, 15, 20-25)

    // console.log(book, chapter, verses);

    if(book === "Psalm") {
      book = "Psalms";
    }
    
  
    // Normalizar el nombre del libro para la API
    if (/^\d/.test(book)) {
      book = book.replace(" ", "-");
    }
  
    // Obtener el primer versículo del rango para la llamada a la API
    // const firstVerse = verses.split(/[-,]/)[0];

    // console.log(firstVerse);
    
    
    return { 
      book, 
      chapter, 
      verseNum: verses, // Usamos solo el primer versículo para la API
      fullReference: `${book} ${chapter}:${verses}` // Mantenemos el rango original para mostrar
    };
  };

  // 🔹 Obtiene el versículo en español desde la API
  const getVerseInSpanish = async (book: string, chapter: string, verseRange: string) => {
    // console.log(verseRange);
    
    // Usar verseRange en lugar de verseNum
    const response = await fetch(
      `https://bible-api.deno.dev/api/read/rv1960/${book}/${chapter}/${verseRange}`
    );
    const data = await response.json();
    // console.log(data);
    
    if (Array.isArray(data)) {
      return data.map(v => v.verse).join(" ");
    } else if (data && data.verse) {
      return data.verse;
    } else {
      return "";
    }
  };

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
        Alert.alert('❌ Error', 'No se pudo abrir el enlace, verifica tu conexión a internet');
      }
    };


  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.headerContainer}>
        <Text style={styles.textHeader}>¡Hola, {user?.displayName || 'Usuario'}</Text>
        {/* Botón de perfil flotante */}
        <TouchableOpacity 
          style={styles.profileIcon} 
          onPress={user? () => navigation.navigate('Más', { screen: 'ProfileScreen'}) : () => navigation.navigate('Más', { screen: 'LoginScreen'})}
        >
          {user?.photoURL ? 
            <Image
              source={{ uri: user.photoURL }}
              style={styles.profileImage}
            />      
          : <Icon name="person-circle-outline" size={40} color="#333" />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Logo */}
        <Image source={require("../../assets/img/870.jpg")} style={styles.logo} />

        {/* Card de Bienvenida */}
        <View style={styles.card}>
          <Text style={styles.welcomeText}>¡Bienvenido a la App de Verdad y Vida Radio!</Text>
          <Text style={styles.subtitle}>Conéctate con la mejor música y mensajes inspiradores.</Text>


          {/* Último Devocional */}
          <TouchableOpacity style={styles.buttonSecondary} onPress={() => navigation.navigate('Devocionales', { screen: 'DevotionalScreen'})}>
            <Text style={styles.buttonText}>📖 Último Devocional</Text>
          </TouchableOpacity>
          
          {/* Botón para escuchar en vivo */}
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => {
              navigation.navigate('Radio', { screen: 'RadioScreen'});
            }}
          > 
            <Text style={styles.buttonText}>🎧 Escuchar en Vivo</Text>
          </TouchableOpacity>

          {/* Biblia */}
          <TouchableOpacity style={styles.buttonSecondary} onPress={() => navigation.navigate('Biblia', { screen: 'BibleScreen'})}> 
            <Text style={styles.buttonText}>📖 Biblia</Text>
          </TouchableOpacity>
        </View>
        
        {/* Card de Versículo Diario */}
        <View style={styles.card}>
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : verse ? (
            <>
              <Text style={styles.verseText}>📖 "{verse}"</Text>
              <Text style={styles.referenceText}>{reference}</Text>

              {/* Botón para leer el capítulo completo usando el Context */}
              <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                  if (bookDailyEn && chapterDaily) {
                    setBook(bookDailyEn);
                    setChapter(chapterDaily);
                    navigation.navigate('Biblia', { screen: 'BibleScreen'});
                  }
                }}
              >
                <Text style={styles.buttonText}>Leer capítulo completo</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.errorText}>No se pudo cargar el versículo.</Text>
          )}
        </View>

        {/* Card de Redes Sociales */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Conéctate con Nosotros</Text>
          <View style={styles.socialButtons}>
            <TouchableOpacity onPress={() => openSocialMedia(
              'fb://profile/359807460699524', // Reemplaza con tu ID de Facebook
              'https://www.facebook.com/radioverdadyvida'
            )}>
              <Text style={styles.socialText}><Icon name="logo-facebook" size={22} color="#3B5998" /> Facebook</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openSocialMedia(
              'youtube://channel/UCsCRnbf4sA7E8FpQa6FKfMg', 
              'https://www.youtube.com/@VerdadYVidaRadioOficial'
            )}>
              <Text style={styles.socialText}><Icon name="logo-youtube" size={22} color="#ff0000" /> YouTube</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    top: 20,
    alignItems: "center",
    paddingBottom: 80,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 15, // Este padding se suma a la safe area
    backgroundColor: "#fff",
  },
  textHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  profileIcon: {
    // Ya no lo posicionamos absolutamente
    padding: 2,
    marginBottom: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 50,
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 20,
    borderRadius: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    width: "90%",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "gray",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  verseText: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 5,
    color: "#333",
  },
  verseReference: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#007AFF",
  },
  button: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
    marginBottom: 10,
  },
  buttonSecondary: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  socialText: {
    fontSize: 16,
    color: "#333",
  },
  referenceText: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
    marginBottom: 15,
    color: "#333",
  },
  errorText: {
    fontSize: 14,
    color: "red",
  },
});

export default HomeScreen;
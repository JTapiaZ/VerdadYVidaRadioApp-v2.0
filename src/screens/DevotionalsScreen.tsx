import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Share, FlatList, ActivityIndicator, Alert, RefreshControl, useColorScheme, Image, TextInput } from "react-native";
import Video from "react-native-video";
import Icon from 'react-native-vector-icons/Ionicons';
import { collection, query, orderBy, onSnapshot, doc, setDoc, deleteDoc, where } from "firebase/firestore";
import { db } from "../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";

const DevotionalsScreen = ({ navigation }) => {
  const [devotionals, setDevotionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState({});
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");

  const { user, signOut } = useAuth();

  // Actualiza tu useEffect de carga de favoritos:
useEffect(() => {
  const loadFavorites = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (!userData) return;

    const { email } = JSON.parse(userData);
    
    // Consulta a Firestore
    const q = query(
      collection(db, "userFavorites"),
      where("userId", "==", email),
      where("type", "==", "devotional")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const favs = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data().data;
        favs[data.id] = true;
      });
      setFavorites(favs);
    });

    return () => unsubscribe();
  };

  loadFavorites();
}, []);

  // Manejar favoritos
  const toggleFavorite = async (devotional) => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) throw new Error("Usuario no autenticado");
  
      const { email } = JSON.parse(userData);
      const favoriteId = `${email}_devotional_${devotional.id}`; // ID compuesto único
      
      const favoriteRef = doc(db, "userFavorites", favoriteId);
  
      if (favorites[devotional.id]) {
        // Eliminar de favoritos
        await deleteDoc(favoriteRef);
        setFavorites((prev) => ({ ...prev, [devotional.id]: false }));
        Alert.alert('❤️ Devocional eliminado de favoritos');
      } else {
        // Guardar en Firestore con estructura compatible
        const favoriteData = {
          userId: email,
          type: "devotional",
          data: {
            id: devotional.id, // ID del devocional original
            title: devotional.title,
            content: devotional.content,
            videoUrl: devotional.videoUrl || null,
            createdAt: new Date(),
          },
        };
  
        await setDoc(favoriteRef, favoriteData);
        setFavorites((prev) => ({ ...prev, [devotional.id]: true }));
        Alert.alert('⭐ ¡Añadido a favoritos!');
      }
    } catch (error) {
      console.error("Error en toggleFavorite:", error);
      Alert.alert('❌ Error', 'Intenta nuevamente');
    }
  };

  // Detección de nuevo devocional
  const detectNewDevotional = async (latest) => {
    if (!latest) return;
    
    const storedId = await AsyncStorage.getItem("lastDevotionalId");
    if (storedId !== latest.id) {
      Alert.alert("¡📖 Nuevo Devocional!", `Puedes ir a ver nuestro nuevo devocional llamado: ${latest.title}`);
      await AsyncStorage.setItem("lastDevotionalId", latest.id);
    }
  };

  useEffect(() => {
    let unsubscribe: () => void;

    const setupFirestoreListener = () => {
      try {
        const q = query(collection(db, "devotionals"), orderBy("createdAt", "desc"));
        
        unsubscribe = onSnapshot(q, async (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setDevotionals(data);
          await detectNewDevotional(data[0]);
          setLoading(false);
        });

      } catch (error) {
        Alert.alert("❌ Error", "Error cargando devocionales, revisa tu conexión a internet");
        setLoading(false);
      }
    };

    setupFirestoreListener();

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Forzar una nueva verificación del último devocional
      const latest = devotionals[0];
      await detectNewDevotional(latest);
    } catch (error) {
      Alert.alert("❌ Error", "Error al actualizar, revisa tu conexión a internet");
    } finally {
      setRefreshing(false);
    }
  };

  // Filtrar devocionales por búsqueda en título o pastor
const filteredDevotionals = devotionals.filter(item => {
  const searchLower = searchText.toLowerCase();
  const titleMatch = item.title.toLowerCase().includes(searchLower);
  const pastorMatch = item.pastor ? item.pastor.toLowerCase().includes(searchLower) : false;
  return titleMatch || pastorMatch;
});

  // Render Item mejorado
  const renderItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('Devocionales', { screen: 'DevotionalDetailScreen', params: { devotionalId: item.id, devotional: item } })}
      // onPress={() => navigation.navigate('DevotionalDetailScreen', { devotionalId: item.id, devotional: item })}
    >
    <View style={styles.card}>
    {item.imageUrl && (
        <Image
          source={{ uri: item.imageUrl }}
          style={{ width: '100%', height: 200, borderTopLeftRadius: 15, borderTopRightRadius: 15 }}
        />
      )}
      {/* {item.videoUrl && (
        <Video
          source={{ uri: item.videoUrl }}
          style={styles.video}
          controls
          resizeMode="contain"
          paused={true}
        />
      )} */}
      
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.content} numberOfLines={3} ellipsizeMode="tail">{item.content}</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon name="person" size={15} color="#555" />
          <Text style={{margin: 10, color: '#333'}}>{item.pastor}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon name="calendar" size={15} color="#555" style={{marginRight: 10,}} />
          <Text style={{color: '#333'}}>{new Date(item.createdAt?.toDate()).toLocaleDateString()}</Text>
        </View>
        
        <View style={styles.actions}>
        <TouchableOpacity onPress={user? () => toggleFavorite(item) : () => navigation.navigate('Más', { screen: 'LoginScreen' })}>
          <Icon 
            name={favorites[item.id] ? "heart" : "heart-outline"}
            size={24} 
            color="#ff4757"
          />
        </TouchableOpacity>
          <TouchableOpacity onPress={() => Share.share({
            message: `${item.title}\n\n${item.content}`
          })}>
            <Icon name="share-social" size={24} color="#2f3542" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header con título y botón de búsqueda */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Nuestros Devocionales</Text>
        <TouchableOpacity onPress={() => setShowSearch(prev => !prev)} style={styles.searchButton}>
          <Icon name="search" size={24} color="#2d3436" />
        </TouchableOpacity>
      </View>
      {/* Mostrar campo de búsqueda si está activo */}
      {showSearch && (
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por título o pastor :"
          value={searchText}
          onChangeText={setSearchText}
        />
      )}
      <FlatList
        data={filteredDevotionals}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {loading ? "..." : "No hay devocionales disponibles"}
          </Text>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      />
      
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={useColorScheme==='dark'? '#fff' : "333"} />
        </View>
      )}
    </SafeAreaView>
  );
};

// Estilos (se mantienen igual)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f2f6',
    marginBottom: 60,
  },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 19,
    fontWeight: '700',
    color: '#2d3436',
  },
  searchButton: {
    padding: 5,
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 10,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    margin: 10,
  },
  video: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  cardContent: {
    padding: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2f3542',
    marginBottom: 10,
  },
  content: {
    fontSize: 16,
    color: '#57606f',
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingHorizontal: 10,
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#333',
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
});

export default DevotionalsScreen;
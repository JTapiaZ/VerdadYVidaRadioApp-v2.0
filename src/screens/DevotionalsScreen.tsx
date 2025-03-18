import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Share, FlatList, ActivityIndicator, Alert, RefreshControl } from "react-native";
import Video from "react-native-video";
import Icon from 'react-native-vector-icons/Ionicons';
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DevotionalsScreen = ({ navigation }) => {
  const [devotionals, setDevotionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState({});

  // Cargar favoritos al iniciar
  useEffect(() => {
    const loadFavorites = async () => {
      const savedFavorites = await AsyncStorage.getItem('devotionalFavorites');
      setFavorites(savedFavorites ? JSON.parse(savedFavorites) : {});
    };
    loadFavorites();
  }, []);

  // Manejar favoritos
  const toggleFavorite = async (id) => {
    const newFavorites = {...favorites, [id]: !favorites[id]};
    await AsyncStorage.setItem('devotionalFavorites', JSON.stringify(newFavorites));
    setFavorites(newFavorites);
  };

  // Detección de nuevo devocional
  const detectNewDevotional = async (latest) => {
    if (!latest) return;
    
    const storedId = await AsyncStorage.getItem("lastDevotionalId");
    if (storedId !== latest.id) {
      Alert.alert("📖 Nuevo Devocional", latest.title);
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
        Alert.alert("Error", "Error cargando devocionales");
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
      Alert.alert("Error", "Error al actualizar");
    } finally {
      setRefreshing(false);
    }
  };

  // Render Item mejorado
  const renderItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('DevotionalDetailScreen', { devotionalId: item.id })}
    >
    <View style={styles.card}>
      {item.videoUrl && (
        <Video
          source={{ uri: item.videoUrl }}
          style={styles.video}
          controls
          resizeMode="contain"
          paused={true}
        />
      )}
      
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.content}>{item.content}</Text>
        
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
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
    <View style={styles.container}>
      <FlatList
        data={devotionals}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {loading ? "Cargando..." : "No hay devocionales disponibles"}
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
          <ActivityIndicator size="large" color="#2ed573" />
        </View>
      )}
    </View>
  );
};

// Estilos (se mantienen igual)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f2f6',
    marginBottom: 60,
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
    color: '#57606f',
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
});

export default DevotionalsScreen;
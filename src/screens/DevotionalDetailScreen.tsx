import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ScrollView, 
  TouchableOpacity, 
  Share,
  Alert
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import { doc, onSnapshot, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DevotionalDetailScreen = ({ route, navigation }) => {
  const { devotionalId } = route.params;
  const [devotional, setDevotional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  // 1. Actualiza el useEffect de carga de favoritos
useEffect(() => {
  const loadFavoriteStatus = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) return;
      
      const { email } = JSON.parse(userData);
      const favoriteId = `${email}_devotional_${devotionalId}`;
      const favoriteRef = doc(db, 'userFavorites', favoriteId);

      // Escuchar cambios en tiempo real
      const unsubscribe = onSnapshot(favoriteRef, (doc) => {
        setIsFavorite(doc.exists());
      });

      return unsubscribe; // Limpiar al desmontar
    } catch (error) {
      console.error("Error checking favorite:", error);
    }
  };

  loadFavoriteStatus();
}, [devotionalId]);

  // 2. Modifica la función toggleFavorite
const toggleFavorite = async () => {
  try {
    const userData = await AsyncStorage.getItem('user');
    if (!userData) {
      Alert.alert("Error", "Debes iniciar sesión para esta acción");
      return;
    }

    const { email } = JSON.parse(userData);
    const favoriteId = `${email}_devotional_${devotionalId}`;
    const favoriteRef = doc(db, 'userFavorites', favoriteId);

    if (isFavorite) {
      // Eliminar de favoritos
      await deleteDoc(favoriteRef);
    } else {
      // Agregar a favoritos
      const devotionalData = {
        userId: email,
        type: "devotional",
        data: {
          id: devotionalId,
          title: devotional.title,
          content: devotional.content,
          videoUrl: devotional.videoUrl || null,
          createdAt: devotional.createdAt?.toDate() || new Date(),
        }
      };
      await setDoc(favoriteRef, devotionalData);
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    Alert.alert("Error", "No se pudo actualizar el favorito");
  }
};

  // Compartir devocional
  const handleShare = async () => {
    try {
      await Share.share({
        title: devotional.title,
        message: `${devotional.title}\n\n${devotional.content}\n\nCompartido desde Mi App de Devocionales`,
      });
    } catch (error) {
      console.error('Error al compartir:', error);
    }
  };

  useEffect(() => {
    const devotionalRef = doc(db, 'devotionals', devotionalId);
    
    const unsubscribe = onSnapshot(devotionalRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        setDevotional(docSnapshot.data());
      } else {
        console.log('Documento no encontrado');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [devotionalId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ed573" />
      </View>
    );
  }

  if (!devotional) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Devocional no encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
        <TouchableOpacity onPress={toggleFavorite} style={styles.iconButton}>
          <Icon 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={24} 
            color={isFavorite ? "#ff4757" : "#333"} 
          />
        </TouchableOpacity>
          
          <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
            <Icon name="share-social" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenido */}
      <ScrollView contentContainerStyle={styles.content}>
        {devotional.videoUrl && (
          <Video
            source={{ uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" }}
            style={styles.video}
            controls
            resizeMode="contain"
            paused={false}
            onError={(error) => console.log('Error video:', error)}
            bufferConfig={{
              minBufferMs: 15000,
              maxBufferMs: 50000,
              bufferForPlaybackMs: 2500,
              bufferForPlaybackAfterRebufferMs: 5000
            }}
          />  
        )}
        
        <Text style={styles.title}>{devotional.title}</Text>
        <Text style={styles.date}>{new Date(devotional.createdAt?.toDate()).toLocaleDateString()}</Text>
        
        <Text style={styles.contentText}>
          {devotional.content}
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 20,
  },
  iconButton: {
    padding: 5,
  },
  content: {
    padding: 20,
  },
  video: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 25,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 10,
    lineHeight: 34,
  },
  date: {
    fontSize: 14,
    color: '#636e72',
    marginBottom: 25,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2d3436',
    marginBottom: 30,
  },
  errorText: {
    fontSize: 18,
    color: '#ff4757',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default DevotionalDetailScreen;
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ScrollView, 
  TouchableOpacity, 
  Share,
  Alert,
  Animated,
  Image
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import { doc, onSnapshot, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const DevotionalDetailScreen = ({ route, navigation }) => {
  const { devotionalId } = route.params;
  const [devotional, setDevotional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  const { user, signOut } = useAuth();
    
  // Dentro del componente:
  const scaleValue = useRef(new Animated.Value(1)).current;

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

useEffect(() => {
  const devotionalRef = doc(db, 'devotionals', devotionalId);
  
  const unsubscribe = onSnapshot(devotionalRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      // Validar campos esenciales
      if (!data.title || !data.content) {
        console.log("Error", "Este devocional está corrupto");
        navigation.goBack();
        return;
      }
      setDevotional(data);
    } else {
      console.log("Error", "El devocional ya no existe");
      navigation.goBack();
    }
    setLoading(false);
  });

  return () => unsubscribe();
}, [devotionalId]);

  // 2. Modifica la función toggleFavorite
  const toggleFavorite = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) {
        // Alert.alert("Error", "Debes iniciar sesión para guardar favoritos");
        navigation.navigate('Más', { screen: 'LoginScreen'});
        return;
      }
  
      const { email } = JSON.parse(userData);
      const favoriteId = `${email}_devotional_${devotionalId}`;
      const favoriteRef = doc(db, 'userFavorites', favoriteId);
  
      if (isFavorite) {
        // Eliminar de favoritos
        await deleteDoc(favoriteRef);
        Alert.alert('❤️ Eliminado', 'Devocional quitado de favoritos');
      } else {
        // Agregar a favoritos
        const devotionalData = {
          userId: email,
          type: "devotional",
          data: {
            id: devotionalId,
            title: devotional.title,
            content: devotional.content,
            videoUrl: devotional.videoUrl || "",
            createdAt: devotional.createdAt?.toDate() || new Date(),
          }
        };
        
        await setDoc(favoriteRef, devotionalData);
        Alert.alert('⭐ ¡Añadido!', 'Devocional guardado en favoritos');
      }
    } catch (error) {
      console.error("Error al actualizar favorito:", error);
      Alert.alert("❌ Error", "Intenta nuevamente");
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

  const animateIcon = () => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
        <TouchableOpacity 
        style={styles.iconButton}
        onPress={() => {
          user? toggleFavorite() : navigation.navigate('Más', { screen: 'LoginScreen'});
          animateIcon();
        }}>
          <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <Icon 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorite ? "#ff4757" : "#333"} 
            />
          </Animated.View>
        </TouchableOpacity>
          
          <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
            <Icon name="share-social" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenido */}
      <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.content, { minHeight: '100%' }]}
        >
        {devotional.imageUrl && (
          <Image
            source={{ uri: devotional.imageUrl }}
            style={{ width: '100%', height: 200, borderRadius: 15, marginBottom: 20 }}
          />  
        )}

        <Text style={styles.title}>{devotional.title}</Text>
        
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon name="calendar" size={25} color="#555" style={{marginRight: 10,}} />
          <Text style={styles.date}>{new Date(devotional.createdAt?.toDate()).toLocaleDateString()}</Text>
        </View>

        
        
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon name="person" size={25} color="#555" style={{marginRight: 10,}} />
          <Text style={styles.pastor}>{devotional.pastor}</Text>
        </View>
        
        {devotional.videoUrl && (
          <Video
            source={{ uri: devotional.videoUrl }}
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
        
        <View style={styles.paragraphContainer}>
          {devotional.content
            .replace(/\\n/g, '\n') // Convierte "\n" literal en saltos de línea reales
            .split('\n')
            .filter(paragraph => paragraph.trim() !== '')
            .map((paragraph, index) => (
              <Text key={index} style={styles.paragraph}>
                {paragraph.trim()}
              </Text>
            ))
          }
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginBottom: 60,
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
    flexGrow: 1,
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
    top: 4,
    fontSize: 14,
    color: '#636e72',
    marginBottom: 10,
  },
  pastor: {
    top: 10,
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
  paragraphContainer: {
    marginBottom: 30,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2d3436',
    marginBottom: 15, // separación entre párrafos
  },
  errorText: {
    fontSize: 18,
    color: '#ff4757',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default DevotionalDetailScreen;
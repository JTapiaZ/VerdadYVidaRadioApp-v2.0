import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SectionList, 
  ActivityIndicator,
  Alert,
  Image,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBible } from '../context/BibleContext';

// Función para obtener los datos completos de los favoritos desde Firestore
interface FavoriteItem {
  id: string;
  firebaseId: string; // Añade esto
  title: string;
  reference?: string;
  content: string; 
  videoUrl?: string; 
  text?: string;
  book?: string;
  chapter?: number;
  number?: number;
  version?: string;
}

interface User {
  email?: string;
  displayName?: string;
  photoURL?: string;
}

type NavigationProps = {
  navigation: {
    replace: (route: string) => void;
    navigate: (route: string, params?: object) => void;
    goBack: () => void;
  };
};

const getFavoritesData = async (ids: string[], type: 'devotionals' | 'verses') => {
  try {
    const userData = await AsyncStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;

    const q = query(
      collection(db, 'userFavorites'),
      where("userId", "==", user?.email),
      where("type", "==", type === 'devotionals' ? 'devotional' : 'verse')
    );

    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.data.id, // ID único del contenido (ej: ID del versículo/devocional)
        ...data.data,     // Todos los campos del documento anidado
        firebaseId: doc.id, // ID del documento en Firestore (IMPORTANTE para eliminar)
        version: data.data.version || '' // Campo adicional de ejemplo (si es necesario)
      };
    });

  } catch (error) {
    console.error(`Error obteniendo ${type}:`, error);
    return [];
  }
};


const ProfileScreen = ({ navigation, route }: NavigationProps) => {
  const { setBook, setChapter, setVerse, setVersion, setSelectedVerses } = useBible();
  const [favorites, setFavorites] = useState<{
    userFavorites: FavoriteItem[];
    devotionals: FavoriteItem[];
    verses: FavoriteItem[];
  }>({
    userFavorites: [],
    devotionals: [],
    verses: []
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null); // Estado para almacenar los datos del usuario
  const [selectedCategory, setSelectedCategory] = useState<'devotionals' | 'verses' | 'userFavorites'>(route.params?.initialCategory || 'devotionals'); // Estado para la categoría seleccionada

  // Cargar favoritos y datos del usuario
  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        const user = userData ? JSON.parse(userData) : null;
    
        const q = query(
          collection(db, 'userFavorites'),
          where("userId", "==", user?.email)
        );
    
        const querySnapshot = await getDocs(q);
        
        const allFavorites = querySnapshot.docs.map(doc => ({
          id: doc.data().data.id, // ID único del contenido (no de Firestore)
          ...doc.data().data,
          firebaseId: doc.id, // Este es el ID real del documento en Firestore
          type: doc.data().type
        }));
    
        setFavorites({
          devotionals: allFavorites.filter(f => f.type === 'devotional'),
          verses: allFavorites.filter(f => f.type === 'verse'),
          userFavorites: []
        });
    
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };
  
    loadData();
  }, []);

  // Función para manejar el cierre de sesión
  const handleLogout = async () => {
    try {
      // Eliminar datos de autenticación
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');

      // Redirigir a la pantalla de inicio de sesión
      navigation.replace('Login'); // Cambia 'Login' por el nombre de tu pantalla de inicio de sesión
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
  };

  // Función para manejar la edición del perfil
  const handleEditProfile = () => {
    navigation.navigate('EditProfile'); // Cambia 'EditProfile' por el nombre de tu pantalla de edición de perfil
  };

  // Función para cambiar la categoría seleccionada
  const handleCategoryChange = (category: 'devotionals' | 'verses') => {
    setSelectedCategory(category);
  };

  const renderItem = ({ item }: { item: FavoriteItem }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => {
        if (selectedCategory === 'devotionals') {
          navigation.navigate('DevotionalDetailScreen', { 
            devotionalId: item.id,
            title: item.title,
            content: item.content
          });
        } else {
          setBook(item.book || 'genesis');
          setChapter(item.chapter || 1);
          setSelectedVerses(item.number ? [item.number] : []);
          navigation.navigate('Biblia');
        }
      }}
    >
      <Text style={styles.cardTitle}>
        {selectedCategory === 'devotionals' 
          ? item.title || 'Devocional sin título' 
          : item.reference || `${item.book} ${item.chapter}:${item.number}`}
      </Text>
      
      <Text style={styles.cardContent} numberOfLines={2}>
        {selectedCategory === 'devotionals' 
          ? item.content || 'Contenido no disponible'
          : item.text || 'Texto no disponible'}
      </Text>
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => {
          if (!item.firebaseId) { // Cambia la validación aquí
            console.error('firebaseId no está definido para este item:', item);
            return;
          }
          handleRemoveFavorite(item.firebaseId, selectedCategory); // Usa firebaseId aquí
        }}
      >
        <Icon name="trash-outline" size={18} color="#ff6b6b" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const handleRemoveFavorite = async (id: string, type: 'devotionals' | 'verses') => {
    try {
      // 1. Eliminar de Firestore
      await deleteDoc(doc(db, 'userFavorites', id)); // Elimina el documento de Firestore
      
      console.log('Intentando eliminar documento con ID:', id);
      await deleteDoc(doc(db, 'userFavorites', id));
      console.log('Documento eliminado correctamente');
  
      // 2. Actualizar estado local
      setFavorites(prev => {
        if (!prev[type]) {
          console.error(`La categoría ${type} no existe en el estado favorites`);
          return prev;
        }
  
        // Filtrar el array correspondiente
        const updatedFavorites = prev[type].filter(item => item.id !== id);
  
        // Retornar el estado actualizado
        return {
          ...prev,
          [type]: updatedFavorites
        };
      });
  
      // 3. Eliminar de AsyncStorage (opcional)
      const key = `${type}Favorites`;
      const currentFavorites = await AsyncStorage.getItem(key);
      if (currentFavorites) {
        const parsed = JSON.parse(currentFavorites);
        delete parsed[id];
        await AsyncStorage.setItem(key, JSON.stringify(parsed));
      }
  
      Alert.alert('✅ Favorito eliminado');
  
    } catch (error) {
      console.error('Error eliminando favorito:', error);
      Alert.alert('❌ Error', 'No se pudo eliminar el favorito');
    }
  };

  // Opcional: Actualiza si el parámetro cambia
  useEffect(() => {
    if (route.params?.initialCategory) {
      setSelectedCategory(route.params.initialCategory);
    }
  }, [route.params]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Mi Perfil</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Foto de perfil y nombre */}
      <View style={styles.profileSection}>
        <Image
          source={user?.photoURL ? { uri: user.photoURL } : require('../../assets/img/UserDefault.png')}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>{user?.displayName || 'Usuario'}</Text>
      </View>

      {/* Botones de editar perfil y cerrar sesión */}
      <View style={styles.iconButtonContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={handleEditProfile}>
          <Icon name="pencil-outline" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
          <Icon name="log-out-outline" size={24} color="#ff6b6b" />
        </TouchableOpacity>
      </View>

      {/* Botones de categoría */}
      <View style={styles.categoryContainer}>
        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategory === 'devotionals' && styles.selectedCategoryButton
          ]}
          onPress={() => handleCategoryChange('devotionals')}
        >
          <Text style={styles.categoryButtonText}>Devocionales</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategory === 'verses' && styles.selectedCategoryButton
          ]}
          onPress={() => handleCategoryChange('verses')}
        >
          <Text style={styles.categoryButtonText}>Versículos</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de favoritos */}
      <View style={styles.listContainer}>
        <SectionList
          sections={[
            { 
              title: selectedCategory === 'devotionals' ? 'Devocionales' : 'Versículos',
              data: selectedCategory === 'devotionals' ? favorites.devotionals : favorites.verses
            }
          ]}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Image
                source={require('../../assets/img/EmptyFavorites.png')}
                style={styles.emptyImage}
              />
              <Text style={styles.emptyText}>No tienes favoritos aún</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2d3436',
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2d3436',
  },
  iconButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#c7c7c7',
    marginHorizontal: 10,
  },
  selectedCategoryButton: {
    backgroundColor: '#333',
  },
  categoryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  listContainer: {
    flex: 1, // Asegura que el SectionList ocupe todo el espacio disponible
  },
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 30,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 14,
    color: '#636e72',
    lineHeight: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3436',
    marginTop: 20,
    marginBottom: 12,
    marginLeft: 16,
  },
  deleteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyImage: {
    width: 150,
    height: 150,
    opacity: 0.5,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#636e72',
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileScreen;

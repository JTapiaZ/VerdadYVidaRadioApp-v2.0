import React, { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, Linking, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import NetInfo from '@react-native-community/netinfo';

const InternetCheck = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    // Verificar conexión al montar el componente
    const unsubscribe = NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
      if (!state.isConnected) {
        setIsModalVisible(true);
      }
    });

    // Listener para cambios en la conexión
    const subscription = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      if (!state.isConnected && !isModalVisible) {
        setIsModalVisible(true);
      }
    });

    return () => subscription();
  }, []);

  const handleClose = async () => {
    setIsModalVisible(false);
    
    if (!isConnected) {
      try {
        // Abrir ajustes de red según plataforma
        if (Platform.OS === 'ios') {
          // iOS 15+ (funciona en simulador pero no en dispositivos reales por restricciones de Apple)
          await Linking.openURL('app-settings:');
        } else {
          // Android (funciona en la mayoría de dispositivos)
          await Linking.openURL('android.settings');
        }
      } catch (error) {
        // Fallback: Abrir ajustes generales si falla
        await Linking.openSettings();
      }
    }
  };

  return (
    <Modal
      visible={isModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Icon name="wifi-outline" size={50} color="#164b7f" />
          <Text style={styles.title}>¡Conectividad requerida!</Text>
          <Text style={styles.message}>
            Para disfrutar de una experiencia sin interrupciones, asegúrate de tener una conexión a internet activa.
          </Text>
          <Pressable 
            style={styles.button} 
            onPress={() => setIsModalVisible(false)}
            android_ripple={{ color: '#333' }}
          >
            <Text style={styles.buttonText}>Entendido</Text>
          </Pressable>
          {/* <Pressable 
            style={styles.button1} 
            onPress={handleClose}
        >
            <Text style={styles.buttonText}>Ajustes de conexión</Text>
        </Pressable> */}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    width: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  button: {
    backgroundColor: '#164b7f',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  button1: {
    top: 5,
    backgroundColor: '#164b7f',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default InternetCheck;
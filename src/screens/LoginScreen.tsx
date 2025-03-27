// src/screens/LoginScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

const LoginScreen = () => {
  const { loading, signIn } = useAuth();
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      console.log('Iniciando proceso...');
      await signIn();
      console.log('Proceso completado exitosamente');
      navigation.navigate('Inicio', { screen: 'HomeScreen'});
    } catch (error) {
      // Alert.alert('Error', error.message);
      console.log('Error capturado en UI:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Image 
        source={require('../../assets/img/870.jpg')} // Asegúrate de tener este archivo
        style={styles.logo}
        resizeMode="contain"
      />
      
      <Text style={styles.title}>Verdad y Vida Radio</Text>
      <Text style={styles.subtitle}>Conecta con tu espiritualidad</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#EA4335" />
      ) : (
        <GoogleSigninButton
          style={styles.customGoogleButton}
          size={GoogleSigninButton.Size.Wide}
          onPress={() => {
            handleLogin();
          }}
          disabled={loading}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#F8F9FA',
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 30,
    borderRadius: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 40,
    textAlign: 'center',
  },
  customGoogleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 280,
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 20,
  },
  googleIcon: {
    marginRight: 15,
  },
  buttonText: {
    color: '#2D3748',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LoginScreen;
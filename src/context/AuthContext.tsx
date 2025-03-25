import React, { createContext, useContext, useEffect, useState } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);

  GoogleSignin.configure({
    webClientId: '923461091261-hmvlvn6tpddgm1ca38kv28qro4b9hmjn.apps.googleusercontent.com',
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    offlineAccess: true,
    hostedDomain: '',
    forceCodeForRefreshToken: false,
    accountName: '',
    iosClientId: '<FROM DEVELOPER CONSOLE>',
    googleServicePlistPath: '',
    openIdRealm: '',
    profileImageSize: 120,
  });

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return subscriber;
  }, []);

  const signIn = async () => {
    try {
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
          resolveOnCancel: false,
        });
      }
      
      const userInfo = await GoogleSignin.signIn();
      // Se espera que userInfo contenga al menos el idToken para Firebase Auth
      if (!userInfo.idToken) {
        throw new Error('No se recibió idToken de Google Sign-In');
      }

      AsyncStorage.setItem('user', JSON.stringify({
            email: userInfo.user.email,
            displayName: `${userInfo.user.givenName} ${userInfo.user.familyName}`,
            photoURL: userInfo.user.photo,
          }));
      
      // Crear credencial de Firebase con el token recibido de Google
      const googleCredential = auth.GoogleAuthProvider.credential(userInfo.idToken);
      await auth().signInWithCredential(googleCredential);
      
      // Opcional: actualizar el estado local si lo deseas (aunque Firebase Auth onAuthStateChanged lo actualiza)
      // setUser(auth().currentUser);
      
    } catch (error: any) {
      // Manejo de errores basado en error.code
      if (error.code === statusCodes.IN_PROGRESS) {
        // Operación en progreso
        Alert.alert('Inicio de sesión en progreso');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // Play Services no disponibles o desactualizados
        Alert.alert('Play Services no están disponibles o están desactualizados');
      } else {
        console.error('Error en signIn:', error);
        // Alert.alert('Error durante el inicio de sesión', error.message);
      }
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      await auth().signOut();
      // Opcional: actualizar el estado local
      setUser(null);
    } catch (error) {
      console.error('Error en signOut:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

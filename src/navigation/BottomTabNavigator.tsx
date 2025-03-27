import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer, CommonActions } from "@react-navigation/native";
import { View, Text } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useSafeAreaInsets } from 'react-native-safe-area-context';


//Screens
import HomeStack from "../navigation/HomeNavigation";
import RadioStack from "../navigation/RadioNavigation";
import BibleStack from "./BibleNavigation";
import DevotionalStack from "./DevotionalNavigation";
import MoreStack from "../navigation/MoreNavigation";
// import { AuthProvider } from '../context/AuthContext';
// import LoginScreen from "../screens/LoginScreen";

// Definimos los tipos de las rutas
type RootTabParamList = {
  Inicio: undefined;
  Radio: undefined;
  Devocionales: undefined;
  Biblia: undefined;
  Más: undefined;
};

// Creamos el Tab Navigator
const Tab = createBottomTabNavigator<RootTabParamList>();

// Configuración del Navigator con iconos
const BottomTabNavigator = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={
        ({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: string = "home-outline";

          if (route.name === "Inicio") iconName = "home-outline";
          else if (route.name === "Radio") iconName = "radio-outline";
          else if (route.name === "Devocionales") iconName = "videocam-outline";
          else if (route.name === "Biblia") iconName = "book-outline";
          else if (route.name === "Más") iconName = "menu-outline";

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#333",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
            position: "absolute",
            elevation: 30,
            shadowOpacity: 0.1,
            zIndex: 30,
          backgroundColor: "#fff",
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
          height: 60 + insets.bottom, // Ajuste dinámico
          paddingBottom: 5,
        },
      })}
    >
      <Tab.Screen 
        name="Inicio" 
        component={HomeStack}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Obtener el estado actual del navegador de tabs
            const state = navigation.getState();
            if (state) {
              const currentRoute = state.routes[state.index];
              // Verificar si ya estamos en la pestaña Inicio
              if (currentRoute.name === 'Inicio') {
                // Reiniciar el stack interno de HomeStack
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [
                      {
                        name: 'Inicio',
                        state: {
                          index: 0,
                          routes: [{ name: 'HomeScreen' }] // Nombre de la ruta inicial del stack
                        }
                      }
                    ]
                  })
                );
                e.preventDefault(); // Evitar el comportamiento por defecto
              }
            }
          }
        })}
      />
      <Tab.Screen 
        name="Radio" 
        component={RadioStack} // Usa el stack en lugar de la pantalla
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            const state = navigation.getState();
            if (state?.routes[state.index].name === 'Radio') {
              navigation.dispatch({
                ...CommonActions.reset({
                  index: 0,
                  routes: [{ 
                    name: 'Radio',
                    state: {
                      routes: [{ name: 'RadioScreen' }],
                      index: 0
                    }
                  }]
                })
              });
              e.preventDefault();
            }
          }
        })}
      />
      <Tab.Screen 
        name="Devocionales" 
        component={DevotionalStack} // Usa el stack en lugar de la pantalla
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            const state = navigation.getState();
            if (state?.routes[state.index].name === 'Devocionales') {
              navigation.dispatch({
                ...CommonActions.reset({
                  index: 0,
                  routes: [{ 
                    name: 'Devocionales',
                    state: {
                      routes: [{ name: 'DevotionalScreen' }],
                      index: 0
                    }
                  }]
                })
              });
              e.preventDefault();
            }
          }
        })}
      />
      <Tab.Screen 
        name="Biblia" 
        component={BibleStack}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            const state = navigation.getState();
            if (state?.routes[state.index].name === 'Biblia') {
              navigation.dispatch({
                ...CommonActions.reset({
                  index: 0,
                  routes: [{ 
                    name: 'Biblia',
                    state: {
                      routes: [{ name: 'Biblia' }], // Pantalla inicial del stack
                      index: 0
                    }
                  }]
                })
              });
              e.preventDefault();
            }
          }
        })}
      />
      <Tab.Screen 
        name="Más" 
        component={MoreStack}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            const state = navigation.getState();
            if (state?.routes[state.index].name === 'Más') {
              navigation.dispatch({
                ...CommonActions.reset({
                  index: 0,
                  routes: [{ 
                    name: 'Más',
                    state: {
                      routes: [{ name: 'Más' }],
                      index: 0
                    }
                  }]
                })
              });
              e.preventDefault();
            }
          }
        })}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
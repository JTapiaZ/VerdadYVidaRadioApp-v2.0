import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { View, Text } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

//Screens
import HomeStack from "../navigation/HomeNavigation";
import RadioScreen from "../screens/RadioScreen";
import BibleStack from "./BibleNavigation";
import DevotionalStack from "./DevotionalNavigation";
import MoreStack from "../navigation/MoreNavigation";

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
            elevation: 5,
            shadowOpacity: 0.1,
            zIndex: 10,
          backgroundColor: "#fff",
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
          height: 60,
          paddingBottom: 5,
        },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeStack} />
      <Tab.Screen name="Radio" component={RadioScreen} />
      <Tab.Screen name="Devocionales" component={DevotionalStack} />
      <Tab.Screen name="Biblia" component={BibleStack} />
      <Tab.Screen name="Más" component={MoreStack} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;

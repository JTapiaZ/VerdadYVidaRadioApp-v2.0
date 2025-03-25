import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import DevotionalDetailScreen from "../screens/DevotionalDetailScreen";
import RadioScreen from "../screens/RadioScreen";
import BibleScreen from "../screens/BibleScreen";
import LoginScreen from "../screens/LoginScreen";
import DevotionalsScreen from "../screens/DevotionalsScreen";

const Stack = createStackNavigator();

const DevotionalStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="Radio" component={RadioScreen} />
      <Stack.Screen name="Biblia" component={BibleScreen} />
      <Stack.Screen name="DevotionalScreen" component={DevotionalsScreen} />
      <Stack.Screen name="DevotionalDetailScreen" component={DevotionalDetailScreen} />
    </Stack.Navigator>
  );
};

export default DevotionalStack;

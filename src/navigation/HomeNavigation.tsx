import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import DevotionalDetailScreen from "../screens/DevotionalDetailScreen";
import BibleScreen from "../screens/BibleScreen";
import LoginScreen from "../screens/LoginScreen";
import DevotionalsScreen from "../screens/DevotionalsScreen";

const Stack = createStackNavigator();

const DevotionalStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
    </Stack.Navigator>
  );
};

export default DevotionalStack;
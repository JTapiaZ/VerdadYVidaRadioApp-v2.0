import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import DevotionalDetailScreen from "../screens/DevotionalDetailScreen";
import RadioScreen from "../screens/RadioScreen";
import BibleStack from "../navigation/BibleNavigation";

const Stack = createStackNavigator();

const DevotionalStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="Radio" component={RadioScreen} />
      <Stack.Screen name="Biblia" component={BibleStack} />
      <Stack.Screen name="DevotionalDetailScreen" component={DevotionalDetailScreen} />
    </Stack.Navigator>
  );
};

export default DevotionalStack;

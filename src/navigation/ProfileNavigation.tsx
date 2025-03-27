import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ProfileScreen from "../screens/ProfileScreen";
import BibleScreen from "../screens/BibleScreen";
import DevotionalDetailScreen from "../screens/DevotionalDetailScreen";

const Stack = createStackNavigator();

const DevotionalStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

export default DevotionalStack;
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import MoreScreen from "../screens/MoreScreen";
import ProfileScreen from "../screens/ProfileScreen";
import DevotionalDetailScreen from "../screens/DevotionalDetailScreen";

const Stack = createStackNavigator();

const DevotionalStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Más" component={MoreScreen} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="DevotionalDetailScreen" component={DevotionalDetailScreen} />
    </Stack.Navigator>
  );
};

export default DevotionalStack;

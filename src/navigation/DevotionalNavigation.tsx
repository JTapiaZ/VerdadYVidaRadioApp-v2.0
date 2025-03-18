import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import DevotionalScreen from "../screens/DevotionalsScreen";
import DevotionalDetailScreen from "../screens/DevotionalDetailScreen";

const Stack = createStackNavigator();

const DevotionalStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DevotionalScreen" component={DevotionalScreen} />
      <Stack.Screen name="DevotionalDetailScreen" component={DevotionalDetailScreen} />
    </Stack.Navigator>
  );
};

export default DevotionalStack;

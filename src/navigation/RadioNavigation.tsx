// navigation/RadioNavigation.js
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import RadioScreen from "../screens/RadioScreen";

const Stack = createStackNavigator();

const RadioStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="RadioScreen" component={RadioScreen} />
  </Stack.Navigator>
);

export default RadioStack;
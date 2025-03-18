import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import BibleScreen from "../screens/BibleScreen";
import BookSelectionScreen from "../screens/BookSelectionScreen";
import ChapterSelectionScreen from "../screens/ChapterSelectionScreen";
import VersionSelectionScreen from "../screens/VersionSelectionScreen";

import ProfileScreen from "../screens/ProfileScreen";
import DevotionalDetail from "../screens/DevotionalDetailScreen";

const Stack = createStackNavigator();

const BibleStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Biblia" component={BibleScreen} />
      <Stack.Screen name="BookSelectionScreen" component={BookSelectionScreen} />
      <Stack.Screen name="ChapterSelectionScreen" component={ChapterSelectionScreen} />
      <Stack.Screen name="VersionSelectionScreen" component={VersionSelectionScreen} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="DevotionalDetailScreen" component={DevotionalDetail} />
    </Stack.Navigator>
  );
};

export default BibleStack;

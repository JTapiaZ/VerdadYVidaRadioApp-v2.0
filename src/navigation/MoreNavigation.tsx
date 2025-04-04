import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import MoreScreen from "../screens/MoreScreen";
import ProfileScreen from "../screens/ProfileScreen";
import PodcastScreen from "../screens/PodcastScreen";
import PreachingScreen from "../screens/PreachingScreen";
import DonationScreen from "../screens/DonationScreen";
import SiteInformationScreen from "../screens/SiteInformationScreen";
import LoginScreen from "../screens/LoginScreen";


const Stack = createStackNavigator();

const DevotionalStack = () => {

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MoreScreen" component={MoreScreen}  />
      <Stack.Screen name="LoginScreen" component={LoginScreen}  />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="PodcastScreen" component={PodcastScreen} />
      <Stack.Screen name="Predicaciones" component={PreachingScreen} />
      <Stack.Screen name="DonationScreen" component={DonationScreen} />
      <Stack.Screen name="SiteInformationScreen" component={SiteInformationScreen} />
    </Stack.Navigator>
  );
};

export default DevotionalStack;
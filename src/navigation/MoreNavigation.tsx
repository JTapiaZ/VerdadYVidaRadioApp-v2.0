import React, {useCallback, useRef} from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import MoreScreen from "../screens/MoreScreen";
import ProfileScreen from "../screens/ProfileScreen";
import DevotionalsScreen from "../screens/DevotionalsScreen";
import DevotionalDetailScreen from "../screens/DevotionalDetailScreen";
import PreachingScreen from "../screens/PreachingScreen";
import DonationScreen from "../screens/DonationScreen";
import SiteInformationScreen from "../screens/SiteInformationScreen";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";

const Stack = createStackNavigator();

const DevotionalStack = () => {
  const navigation = useNavigation();
  const isInitialMount = useRef(true); // Bandera para primer montaje

  useFocusEffect(
    useCallback(() => {
      if (!isInitialMount.current) {
        // Solo ejecuta en enfoques posteriores, no en el inicial
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'MoreMain' }],
          })
        );
      }
      isInitialMount.current = false;

      return () => {
        isInitialMount.current = true; // Reset al desmontar
      };
    }, [navigation])
  );

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Más" component={MoreScreen}  />
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen}  />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="DevotionalsScreen" component={DevotionalsScreen} />
      <Stack.Screen name="DevotionalDetailScreen" component={DevotionalDetailScreen} />
      <Stack.Screen name="Predicaciones" component={PreachingScreen} />
      <Stack.Screen name="DonationScreen" component={DonationScreen} />
      <Stack.Screen name="SiteInformationScreen" component={SiteInformationScreen} />
    </Stack.Navigator>
  );
};

export default DevotionalStack;

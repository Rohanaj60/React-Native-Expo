import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MainScreen from '../screens/MainScreen';  // Import Main Screen

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);  // Modify login state as per need

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isLoggedIn ? "Main" : "Home"}  // Set initial route based on isLoggedIn state
        screenOptions={{
          headerShown: false, // Hide header for all screens
          cardStyle: { backgroundColor: '#fff' }, // Set background color for all screens
        }}
      >
        {/* Conditional Screens */}
        {isLoggedIn ? (
          <Stack.Screen 
            name="Main" 
            component={MainScreen} 
            options={{ headerShown: false }} // Hide header for MainScreen
          />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

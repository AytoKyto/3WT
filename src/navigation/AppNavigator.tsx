import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';
import useStreamingStore from '../store/useStreamingStore';

// Import des écrans (à créer)
import OnboardingScreen from '../screens/OnboardingScreen';
import SwipeScreen from '../screens/SwipeScreen';
import SuggestionScreen from '../screens/SuggestionScreen';
import WatchlistScreen from '../screens/WatchlistScreen';
import SearchScreen from '../screens/SearchScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Swipe: undefined;
  Suggestion: undefined;
  Watchlist: undefined;
  Search: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const TabIcon = ({ label, focused }: { label: string; focused: boolean }) => {
  const icons: { [key: string]: string } = {
    Swipe: '👆',
    Suggestion: '🎲',
    Watchlist: '📚',
    Search: '🔍',
  };
  
  const labels: { [key: string]: string } = {
    Swipe: 'Swipe',
    Suggestion: 'Suggérer',
    Watchlist: 'Ma Liste',
    Search: 'Chercher',
  };

  return (
    <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      <Text style={styles.tabIconEmoji}>{icons[label]}</Text>
      <Text 
        style={[styles.tabLabel, focused && styles.tabLabelFocused]}
        numberOfLines={1}
      >
        {labels[label] || label}
      </Text>
    </View>
  );
};

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon label={route.name} focused={focused} />
        ),
      })}
    >
      <Tab.Screen name="Swipe" component={SwipeScreen} />
      <Tab.Screen name="Suggestion" component={SuggestionScreen} />
      <Tab.Screen name="Watchlist" component={WatchlistScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const hasCompletedOnboarding = useStreamingStore(
    (state) => state.hasCompletedOnboarding
  );

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasCompletedOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    height: 78,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xs,
    width: 70,
  },
  tabIconFocused: {
    transform: [{ scale: 1.05 }],
  },
  tabIconEmoji: {
    fontSize: 24,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    width: 65,
  },
  tabLabelFocused: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
});

export default AppNavigator;
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { theme } from '../styles/theme';
import useStreamingStore from '../store/useStreamingStore';
import { Movie } from '../types/movie';
import { TVShow } from '../types/tv';
import { MediaType } from '../components/MediaTypeToggle';
import AnimatedTouchable from '../components/AnimatedTouchable';

import OnboardingScreen from '../screens/OnboardingScreen';
import SwipeScreen from '../screens/SwipeScreen';
import SuggestionScreen from '../screens/SuggestionScreen';
import WatchlistScreen from '../screens/WatchlistScreen';
import SearchScreen from '../screens/SearchScreen';
import MovieDetailScreen from '../screens/MovieDetailScreen';
import SeriesDetailScreen from '../screens/SeriesDetailScreen';
import DuelScreen from '../screens/DuelScreen';
import { SwipeIcon, DiceIcon, ListIcon, SearchIcon } from '../components/TabIcons';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  MovieDetail: { movie: Movie };
  SeriesDetail: { show: TVShow };
  Duel: { mediaType?: MediaType } | undefined;
};

export type MainTabParamList = {
  Swipe: undefined;
  Suggestion: { mediaType?: MediaType } | undefined;
  Watchlist: undefined;
  Search: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: { [key: string]: React.FC<{ color: string; size?: number }> } = {
  Swipe: SwipeIcon,
  Suggestion: DiceIcon,
  Watchlist: ListIcon,
  Search: SearchIcon,
};

interface TabBarItemProps {
  focused: boolean;
  isLast: boolean;
  onPress: () => void;
  Icon?: React.FC<{ color: string; size?: number }>;
}

// Petit bump du picto quand l'onglet devient actif — feedback discret
// qui vient s'ajouter au fond jaune plat déjà en place.
const TabBarItem: React.FC<TabBarItemProps> = ({ focused, isLast, onPress, Icon }) => {
  const color = focused ? theme.colors.ink : theme.colors.textFaint;

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(focused ? 1.12 : 1, theme.animation.easing.springGentle) }],
  }), [focused]);

  return (
    <AnimatedTouchable
      onPress={onPress}
      style={[
        styles.tabItem,
        !isLast && styles.tabItemBorder,
        focused && styles.tabItemFocused,
      ]}
    >
      <Animated.View style={iconStyle}>
        {Icon && <Icon color={color} size={22} />}
      </Animated.View>
    </AnimatedTouchable>
  );
};

// Tab bar 100% custom — react-navigation impose des marges internes sur
// tabBarIcon/tabBarItemStyle qu'on ne peut pas entièrement neutraliser,
// donc on reprend la main sur tout le layout du bouton.
const CustomTabBar = ({ state, navigation }: BottomTabBarProps) => {
  return (
    <SafeAreaView style={styles.tabBarSafeArea} edges={['bottom']}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => (
          <TabBarItem
            key={route.key}
            focused={state.index === index}
            isLast={index === state.routes.length - 1}
            onPress={() => navigation.navigate(route.name)}
            Icon={TAB_ICONS[route.name]}
          />
        ))}
      </View>
    </SafeAreaView>
  );
};

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
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
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="MovieDetail"
              component={MovieDetailScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="SeriesDetail"
              component={SeriesDetailScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen name="Duel" component={DuelScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBarSafeArea: {
    backgroundColor: theme.colors.ink,
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: theme.colors.ink,
    borderTopWidth: theme.borders.thick,
    borderTopColor: theme.colors.ink,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemBorder: {
    borderRightWidth: theme.borders.medium,
    borderRightColor: '#2a2a2a',
  },
  tabItemFocused: {
    backgroundColor: theme.colors.yellow,
  },
});

export default AppNavigator;

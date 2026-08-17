import React from 'react';
import { View, StyleSheet } from 'react-native';

interface IconProps {
  color: string;
  size?: number;
}

// Deux cartes empilées, décalées — évoque le swipe
export const SwipeIcon: React.FC<IconProps> = ({ color, size = 20 }) => (
  <View style={{ width: size, height: size }}>
    <View
      style={[
        styles.swipeBack,
        { borderColor: color, width: size * 0.62, height: size * 0.78 },
      ]}
    />
    <View
      style={[
        styles.swipeFront,
        { borderColor: color, width: size * 0.62, height: size * 0.78 },
      ]}
    />
  </View>
);

// Dé à 5 (tirage au sort)
export const DiceIcon: React.FC<IconProps> = ({ color, size = 20 }) => {
  const dot = Math.max(size * 0.13, 2);
  return (
    <View style={[styles.diceBox, { borderColor: color, width: size, height: size }]}>
      <View style={styles.diceRow}>
        <View style={[styles.dot, { backgroundColor: color, width: dot, height: dot }]} />
        <View style={{ width: dot }} />
        <View style={[styles.dot, { backgroundColor: color, width: dot, height: dot }]} />
      </View>
      <View style={styles.diceRow}>
        <View style={{ width: dot }} />
        <View style={[styles.dot, { backgroundColor: color, width: dot, height: dot }]} />
        <View style={{ width: dot }} />
      </View>
      <View style={styles.diceRow}>
        <View style={[styles.dot, { backgroundColor: color, width: dot, height: dot }]} />
        <View style={{ width: dot }} />
        <View style={[styles.dot, { backgroundColor: color, width: dot, height: dot }]} />
      </View>
    </View>
  );
};

// Trois lignes empilées — la liste
export const ListIcon: React.FC<IconProps> = ({ color, size = 20 }) => {
  const barHeight = Math.max(size * 0.14, 2);
  return (
    <View style={{ width: size, height: size, justifyContent: 'space-between', paddingVertical: size * 0.1 }}>
      <View style={{ backgroundColor: color, height: barHeight, width: size }} />
      <View style={{ backgroundColor: color, height: barHeight, width: size * 0.75 }} />
      <View style={{ backgroundColor: color, height: barHeight, width: size }} />
    </View>
  );
};

// Loupe carrée — cohérente avec le "zéro arrondi" du système
export const SearchIcon: React.FC<IconProps> = ({ color, size = 20 }) => (
  <View style={{ width: size, height: size }}>
    <View
      style={[
        styles.searchLens,
        { borderColor: color, width: size * 0.62, height: size * 0.62 },
      ]}
    />
    <View
      style={[
        styles.searchHandle,
        {
          backgroundColor: color,
          width: size * 0.42,
          height: Math.max(size * 0.13, 2),
        },
      ]}
    />
  </View>
);

const styles = StyleSheet.create({
  swipeBack: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderWidth: 2,
  },
  swipeFront: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    borderWidth: 2,
  },
  diceBox: {
    borderWidth: 2,
    justifyContent: 'space-between',
    padding: 2,
  },
  diceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dot: {},
  searchLens: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderWidth: 2,
  },
  searchHandle: {
    position: 'absolute',
    bottom: 1,
    right: 0,
    transform: [{ rotate: '45deg' }],
  },
});

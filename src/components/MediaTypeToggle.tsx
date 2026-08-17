import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../styles/theme';
import AnimatedTouchable from './AnimatedTouchable';

export type MediaType = 'movie' | 'tv';

interface MediaTypeToggleProps {
  value: MediaType;
  onChange: (value: MediaType) => void;
  style?: ViewStyle;
}

// Petit sélecteur Films/Séries réutilisé partout où l'app doit basculer
// entre les deux catalogues (listes, tirage au sort, duel séparés).
const MediaTypeToggle: React.FC<MediaTypeToggleProps> = ({ value, onChange, style }) => {
  return (
    <View style={[styles.row, style]}>
      <AnimatedTouchable
        style={[styles.cell, styles.cellBorder, value === 'movie' && styles.cellActive]}
        onPress={() => onChange('movie')}
      >
        <Text style={[styles.text, value === 'movie' && styles.textActive]}>FILMS</Text>
      </AnimatedTouchable>
      <AnimatedTouchable
        style={[styles.cell, value === 'tv' && styles.cellActive]}
        onPress={() => onChange('tv')}
      >
        <Text style={[styles.text, value === 'tv' && styles.textActive]}>SÉRIES</Text>
      </AnimatedTouchable>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderWidth: theme.borders.thick,
    borderColor: theme.colors.ink,
  },
  cell: {
    flex: 1,
    paddingVertical: theme.spacing.sm + 2,
    alignItems: 'center',
    backgroundColor: theme.colors.paper,
  },
  cellBorder: {
    borderRightWidth: theme.borders.medium,
    borderRightColor: theme.colors.ink,
  },
  cellActive: {
    backgroundColor: theme.colors.ink,
  },
  text: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
    color: theme.colors.ink,
    letterSpacing: theme.typography.letterSpacing.mono,
  },
  textActive: {
    color: theme.colors.yellow,
  },
});

export default MediaTypeToggle;

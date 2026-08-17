import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../styles/theme';

type LogoVariant = 'block' | 'horizontal';
type LogoColorway = 'principale' | 'inversee' | 'papier' | 'mono';

interface LogoProps {
  variant?: LogoVariant;
  colorway?: LogoColorway;
  size?: number;
  style?: ViewStyle;
}

const COLORWAYS: Record<LogoColorway, { bg: string; fg: string; dot: string }> = {
  principale: { bg: theme.colors.ink, fg: theme.colors.yellow, dot: theme.colors.paper },
  inversee: { bg: theme.colors.yellow, fg: theme.colors.ink, dot: theme.colors.ink },
  papier: { bg: theme.colors.paper, fg: theme.colors.ink, dot: theme.colors.ink },
  mono: { bg: theme.colors.ink, fg: theme.colors.paper, dot: theme.colors.paper },
};

// "Le Bloc" — 3W / T· en Archivo Black, interlettrage -0.07em, interligne 0.76.
// Sous 40px le sigle tombe à "3" seul (règle de réduction du système).
const Logo: React.FC<LogoProps> = ({
  variant = 'block',
  colorway = 'principale',
  size = 96,
  style,
}) => {
  const c = COLORWAYS[colorway];
  const isTiny = size < 40;

  if (variant === 'horizontal') {
    const mark = isTiny ? '3' : '3WT';
    const fontSize = size;
    return (
      <View
        style={[
          styles.horizontalBlock,
          { backgroundColor: c.bg, paddingHorizontal: size * 0.24, paddingVertical: size * 0.16 },
          style,
        ]}
      >
        <Text
          style={{
            fontFamily: theme.typography.fontFamily.display,
            fontWeight: theme.typography.fontWeight.black,
            fontSize,
            lineHeight: fontSize * 0.8,
            letterSpacing: fontSize * -0.06,
            color: c.fg,
          }}
        >
          {mark}
        </Text>
      </View>
    );
  }

  if (isTiny) {
    return (
      <View
        style={[
          styles.tinyBlock,
          { width: size, height: size, backgroundColor: c.bg },
          style,
        ]}
      >
        <Text
          style={{
            fontFamily: theme.typography.fontFamily.display,
            fontWeight: theme.typography.fontWeight.black,
            fontSize: size * 0.58,
            color: c.fg,
          }}
        >
          3
        </Text>
      </View>
    );
  }

  const margin = size / 6;
  const fontSize = (size - margin * 2) / 1.52;

  return (
    <View
      style={[
        styles.block,
        { width: size, height: size, backgroundColor: c.bg, padding: margin },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: theme.typography.fontFamily.display,
          fontWeight: theme.typography.fontWeight.black,
          fontSize,
          lineHeight: fontSize * 0.76,
          letterSpacing: fontSize * -0.07,
          color: c.fg,
        }}
      >
        3W{'\n'}T<Text style={{ color: c.dot }}>·</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  block: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  tinyBlock: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalBlock: {
    alignSelf: 'flex-start',
  },
});

export default Logo;

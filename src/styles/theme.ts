import { Platform } from 'react-native';

// Carton-pâte — brutalist redesign
// Noir, papier, jaune acide. Zéro arrondi, filets épais, tout en majuscules.
export const theme = {
  colors: {
    // Palette Carton-pâte
    ink: '#141414',
    yellow: '#E8FF00',
    paper: '#F2F0EA',
    paperAlt: '#EDEBE4',
    white: '#FFFFFF',
    textMuted: '#57534b',
    textFaint: '#8a8579',
    placeholderA: '#dcd8ce',
    placeholderB: '#cfcabd',

    // Alias conservés pour compatibilité — tous repointés vers la palette brutaliste
    primary: '#141414',
    secondary: '#E8FF00',
    accent: '#E8FF00',

    background: '#F2F0EA',
    card: '#FFFFFF',
    surface: '#F2F0EA',

    text: '#141414',
    textSecondary: '#57534b',
    textTertiary: '#8a8579',

    success: '#E8FF00',
    warning: '#E8FF00',
    error: '#141414',
    info: '#141414',

    white2: '#FFFFFF',
    black: '#141414',

    border: '#141414',
    borderLight: '#141414',
  },

  typography: {
    fontFamily: {
      // Substituts système pour Archivo Black / JetBrains Mono (pas de police custom liée nativement)
      display: Platform.select({ ios: 'Arial Black', android: 'sans-serif-black', default: 'System' }),
      regular: 'System',
      medium: 'System',
      semiBold: 'System',
      bold: 'System',
      mono: Platform.select({ ios: 'Courier New', android: 'monospace', default: 'monospace' }),
    },
    fontSize: {
      xs: 11,
      sm: 13,
      md: 15,
      lg: 17,
      xl: 20,
      xxl: 24,
      xxxl: 32,
      display: 40,
    },
    fontWeight: {
      regular: '400' as const,
      medium: '500' as const,
      semiBold: '600' as const,
      bold: '700' as const,
      extraBold: '800' as const,
      black: '900' as const,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
    letterSpacing: {
      tight: -0.5,
      normal: 0,
      wide: 0.3,
      wider: 0.5,
      mono: 1,
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },

  // Zéro arrondi — c'est le principe du système Carton-pâte
  borderRadius: {
    sm: 0,
    md: 0,
    lg: 0,
    xl: 0,
    xxl: 0,
    full: 0,
  },

  // Filets épais, caractéristiques du système
  borders: {
    hairline: 1,
    thin: 2,
    medium: 2,
    thick: 3,
  },

  // Décalage du "hard shadow" brutaliste (bloc plein, pas de flou)
  hardShadow: {
    offset: 8,
    offsetSmall: 5,
  },

  // Animation values
  animation: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 400,
    },
    easing: {
      spring: {
        damping: 20,
        mass: 1,
        stiffness: 180,
      },
      springGentle: {
        damping: 25,
        mass: 1,
        stiffness: 120,
      },
    },
  },

  // Opacity values
  opacity: {
    disabled: 0.4,
    subtle: 0.6,
    medium: 0.8,
  },
};

export type Theme = typeof theme;

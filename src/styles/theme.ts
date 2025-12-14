// Flat Design Pastel Zen Theme
export const theme = {
  colors: {
    // Palette Pastel Froid
    primary: '#a7d5e2',        // Bleu ciel pastel
    secondary: '#abe2cd',      // Menthe pastel
    accent: '#bea4ec',         // Lilas pastel

    // Backgrounds
    background: '#dbecee',     // Blanc cassé très léger
    card: '#FFFFFF',           // Blanc pur
    surface: '#FAFCFD',        // Surface légèrement teintée

    // Text
    text: '#4A5568',           // Gris foncé doux
    textSecondary: '#8B9DC3',  // Bleu-gris pastel
    textTertiary: '#B8C5D6',   // Gris très clair

    // Status
    success: '#B8E6D5',        // Menthe
    warning: '#FFE4CC',        // Pêche très pâle
    error: '#FFD4D4',          // Rose très pâle
    info: '#A8D5E2',           // Bleu ciel pastel

    // Neutrals
    white: '#FFFFFF',
    black: '#2D3748',          // Noir doux

    // Borders
    border: '#E8F0F5',         // Border très subtile
    borderLight: '#F0F5F9',    // Border ultra-légère

    // Variations pastel pour variety
    mint: '#B8E6D5',
    sky: '#A8D5E2',
    lilac: '#D4C5E9',
    peach: '#FFE4CC',
    rose: '#FFD4D4',
    lavender: '#E5D9F2',
    aqua: '#D0E8F2',
  },

  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      semiBold: 'System',
      bold: 'System',
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

  // Border-radius très élevé pour formes douces
  borderRadius: {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 28,
    xxl: 36,
    full: 9999,
  },

  // Borders subtiles
  borders: {
    hairline: 0.5,
    thin: 1,
    medium: 2,
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

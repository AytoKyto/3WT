import React, { useState } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { theme } from '../styles/theme';
import { useScaleAnimation } from '../hooks/useAnimations';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'filled' | 'tinted' | 'outline' | 'ghost';
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'error';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'filled',
  color = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const [pressed, setPressed] = useState(false);
  const scaleStyle = useScaleAnimation(pressed);

  // En Carton-pâte tout se ramène à deux blocs : encre ou jaune acide.
  const baseColor = color === 'secondary' || color === 'accent' || color === 'success'
    ? theme.colors.yellow
    : theme.colors.ink;

  const variantConfig = {
    filled: {
      backgroundColor: baseColor,
      textColor: baseColor === theme.colors.yellow ? theme.colors.ink : theme.colors.yellow,
      borderColor: theme.colors.ink,
    },
    tinted: {
      backgroundColor: theme.colors.yellow,
      textColor: theme.colors.ink,
      borderColor: theme.colors.ink,
    },
    outline: {
      backgroundColor: theme.colors.paper,
      textColor: theme.colors.ink,
      borderColor: theme.colors.ink,
    },
    ghost: {
      backgroundColor: 'transparent',
      textColor: theme.colors.ink,
      borderColor: 'transparent',
    },
  };

  const sizeConfig = {
    small: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: theme.typography.fontSize.sm,
    },
    medium: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      fontSize: theme.typography.fontSize.md,
    },
    large: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.lg,
      fontSize: theme.typography.fontSize.lg,
    },
  };

  const config = sizeConfig[size];
  const variantStyle = variantConfig[variant];

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled || loading}
      style={[
        scaleStyle,
        styles.button,
        {
          backgroundColor: disabled ? theme.colors.paperAlt : variantStyle.backgroundColor,
          paddingHorizontal: config.paddingHorizontal,
          paddingVertical: config.paddingVertical,
          borderWidth: variant === 'ghost' ? 0 : theme.borders.thick,
          borderColor: disabled ? theme.colors.textFaint : variantStyle.borderColor,
        },
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.textColor} />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text
            style={[
              styles.text,
              {
                fontSize: config.fontSize,
                color: disabled ? theme.colors.textFaint : variantStyle.textColor,
              },
              textStyle,
            ]}
          >
            {title.toUpperCase()}
          </Text>
        </View>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: theme.opacity.disabled,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  text: {
    fontFamily: theme.typography.fontFamily.display,
    fontWeight: theme.typography.fontWeight.black,
    letterSpacing: theme.typography.letterSpacing.tight,
  },
});

export default Button;

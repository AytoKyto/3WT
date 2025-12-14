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

  // Couleurs par type
  const colorMap = {
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    accent: theme.colors.accent,
    success: theme.colors.success,
    error: theme.colors.error,
  };

  const baseColor = colorMap[color];

  // Variantes de style
  const variantConfig = {
    filled: {
      backgroundColor: baseColor,
      textColor: color === 'error' || color === 'success' ? theme.colors.text : theme.colors.white,
      borderWidth: 0,
      borderColor: 'transparent',
    },
    tinted: {
      backgroundColor: theme.colors.accent, // 20% opacity
      textColor: theme.colors.text,
      borderWidth: 0,
      borderColor: 'transparent',
    },
    outline: {
      backgroundColor: 'transparent',
      textColor: theme.colors.text,
      borderWidth: 2,
      borderColor: baseColor,
    },
    ghost: {
      backgroundColor: 'transparent',
      textColor: theme.colors.text,
      borderWidth: 0,
      borderColor: 'transparent',
    },
  };

  const sizeConfig = {
    small: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: theme.typography.fontSize.sm,
      borderRadius: theme.borderRadius.md,
    },
    medium: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      fontSize: theme.typography.fontSize.md,
      borderRadius: theme.borderRadius.lg,
    },
    large: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.lg,
      fontSize: theme.typography.fontSize.lg,
      borderRadius: theme.borderRadius.xl,
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
          backgroundColor: disabled ? theme.colors.border : variantStyle.backgroundColor,
          paddingHorizontal: config.paddingHorizontal,
          paddingVertical: config.paddingVertical,
          borderRadius: config.borderRadius,
          borderWidth: variantStyle.borderWidth,
          borderColor: disabled ? theme.colors.border : variantStyle.borderColor,
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
                color: disabled ? theme.colors.textTertiary : variantStyle.textColor,
              },
              textStyle,
            ]}
          >
            {title}
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
    overflow: 'hidden',
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
    fontWeight: theme.typography.fontWeight.semiBold,
    letterSpacing: theme.typography.letterSpacing.normal,
  },
});

export default Button;

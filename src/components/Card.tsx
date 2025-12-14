import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Pressable,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { theme } from '../styles/theme';
import { useScaleAnimation, useFadeIn, useSlideIn } from '../hooks/useAnimations';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'surface' | 'outlined';
  noPadding?: boolean;
  animated?: boolean;
  animationDelay?: number;
  slideDirection?: 'left' | 'right' | 'top' | 'bottom';
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
  noPadding = false,
  animated = false,
  animationDelay = 0,
  slideDirection = 'bottom',
}) => {
  const [pressed, setPressed] = useState(false);
  const scaleStyle = useScaleAnimation(pressed);
  const fadeStyle = animated ? useFadeIn(theme.animation.duration.normal) : {};
  const slideStyle = animated ? useSlideIn(slideDirection, 30, theme.animation.duration.normal) : {};

  const variantConfig = {
    default: {
      backgroundColor: theme.colors.card,
      borderWidth: 0,
      borderColor: 'transparent',
    },
    surface: {
      backgroundColor: theme.colors.surface,
      borderWidth: 0,
      borderColor: 'transparent',
    },
    outlined: {
      backgroundColor: theme.colors.card,
      borderWidth: theme.borders.thin,
      borderColor: theme.colors.border,
    },
  };

  const config = variantConfig[variant];

  const cardContent = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: config.backgroundColor,
          borderWidth: config.borderWidth,
          borderColor: config.borderColor,
          padding: noPadding ? 0 : theme.spacing.md,
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        style={[
          scaleStyle,
          animated && fadeStyle,
          animated && slideStyle,
        ]}
      >
        {cardContent}
      </AnimatedPressable>
    );
  }

  if (animated) {
    return (
      <Animated.View style={[fadeStyle, slideStyle]}>
        {cardContent}
      </Animated.View>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
});

export default Card;

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
  variant?: 'default' | 'surface' | 'outlined' | 'ink';
  noPadding?: boolean;
  animated?: boolean;
  animationDelay?: number;
  slideDirection?: 'left' | 'right' | 'top' | 'bottom';
  hardShadow?: boolean;
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
  hardShadow = false,
}) => {
  const [pressed, setPressed] = useState(false);
  const scaleStyle = useScaleAnimation(pressed);
  const fadeStyle = animated ? useFadeIn(theme.animation.duration.normal) : {};
  const slideStyle = animated ? useSlideIn(slideDirection, 30, theme.animation.duration.normal) : {};

  const variantConfig = {
    default: {
      backgroundColor: theme.colors.white,
      borderColor: theme.colors.ink,
    },
    surface: {
      backgroundColor: theme.colors.paper,
      borderColor: theme.colors.ink,
    },
    outlined: {
      backgroundColor: theme.colors.paper,
      borderColor: theme.colors.ink,
    },
    ink: {
      backgroundColor: theme.colors.ink,
      borderColor: theme.colors.ink,
    },
  };

  const config = variantConfig[variant];

  const innerCard = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: config.backgroundColor,
          borderWidth: theme.borders.thick,
          borderColor: config.borderColor,
          padding: noPadding ? 0 : theme.spacing.md,
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  const cardContent = hardShadow ? (
    <View style={styles.shadowWrapper}>
      <View pointerEvents="none" style={styles.shadowBlock} />
      {innerCard}
    </View>
  ) : innerCard;

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
    overflow: 'hidden',
  },
  shadowWrapper: {
    position: 'relative',
  },
  shadowBlock: {
    position: 'absolute',
    top: theme.hardShadow.offsetSmall,
    left: theme.hardShadow.offsetSmall,
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.ink,
  },
});

export default Card;

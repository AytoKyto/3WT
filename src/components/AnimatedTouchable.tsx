import React, { useState } from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { useScaleAnimation } from '../hooks/useAnimations';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AnimatedTouchableProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
}

// Wrapper léger autour de Pressable qui reprend le même retour visuel
// (scale 0.97) que Button/Card, pour uniformiser le feedback tactile
// sur les CTA qui utilisaient encore un TouchableOpacity brut.
const AnimatedTouchable: React.FC<AnimatedTouchableProps> = ({
  style,
  onPressIn,
  onPressOut,
  disabled,
  children,
  ...rest
}) => {
  const [pressed, setPressed] = useState(false);
  const scaleStyle = useScaleAnimation(pressed);

  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={(e) => {
        setPressed(true);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        onPressOut?.(e);
      }}
      style={[scaleStyle, style]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
};

export default AnimatedTouchable;

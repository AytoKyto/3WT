import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { theme } from '../styles/theme';

// Spring bounce animation for buttons and cards
export const useSpringAnimation = (trigger: boolean) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(trigger ? 0.95 : 1, theme.animation.easing.springGentle);
  }, [trigger]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return animatedStyle;
};

// Fade in animation for screen entries
export const useFadeIn = (duration: number = theme.animation.duration.normal) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return animatedStyle;
};

// Slide in animation
export const useSlideIn = (
  direction: 'left' | 'right' | 'top' | 'bottom' = 'bottom',
  distance: number = 50,
  duration: number = theme.animation.duration.normal
) => {
  const translateX = useSharedValue(direction === 'left' ? -distance : direction === 'right' ? distance : 0);
  const translateY = useSharedValue(direction === 'top' ? -distance : direction === 'bottom' ? distance : 0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withTiming(0, { duration, easing: Easing.out(Easing.cubic) });
    translateY.value = withTiming(0, { duration, easing: Easing.out(Easing.cubic) });
    opacity.value = withTiming(1, { duration });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  return animatedStyle;
};

// Scale animation for micro-interactions
export const useScaleAnimation = (pressed: boolean) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(pressed ? 0.97 : 1, theme.animation.easing.spring);
  }, [pressed]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return animatedStyle;
};

// Shimmer loading animation
export const useShimmer = () => {
  const shimmer = useSharedValue(-1);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmer.value,
      [-1, 1],
      [-300, 300],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateX }],
    };
  });

  return animatedStyle;
};

// Pulse animation for highlighting - gentle breathing effect
export const usePulse = () => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.03, {
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(1, {
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return animatedStyle;
};

// Rotate animation
export const useRotate = (duration: number = 1000) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return animatedStyle;
};

// Bounce animation for success/celebration - gentle zen bounce
export const useBounce = (trigger: boolean) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (trigger) {
      scale.value = withSequence(
        withSpring(1.1, theme.animation.easing.springGentle),
        withSpring(0.98, theme.animation.easing.springGentle),
        withSpring(1, theme.animation.easing.springGentle)
      );
    }
  }, [trigger]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return animatedStyle;
};

// Stagger animation for list items - zen style with gentle timing
export const useStagger = (index: number, total: number = 10) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    const delay = Math.min(index * 80, 800); // Cap at 800ms for long lists

    opacity.value = withTiming(1, {
      duration: theme.animation.duration.slow,
      easing: Easing.out(Easing.ease),
    });

    translateY.value = withSpring(0, {
      ...theme.animation.easing.springGentle,
      delay,
    });

    scale.value = withSpring(1, {
      ...theme.animation.easing.springGentle,
      delay,
    });
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return animatedStyle;
};

// Glow animation for glassmorphism
export const useGlow = () => {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return animatedStyle;
};

import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

export const useSplash = () => {
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  const titleTranslateX = useRef(new Animated.Value(60)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(0.8)).current;

  const sloganTranslateY = useRef(new Animated.Value(10)).current;
  const sloganOpacity = useRef(new Animated.Value(0)).current;

  const loadingDots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 550,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(180),
      Animated.parallel([
        Animated.spring(titleTranslateX, {
          toValue: 0,
          stiffness: 120,
          damping: 14,
          mass: 1,
          useNativeDriver: true,
        }),
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 350,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(titleScale, {
          toValue: 1,
          stiffness: 110,
          damping: 12,
          mass: 1,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    Animated.sequence([
      Animated.delay(380),
      Animated.parallel([
        Animated.timing(sloganOpacity, {
          toValue: 1,
          duration: 350,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(sloganTranslateY, {
          toValue: 0,
          stiffness: 100,
          damping: 12,
          mass: 1,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    loadingDots.forEach((dot, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 120),
          Animated.timing(dot, {
            toValue: -6,
            duration: 320,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 320,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    logoScale,
    logoOpacity,
    titleTranslateX,
    titleOpacity,
    titleScale,
    sloganTranslateY,
    sloganOpacity,
    loadingDots,
  };
};

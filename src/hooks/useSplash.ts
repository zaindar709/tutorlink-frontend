import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

export const useSplash = () => {
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  // Title Animation: slide + fade + slight pop
  const titleTranslateX = useRef(new Animated.Value(60)).current; // start offset
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(0.8)).current;

  // Slogan Animation: fade + slight slide
  const sloganTranslateY = useRef(new Animated.Value(10)).current;
  const sloganOpacity = useRef(new Animated.Value(0)).current;

  const loadingDots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    // Logo: fade + scale
    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    // Title Animation: slide + fade + pop
    Animated.sequence([
      Animated.delay(500), // after logo
      Animated.parallel([
        Animated.spring(titleTranslateX, {
          toValue: 0,
          stiffness: 90,
          damping: 10,
          mass: 1,
          useNativeDriver: true,
        }),
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(titleScale, {
          toValue: 1,
          stiffness: 80,
          damping: 8,
          mass: 1,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Slogan Animation: fade + slight slide
    Animated.sequence([
      Animated.delay(900), // after title
      Animated.parallel([
        Animated.timing(sloganOpacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(sloganTranslateY, {
          toValue: 0,
          stiffness: 70,
          damping: 10,
          mass: 1,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 4Loading Dots: subtle bounce
    loadingDots.forEach((dot, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 200),
          Animated.timing(dot, {
            toValue: -8,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
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
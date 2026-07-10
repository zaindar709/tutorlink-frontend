import React, { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  GRADIENT_DIRECTIONS,
  GRADIENTS,
  GradientVariant,
} from '../../constants/gradients';

type GradientSurfaceProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: GradientVariant;
  colors?: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
};

const GradientSurface = ({
  children,
  style,
  variant = 'primary',
  colors,
  start = GRADIENT_DIRECTIONS.diagonal.start,
  end = GRADIENT_DIRECTIONS.diagonal.end,
}: GradientSurfaceProps) => (
  <LinearGradient colors={colors ?? GRADIENTS[variant]} start={start} end={end} style={style}>
    {children}
  </LinearGradient>
);

export default GradientSurface;

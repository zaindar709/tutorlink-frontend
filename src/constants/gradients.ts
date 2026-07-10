export const GRADIENT_DIRECTIONS = {
  diagonal: {
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  horizontal: {
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },
  vertical: {
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  },
} as const;

export type GradientVariant =
  | 'primary'
  | 'primarySoft'
  | 'primaryHeader'
  | 'primaryCard'
  | 'primaryButton'
  | 'primaryVivid';

export const GRADIENTS: Record<GradientVariant, string[]> = {
  primary: ['#5B4FF5', '#7548F5', '#9B6DFF'],
  primarySoft: ['#6A82FC', '#8F73FD'],
  primaryHeader: ['#4F3DF5', '#7548F5', '#A78BFA'],
  primaryCard: ['#6B5CE7', '#8B5CF6', '#A855F7'],
  primaryButton: ['#6348F5', '#8F6DFD'],
  primaryVivid: ['#5A3EF0', '#7548F5', '#C084FC'],
};

export const isPrimaryColor = (
  color: unknown,
  primaryColor: string
): boolean => {
  if (!color) {
    return true;
  }

  return String(color).toLowerCase() === String(primaryColor).toLowerCase();
};

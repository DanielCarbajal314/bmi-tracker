// Accepted range of the entered weight and height, per unit system.
export const MEASUREMENT_LIMITS = {
  imperial: {
    weight: { min: 2, max: 1500, unit: 'lb' },
    height: { min: 10, max: 120, unit: 'in' },
  },
  metric: {
    weight: { min: 1, max: 700, unit: 'kg' },
    height: { min: 0.25, max: 3, unit: 'm' },
  },
} as const;

// Accepted range of the entered weight and height, per unit system. Mirrors the backend.
export const MEASUREMENT_LIMITS = {
  imperial: {
    weight: { min: 2, max: 1500 },
    height: { min: 10, max: 120 },
  },
  metric: {
    weight: { min: 1, max: 700 },
    height: { min: 0.25, max: 3 },
  },
} as const;

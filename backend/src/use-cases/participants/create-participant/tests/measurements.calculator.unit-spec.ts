import { describe, expect, test } from 'bun:test';
import { calculateMeasurements } from '../measurements.calculator';

describe('calculateMeasurements', () => {
  describe('imperial', () => {
    const result = calculateMeasurements({ unitPicked: 'imperial', weight: 154.3, height: 69 });

    test('keeps the entered weight and height', () => {
      expect(result.weightInLbs).toBe(154.3);
      expect(result.heightInInches).toBe(69);
    });

    test('derives kilos and meters, rounded to 2 decimals', () => {
      expect(result.weightInKilos).toBe(69.99);
      expect(result.heightInMeters).toBe(1.75);
    });

    test('multiplies lb / in² by 703', () => {
      expect(result.bmi).toBe(22.78);
      expect(calculateMeasurements({ unitPicked: 'imperial', weight: 200, height: 70 }).bmi).toBe(
        28.69,
      );
    });
  });

  describe('metric', () => {
    const result = calculateMeasurements({ unitPicked: 'metric', weight: 70, height: 1.75 });

    test('keeps the entered weight and height', () => {
      expect(result.weightInKilos).toBe(70);
      expect(result.heightInMeters).toBe(1.75);
    });

    test('derives pounds and inches, rounded to 2 decimals', () => {
      expect(result.weightInLbs).toBe(154.32);
      expect(result.heightInInches).toBe(68.9);
    });

    test('divides kg by m² with no factor', () => {
      expect(result.bmi).toBe(22.86);
    });
  });

  test('both systems agree on the BMI of the same person', () => {
    const metric = calculateMeasurements({ unitPicked: 'metric', weight: 82, height: 1.8 });
    const imperial = calculateMeasurements({
      unitPicked: 'imperial',
      weight: metric.weightInLbs,
      height: metric.heightInInches,
    });
    expect(imperial.bmi).toBeCloseTo(metric.bmi, 1);
  });
});

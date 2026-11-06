import { IMPERIAL_BMI_FACTOR, KG_PER_LB, M_PER_IN } from './constants/unit-conversion';
import type { CreateParticipantInput } from './create-participant.contract';

const round = (value: number): number => Math.round(value * 100) / 100;

// The entered values are kept as given. The other unit system and the BMI are
// derived and rounded to 2 decimals. BMI is computed from the entered values.
export function calculateMeasurements({
  unitPicked,
  weight,
  height,
}: Pick<CreateParticipantInput, 'unitPicked' | 'weight' | 'height'>) {
  const squaredHeight = height ** 2;

  if (unitPicked === 'imperial') {
    return {
      weightInLbs: weight,
      weightInKilos: round(weight * KG_PER_LB),
      heightInInches: height,
      heightInMeters: round(height * M_PER_IN),
      bmi: round((weight / squaredHeight) * IMPERIAL_BMI_FACTOR),
    };
  }

  return {
    weightInLbs: round(weight / KG_PER_LB),
    weightInKilos: weight,
    heightInInches: round(height / M_PER_IN),
    heightInMeters: height,
    bmi: round(weight / squaredHeight),
  };
}

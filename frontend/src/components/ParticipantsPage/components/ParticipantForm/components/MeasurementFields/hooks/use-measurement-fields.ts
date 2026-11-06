import type { UnitSystem } from '../../../../../apis/participant.contract';
import { MEASUREMENT_LIMITS } from '../../../../../constants/measurement-limits';
import { UNIT_SYSTEMS } from '../../../../../constants/unit-systems';

export function useMeasurementFields(unitSystem: UnitSystem) {
  const units = UNIT_SYSTEMS[unitSystem];
  const limits = MEASUREMENT_LIMITS[unitSystem];

  return {
    weight: {
      label: `Weight (${units.weightUnit})`,
      placeholder: `${limits.weight.min} – ${limits.weight.max}`,
    },
    height: {
      label: `Height (${units.heightUnit})`,
      placeholder: `${limits.height.min} – ${limits.height.max}`,
    },
  };
}

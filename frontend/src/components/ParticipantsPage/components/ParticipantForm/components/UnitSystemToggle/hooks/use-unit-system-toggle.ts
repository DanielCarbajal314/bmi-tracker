import { type UnitSystem, UnitSystemSchema } from '../../../../../apis/participant.contract';
import { UNIT_SYSTEMS } from '../../../../../constants/unit-systems';

export function useUnitSystemToggle(onChange: (value: UnitSystem) => void) {
  const options = UnitSystemSchema.options.map((system) => ({
    value: system,
    label: UNIT_SYSTEMS[system].label,
  }));

  // Clicking the selected item reports an empty value: ignore it.
  function select(next: string) {
    const parsed = UnitSystemSchema.safeParse(next);
    if (parsed.success) onChange(parsed.data);
  }

  return { options, select };
}

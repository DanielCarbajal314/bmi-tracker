import { FormField } from '../FormField';
import { UnitSystemToggle } from '../UnitSystemToggle';
import { useMeasurementFields } from './hooks/use-measurement-fields';
import type { MeasurementFieldsProps } from './types/measurement-fields-props.types';

// Age sits on the same row as weight and height, as in the design.
export function MeasurementFields({
  form,
  unitSystem,
  onUnitSystemChange,
}: MeasurementFieldsProps) {
  const { weight, height } = useMeasurementFields(unitSystem);

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <span className="text-sm leading-none font-semibold">Unit system</span>
        <UnitSystemToggle value={unitSystem} onChange={onUnitSystemChange} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <FormField
          form={form}
          name="weight"
          label={weight.label}
          type="number"
          inputMode="decimal"
          step="any"
          placeholder={weight.placeholder}
          numeric
        />
        <FormField
          form={form}
          name="height"
          label={height.label}
          type="number"
          inputMode="decimal"
          step="any"
          placeholder={height.placeholder}
          numeric
        />
        <FormField
          form={form}
          name="age"
          label="Age"
          type="number"
          inputMode="numeric"
          step="1"
          numeric
        />
      </div>
    </div>
  );
}

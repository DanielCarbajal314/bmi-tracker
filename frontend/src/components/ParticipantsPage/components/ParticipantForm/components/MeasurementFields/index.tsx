import { FormField } from '../FormField';
import { UnitSystemToggle } from '../UnitSystemToggle';
import { useMeasurementFields } from './hooks/use-measurement-fields';
import type { MeasurementFieldsProps } from './types/measurement-fields-props.types';

export function MeasurementFields({
  form,
  unitSystem,
  onUnitSystemChange,
}: MeasurementFieldsProps) {
  const { weight, height } = useMeasurementFields(unitSystem);

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <span className="text-sm leading-none font-medium">Unit system</span>
        <UnitSystemToggle value={unitSystem} onChange={onUnitSystemChange} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
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
      </div>
    </div>
  );
}

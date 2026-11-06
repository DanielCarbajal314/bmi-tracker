import { ToggleGroup, ToggleGroupItem } from '@/components/ui/ToggleGroup';
import { useUnitSystemToggle } from './hooks/use-unit-system-toggle';
import type { UnitSystemToggleProps } from './types/unit-system-toggle-props.types';

export function UnitSystemToggle({ value, onChange }: UnitSystemToggleProps) {
  const { options, select } = useUnitSystemToggle(onChange);

  return (
    <ToggleGroup type="single" value={value} aria-label="Unit system" onValueChange={select}>
      {options.map((option) => (
        <ToggleGroupItem key={option.value} value={option.value}>
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

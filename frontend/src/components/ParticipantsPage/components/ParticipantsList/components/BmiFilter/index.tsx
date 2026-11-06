import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useBmiFilter } from './hooks/use-bmi-filter';
import type { BmiFilterProps } from './types/bmi-filter-props.types';

export function BmiFilter({ onApply, onClear }: BmiFilterProps) {
  const { min, max, setMin, setMax, error, submit, clear } = useBmiFilter(onApply, onClear);

  return (
    <form onSubmit={submit} className="grid gap-2" aria-label="Filter by BMI">
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-2">
          <Label htmlFor="minBmi">Min BMI</Label>
          <Input
            id="minBmi"
            type="number"
            step="any"
            className="w-28"
            value={min}
            onChange={(event) => setMin(event.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="maxBmi">Max BMI</Label>
          <Input
            id="maxBmi"
            type="number"
            step="any"
            className="w-28"
            value={max}
            onChange={(event) => setMax(event.target.value)}
          />
        </div>
        <Button type="submit" variant="secondary">
          Apply
        </Button>
        <Button type="button" variant="ghost" onClick={clear}>
          Clear
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}

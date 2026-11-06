import { type FormEvent, useState } from 'react';
import type { BmiFilterValue } from '../../../types/bmi-filter.types';

// An empty field means "no bound"; anything else must be a number of 0 or more.
function parseBound(text: string): number | undefined | null {
  if (text.trim() === '') return undefined;
  const value = Number(text);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

export function useBmiFilter(onApply: (filter: BmiFilterValue) => void, onClear: () => void) {
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [error, setError] = useState<string>();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const minBmi = parseBound(min);
    const maxBmi = parseBound(max);

    if (minBmi === null || maxBmi === null) {
      setError('Enter BMI values of 0 or more');
      return;
    }
    if (minBmi !== undefined && maxBmi !== undefined && minBmi > maxBmi) {
      setError('Minimum BMI cannot be greater than maximum BMI');
      return;
    }
    setError(undefined);
    onApply({ minBmi, maxBmi });
  }

  function clear() {
    setMin('');
    setMax('');
    setError(undefined);
    onClear();
  }

  return { min, max, setMin, setMax, error, submit, clear };
}

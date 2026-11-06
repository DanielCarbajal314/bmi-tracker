import type { BmiFilterValue } from '../../../types/bmi-filter.types';

export type BmiFilterProps = {
  onApply: (filter: BmiFilterValue) => void;
  onClear: () => void;
};
